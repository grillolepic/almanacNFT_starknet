<template>

  <div id="selectContainer" :class="{ 'show-select-bg': selectOpen }" @click="showSelect(false)">
    <div id="optionsContainer" :class="{ 'hide-options': !selectOpen }">
      <div id="optionsBg">
        <div id="optionsTitle" class="label">{{selectTitle}}:</div>
        <div id="optionsScroller" class="sc5">
          <div class="optionsOption" v-for="(item, index) in selectOptions" :key="item.id" @click="selectOption(index)" :class="{selectedOption: isOptionSelected(index)}">
            <div id="marketIcon" v-if="selectType=='market' && index > 0" :style="optionMarketIconStyle(index)"></div>
            <span>{{selectOptions[index].name}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="viewContainer">
    <div id="title">gallery</div>

    <div id="loadingMessage" v-if="argent.loadingAlmanacs || argent.almanacs.length == 0">
        <div class="message" v-if="argent.loadingAlmanacs">Loading Almanac NFTs...</div>
        <div class="messageContainer" v-else>
            <div class="message">No almanacs minted</div>
            <router-link :to="'/mint'"><div id="mintNowButton" class="button noSelect">mint yours now</div></router-link>
        </div>
    </div>
    <div id="galleryContainer" v-else>
        <div id="settings">
            <div class="filterOption">
                <div class="filterTitle">Owned by:</div>
                <div class="filterShow noSelect" @click="switchOwner()">{{(argent.filter.onlyUser)?'me':'show all'}}</div>
            </div>
            <div class="filterOption">
                <div class="filterTitle">Market:</div>
                <div class="filterShow noSelect" @click="showSelect(true)">{{(argent.filter.market != null)?(argent.markets[argent.filter.market].name):'show all'}}</div>
            </div>
            <div class="filterOption">
                <div class="filterTitle">Sort By:</div>
                <div class="filterShow noSelect" @click="switchSortBy()">{{(argent.filter.sortBy).replace("_up", "   ▲").replace("_down", "   ▼")}}</div>
            </div>
        </div>
        <div id="nftContainer">
            <div v-for="(nft, index) in argent.filteredAlmanacs" :key="index">
                <div class="containNft">
                    <div class="almanacNft" @click="goToLink(`https://server.almanacNFT.xyz/almanac/nfts/${argent.networkName == 'mainnet-alpha'?'starknet':'starknet_goerli'}/video/${argent.filteredAlmanacs[index].id}`)" :style="almanacStyle(index)"></div>
                    <div class="almanacName">Almanac #{{argent.filteredAlmanacs[index].id}}</div>
                    <div class="almanacDescription">{{argent.filteredAlmanacs[index].description}}</div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Gallery',
  data() { return {
    selectOpen: false,
    selectType: "market",
    selectTitle: 'Market:',
    selectOptions: [],
  }},
  mounted: function() {},
  components: {},
  methods: {
    ...mapActions('argent', ['filterAlmanacs']),
    almanacStyle: function(index) {
      let style = `background-image: url("https://server.almanacNFT.xyz/almanac/nfts/${this.argent.networkName == 'mainnet-alpha'?'starknet':'starknet_goerli'}/image/${this.argent.filteredAlmanacs[index].id}");`;
      return style;
    },

    switchOwner() {
        this.filterAlmanacs({ onlyUser: !this.argent.filter.onlyUser })
    },

    switchSortBy() {
        if (this.argent.filter.sortBy == 'id') {
            this.filterAlmanacs({ sortBy: 'day_up'});
        } else if (this.argent.filter.sortBy == 'day_up') {
            this.filterAlmanacs({ sortBy: 'day_down'});
        } else if (this.argent.filter.sortBy == 'day_down') {
            this.filterAlmanacs({ sortBy: 'change_up'});
        } else if (this.argent.filter.sortBy == 'change_up') {
            this.filterAlmanacs({ sortBy: 'change_down'});
        } else {
            this.filterAlmanacs({ sortBy: 'id'});
        }
    },

    showSelect: function (visible, section = "market") {
        this.selectOpen = visible;
        if (visible) {
            this.selectType = section;
            if (section == "market") {
                let options = ([{name:'show all', value:'all'}]).concat(this.argent.markets);
                this.selectOptions = options;
            }
        }
    },

    isOptionSelected: function (index) {
        if (this.selectType == "market") {
            if (this.argent.filter.market == null) {
                return index == 0;
            } else {
                return index == (this.argent.filter.market + 1)
            }
        }
    },

    optionMarketIconStyle: function (index) {
        if (index > 0) {
          return `background-image: url("${this.argent.markets[index-1].image}")`;
        }
        return '';
    },

    selectOption: function (index) {
      if (this.selectType == 'market') {
          if (index == 0) {
              this.filterAlmanacs({ market: null })
          } else {
            this.filterAlmanacs({ market: index-1 })
          }

      }
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

  #optionsTitle {
    color: white;
    font-size: 28px;
    letter-spacing: 1px;
  }


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


    #galleryContainer {
        margin-top: 30px;
        margin-bottom: 80px;
        width: 100%;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: flex-start;
        justify-content: flex-start;
        align-items: flex-start;
    }

        #settings {
            width: 100%;
            height: 65px;
            color: white;
            font-size: 21px;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-content: center;
            justify-content: space-around;
            align-items: center;
        }

            .filterOption {
                display: flex;
                flex-direction: column;
                align-content: center;
                align-items: center;
            }

            .filterTitle {
                font-size: 18px;
                margin-bottom: 5px;
            }

            .filterShow {
                height: 30px;
                min-width: 100px;
                font-size: 14px;
                line-height: 30px;
                cursor: pointer;
                outline: none;
                transform: translate(0);
                background-image: linear-gradient(45deg, #4568dc, #b06ab3);
                padding: 0px 25px;
                border-radius: 65px;
                box-shadow: 1px 1px 7px rgba(255, 255, 255, 0.25);
                -webkit-transition: box-shadow 0.25s;
                transition: box-shadow 0.25s;
                color: white;
                text-align: center;
                font-family: 'Major Mono Display', monospace;
            }

            .filterShow .text {
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-image: linear-gradient(45deg, #4568dc, #b06ab3);
            }

            .filterShow:after {
                content: "";
                border-radius: 2em;
                position: absolute;
                margin: 2px;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                z-index: -1;
                background: #101022;
            }

            .filterShow:hover {
                background-image: linear-gradient(45deg, #4f78ff, #e18ae4);
            }

            #marketIcon {
                width: 80px;
                height: 35px;
                background-size: contain;
                background-repeat: no-repeat;
            }


        #nftContainer {
            margin-top: 20px;
            margin-bottom: 80px;
            width: 100%;
            min-height: calc(100vh - 500px);
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-content: flex-start;
            justify-content: flex-start;
            align-items: flex-start;
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