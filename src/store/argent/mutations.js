export default {
    initialized: function (state, value) {
      state.initialized = value;
    },
    connecting: function (state, value) {
      state.connecting = value;
    },
    connected: function (state, value) {
      state.connected = value;
    },
    networkName: function (state, value) {
      state.networkName = value;
    },
    networkOk: function (state, value) {
      state.networkOk = value;
    },
    address: function (state, value) {
      state.address = value;
    },
    balance: function (state, value) {
      state.balance = value;
    },
    allowance: function (state, value) {
      state.allowance = value;
    },
    
    initialLoading: function (state, value) {
      state.initialLoading = value;
    },

    totalSupply: function (state, value) {
      state.totalSupply = value;
    },
    publicMinted: function (state, value) {
      state.publicMinted = value;
    },
    milestonesMinted: function (state, value) {
      state.milestonesMinted = value;
    },
    supplyOk: function (state, value) {
      state.supplyOk = value;
    },


    cost: function (state, value) {
      state.cost = value;
    },
    costOk: function (state, value) {
      state.costOk = value;
    },
    allowanceOk: function (state, value) {
      state.allowanceOk = value;
    },




    almanacMaxMarket: function (state, value) {
      state.almanacMaxMarket = value;
    },
    almanacAllowedMarkets: function (state, value) {
      state.almanacAllowedMarkets = value;
    },
    almanacQueryTokenUri: function (state, value) {
      state.almanacQueryTokenUri = value;
    },



    almanacs: function (state, value) {
      state.almanacs = value;
    },
    userAlmanacs: function (state, value) {
      state.userAlmanacs = value;
    },
    filteredAlmanacs: function (state, value) {
      state.filteredAlmanacs = value;
    },
    loadingAlmanacs: function (state, value) {
      state.loadingAlmanacs = value;
    },
    loadingUserAlmanacs: function (state, value) {
      state.loadingUserAlmanacs = value;
    },


    filterOnlyUser: function (state, value) {
      state.filter.onlyUser = value;
    },
    filterMarket: function (state, value) {
      state.filter.market = value;
    },
    filterMilestone: function (state, value) {
      state.filter.milestone = value;
    },
    filterPage: function (state, value) {
      state.filter.page = value;
    },
    filterSortBy: function (state, value) {
      state.filter.sortBy = value;
    },


    almanacDaysSince: function (state, value) {
      state.almanac.daysSince = value;
    },
    almanacMarket: function (state, value) {
      state.almanac.market = value;
    },
    almanacAvailable: function (state, value) {
      state.almanac.nftAvailable = value;
    },
    almanacDataAvailable: function (state, value) {
      state.almanac.dataAvailable = value;
    },
    almanacQueryingAvailable: function (state, value) {
      state.almanac.queryingNftAvailable = value;
    },
    almanacQueryingDataAvailable: function (state, value) {
      state.almanac.queryingDataAvailable = value;
    },
  
  
    transactionStatus: function (state, value) {
      state.transaction.status = value;
    },
    transactionLink: function (state, value) {
      state.transaction.link = value;
    },
    transactionError: function (state, value) {
      state.transaction.error = value;
    },
    transactionIsApprove: function (state, value) {
      state.transaction.isApprove = value;
    },
  

    markets: function (state, value) {
      state.markets = value;
    },
    serverError: function (state, value) {
      state.serverError = value;
    }

}