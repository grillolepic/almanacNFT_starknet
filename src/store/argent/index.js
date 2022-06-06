import getters from './getters'
import actions from './actions'
import mutations from './mutations'

const state = () => ({
  initialized: false,
  connected: false,
  networkName: '',
  networkOk: false,
  address: '',
  balance: null,
  allowance: null,

  initialLoading: true,

  totalSupply: 0,
  publicMinted: 0,
  milestonesMinted: 0,
  supplyOk: true,

  cost: '',
  costOk: false,
  allowanceOk: false,
  
  almanacMaxMarket: '',
  almanacAllowedMarkets: [],

  userAlmanacs: [],
  loadingAlmanacs: true,

  startDate: new Date(2009,0,1),

  almanac: {
    daysSince: 0,
    market: 0,
    nftAvailable: false,
    dataAvailable: false,
    queryingNftAvailable: false,
    queryingDataAvailable: false,
  },

  transaction: {
    status: null,
    link: null,
    error: null,
  },

  markets: null,
  serverError: false,

});

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}