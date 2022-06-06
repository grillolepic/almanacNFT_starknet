const axios = require('axios').default;
import moment from 'moment';
import { connect, disconnect } from "@argent/get-starknet";
import { Contract, number, uint256, validateAndParseAddress, shortString } from "starknet";

let INIT = false;
let STARKNET = null;
let ADDRESS = null;
let NETWORK_NAME = null;
let NETWORK_OK= null;
let COST = 0;
let BALANCE = 0;
let ALLOWANCE = 0;

const supportedNetworks = ["goerli-alpha"]; //, "mainnet-alpha"];

const MAINNET_ETHER_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const GOERLI_ETHER_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const ETHER_ABI = require('./Ether.json');
let ETHER_CONTRACT = null;

const MAINNET_ALMANAC_ADDRESS = "0x07fb5a16fa38a31e5ca186fbca7a3142e1a6eaf7e384dc7d9470a1f722e36ed7";
const GOERLI_ALMANAC_ADDRESS = "0x07fb5a16fa38a31e5ca186fbca7a3142e1a6eaf7e384dc7d9470a1f722e36ed7";
const ALMANAC_ABI = require('./Almanac.json');
let ALMANAC_CONTRACT = null;

let almanacDate = new Date();
let almanacMarket = 0;
let almanacDaysSince = 0;
let almanacAvailable = false;
let almanacDataAvailable = false;
let userAlmanacs = [];

const MAX_PUBLIC_SUPPLY = 9000;
let supplyOk = false;

let cost = uint256.bnToUint256(number.toBN(0));
let costOk = false;
let allowanceOk = false;

async function getMarkets(context) {
    console.log("getMarkets()");
    try {
      let marketsReq = await axios.get(`https://server.almanacnft.xyz/almanac/markets`);
      context.commit('markets', marketsReq.data);
      context.commit('serverError', false);
    } catch (err) {
      console.log(" - Couldn't fetch markets!");
      console.log(err);
      context.commit('markets', []);
      context.commit('serverError', true);
    }
  }

const init = async function (context) {
    await getMarkets(context);
    STARKNET = await connect({ showList: false })
    await STARKNET?.enable();
    if (STARKNET?.isConnected) {
        login(context);
    }
    context.commit('initialized', true);
}

const startDate = function (context) {
    let startingDate = moment.utc(new Date(2009,0,1));
    let currentDate = moment.utc().subtract(1, 'day');
    let currentDaysSince = currentDate.diff(startingDate, 'days');
    setAlmanac(context, {
        daysSince: currentDaysSince,
        market: 0
    });
}

const connectArgentX = async function (context) {
    STARKNET = await connect({
        include: ["argentX"],
        modalOptions: {theme: 'dark'}
    });
    await STARKNET?.enable()
    if (STARKNET?.isConnected) {
        login(context);
    }
}

function handleAccountsChanged(context, accounts) {
    if (STARKNET.selectedAddress != ADDRESS) {
        login(context);
    }
}

function getNetworkName() {
    if (!STARKNET) { return null; }
    const { baseUrl } = STARKNET.provider;
    if (baseUrl.includes("alpha-mainnet.starknet.io")) {
        return "mainnet-alpha";
    } else if (baseUrl.includes("alpha4.starknet.io")) {
        return "goerli-alpha";
    } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
        return "localhost";
    }
    return "unknown";
}

const login = async function (context) {
    if (STARKNET?.isConnected) {
        console.log("login()");

        context.commit('initialLoading', true);
        ADDRESS = validateAndParseAddress(STARKNET.selectedAddress);
        NETWORK_NAME = getNetworkName();
        NETWORK_OK = supportedNetworks.includes(NETWORK_NAME);

        context.commit('connected', true);
        context.commit('address', ADDRESS);
        context.commit('networkOk', NETWORK_OK);

        if (!INIT) {
            STARKNET.on("accountsChanged", (accounts) => handleAccountsChanged(context, accounts));
            INIT = true;
        }
        
        if (NETWORK_OK) {

            ETHER_CONTRACT = new Contract(
                ETHER_ABI,
                (NETWORK_NAME == 'mainnet-alpha')?MAINNET_ETHER_ADDRESS:GOERLI_ETHER_ADDRESS,
                STARKNET.account
            );

            ALMANAC_CONTRACT = new Contract(
                ALMANAC_ABI,
                (NETWORK_NAME == 'mainnet-alpha')?MAINNET_ALMANAC_ADDRESS:GOERLI_ALMANAC_ADDRESS,
                STARKNET.account
            );

            resetCurrentAlmanac(context);
            resetTransaction(context);
            await updateCost(context);
            await updateTotalSupply(context);
            await updateBalance(context);
            await loadUserAlmanacs(context);
        }

        context.commit('initialLoading', false);

    } else {
        logout();
    }
}

