import { defineStore } from 'pinia'
import axios from 'axios'
import { connect, disconnect } from '@argent/get-starknet'
import { num, Contract, validateAndParseAddress } from 'starknet'
import {
  networkName,
  supportedChainIds,
  defaultChainId,
  etherAddress,
  isTestnet
} from '@/helpers/blockchainConstants'
import { formatEther } from '@/helpers/ethereumHelpers'
import erc20Abi from '../assets/abis/erc20.json' assert { type: 'json' }
import { useAlmanacStore } from '@/store/almanac'

let _starknet = null
let _etherContract = null
let _almanacStore

let _initialState = {
  initialized: false,
  connecting: false,
  connected: false,
  address: '',
  starkName: null,
  chainId: null,
  networkName: null,
  networkOk: false,
  balance: 0.0,

  transaction: {
    status: null,
    link: null,
    error: null
  }
}

export const useStarknetStore = defineStore('starknet', {
  state: () => {
    return { ..._initialState }
  },

  getters: {
    account: (state) => {
      if (_starknet != null) {
        return _starknet.account
      }
      return null
    },
    shortAddress: (state) => {
      return (len) => {
        if (state.address.length == 0) {
          return ''
        }
        if (state.starkName != null) {
          return state.starkName
        }
        return `${state.address.substring(0, Math.floor(len / 2))}...${state.address.substring(
          state.address.length - Math.floor(len / 2)
        )}`
      }
    },
    currentOrDefaultChainId: (state) => (state.chainId == null) ? defaultChainId : state.chainId,
    isStarknetConnected: () => (_starknet == null) ? false : _starknet.isConnected,
    isStarknetTestnet: (state) => isTestnet(state.currentOrDefaultChainId)
  },

  actions: {
    async init() {
      console.log('starknet: init()')
      if ('true' === localStorage.getItem('wasConnected')) {
        _starknet = await connect({ showList: false })
        await _starknet?.enable()
        if (_starknet?.isConnected) {
          this.login()
        }
      }
      this.initialized = true
      _almanacStore = useAlmanacStore()
    },

    async connectStarknet() {
      _starknet = await connect({
        modalOptions: { theme: 'dark' }
      })
      await _starknet?.enable()
      if (_starknet?.isConnected) {
        this.login()
      }
    },

    async login() {
      if (_starknet?.isConnected) {
        console.log('starknet: login()')

        let address = validateAndParseAddress(_starknet.selectedAddress)
        let { chainId } = _starknet.provider
        let network_name = networkName[chainId]
        let network_ok = supportedChainIds.includes(chainId)

        let stark_domain = null
        try {
          let address_base_10 = num.toBigInt(address).toString()
          let response = await axios.get(
            `https://app.starknet.id/api/indexer/addr_to_domain?addr=${address_base_10}`
          )
          if ('domain' in response.data) {
            stark_domain = response.data.domain
          }
        } catch (err) { }

        this.$patch({
          connecting: false,
          connected: true,
          address: address,
          chainId: chainId,
          networkName: network_name,
          networkOk: network_ok,
          starkName: stark_domain
        })

        _starknet.off('accountsChanged', (accounts) => this.handleAccountsChanged(accounts))
        _starknet.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts))

        if (network_ok) {
          _etherContract = new Contract(erc20Abi, etherAddress[chainId], _starknet.account)

          await this.updateBalance()
        }

        localStorage.setItem('wasConnected', true)

        _almanacStore.loggedIn()
      } else {
        this.logout()
      }
    },

    async updateBalance() {
      if (_starknet == null || _etherContract == null) {
        return (this.balance = 0.0)
      }

      console.log('starknet: updateBalance()')
      let response = await _etherContract.balanceOf(this.address)
      let balance = parseFloat(formatEther(response.balance))
      this.balance = balance
    },

    resetTransaction() {
      console.log("starknet: resetTransaction()");
      this.$patch({
        transaction: {
          status: null,
          link: null,
          error: null
        }
      });
    },

    async sendTransactions(tx_array) {
      console.log("starknet: transaction()");
      try {
        if (_starknet != null) {
          this.transaction.status = 0;

          let result = await _starknet.account.execute(tx_array);
          this.transaction.link = `https://${this.isStarknetTestnet ? 'testnet.' : ''}starkscan.co/tx/${result.transaction_hash}`;

          this.transaction.status = 1;
          await _starknet.provider.waitForTransaction(result.transaction_hash);

          this.transaction.status = 2;

          await this.updateBalance();
          await axios.get(`https://server.almanacnft.xyz/almanac/updateStarknet`);

          return true;
        }
      } catch (err) {
        this.transaction.error = err.toString().replace("Error: ", "");
        this.transaction.status = -1;
      }
      return false;
    },

    async signMessage(signableMessage) {
      console.log("starknet: signMessage()");
      let signature = await _starknet.account.signMessage(signableMessage);
      return signature;
    },

    handleAccountsChanged(accounts) {
      if (_starknet.selectedAddress != this.address) {
        this.login()
      }
    },

    logout() {
      console.log('starknet: logout()')
      _starknet.off('accountsChanged', (accounts) => this.handleAccountsChanged(accounts))
      this.$patch(_initialState)
      this.initialized = true
      _etherContract = null
      _starknet = null
      disconnect()
      _almanacStore.loggedOff()
      localStorage.setItem('wasConnected', false)
    }
  }
})
