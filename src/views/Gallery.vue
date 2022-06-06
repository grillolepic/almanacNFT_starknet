<template>
  <div class="viewContainer">
    <div id="title">gallery</div>
    <div id="explain">your AlmAnAc nfts</div>

    <div id="loadingMessage" v-if="argent.loadingAlmanacs || argent.userAlmanacs.length ==0">
        <div class="message" v-if="argent.loadingAlmanacs">Loading your Almanac NFTs...</div>
        <div class="message" v-else>You don't seem to own any Almanac NFT</div>
    </div>
    <div id="nftContainer" v-else>
        <div v-for="(nft, index) in argent.userAlmanacs" :key="index">
            <div class="containNft">
                <div class="almanacNft" @click="goToLink(argent.userAlmanacs[index].animation_url)"  :style="almanacStyle(index)"></div>
                <div class="almanacName">{{argent.userAlmanacs[index].name}}</div>
                <div class="almanacDescription">{{argent.userAlmanacs[index].description}}</div>
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
      let style = `background-image: url("${this.argent.userAlmanacs[index].image}");`;
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

        .message {
            margin-bottom: 100px;
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