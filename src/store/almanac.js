import axios from 'axios';
import { Contract, uint256, validateAndParseAddress, CallData, hash, num } from "starknet";
import { defineStore } from 'pinia';
import moment from 'moment';
import { serverNetworkTag, ownerAddress, almanacAddress, etherAddress, defaultChainId } from '@/helpers/blockchainConstants';
import almanacMainnetAbi from '../assets/abis/almanac_mainnet.json' assert {type: 'json'};
import almanacTestnetAbi from '../assets/abis/almanac_testnet.json' assert {type: 'json'};
import argentAccountAbi from '../assets/abis/argent_account.json' assert {type: 'json'};
import { useStarknetStore } from '@/store/starknet';
import { formatEther } from '@/helpers/ethereumHelpers';

let _almanacContract = null;
let _starknetStore = null;

let _loadedAlmanacs = false;
let _priceBigInt = null;
let _dataInputTimeout = null;
let _lastAlmanacInput = {
    market: 0,
    daysSince: 0
};

const pageSize = 12;

let _initialState = {
    startDate: new Date(2008, 0, 1),
    markets: [],
    serverError: false,
    loadingAlmanacs: false,
    almanacs: [],
    userAlmanacs: [],
    galleryPages: 0,
    filter: {
        onlyUser: false,
        market: null,
        milestone: null,
        page: 0,
        sortBy: 'id'
    },
    filterChanging: false,
    filteredAlmanacs: [],
    enabled: true,
    isOwner: false,
    priceOk: false,
    totalSupply: 0,
    publicMinted: 0,
    milestonesMinted: 0,
    supplyOk: true,
    price: null,
    priceOk: false,
    almanacInput: {
        market: 0,
        daysSince: 0,
        nftAvailable: false,
        dataAvailable: false
    },
    queryingNftAvailable: false,
    queryingDataAvailable: false,
    waitingInput: false,

    selectedAlmanac: {
        id: null,
        market: null,
        owner: null,
        title: '',
        description: null,
        loading: false,
        changing: false,
        exists: false,
        userOwned: false
    },

    findingRandom: false,
    randomMarket: 0,
    randomNotFound: false
};

