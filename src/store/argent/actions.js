const axios = require('axios').default;
import moment from 'moment';
import { connect, disconnect } from "@argent/get-starknet";
import { Contract, Account, number, uint256, validateAndParseAddress, hash, ec } from "starknet";

let INIT = false;
let STARKNET = null;
let ADDRESS = null;
let NETWORK_NAME = null;
let NETWORK_OK= null;
let COST = 0;
let COST_BN = null;
let BALANCE = 0;

let PUBLIC_SUPPLY = 0;
let MILESTONE_SUPPLY = 0;

let MARKETS = [];
let ALL_ALMANACS = [];
let USER_ALMANACS = [];
let FILTERED_ALMANACS = [];
let LOADED_ALMANACS = false;

let FILTER = {
    onlyUser: false,
    market: null,
    milestone: null,
    page: 0,
    sortBy: 'id'
}

const PAGE_SIZE = 12;

const supportedNetworks = ["goerli-alpha"]; //, "mainnet-alpha"];

const ARGENT_ABI = require('./ArgentAccount.json');

const MAINNET_ETHER_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const GOERLI_ETHER_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const ETHER_ABI = require('./Ether.json');
let ETHER_CONTRACT = null;

const MAINNET_ALMANAC_ADDRESS = "0x0175e2980c223827a8d5d616b81f5613b3f0cc22798686726ab29ad17b05dc4a";
const GOERLI_ALMANAC_ADDRESS = "0x0175e2980c223827a8d5d616b81f5613b3f0cc22798686726ab29ad17b05dc4a";
const ALMANAC_ABI = require('./Almanac.json');
let ALMANAC_CONTRACT = null;

let almanacAvailable = false;
let almanacDataAvailable = false;

const MAX_PUBLIC_SUPPLY = 9000;
let supplyOk = false;

let costOk = false;

let LAST_ALMANAC_INPUT = { market: 0, daysSince: 0 };
let ALMANAC_INPUT = { market: 0, daysSince: 0 };
let DATA_INPUT_TIMEOUT = null;
const INPUT_DELAY = 3 * 1000;


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
        let almanacsReq = await axios.get(`https://server.almanacnft.xyz/almanac/getAll/${(NETWORK_NAME == 'mainnet-alpha')?'starknet':'starknet_goerli'}/${i}`);
        ALL_ALMANACS = ALL_ALMANACS.concat(almanacsReq.data);
        if (almanacsReq.data.length < PAGE_SIZE) { break; }
    }

    context.commit('almanacs', ALL_ALMANACS);
    filterAlmanacs(context);
    context.commit('loadingAlmanacs', false);
    LOADED_ALMANACS = true;
}