async function updateBalance(context) {
    if (!STARKNET) {
        return context.commit("balance", null);
    }

    console.log("Finding Ether balanace....");
    let response = await ETHER_CONTRACT.balanceOf(ADDRESS);
    BALANCE = parseFloat(formatEther(response.balance));
    context.commit('balance', BALANCE);

    console.log("Finding Ether allowance....");
    response = await ETHER_CONTRACT.allowance(ADDRESS, (NETWORK_NAME == 'mainnet-alpha')?MAINNET_ALMANAC_ADDRESS:GOERLI_ALMANAC_ADDRESS);
    ALLOWANCE = parseFloat(formatEther(response.remaining));
    context.commit('allowance', ALLOWANCE);

    costOk = (COST <= BALANCE);
    allowanceOk = (COST <= ALLOWANCE);
    context.commit('costOk', costOk);
    context.commit('allowanceOk', allowanceOk);
}

async function updateTotalSupply(context) {
    if (STARKNET) {

        //getPublicMinted()
        console.log("Finding Almanac public minted....");
        let response = await ALMANAC_CONTRACT.getPublicMinted();
        let publicMinted = uint256.uint256ToBN(response.publicMinted).toNumber();
        context.commit('publicMinted', publicMinted);

        //getMilestonesMinted
        console.log("Finding Almanac Milestones minted....");
        let response2 = await ALMANAC_CONTRACT.getMilestonesMinted();
        let milestonesMinted = uint256.uint256ToBN(response2.milestonesMinted).toNumber();
        context.commit('milestonesMinted', milestonesMinted);

        let total = publicMinted + milestonesMinted;
        context.commit('totalSupply', total);

        supplyOk = (publicMinted < MAX_PUBLIC_SUPPLY);
        context.commit('supplyOk', supplyOk);
    } else {
        supplyOk = false;
        context.commit('totalSupply', 0);
        context.commit('publicMinted', 0);
        context.commit('milestonesMinted', 0);
        context.commit('supplyOk', false);
    }
}
  
async function updateCost(context) {
    if (STARKNET) {
        console.log("Finding Almanac cost....");
        let response = await ALMANAC_CONTRACT.getCost();
        COST = parseFloat(formatEther(response.cost));
        context.commit('cost', COST);
        costOk = (COST <= BALANCE);
        allowanceOk = (COST <= ALLOWANCE);
    } else {
        context.commit('cost', null);
        costOk = false;
        allowanceOk = false;
        ALLOWANCE = 0;
        BALANCE = 0;
    }
    context.commit('costOk', costOk);
    context.commit('allowanceOk', allowanceOk);
}

const approveEther = async function(context) {
    if (!STARKNET) { return null; }
    try {
        context.commit('transactionStatus', 0);
        const result = await ETHER_CONTRACT.approve((NETWORK_NAME == 'mainnet-alpha')?MAINNET_ALMANAC_ADDRESS:GOERLI_ALMANAC_ADDRESS, uint256.bnToUint256(uint256.UINT_256_MAX));
        context.commit("transactionLink", `Transaction hash: ${result.transaction_hash}`);
        context.commit('transactionStatus', 1);
        await STARKNET.provider.waitForTransaction(result.transaction_hash);
        context.commit('transactionStatus', 2);
        updateBalance(context);
    } catch (err) {
        console.log(err);
        context.commit('transactionError', "Unknown error");
        context.commit('transactionStatus', -1);

    }
}

const logout = async function (context) {
    INIT = false;
    BALANCE = 0;
    ALLOWANCE = 0;
    cost = uint256.bnToUint256(number.toBN(0));
    costOk = false;
    allowanceOk = false;
    context.commit('cost', null);
    context.commit('costOk', costOk);
    context.commit('allowanceOk', allowanceOk);
    context.commit('balance', BALANCE);
    context.commit('allowance', ALLOWANCE);

    STARKNET.off("accountsChanged", (accounts) => handleAccountsChanged(context, accounts)); 

    disconnect();
    context.commit('connected', false);
    context.commit('address', '');
    context.commit('networkName', '');
    context.commit('networkOk', false);
    context.commit('contractBalance', '');
}