export const useAlmanacStore = defineStore('almanac', {
    state: () => { return { ..._initialState } },
    getters: {
        aspectUri: () => {
            if (_starknetStore.isStarknetTestnet) {
                return `https://aspect.co/asset/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            } else {
                return `https://aspect.co/asset/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            }
        },
        mintsquareUri: () => {
            if (_starknetStore.isStarknetTestnet) {
                return `https://mintsquare.io/asset/starknet-testnet/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            } else {
                return `https://mintsquare.io/asset/starknet/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            }
        },
        unframedUri: () => {
            if (_starknetStore.isStarknetTestnet) {
                return ``;
            } else {
                return `https://unframed.co/collection/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            }
        },
        unframedAssetUri: () => {
            if (_starknetStore.isStarknetTestnet) {
                return ``;
            } else {
                return `https://unframed.co/item/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            }
        },
        flexUri: () => {
            if (_starknetStore.isStarknetTestnet) {
                return ``;
            } else {
                return `https://flexing.gg/starknet/collection/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            }
        },
        flexAssetUri: () => {
            if (_starknetStore.isStarknetTestnet) {
                return ``;
            } else {
                return `https://flexing.gg/starknet/asset/${almanacAddress[_starknetStore.chainId] ?? almanacAddress[defaultChainId]}`;
            }
        }
    },
    actions: {
        async init() {
            console.log("almanac: init()");
            _starknetStore = useStarknetStore();

            await this.getMarkets();
            await this.downloadAlmanacs();
        },

        async getMarkets() {
            console.log("almanac: getMarkets()");
            try {
                let marketsReq = await axios.get(`https://server.almanacnft.xyz/almanac/markets`);
                this.$patch({
                    markets: marketsReq.data,
                    serverError: false
                });
            } catch (err) {
                console.log(" - Couldn't fetch markets!");
                this.$patch({
                    markets: [],
                    serverError: true
                });
            }
        },

        async loadUserAlmanacs() {
            console.log("almanac: loadUserAlmanacs()");
            if (!_starknetStore.isStarknetConnected || _almanacContract == null) { return null; }

            this.$patch({
                loadingUserAlmanacs: true,
                userAlmanacs: []
            });

            let USER_ALMANACS = [];

            let response = await _almanacContract.balanceOf(_starknetStore.address);
            let numberOfAlmanacs = Number(uint256.uint256ToBN(response.balance));

            for (let i = 0; i < numberOfAlmanacs; i++) {
                let idx = uint256.bnToUint256(i);
                let response2 = await _almanacContract.tokenOfOwnerByIndex(_starknetStore.address, idx);
                let id = Number(uint256.uint256ToBN(response2.tokenId));
                if (!USER_ALMANACS.includes(id)) {
                    USER_ALMANACS.push(id);
                    this.userAlmanacs = USER_ALMANACS;
                    this.filterAlmanacs();
                }
            }

            this.$patch({
                loadingUserAlmanacs: false,
                userAlmanacs: USER_ALMANACS
            });
        },

        async downloadAlmanacs() {
            console.log("almanac: downloadAlmanacs()");
            const pageSize = 1000;

            this.$patch({
                loadingAlmanacs: true,
                almanacs: []
            });

            let allAlmanacs = [];

            for (let i = 0; i < 10; i++) {
                let almanacsReq = await axios.get(`https://server.almanacnft.xyz/almanac/getAll/${serverNetworkTag[_starknetStore.currentOrDefaultChainId]}/${i}`);
                allAlmanacs = allAlmanacs.concat(almanacsReq.data);
                if (almanacsReq.data.length < pageSize) { break; }
            }

            this.almanacs = [...allAlmanacs];
            this.filterAlmanacs();

            this.loadingAlmanacs = false;
            _loadedAlmanacs = true;
        },

        async loggedIn() {
            console.log("almanac: loggedIn()");

            if (_starknetStore == ownerAddress) {
                this.isOwner = true;
            }

            _almanacContract = new Contract(
                _starknetStore.isStarknetTestnet ? almanacTestnetAbi : almanacMainnetAbi,
                almanacAddress[_starknetStore.chainId],
                _starknetStore.account
            );

            if (this.almanacInput.daysSince == 0) {
                this.resetCurrentAlmanac();
            }

            _starknetStore.resetTransaction();

            this.loadUserAlmanacs();
            this.downloadAlmanacs();

            await this.updateEnabled();
            await this.updatePrice();
            await this.updateTotalSupply();
        },

        async updateEnabled() {
            console.log("almanac: updateEnabled()");
            if (_almanacContract != null) {
                try {
                    let response = await _almanacContract.isEnabled();
                    return this.enabled = (Number(response.enabled) > 0);
                } catch (err) { }
            }
            this.enabled = false;
        },

        async updatePrice() {
            console.log("almanac: updatePrice()");

            if (_almanacContract != null) {
                try {
                    let response = await _almanacContract.getPrice();
                    _priceBigInt = response.price;
                    this.price = parseFloat(formatEther(response.price));
                    this.priceOk = (this.price < _starknetStore.balance);
                    return;
                } catch (err) { }
            }

            this.$patch({
                price: null,
                priceOk: false
            });
            _priceBigInt = null;
        },

        async updateTotalSupply() {
            console.log("almanac: updateTotalSupply()");

            if (_almanacContract != null) {
                const maxPublicSupply = 9950;
                try {
                    let response = await _almanacContract.getPublicMinted();
                    this.publicMinted = Number(uint256.uint256ToBN(response.publicMinted));

                    response = await _almanacContract.getMilestonesMinted();
                    this.milestonesMinted = Number(uint256.uint256ToBN(response.milestonesMinted));

                    this.totalSupply = this.publicMinted + this.milestonesMinted;
                    this.supplyOk = (this.publicMinted < maxPublicSupply);

                    return;
                } catch (err) { }
            }

            this.$patch({
                totalSupply: 0,
                publicMinted: 0,
                milestonesMinted: 0,
                supplyOk: false
            });
        },

        //Gallery
        filterAlmanacs(settings = {}) {
            console.log(`almanac: filterAlmanacs(${JSON.stringify(settings)})`);

            this.filterChanging = true;

            let tempFilter = { ... this.filter };

            if ("onlyUser" in settings) { tempFilter.onlyUser = settings.onlyUser; }
            if ("market" in settings) { tempFilter.market = settings.market; }
            if ("milestone" in settings) { tempFilter.milestone = settings.milestone; }
            if ("page" in settings) { tempFilter.page = settings.page; }
            if ("sortBy" in settings) { tempFilter.sortBy = settings.sortBy; }

            let filteredAlmanacs = [... this.almanacs];
            filteredAlmanacs = filteredAlmanacs.filter((x) => (tempFilter.onlyUser) ? (this.userAlmanacs.includes(x.id)) : true);
            filteredAlmanacs = filteredAlmanacs.filter((x) => (tempFilter.market != null) ? (x.market == tempFilter.market) : true);
            filteredAlmanacs = filteredAlmanacs.filter((x) => (tempFilter.milestone != null) ? (tempFilter.milestone ? (x.id <= 1000) : (x.id > 1000)) : true);

            if (tempFilter.sortBy == 'id') {
                filteredAlmanacs.sort((a, b) => a.id - b.id);
            } else if (tempFilter.sortBy == 'day_up') {
                filteredAlmanacs.sort((a, b) => a.timestamp - b.timestamp);
            } else if (tempFilter.sortBy == 'day_down') {
                filteredAlmanacs.sort((a, b) => b.timestamp - a.timestamp);
            } else if (tempFilter.sortBy == 'change_up') {
                filteredAlmanacs.sort((a, b) => a.change - b.change);
            } else if (tempFilter.sortBy == 'change_down') {
                filteredAlmanacs.sort((a, b) => b.change - a.change);
            }

            let totalPages = Math.ceil(filteredAlmanacs.length / pageSize) - 1;
            totalPages = Math.max(totalPages, 0);

            if (filteredAlmanacs.length > pageSize) {
                filteredAlmanacs = filteredAlmanacs.slice(tempFilter.page * pageSize, (tempFilter.page * pageSize) + pageSize);
            }

            if (tempFilter.page > totalPages) {
                tempFilter.page = totalPages;
            }

            this.$patch({
                galleryPages: totalPages,
                filter: { ...tempFilter },
                filteredAlmanacs: [...filteredAlmanacs],
                filterChanging: false
            });
        },

        async selectAlmanac(id) {
            console.log(`almanac: selectAlmanac(${id})`);

            this.selectedAlmanac.loading = true;
            this.selectedAlmanac.id = id;

            if (!_loadedAlmanacs) {
                return setTimeout(() => this.selectAlmanac(id), 2000);
            }

            if (id == 0) { return this.selectedAlmanac.exists = false; }
            else {
                let exists = this.almanacs.find((x) => x.id == id);
                if (exists != undefined) {

                    this.selectedAlmanac.exists = true;
                    this.selectedAlmanac.title = exists.title;
                    this.selectedAlmanac.description = exists.description;
                    this.selectedAlmanac.market = exists.market;

                    if (this.userAlmanacs.includes(id)) {
                        this.selectedAlmanac.userOwned = true;
                        this.selectedAlmanac.owner = _starknetStore.address;
                    } else {
                        if (_starknetStore.isStarknetConnected && _almanacContract != null) {
                            let response = await _almanacContract.ownerOf(uint256.bnToUint256(id));
                            let owner = validateAndParseAddress(response.owner);
                            this.selectedAlmanac.owner = owner;
                            if (owner == _starknetStore.address) {
                                this.selectedAlmanac.userOwned = true;
                            }
                        }
                    }
                } else {
                    this.selectedAlmanac.exists = false;
                }
            }

            this.selectedAlmanac.loading = false;
        },

        async resetSelectedAlmanac() {
            this.selectedAlmanac = {
                id: null,
                market: null,
                owner: null,
                title: '',
                description: null,
                loading: false,
                changing: false,
                exists: false,
                userOwned: false
            };
        },

        async loggedOff() {
            console.log("almanac: loggedOff()");
            _almanacContract = null;
            this.$patch({
                isOwner: false,
                priceOk: false,
                userAlmanacs: [],
            });
            this.filterAlmanacs();
        },

        async updateTitle(info) {

            this.selectedAlmanacChanging = true;

            const titleRegex = new RegExp("^[a-zA-Z\ \'!?]{0,65}$");
            let title = info.title.substring(0, 65);

            if (!titleRegex.test(title)) { return; }

            //First, I build an object with all the info I want the user to sign
            let objMessage = {
                id: info.id,
                title: title,
                signer: _starknetStore.address
            };

            //I then hash the object with starknet.js starknetKeccak()
            let strMessage = JSON.stringify(objMessage);
            let hashedMessage = num.toHex(hash.starknetKeccak(strMessage));

            //I build the message for the user to sign and I include the hash as the message
            let signableMessage = {
                domain: {
                    name: "Almanac",
                    chainId: (_starknetStore.isStarknetTestnet) ? "SN_GOERLI" : "SN_MAIN",
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
                //I ask the user to sign the message
                let signature = await _starknetStore.signMessage(signableMessage);

                //I build a new object with the original object, the signable message and the signature
                let serverObject = {
                    objMessage,
                    signableMessage,
                    signature
                }

                //Finally, I send the object to my server, 
                await axios.post(`https://server.almanacnft.xyz/almanac/updateTitle`, serverObject);

                await this.downloadAlmanacs();
                await this.selectAlmanac(info.id);
            } catch (err) { }

            this.selectedAlmanacChanging = false;
        },


        //Minting
        setCurrentDate(force_update = false) {
            console.log("almanac: setCurrentDate()");
            let startingDate = moment.utc(new Date(2008, 0, 1));
            let currentDate = moment.utc().subtract(1, 'day');
            let currentDaysSince = currentDate.diff(startingDate, 'days');
            this.setAlmanac({
                daysSince: currentDaysSince,
                market: 0
            }, force_update);
        },

        setAlmanac(almanacConfig, force_update = false) {
            console.log(`almanac: setAlmanac(${almanacConfig.market}, ${almanacConfig.daysSince})`);

            if ("market" in almanacConfig) {
                this.almanacInput.market = almanacConfig.market;
            }

            if ("daysSince" in almanacConfig) {
                this.almanacInput.daysSince = almanacConfig.daysSince;
            }

            if (this.almanacInput.market != _lastAlmanacInput.market || this.almanacInput.daysSince != _lastAlmanacInput.daysSince || force_update) {
                this.almanacInput.nftAvailable = false;
                this.almanacInput.dataAvailable = false;
                this.$patch({
                    queryingNftAvailable: true,
                    queryingDataAvailable: true,
                    waitingInput: true
                });

                const MILESTONES = [[0, 277], [0, 304], [0, 368], [0, 377], [0, 981], [0, 1025], [0, 1039], [0, 1096], [0, 1135], [0, 1207], [0, 1254], [0, 1416], [0, 1498], [0, 1792], [1, 2157], [0, 2178], [0, 2256], [1, 2282], [1, 2349], [1, 2394],
                [1, 2767], [1, 2806], [1, 3090], [0, 3112], [1, 3123], [1, 3411], [1, 3461], [0, 3500], [1, 3619], [1, 3639], [1, 3958], [1, 4210], [0, 4514], [1, 4550], [1, 4581], [0, 4606], [1, 4623], [1, 4643], [1, 4718], [1, 4761],
                [1, 4965], [1, 4966], [0, 4998], [1, 5080], [1, 5333], [1, 5371]];

                if (MILESTONES.includes([this.almanacInput.market, this.almanacInput.daysSince])) {
                    this.$patch({
                        queryingNftAvailable: false,
                        queryingDataAvailable: false,
                        waitingInput: false
                    });
                } else {
                    const inputDelay = force_update ? 0 : 2000;
                    clearTimeout(_dataInputTimeout);

                    _dataInputTimeout = setTimeout(async () => {
                        console.log(`almanac: setAlmanac(${this.almanacInput.market}, ${this.almanacInput.daysSince}) [TIMEOUT]`);

                        _lastAlmanacInput.market = this.almanacInput.market;
                        _lastAlmanacInput.daysSince = this.almanacInput.daysSince;
                        this.waitingInput = false;

                        if (_almanacContract != null) {
                            try {
                                let response = await _almanacContract.getAlmanac({ market: this.almanacInput.market, day: this.almanacInput.daysSince });
                                let almanacId = Number(uint256.uint256ToBN(response.almanacId));

                                if (almanacId == 0) {
                                    this.almanacInput.nftAvailable = true;
                                }
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        this.queryingNftAvailable = false;

                        if (this.almanacInput.nftAvailable) {
                            try {
                                let reqDataAvailable = await axios.get(`https://server.almanacnft.xyz/almanac/dataAvailable/${this.almanacInput.market}/${this.almanacInput.daysSince}`);
                                if (reqDataAvailable.data) {
                                    this.almanacInput.dataAvailable = reqDataAvailable.data.available;
                                }
                            } catch (err) { }
                        }
                        this.queryingDataAvailable = false;

                    }, inputDelay);
                }
            }
        },

        resetCurrentAlmanac() {
            console.log("almanac: resetCurrentAlmanac()");
            this.setCurrentDate(true);
        },

        async resetDelay() {
            console.log("almanac: resetDelay()");
            clearTimeout(_dataInputTimeout);
        },

        async randomize(market) {
            console.log("almanac: randomize()");
            this.$patch({
                randomMarket: market,
                findingRandom: true,
                randomNotFound: false
            });

            try {
                let reqDataAvailable = await axios.get(`https://server.almanacnft.xyz/almanac/random/${(_starknetStore.isStarknetTestnet) ? "starknet_goerli" : "starknet"}/${this.randomMarket}`);
                if (reqDataAvailable.data) {
                    if ('market' in reqDataAvailable.data && 'daysSince' in reqDataAvailable.data) {
                        this.$patch({
                            almanacInput: {
                                market: reqDataAvailable.data.market,
                                daysSince: reqDataAvailable.data.daysSince,
                                nftAvailable: true,
                                dataAvailable: true
                            },
                            queryingNftAvailable: false,
                            queryingDataAvailable: false,
                            waitingInput: false
                        });
                    } else {
                        this.randomNotFound = true;
                    }
                }
            } catch (err) {
                this.randomNotFound = true;
            }

            this.findingRandom = false;
        },

        async mintAlmanac() {
            console.log("almanac: mintAlmanac()");

            _starknetStore.resetTransaction();

            await this.updatePrice();

            if (_priceBigInt != null) {

                let approveCall = {
                    contractAddress: etherAddress[_starknetStore.currentOrDefaultChainId],
                    entrypoint: "approve",
                    calldata: CallData.compile({
                        spender: almanacAddress[_starknetStore.currentOrDefaultChainId],
                        amount: _priceBigInt,
                    })
                };
                let mintCall = {
                    contractAddress: almanacAddress[_starknetStore.currentOrDefaultChainId],
                    entrypoint: "publicMint",
                    calldata: CallData.compile({
                        almanac: {
                            market: this.almanacInput.market,
                            day: this.almanacInput.daysSince
                        },
                        recipient: 0
                    }),
                };

                if (await _starknetStore.sendTransactions([approveCall, mintCall])) {
                    this.almanacInput.nftAvailable = false;
                    setTimeout(() => {
                        this.loadUserAlmanacs();
                        this.downloadAlmanacs();
                    }, 2000 * 60);
                }
            }
        }

    }
});