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

  initialLoading: true,

  totalSupply: 0,
  publicMinted: 0,
  milestonesMinted: 0,
  supplyOk: true,

  enabled: false,
  isOwner: false,

  price: '',
  priceOk: false,
  
  almanacMaxMarket: '',
  almanacAllowedMarkets: [],

  almanacs: [],
  userAlmanacs: [],
  filteredAlmanacs: [],
  loadingAlmanacs: false,
  loadingUserAlmanacs: false,

  galleryPages: 0,

  filter: {
    changing: false,
    onlyUser: false,
    market: null,
    milestone: null,
    page: 0,
    sortBy: 'id'
  },

  startDate: new Date(2008,0,1),

  almanac: {
    daysSince: 0,
    market: 0,
    nftAvailable: false,
    dataAvailable: false,
    waitingInput: false,
    queryingNftAvailable: false,
    queryingDataAvailable: false,
  },

  selectedAlmanac: {
    changing: false,
    loading: false,
    exists: false,
    userOwned: false,
    id: null,
    title: '',
    description: null,
    market: null,
    owner: null
  },

  transaction: {
    status: null,
    link: null,
    error: null
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