async function loadUserAlmanacs(context) {
if (!STARKNET) { return null; }

context.commit("loadingAlmanacs", true);
console.log("Loading Almanacs...");

userAlmanacs = await axios.get(`https://server.almanacnft.xyz/almanac/userAlmanacs/${(NETWORK_NAME == 'mainnet-alpha')?'starknet':'starknet_goerli'}/${ADDRESS}`);

if (userAlmanacs.status == 200) {
    userAlmanacs = userAlmanacs.data;
}

console.log(userAlmanacs);
context.commit("userAlmanacs", userAlmanacs);
context.commit("loadingAlmanacs", false);
}

const setAlmanac = async function setAlmanac(context, almanacConfig) {
    console.log(`setAlmanac(${almanacConfig.market},${almanacConfig.daysSince})`);
    console.log(almanacConfig);
  
    almanacAvailable = false;
    almanacDataAvailable = false;
    context.commit('almanacAvailable', false);
    context.commit('almanacDataAvailable', false);
    context.commit('almanacQueryingAvailable', true);
    context.commit('almanacQueryingDataAvailable', true);
  
    if ("market" in almanacConfig) {
      almanacMarket = almanacConfig.market;
      console.log(`almanacMarket: ${almanacMarket}`)
      context.commit('almanacMarket', almanacMarket);
    }
    
    if ("daysSince" in almanacConfig) {
      almanacDaysSince = almanacConfig.daysSince;
      console.log(`almanacDaysSince: ${almanacDaysSince}`)
      context.commit('almanacDaysSince', almanacDaysSince);
    }
  
    if (ALMANAC_CONTRACT != null) {
      try {
        let response = await ALMANAC_CONTRACT.getAlmanac({market: almanacMarket, day: almanacDaysSince});
        let almanacId = uint256.uint256ToBN(response.almanacId).toNumber();
        if (almanacId == 0) {
          almanacAvailable = true;
        }
      } catch (err) {}
      context.commit('almanacQueryingAvailable', false);
      context.commit('almanacAvailable', almanacAvailable);
    }
  
    if (almanacAvailable) {
      try { 
        console.log("Trying to obtain data....");
        let reqDataAvailable = await axios.get(`https://server.almanacnft.xyz/almanac/dataAvailable/${almanacMarket}/${almanacDaysSince}`);
        if (reqDataAvailable.data) {
          almanacDataAvailable = reqDataAvailable.data.available;
        }
      } catch (err) {}
    } else {
      almanacDataAvailable = true;
    }
    context.commit('almanacQueryingDataAvailable', false); 
    context.commit('almanacDataAvailable', almanacDataAvailable);
}
  
async function mintAlmanac(context) {
    context.commit('transactionStatus', 0);

    try {
        await updateCost(context);
        let result = await ALMANAC_CONTRACT.publicMint({'market': almanacMarket, 'day': almanacDaysSince});
        context.commit("transactionLink", `https://${(NETWORK_NAME == 'mainnet-alpha')?'':'goerli.'}voyager.online/tx/${result.transaction_hash}`);
        context.commit('transactionStatus', 1);
        await STARKNET.provider.waitForTransaction(result.transaction_hash);
        context.commit('transactionStatus', 2);
        context.commit('almanacAvailable', false);
        await updateBalance(context);
        await axios.get(`https://server.almanacnft.xyz/almanac/updateStarknet`);
        setTimeout(() => loadUserAlmanacs(context), 2000 * 60);
    } catch (err) {
        console.log(err);
        context.commit('transactionError', "Unknown error");
        context.commit('transactionStatus', -1);
    }
}

const resetCurrentAlmanac = function resetCurrentAlmanac(context) {
    almanacMarket = 0;
    almanacDaysSince = 0;
    almanacAvailable = false;
    almanacDataAvailable = false;
    almanacDate = new Date();
    startDate(context);
    context.commit('almanacDaysSince', almanacDaysSince);
    context.commit('almanacMarket', almanacMarket);
    context.commit('almanacAvailable', almanacAvailable);
    context.commit('almanacDataAvailable', almanacDataAvailable);
}
  
const resetTransaction = function resetTransaction(context) {
    context.commit('transactionStatus', null);
    context.commit('transactionLink', null);
    context.commit('transactionError', null);
}

function formatEther(n) {
    let bn = uint256.uint256ToBN(n).toString();
    let currentStr = "";
    if (bn.length > 18) {
        let extraZeros = bn.length - 18;
        currentStr = bn.substring(0, extraZeros) + "." + bn.substring(extraZeros + 1)
    } else {
        let zerosMissing = 18 - bn.length;
        currentStr = "0." + ("0").repeat(zerosMissing) + bn;
    }
    return currentStr;
}

export default {
    init,
    logout,
    connectArgentX,

    approveEther,
    
    setAlmanac,
    mintAlmanac,
    
    resetCurrentAlmanac,
    resetTransaction
}