const init = async function (context) {
    await getMarkets(context);
    await downloadAlmanacs(context);
    STARKNET = await connect({ showList: false, include:["argentX"] })
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
    console.log("starting almanac date");
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

    if (FILTER.page > totalPages) {
        FILTER.page = totalPages;
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

    costOk = (COST <= BALANCE);
    context.commit('costOk', costOk);
}

async function updateTotalSupply(context) {
    if (STARKNET) {

        //getPublicMinted()
        console.log("Finding Almanac public minted....");
        let response = await ALMANAC_CONTRACT.getPublicMinted();
        PUBLIC_SUPPLY = uint256.uint256ToBN(response.publicMinted).toNumber();
        context.commit('publicMinted', PUBLIC_SUPPLY);

        //getMilestonesMinted
        console.log("Finding Almanac Milestones minted....");
        let response2 = await ALMANAC_CONTRACT.getMilestonesMinted();
        MILESTONE_SUPPLY = uint256.uint256ToBN(response2.milestonesMinted).toNumber();
        context.commit('milestonesMinted', MILESTONE_SUPPLY);

        let total = PUBLIC_SUPPLY + MILESTONE_SUPPLY;
        context.commit('totalSupply', total);

        supplyOk = (PUBLIC_SUPPLY < MAX_PUBLIC_SUPPLY);
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
    try {
        if (STARKNET) {
            console.log("Finding Almanac cost....");
            let response = await ALMANAC_CONTRACT.getCost();
            COST_BN = response.cost;
            COST = parseFloat(formatEther(response.cost));
            context.commit('cost', COST);
            costOk = (COST <= BALANCE);
        } else {
            context.commit('cost', null);
            costOk = false;
            BALANCE = 0;
        }
        context.commit('costOk', costOk);
    } catch (err) {
        COST_BN = null;
    }
}

const logout = async function (context) {
    INIT = false;
    BALANCE = 0;
    COST = 0;
    costOk = false;
    context.commit('cost', null);
    context.commit('costOk', costOk);
    context.commit('balance', BALANCE);

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

    if ("market" in almanacConfig) {
        ALMANAC_INPUT.market = almanacConfig.market;
        console.log(`Setting market to: ${ALMANAC_INPUT.market}`)
        context.commit('almanacMarket', ALMANAC_INPUT.market);
    }
    
    if ("daysSince" in almanacConfig) {
        ALMANAC_INPUT.daysSince = almanacConfig.daysSince;
        console.log(`Setting daysSince to: ${ALMANAC_INPUT.daysSince}`)
        context.commit('almanacDaysSince', ALMANAC_INPUT.daysSince);
    }

    if (ALMANAC_INPUT.market != LAST_ALMANAC_INPUT.market || ALMANAC_INPUT.daysSince != LAST_ALMANAC_INPUT.daysSince) {

        context.commit('almanacAvailable', false);
        context.commit('almanacDataAvailable', false);
        context.commit('almanacQueryingAvailable', true);
        context.commit('almanacQueryingDataAvailable', true);
        context.commit('almanacWaitingInput', true);   

        clearTimeout(DATA_INPUT_TIMEOUT);
        DATA_INPUT_TIMEOUT = setTimeout(async () => {
            
            context.commit('almanacMarket', ALMANAC_INPUT.market);
            context.commit('almanacDaysSince', ALMANAC_INPUT.daysSince);

            LAST_ALMANAC_INPUT.market = ALMANAC_INPUT.market;
            LAST_ALMANAC_INPUT.daysSince = ALMANAC_INPUT.daysSince;

            context.commit('almanacWaitingInput', false);

            almanacAvailable = false;
            almanacDataAvailable = false;

            if (ALMANAC_CONTRACT != null) {
                try {
                    let response = await ALMANAC_CONTRACT.getAlmanac({market: ALMANAC_INPUT.market, day: ALMANAC_INPUT.daysSince});
                    let almanacId = uint256.uint256ToBN(response.almanacId).toNumber();
                    if (almanacId == 0) { almanacAvailable = true; }
                } catch (err) {}
                context.commit('almanacQueryingAvailable', false);
                context.commit('almanacAvailable', almanacAvailable);
            }
        
            if (almanacAvailable) {
                try { 
                    console.log("Trying to obtain data....");
                    let reqDataAvailable = await axios.get(`https://server.almanacnft.xyz/almanac/dataAvailable/${ALMANAC_INPUT.market}/${ALMANAC_INPUT.daysSince}`);
                    if (reqDataAvailable.data) {
                    almanacDataAvailable = reqDataAvailable.data.available;
                    }
                } catch (err) {}
            }
            context.commit('almanacQueryingDataAvailable', false); 
            context.commit('almanacDataAvailable', almanacDataAvailable);
        }, INPUT_DELAY);
    }
}

const resetDelay = async function resetDelay(context) {
    console.log("Resetting...")
    clearTimeout(DATA_INPUT_TIMEOUT);
}

async function mintAlmanac(context) {
    context.commit('transactionStatus', 0);
    
    try {
        await updateCost(context);

        if (COST_BN != null) {

            let approveCall = {
                contractAddress: GOERLI_ETHER_ADDRESS,
                entrypoint: "approve",
                calldata: [
                    GOERLI_ALMANAC_ADDRESS,
                    uint256.uint256ToBN(COST_BN).toString(),
                    0
                ],
            };
    
            let mintCall = {
                contractAddress: GOERLI_ALMANAC_ADDRESS,
                entrypoint: "publicMint",
                calldata: [ALMANAC_INPUT.market, ALMANAC_INPUT.daysSince],
            };
    
            let result = await STARKNET.account.execute([approveCall, mintCall]);
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
        } else {
            console.log(err);
            context.commit('transactionError', "Couldn't fetch cost");
            context.commit('transactionStatus', -1);
        }
    } catch (err) {
        console.log(err);
        context.commit('transactionError', "Unknown error");
        context.commit('transactionStatus', -1);
    }
}

const resetCurrentAlmanac = function resetCurrentAlmanac(context) {
    almanacAvailable = false;
    almanacDataAvailable = false;
    startDate(context);
    context.commit('almanacDaysSince', ALMANAC_INPUT.daysSince);
    context.commit('almanacMarket', ALMANAC_INPUT.market);
    context.commit('almanacAvailable', almanacAvailable);
    context.commit('almanacDataAvailable', almanacDataAvailable);
}
  
const resetTransaction = function resetTransaction(context) {
    context.commit('transactionStatus', null);
    context.commit('transactionLink', null);
    context.commit('transactionError', null);
}

const updateTitle = async function updateTitle(context, info) {

    context.commit('selectedAlmanacChanging', true);

    let objMessage = {
        id: info.id,
        title: info.title.substring(0,255),
        signer: ADDRESS
    }
    let strMessage = JSON.stringify(objMessage);
    let hashedMessage = number.toHex(hash.starknetKeccak(strMessage));

    let signableMessage = {
        domain: {
            name: "Almanac",
            chainId: (NETWORK_NAME == 'mainnet-alpha') ? "SN_MAIN" : "SN_GOERLI",
            version: "0.0.1",
        },
        types: {
            StarkNetDomain: [
                { name: "name", type: "felt" },
                { name: "chainId", type: "felt" },
                { name: "version", type: "felt" },
            ],
            Message: [{ name: "msg", type: "felt" }],
        },
        primaryType: "Message",
        message: {
            msg: hashedMessage
        }
    };

    try {
        let signature = await STARKNET.account.signMessage(signableMessage);
        let serverObject = {
            objMessage,
            signableMessage,
            signature
        }
        console.log(serverObject);

        let response = await axios.post(`https://server.almanacnft.xyz/almanac/updateTitle`,serverObject);

        await downloadAlmanacs(context);
        await selectAlmanac(context, info.id);
    } catch (err) {}

    context.commit('selectedAlmanacChanging', false);
}

const selectAlmanac = async function selectAlmanac(context, id) {
    context.commit('selectedAlmanacLoading', true);
    context.commit('selectedAlmanacId', id);

    console.log(`selectAlmanac(${id})`);

    if (!LOADED_ALMANACS) {
        return setTimeout(() => selectAlmanac(context, id), 2000);
    }

    if (id == 0) { return context.commit('selectedAlmanacExists', false); }
    else {
        let exists = ALL_ALMANACS.find((x) => x.id == id);
        if (exists != undefined) {
            context.commit('selectedAlmanacExists', true);

            context.commit('selectedAlmanacTitle', exists.title);
            context.commit('selectedAlmanacDescription', exists.description);
            context.commit('selectedAlmanacMarket', exists.market);

            if (USER_ALMANACS.includes(id)) {
                context.commit('selectedAlmanacUserOwned', true);
                context.commit('selectedAlmanacOwner', ADDRESS);
            } else {
                if (STARKNET) {
                    let response = await ALMANAC_CONTRACT.ownerOf(uint256.bnToUint256(number.toBN(id)));
                    let owner = validateAndParseAddress(response.owner);
                    context.commit('selectedAlmanacOwner', owner);
                    if (owner == ADDRESS) {
                        context.commit('selectedAlmanacUserOwned', true);
                    }
                }
            }
        } else {
            context.commit('selectedAlmanacExists', false);
        }
    }

    context.commit('selectedAlmanacLoading', false);
}

const resetSelectedAlmanac = async function selectAlmanac(context) {
    context.commit('selectedAlmanacLoading', false);
    context.commit('selectedAlmanacExists', false);
    context.commit('selectedAlmanacUserOwned', false);
    context.commit('selectedAlmanacId', null);
    context.commit('selectedAlmanacTitle', '');
    context.commit('selectedAlmanacDescription', null);
    context.commit('selectedAlmanacMarket', null);
    context.commit('selectedAlmanacOwner', null);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    init,
    logout,
    connectArgentX,

    setAlmanac,
    resetDelay,
    mintAlmanac,
    
    filterAlmanacs,

    selectAlmanac,
    resetSelectedAlmanac,
    updateTitle,

    resetCurrentAlmanac,
    resetTransaction
}