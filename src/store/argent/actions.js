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

let MARKETS = [];

let ALL_ALMANACS = [];
let USER_ALMANACS = [];
let FILTERED_ALMANACS = [];

let FILTER = {
    onlyUser: false,
    market: null,
    milestone: null,
    page: 0,
    sortBy: 'id'
}

const PAGE_SIZE = 12;

const supportedNetworks = ["goerli-alpha"]; //, "mainnet-alpha"];

const MAINNET_ETHER_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const GOERLI_ETHER_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const ETHER_ABI = require('./Ether.json');
let ETHER_CONTRACT = null;

const MAINNET_ALMANAC_ADDRESS = "0x0175e2980c223827a8d5d616b81f5613b3f0cc22798686726ab29ad17b05dc4a";
const GOERLI_ALMANAC_ADDRESS = "0x0175e2980c223827a8d5d616b81f5613b3f0cc22798686726ab29ad17b05dc4a";
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
      MARKETS = marketsReq.data
      console.log(MARKETS);
      context.commit('markets', MARKETS);
      context.commit('serverError', false);
    } catch (err) {
      console.log(" - Couldn't fetch markets!");
      console.log(err);
      context.commit('markets', []);
      context.commit('serverError', true);
    }
}

async function downloadAlmanacs(context) {
    console.log("downloadAlmanacs()");
    context.commit('loadingAlmanacs', true);
    let PAGE_SIZE = 1000;
    ALL_ALMANACS = [];

    for (let i=0; i<10; i++) {
        console.log(i);
        let almanacsReq = await axios.get(`https://server.almanacnft.xyz/almanac/getAll/${(NETWORK_NAME == 'mainnet-alpha')?'starknet':'starknet_goerli'}/${i}`);
        ALL_ALMANACS = ALL_ALMANACS.concat(almanacsReq.data);
        if (almanacsReq.data.length < PAGE_SIZE) { break; }
    }

    context.commit('almanacs', ALL_ALMANACS);
    filterAlmanacs(context);
    context.commit('loadingAlmanacs', false);
}

const init = async function (context) {
    await getMarkets(context);
    await downloadAlmanacs(context);
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

const filterAlmanacs = function (context, settings = {}) {
    console.log("filterAlmanacs()");

    if ("onlyUser" in settings) { FILTER.onlyUser = settings.onlyUser; }
    if ("market" in settings) { FILTER.market = settings.market; }
    if ("milestone" in settings) { FILTER.milestone = settings.milestone; }
    if ("page" in settings) { FILTER.page = settings.page; }
    if ("sortBy" in settings) { FILTER.sortBy = settings.sortBy; }

    FILTERED_ALMANACS = ALL_ALMANACS.concat([]);
    FILTERED_ALMANACS = FILTERED_ALMANACS.filter((x) => (FILTER.onlyUser)?(USER_ALMANACS.includes(x.id)):true);
    FILTERED_ALMANACS = FILTERED_ALMANACS.filter((x) => (FILTER.market != null)?(x.market ==FILTER.market):true);
    FILTERED_ALMANACS = FILTERED_ALMANACS.filter((x) => (FILTER.milestone != null)?(FILTER.milestone?(x.id <= 1000):(x.id > 1000)):true);

    if (FILTER.sortBy == 'id') {
        FILTERED_ALMANACS.sort((a,b) => a.id - b.id);
    } else if (FILTER.sortBy == 'day_up') {
        FILTERED_ALMANACS.sort((a,b) => a.timestamp - b.timestamp);
    } else if (FILTER.sortBy == 'day_down') {
        FILTERED_ALMANACS.sort((a,b) => b.timestamp - a.timestamp);
    } else if (FILTER.sortBy == 'change_up') {
        FILTERED_ALMANACS.sort((a,b) => a.change - b.change);
    } else if (FILTER.sortBy == 'change_down') {
        FILTERED_ALMANACS.sort((a,b) => b.change - a.change);
    }

    let totalPages = Math.ceil(FILTERED_ALMANACS.length/PAGE_SIZE) - 1;

    if (FILTERED_ALMANACS.length > PAGE_SIZE) {
        FILTERED_ALMANACS = FILTERED_ALMANACS.slice(FILTER.page * PAGE_SIZE, (FILTER.page * PAGE_SIZE) + 12);
    }

    context.commit('galleryPages', totalPages);
    context.commit('filterOnlyUser', FILTER.onlyUser);
    context.commit('filterMarket', FILTER.market);
    context.commit('filterMilestone', FILTER.milestone);
    context.commit('filterPage', FILTER.page);
    context.commit('filterSortBy', FILTER.sortBy);

    context.commit('filteredAlmanacs', FILTERED_ALMANACS);
}

const connectArgentX = async function (context) {
    STARKNET = await connect({
        //include: ["argentX"],
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

            loadUserAlmanacs(context);
            downloadAlmanacs(context);

            await updateCost(context);
            await updateTotalSupply(context);
            await updateBalance(context);
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
        context.commit('transactionIsApprove', true);
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
    console.log("Loading User Almanacs...");
    context.commit("loadingUserAlmanacs", true);

    USER_ALMANACS = [];
    context.commit("userAlmanacs", USER_ALMANACS);

    try {
        let almanacsReq = await axios.get(`https://api-testnet.aspect.co/assets?owner_address=${ADDRESS}&contract_address=${(NETWORK_NAME == 'mainnet-alpha')?MAINNET_ALMANAC_ADDRESS:GOERLI_ALMANAC_ADDRESS}`);
        for (let i=0; i<almanacsReq.data.length; i++) {
            USER_ALMANACS.push(parseInt(almanacsReq.data[i].token_id));
        }
    } catch (err) {
        let response = await ALMANAC_CONTRACT.balanceOf(ADDRESS);
        let numberOfAlmanacs = uint256.uint256ToBN(response.balance).toNumber();
    
        for (let i=0; i<numberOfAlmanacs; i++) {
            let idx = uint256.bnToUint256(number.toBN(i));
            let response2 = await ALMANAC_CONTRACT.tokenOfOwnerByIndex(ADDRESS, idx);
            let id = uint256.uint256ToBN(response2.tokenId).toNumber();
            if (!USER_ALMANACS.includes(id)) {
                USER_ALMANACS.push(id);
                context.commit("userAlmanacs", USER_ALMANACS);
                filterAlmanacs(context)
            }
        }
    }

    context.commit("userAlmanacs", USER_ALMANACS);
    context.commit("loadingUserAlmanacs", false);
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
    context.commit('transactionIsApprove', false);
    
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
        setTimeout(() => {
            downloadAlmanacs(context);
            loadUserAlmanacs(context);
        }, 2000 * 60);
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
    
    filterAlmanacs,

    resetCurrentAlmanac,
    resetTransaction
}