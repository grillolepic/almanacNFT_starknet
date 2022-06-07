<template>
  <div class="viewContainer">
    <div id="title">gallery</div>
    <div id="explain">your AlmAnAc nfts</div>

    <div id="loadingMessage" v-if="argent.loadingAlmanacs || argent.almanacs.length == 0">
        <div class="message" v-if="argent.loadingAlmanacs">Loading Almanac NFTs...</div>
        <div class="messageContainer" v-else>
            <div class="message">No almanacs minted</div>
            <router-link :to="'/mint'"><div id="mintNowButton" class="button noSelect">mint yours now</div></router-link>
        </div>
    </div>
    <div id="nftContainer" v-else>
        <div v-for="(nft, index) in argent.filteredAlmanacs" :key="index">
            <div class="containNft">
                <div class="almanacNft" @click="goToLink(`https://server.almanacNFT.xyz/almanac/nfts/${argent.networkName == 'mainnet-alpha'?'starknet':'starknet_goerli'}/video/${argent.filteredAlmanacs[index].id}`)" :style="almanacStyle(index)"></div>
                <div class="almanacName">{{argent.filteredAlmanacs[index].name}}</div>
                <div class="almanacDescription">{{argent.filteredAlmanacs[index].description}}</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import moment, { max } from 'moment';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Gallery',
  data() { return {

  }},
  mounted: function() {},
  components: {},
  methods: {
    ...mapActions('argent', []),
    almanacStyle: function(index) {
      let style = `background-image: url("https://server.almanacNFT.xyz/almanac/nfts/${this.argent.networkName == 'mainnet-alpha'?'starknet':'starknet_goerli'}/image/${this.argent.filteredAlmanacs[index].id}");`;
      return style;
    },
    goToLink(link) {
      window.open(link);
    },
  },
  computed: mapState({
      argent: (state) => state.argent,
  }),
}
</script>

<style scoped>

    .viewContainer {
        justify-content: flex-start;
    }

    #explain {
        color: white;
        font-size: 28px;
        margin-bottom: 20px;
        text-align: center;
        font-family: 'Major Mono Display', monospace;
    }

    #nftContainer {
        margin-top: 30px;
        margin-bottom: 80px;
        width: 100%;
        min-height: calc(100vh - 340px);
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: flex-start;
        justify-content: flex-start;
        align-items: flex-start;
    }

    #loadingMessage {
        margin-top: 30px;
        width: 100%;
        height: calc(100vh - 340px);
        color: white;
        display: flex;
        align-content: center;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 36px;
        font-family: 'Gemunu Libre', sans-serif;
        letter-spacing: 1px;
    }

        .messageContainer {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .message {
            margin-bottom: 50px;
        }

        #mintNowButton {
            margin-bottom: 100px;
            height: 40px;
            width: 400px;
            font-size: 32px;
            line-height: 40px;
            font-family: 'Major Mono Display', monospace;
        }

    .containNft {
        display: flex;
        flex-direction: column;
        color: white;
    }
        .almanacNft {
            width: 290px;
            height: 290px;
            background-color: #120c2c;
            margin-left: 20px;
            margin-right: 20px;
            margin-bottom: 5px;
            margin-top: 30px;
            background-size: contain;
            cursor: pointer;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
        }

        .almanacNft:hover {
            transform: scale(1.02);
            transition-duration: 100ms;
        }

        .almanacName {
            margin-left: 20px;
            font-family: 'Gemunu Libre', sans-serif;
            font-size: 14px;
            letter-spacing: 1px;
        }

        .almanacDescription {
            width: 300px;
            margin-left: 20px;
            margin-top: 2px;
            font-family: 'Gemunu Libre', sans-serif;
            font-size: 18px;
            letter-spacing: 1px;
        }

    @media only screen and (max-width: 549px) {

    #title {
        margin-top: 0px;
        font-size: 65px;
    }

    #explain {
        font-size: 26px;
        margin-bottom: 0px;
    }

    #nftContainer {
        margin-top: 10px;
        margin-bottom: 80px;
        justify-content: center;
    }


    #loadingMessage {
        width: 80%;
        font-size: 26px;
        text-align: center;
    }

        .message {
            margin-bottom: 100px;
        }
    }





</style>