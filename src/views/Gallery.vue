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
    <div v-if="selectedId == null">
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
                <div class="filterOption" v-if="argent.connected && argent.address && argent.networkOk">
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
                        <router-link :to="{ name: 'gallery', params:{'id': argent.filteredAlmanacs[index].id} }"> <div class="almanacNft" :style="almanacStyle(index)"></div></router-link>
                        <div class="almanacName">Almanac #{{argent.filteredAlmanacs[index].id}}</div>
                        <div class="almanacDescription">{{argent.filteredAlmanacs[index].description}}</div>
                    </div>
                </div>
            </div>
            <div id="pagesContainer">
                <div :class="{'disabledPage': argent.filter.page == 0 }" class=" pageLabel noSelect" @click="changePage('prev')">&lt;</div>
                <div class="currentPageNumber noSelect">{{argent.filter.page+1}}</div>
                <div :class="{'disabledPage': argent.filter.page == argent.galleryPages }" class="pageLabel noSelect" @click="changePage('next')">&gt;</div>
            </div>
        </div>
    </div>
    <div v-else>
        <div id="detailContainer">
            <div id="detailVideo">
                <video autoplay id="nftVideo" muted>
                <source :src="videoLink()" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div id="detailAttributes">
                <router-link :to="{ name:'gallery', params:{'id':''} }">
                    <div id="backButton">go back</div></router-link>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Gallery',
  created() {
    this.updateId();
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => { this.updateId(); }
    )
  },
  data() { return {

    selectedId: null,

    selectOpen: false,
    selectType: "market",
    selectTitle: 'Market:',
    selectOptions: [],
  }},
  mounted: function() {},
  components: {},
  methods: {
    ...mapActions('argent', ['filterAlmanacs', 'updateTitle']),

    updateId: function() {
        console.log("updateId()");
        if (this.$route.params.id == '') {
            this.selectedId = null;
        } else {
            let newId = parseInt(this.$route.params.id);
            if (newId > 0) {
                this.selectedId = newId;
            } else {
                this.selectedId = null;
            }
        }
    },

    videoLink: function() {
      return `https://spaces.irreparabile.xyz/almanac/${this.argent.networkName == 'mainnet-alpha'?'starknet':'starknet_goerli'}/video/${String(this.selectedId).padStart(5,"0")}.mp4`;
    },

    almanacStyle: function(index) {
      let style = `background-image: url("https://spaces.irreparabile.xyz/almanac/${this.argent.networkName == 'mainnet-alpha'?'starknet':'starknet_goerli'}/image/${String(this.argent.filteredAlmanacs[index].id).padStart(5,"0")}.png");`;
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

    changePage(target) {
        if (target == 'prev') {
            if (this.argent.filter.page > 0) {
                this.filterAlmanacs({ page: this.argent.filter.page - 1 })
            }
        } else if (target == 'next') {
            if (this.argent.filter.page != this.argent.galleryPages) {
                this.filterAlmanacs({ page: this.argent.filter.page + 1 })
            }
        } else {
            this.filterAlmanacs({ page: parseInt(this.argent.filter.page) })
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

    changeTitle() {
        this.updateTitle({
            id: 1003,
            title: "A green day"
        })
    }

  },
  computed: mapState({
      argent: (state) => state.argent,
  }),
}
</script>

<style scoped>

    #detailContainer {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 500px);
        margin-top: 50px;
        align-content: center;
        align-items: center;
    }

        #nftVideo {
          width: 700px;
          height: 700px;
        }

        #backButton {
            color: white;
            cursor: pointer;
            margin-top: 40px;
            font-family: 'Major Mono Display', monospace;
        }

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
            align-items: flex-start;
            justify-content: space-evenly;
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

        #pagesContainer {
            display: flex;
            justify-content: center;
            flex-direction: row;
            flex-wrap: nowrap;
            width: 100%;
            color: white;
        }
            .pageLabel {
                cursor: pointer;
                margin-right: 20px;
                margin-left: 20px;
                text-align: center;
                font-family: 'Major Mono Display', monospace;
                font-size: 36px;
            }

            .currentPageNumber {
                margin-right: 20px;
                margin-left: 20px;
                text-align: center;
                font-family: 'Major Mono Display', monospace;
                font-size: 36px;
            }

            .disabledPage {
                color: grey;
                cursor: default;
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