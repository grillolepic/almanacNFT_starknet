<template>
    <span class="mainText">initialized: {{argent.initialized}}</span>
    <span class="mainText">connected: {{argent.connected}}</span>
    <button class="button extraMarginTop" @click="toggleConnect()">{{btnConnectText}}</button>

    <span class="mainText extraMarginTop" v-if="argent.isOwner">this wallet is the owner</span>
    <span class="contractInfo extraMarginTop" v-else>owner: {{argent.owner}}</span>

    <span class="contractInfo extraMarginTop">teth balance: {{argent.testEtherBalance}} teth</span>
    <span class="contractInfo">teth allowance: {{argent.testEtherAllowance}} teth</span>

    <span class="contractInfo extraMarginTop">teth balance in almanac contract: {{argent.testEtherBalanceInAlmanac}} teth</span>

    <span class="contractInfo extraMarginTop">almanac total supply: {{argent.almanacSupply}} almanacs</span>
    <span class="contractInfo"> - public minted: {{argent.publicMinted}} almanacs</span>
    <span class="contractInfo"> - special minted: {{argent.specialMinted}} almanacs</span>

    <span class="contractInfo extraMarginTop">available markets: {{argent.almanacAllowedMarkets}}</span>

    <span class="contractInfo extraMarginTop">my almanac balance: {{argent.almanacBalance}} almanacs</span>
    <span class="contractInfo">almanac cost: {{argent.almanacCost}} teth</span>

    <button class="button extraMarginTop" @click="allowTestEther()" v-if="argent.networkOk && parseFloat(argent.almanacCost) > parseFloat(argent.testEtherAllowance)">ALLOW TEST ETHER</button>

    <div id="inputContainer" v-if="argent.networkOk && parseFloat(argent.almanacCost) <= parseFloat(argent.testEtherAllowance)">
      <input class='input smallInput button extraMarginTop' type="text" v-model="market"/>
      <input class='input smallInput button' type="text" v-model="day"/>
      <button class="button extraMarginTop" @click="publicMint({market: parseInt(market), day: parseInt(day)})" v-if="argent.networkOk && parseFloat(argent.almanacCost) <= parseFloat(argent.testEtherAllowance)">PUBLIC MINT</button>
    </div>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input smallInput button extraMarginTop' type="text" v-model="market2"/>
      <input class='input smallInput button' type="text" v-model="day2"/>
      <input class='input bigInput button' type="text" v-model="owner"/>
      <button class="button extraMarginTop" @click="specialMint({market: parseInt(market2), day: parseInt(day2), owner: owner})">SPECIAL MINT</button>
    </div>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input smallInput button extraMarginTop' type="text" v-model="newMaxMarket"/>
      <button class="button" @click="setMaxMarket(parseInt(newMaxMarket))">SET MAX MARKET</button>
    </div>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input smallInput button extraMarginTop' type="text" v-model="newAllowMarket"/>
      <input type="checkbox" id="checkbox" v-model="newAllowMarketAllow" />
      <label for="checkbox">{{ newAllowMarketAllow }}</label>
      <button class="button" @click="setMarketAllowed({market: parseInt(newAllowMarket), allowed: newAllowMarketAllow?1:0})">SET ALLOWED MARKET</button>
    </div>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input smallInput button extraMarginTop' type="text" v-model="newCost"/>
      <button class="button" @click="setCost(parseFloat(newCost))">SET COST</button>
    </div>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input bigInput button extraMarginTop' type="text" v-model="newOwner"/>
      <button class="button" @click="setOwner(newOwner)" v-if="argent.networkOk">SET OWNER</button>
    </div>

    <button class="button extraMarginTop" @click="withdraw()" v-if="argent.networkOk">WITHDRAW</button>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input smallInput button extraMarginTop' type="text" v-model="market3"/>
      <input class='input smallInput button' type="text" v-model="day3"/>
      <button class="button extraMarginTop" @click="getAlmanac({market: parseInt(market3), day: parseInt(day3)})" v-if="argent.networkOk">GET ALMANAC FROM MARKET/DAY</button>
    </div>
    <span class="contractInfo">{{argent.almanacQuery}}</span>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input smallInput button extraMarginTop' type="text" v-model="id"/>
      <button class="button extraMarginTop" @click="getAlmanacInfo(parseInt(id))" v-if="argent.networkOk">GET ALMANAC FROM ID</button>
    </div>
    <span class="contractInfo">{{argent.almanacQueryId}}</span>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input smallInput button extraMarginTop' type="text" v-model="id2"/>
      <button class="button extraMarginTop" @click="getTokenUri(parseInt(id2))" v-if="argent.networkOk">GET TOKEN URI</button>
    </div>
    <span class="contractInfo">{{argent.almanacQueryTokenUri}}</span>

    <div id="inputContainer" v-if="argent.networkOk">
      <input class='input bigInput button extraMarginTop' type="text" v-model="uri"/>
      <button class="button extraMarginTop" @click="setBaseUri(uri)" v-if="argent.networkOk">SET BASE URI</button>
    </div>

</template>

<script>
import { mapState, mapActions } from 'vuex';


export default {
  name: 'Home',
  data() {
    return {
      market: 0,
      day: 0,
      market2: 0,
      day2: 0,
      owner: '0x029d77df837effe46f65e2eec0f907ef2e95593632366aa98887f1a9bca18985',

      market3: 0,
      day3: 0,
      id: 0,

      newOwner: '0x029d77df837effe46f65e2eec0f907ef2e95593632366aa98887f1a9bca18985',
      newCost: 0.05,
      newMaxMarket: 2,

      id2: 0,
      uri: 'https://nfcopier.xyz/n/',

      newAllowMarket: 3,
      newAllowMarketAllow: true
    }
  },
  methods: {
    ...mapActions('argent', ['connectArgentX', 'allowTestEther', 'publicMint', 'specialMint', 'getAlmanac', 'getAlmanacInfo', 'setMarketAllowed', 'setMaxMarket', 'setCost', 'setOwner', 'getTokenUri', 'setBaseUri', 'withdraw', 'logout']),
    toggleConnect: function (event) {
        if (this.argent.connected && this.argent.address) {
            if (this.argent.networkOk) {
                this.logout();
            }
        } else {
            this.connectArgentX();
        }
    },
  },
  computed: mapState({
    argent: (state) => state.argent,
    btnConnectText: (state) => {
        if (state.argent.connected && state.argent.address) {
            if (state.argent.networkOk) {
                return state.argent.address.toLowerCase().substring(0,6) + "..." + state.argent.address.toLowerCase().substring(state.argent.address.length-6,state.argent.address.length);
            } else {
                return "unsupported network";
            }
        } else {
            return "connect";
        }
    },
  }),
  mounted() {}
}
</script>

<style scoped>
.mainText {
  font-family: 'Major Mono Display', monospace;
  color: white;
  margin-top: 10px;
}

.contractInfo {
  color: white;
  margin-top: 10px;
  font-size: 18px;
  font-family: 'Major Mono Display', monospace;
}

.extraMarginTop {
  margin-top: 25px;
}

.button {
  border-radius: 15px;
  height: 32px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 18px;
}

.input {
  background-color: #503d77;
  color: white;
  text-align: center;
  margin-right: 10px;
}

.smallInput {
  width: 30px;
}

.bigInput {
  width: 480px;
}

label {
  color: white;
  margin-right: 10px;
  font-family: 'Major Mono Display', monospace;
  font-size: 12px;
}
</style>

