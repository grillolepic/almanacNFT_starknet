<template>

  <div id="selectContainer" :class="{ 'show-select-bg': selectOpen }" @click="showSelect(false)">
    <div id="optionsContainer" :class="{ 'hide-options': !selectOpen }">
      <div id="optionsBg">
        <div id="optionsTitle" class="label">{{selectTitle}}:</div>
        <div id="optionsScroller" class="sc5">
          <div class="optionsOption" v-for="(item, index) in selectOptions" :key="item.id" @click="selectOption(index)" :class="{selectedOption: isOptionSelected(index)}">
            <div id="marketIcon" v-if="selectType=='market'" :style="optionMarketIconStyle(index)"></div>
            <span>{{selectOptions[index].name}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="viewContainer">
    <div id="title">mint</div>
    <div v-if="argent.connected && argent.address && argent.networkOk && !argent.serverError && argent.supplyOk">

      <!-- In the future, simply remove this v-if -->
      <div v-if="argent.networkName == 'mainnet-alpha'">
        <div id="almanacConfig">
          <div id="instructions" style="margin-top:50px;">AlmanacNFT is not yet ready for Starknet Mainnet, but you can switch to Starknet Göerli Testnet to try it out before release.</div>
        </div>
      </div>

      <div v-else>
        <div id="spinner" v-if="argent.initialLoading"></div>
        <div v-else>

          <div id="almanacConfig" v-if="argent.transaction.status == null">

            <div id="instructions">Choose the market and the date of your Almanac NFT</div>

            <div class="label">Market</div>
            <div id="MarketSelect" class="comboBox noSelect" :class="{'disabled-btn': argent.almanac.queryingDataAvailable && !argent.almanac.waitingInput}" @click="showSelect(true, 'market')">
              <div id="marketIcon" class="noSelect" :style="selectMarketIconStyle"></div>
              <span class="noSelect">{{argent.markets[argent.almanac.market].name}}</span>
            </div>
            
            <div class="separator"></div>

            <div id="DateSelect">
              <div class="datePart">
                <div class="dateLabel">Day</div>
                <div id="daySelect" class="comboBox noSelect" :class="{'disabled-btn': argent.almanac.queryingDataAvailable && !argent.almanac.waitingInput}" @click="showSelect(true, 'day')">
                  <span>{{selectedDate}}</span>
                </div>
              </div>
              <div class="datePart">
                <div class="dateLabel">Month</div>
                  <div id="monthSelect" class="comboBox noSelect" :class="{'disabled-btn': argent.almanac.queryingDataAvailable && !argent.almanac.waitingInput}" @click="showSelect(true, 'month')">
                    <span>{{selectedMonth}}</span>
                </div>
              </div>
              <div class="datePart">
                <div class="dateLabel">Year</div>
                  <div id="yearSelect" class="comboBox noSelect" :class="{'disabled-btn': argent.almanac.queryingDataAvailable && !argent.almanac.waitingInput}" @click="showSelect(true, 'year')">
                    <span>{{selectedYear}}</span>
                </div>
              </div>
            </div>

            <div class="separator"></div>

            <div class="checker">
              <div class="checkerStatus" :class="{'unavailable': (!argent.almanac.queryingNftAvailable && !argent.almanac.nftAvailable && !argent.almanac.waitingInput), 'querying': (argent.almanac.queryingNftAvailable && !argent.almanac.waitingInput), 'waiting': (argent.almanac.waitingInput)}"></div>
              <div class="checkerInfo">nft available</div>
            </div>
            <div class="checker">
              <div class="checkerStatus" :class="{'unavailable': (!argent.almanac.queryingDataAvailable && !argent.almanac.dataAvailable && !argent.almanac.waitingInput), 'querying': (argent.almanac.queryingDataAvailable && !argent.almanac.waitingInput), 'waiting': (argent.almanac.waitingInput)}"></div>
              <div class="checkerInfo">data available</div>
            </div>

            <div id="mintButton" class="button noSelect" :class="{'green-btn':(argent.almanac.dataAvailable && argent.almanac.nftAvailable && !argent.almanac.waitingInput), 'disabled-btn':(!argent.almanac.dataAvailable || !argent.almanac.nftAvailable || argent.almanac.waitingInput)}" @click="mint" v-if="argent.allowanceOk">mint</div>
            <div id="mintButton" class="button noSelect" :class="{'green-btn':(argent.almanac.dataAvailable && argent.almanac.nftAvailable && !argent.almanac.waitingInput), 'disabled-btn':(!argent.almanac.dataAvailable || !argent.almanac.nftAvailable || argent.almanac.waitingInput)}" @click="approveEther" v-else>approve</div>


            <div id="infoMessage">
              <span v-if="!argent.almanac.dataAvailable && !argent.almanac.queryingDataAvailable && !argent.almanac.queryingNftAvailable">it seems like hourly data for this market/day is currently unavailable</span>
              <span v-else>
                <span v-if="!argent.almanac.nftAvailable && !argent.almanac.queryingNftAvailable && !argent.almanac.queryingDataAvailable">it seems like the nft for this market and day has already been minted</span>
                <span class="infoCost" v-else>cost: {{argent.cost}} ether</span>
              </span>
            </div>

          </div>

          <div id="transactionInfo" v-else>
            <div id="txStatus">{{printTxStatus()}}</div>
            <div id="txLink" v-if="argent.transaction.link != null"  @click="goToLink(argent.transaction.link)">view transaction on voyager</div>
            <div id="txError" v-if="argent.transaction.error != null">{{argent.transaction.error.toLowerCase()}}</div>
            <div v-if="argent.transaction.status == 2">
              <div id="txGallery" v-if="argent.transaction.isApprove">ETH approved</div>
              <div id="txGallery" v-else>Your Almanac will be created shortly.<br>Look for it in the Gallery!</div>
            </div>
            <div v-if="argent.transaction.status == -1 || argent.transaction.status == 2">
              <div id="goBack" class="button noSelect" @click="resetUI()">back</div>
            </div>
          </div>

          <div style="height:100px;"></div>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="argent.serverError || argent.markets == null || !argent.initialized">
        <div id="spinner" v-if="argent.markets == null || !argent.initialized"></div>
        <div id="almanacConfig" v-else>
          <div id="instructions" style="margin-top:50px;">AlmanacNFT server seems to be down. Try again later.</div>
        </div>
      </div>
      <div v-else>
        <div v-if="!argent.supplyOk">
            <div id="almanacConfig">
              <div id="instructions" style="margin-top:50px;">All public Almanacs have been minted.</div>
              <router-link :to="'/gallery'"><div id="connectButton" class="button noSelect">view gallery</div></router-link>
            </div>
        </div>
        <div v-else>
          <div v-if="argent.connected">
            <div id="almanacConfig">
              <div id="instructions" style="margin-top:50px;">AlmanacNFT is currently running only on the StarknNet Göerli Testnet.</div>
            </div>
          </div>
          <div id="almanacConfig" v-else>
              <div id="instructions" style="margin-top:50px;">Connect your StarkNet ArgentX Wallet to begin:</div>
              <div id="connectButton" class="button noSelect" @click="connectArgentX">
                <span id="argentX" v-if="!argent.connected"></span>
                connect
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Mint',
  data() { return {
    selectOpen: false,
    selectType: "market",
    selectTitle: 'Choose the Market for your Almanac',
    selectOptions: [],
  }},
  mounted: function() {},
  components: {},
  methods: {
    ...mapActions('argent', ['connectArgentX', 'resetDelay', 'setAlmanac', 'approveEther', 'mintAlmanac', 'resetTransaction']),

    connect: function() {
      this.init(true);
    },

    resetUI: function() {
      this.resetTransaction();
    },

    showSelect: function (visible, section = "market") {
      if (!this.argent.almanac.queryingDataAvailable || !visible || this.argent.almanac.waitingInput) {
        this.selectOpen = visible;
        if (visible) {
          this.resetDelay();
          this.selectType = section;

          if (section == "market") {
            this.selectTitle = 'Choose the Market for your Almanac';
            this.selectOptions = this.argent.markets;
          } else {

            let currentDate = moment.utc().subtract(1, 'day');
            let startingDate = moment.utc(this.argent.startDate);
            let selectedDate = moment.utc(this.argent.startDate).add(this.argent.almanac.daysSince, 'day');
            this.selectOptions = [];

            let minDate = moment.utc(this.argent.markets[this.argent.almanac.market].minDate);

            if (section == "day") {
              this.selectTitle = 'Choose the day of the month';
              let minDay = 1;
              let maxDay = selectedDate.daysInMonth();

              if (currentDate.year() == selectedDate.year() && currentDate.month() == selectedDate.month()) {
                maxDay = currentDate.get("date");
              }

              if (minDate.year() == selectedDate.year() && minDate.month() == selectedDate.month()) {
                minDay = minDate.get("date");
              }

              for (let i=minDay; i<=maxDay; i++) {
                this.selectOptions.push({
                  name: (i>9)?i.toString():`0${i.toString()}`
                });
              }
            } else if (section == "month") {
              this.selectTitle = 'Choose the month';
              let minMonth = 0;
              let maxMonth = 12;
              
              if (currentDate.year() == selectedDate.year()) {
                maxMonth = currentDate.month() + 1;
              }
              if (minDate.year() == selectedDate.year()) {
                minMonth = minDate.month();
              }

              for (let i=minMonth; i<maxMonth; i++) {
                if (i==0) { this.selectOptions.push({ name: 'january', value: i }); }
                else if (i==1) { this.selectOptions.push({ name: 'february', value: i }); }
                else if (i==2) { this.selectOptions.push({ name: 'march', value: i }); }
                else if (i==3) { this.selectOptions.push({ name: 'april', value: i }); }
                else if (i==4) { this.selectOptions.push({ name: 'may', value: i }); }
                else if (i==5) { this.selectOptions.push({ name: 'june', value: i }); }
                else if (i==6) { this.selectOptions.push({ name: 'july', value: i }); }
                else if (i==7) { this.selectOptions.push({ name: 'august', value: i }); }
                else if (i==8) { this.selectOptions.push({ name: 'september', value: i }); }
                else if (i==9) { this.selectOptions.push({ name: 'october', value: i }); }
                else if (i==10) { this.selectOptions.push({ name: 'november', value: i }); }
                else if (i==11) { this.selectOptions.push({ name: 'december', value: i }); }
              }
            } else if (section == "year") {
              this.selectTitle = 'Choose the year';
              for (let i=minDate.year(); i<=currentDate.year(); i++) {
                this.selectOptions.push({ name: i.toString() });
              }
            }
          }
        } else {
          this.setAlmanac({});
        }
      }
    },

    optionMarketIconStyle: function (index) {
      return `background-image: url("${this.argent.markets[index].image}")`;
    },

    isOptionSelected: function (index) {
      if (this.selectType == "market") {
          return index == this.argent.almanac.market;
        } else {
          let currentDate = moment.utc().subtract(1, 'day');
          let startingDate = moment.utc(this.argent.startDate);
          let selectedDate = moment.utc(this.argent.startDate).add(this.argent.almanac.daysSince, 'day');

          if (this.selectType == "day") {
            return index == (selectedDate.date() - 1);
          } else if (this.selectType == "month") {
            return this.selectOptions[index].name == selectedDate.format("MMM").toLowerCase();
          } else if (this.selectType == "year") {
            return this.selectOptions[index].name == selectedDate.year();
          }
        }
    },

    selectOption: function (index) {
      let currentDate = moment.utc().subtract(1, 'day');
      let startingDate = moment.utc(this.argent.startDate);
      let selectedDate = moment.utc(this.argent.startDate).add(this.argent.almanac.daysSince, 'day');

      if (this.selectType == 'market') {

        let minDate = moment.utc(this.argent.markets[index].minDate);
        console.log("SELECTED DATE: " + selectedDate.format());
        console.log("MIN DATE: " + minDate.format());

        if (minDate.isAfter(selectedDate)) {
          console.log("CHANGING DATE AND MARKET");
          this.setAlmanac({
            market: index,
            daysSince: minDate.diff(startingDate, 'days')
          });
        } else {
          console.log("CHANGING MARKET");
          this.setAlmanac({
            market: index
          });
        }
      } else {

        if (this.selectType == "day") {
          selectedDate.date(parseInt(this.selectOptions[index].name));       
        } else if (this.selectType == "month") {
          selectedDate.month(this.selectOptions[index].value);
        } else if (this.selectType == "year") {
          selectedDate.year(this.selectOptions[index].name);
        }

        if (selectedDate.isSameOrAfter(currentDate)) {
          selectedDate = currentDate
        }
        if (selectedDate.isSameOrBefore(startingDate)) {
          selectedDate = startingDate
        }
        
        this.setAlmanac({
          daysSince: selectedDate.diff(startingDate, 'days')
        });
      }

      this.selectOpen = false;
    },

    mint: function() {
      if (this.argent.almanac.nftAvailable && this.argent.almanac.dataAvailable && !this.argent.almanac.waitingInput) {
        this.mintAlmanac();
        window.scrollTo(0, 0);
      }
    },

    printTxStatus: function(event) {
      if (this.argent.transaction.status == 0) { return "Waiting for ArgentX"; }
      if (this.argent.transaction.status == 1) { return "Waiting for confirmation"; }
      if (this.argent.transaction.status == 2) { return "Done!"; }
      if (this.argent.transaction.status == -1) { return "Transaction failed!"; }
      return "";
    },

    goToLink(link) {
      window.open(link);
    },
  },
  computed: mapState({
      argent: (state) => state.argent,
      selectMarketIconStyle: (state) => {
        return `background-image: url("${state.argent.markets[state.argent.almanac.market].image}")`;
      },
      selectedDate: (state) => {
        let selectedDate = moment(state.argent.startDate).add(state.argent.almanac.daysSince, 'day');
        let minDate = moment.utc(state.argent.markets[state.argent.almanac.market].minDate);
        if (selectedDate.isBefore(minDate)) {
          selectedDate = minDate;
        }
        return (selectedDate.get('date') > 9)?selectedDate.get('date'):`0${selectedDate.get('date')}`;
      },
      selectedMonth: (state) => {
        let selectedDate = moment(state.argent.startDate).add(state.argent.almanac.daysSince, 'day');
        let minDate = moment.utc(state.argent.markets[state.argent.almanac.market].minDate);
        if (selectedDate.isBefore(minDate)) {
          selectedDate = minDate;
        }
        return selectedDate.format("MMM").toLowerCase();
      },
      selectedYear: (state) => {
        let selectedDate = moment(state.argent.startDate).add(state.argent.almanac.daysSince, 'day');
        let minDate = moment.utc(state.argent.markets[state.argent.almanac.market].minDate);
        if (selectedDate.isBefore(minDate)) {
          selectedDate = minDate;
        }
        return selectedDate.get('year').toString();
      },      
  }),
}
</script>

<style scoped>

  #spinner {
    width: 50px;
    height: 50px;
    background-image: url('/public/img/spinner.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: -25px;
    margin-left: -25px;
    z-index: 99999;
  }

  #title {
    position: relative;
    left: 12px;
  }

  #instructions {
    color: white;
    font-family: 'Gemunu Libre', sans-serif;
    font-size: 28px;
    letter-spacing: 1px;
    margin-bottom: 50px;
    text-align: center;
  }

  #almanacConfig {
    width: 650px;
    height: 650px;
    display: flex;
    flex-direction: column;
    align-content: center;
    flex-wrap: nowrap;
    align-items: center;
  }

    .label {
      color: white;
      font-family: 'Gemunu Libre', sans-serif;
      font-size: 28px;
      letter-spacing: 1px;
    }

      .comboBox {
        height: 28px;
        font-size: 24px;
        border: 8em;
        cursor: pointer;
        outline: none;
        -webkit-transform: translate(0);
        transform: translate(0);
        background-image: linear-gradient(45deg, #4568dc, #b06ab3);
        padding: 0.7em 2em;
        border-radius: 65px;
        box-shadow: 1px 1px 10px rgba(255, 255, 255, 0.438);
        -webkit-transition: box-shadow 0.25s;
        transition: box-shadow 0.25s;
        color: white;
        text-align: center;
        font-family: 'Major Mono Display', monospace;
      }

      .comboBox .text {
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-image: linear-gradient(45deg, #4568dc, #b06ab3);
      }

      .comboBox:after {
        content: "";
        border-radius: 8em;
        position: absolute;
        margin: 4px;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: -1;
        background: #101022;
      }

      .comboBox:hover {
        background-image: linear-gradient(45deg, #4f78ff, #e18ae4);
      }

      #MarketSelect {
        width: 520px;
        margin-top: 0.8rem;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        align-content: center;
      }

        #marketIcon {
          width: 80px;
          height: 35px;
          background-size: contain;
          background-repeat: no-repeat;
        }

  .separator {
    height: 30px;
  }

    #DateSelect {
      margin-top: 0.8rem;
      margin-right: 1rem;
      display: flex;
      width: 650px;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: space-around;
    }

      .datePart {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        align-content: center;
      }
  
        .dateLabel {
          color: white;
          font-family: 'Gemunu Libre', sans-serif;
          font-size: 18x;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

  #mintButton {
    margin-top: 40px;
    margin-bottom: 40px;
    height: 60px;
    width: 610px;
    font-size: 40px;
    padding: 20px 0px 5px 0px;
    border: 200px;
  }

    #argentX {
      display: inline-block;
      width: 34px;
      height: 34px;
      background-image: url('/public/img/argentX.png');
      background-size: contain;
      background-repeat: no-repeat;
      position: relative;
      top: 4px;
    }

    #mintButton:after {
      margin: 8px;
    }

    #mintButton:hover {
      background-image: linear-gradient(45deg, #53ff5b, #8de58a);
    }

      .disabled-btn {
        color: rgba(255, 255, 255, 0.2);
        background-image: linear-gradient(45deg, #676767, #313131) !important;
        box-shadow: none;
      }

      .disabled-btn:hover {
        background-image: linear-gradient(45deg, #676767, #313131) !important;
        box-shadow: none !important;
        cursor: auto;
      }

  .checker {
    margin-top: 20px;
    width: 260px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: flex-start;
    align-items: center;
  }

    .checkerStatus {
      width: 20px;
      height: 20px;
      border-radius: 20px;
      background-image: linear-gradient(45deg, #53ff5b, #8de58a);
      box-shadow: 1px 1px 10px rgb(0 255 0 / 44%);
      transition: box-shadow 0.25s;
      margin-right: 20px;
    }

    .waiting {
      background-image: linear-gradient(45deg, #ededed, #dfdfdf);;
      box-shadow: 1px 1px 10px rgb(255 255 0 / 44%);
      transition: box-shadow 0.25s;
    }

    .querying {
      background-image: linear-gradient(45deg, #efca50, #dfa71b);;
      box-shadow: 1px 1px 10px rgb(255 255 0 / 44%);
      transition: box-shadow 0.25s;
    }

    .unavailable {
      background-image: linear-gradient(45deg, #dc4545, #c52525);;
      box-shadow: 1px 1px 10px rgb(255 0 0 / 44%);
      transition: box-shadow 0.25s;
    }

    .checkerInfo {
      color: white;
      font-size: 21px;
      font-family: 'Major Mono Display', monospace;
    }

  #infoMessage {
    text-align: center;
    color: rgb(235 1 37);
    font-size: 19px;
    line-height: 27px;
    height: 56px;
    max-width: 560px;
    font-family: 'Major Mono Display', monospace;
  }

  .infoCost {
    color: #55ff5e;
    font-size: 21px;
    font-family: 'Major Mono Display', monospace;
  }

  #connectButton {
    margin-top: 10px;
    height: 50px;
    width: 300px;
    font-size: 24px;
    line-height: 50px;
    margin-bottom: 20px;
  }

  #arbitrumButton {
    margin-top: 10px;
    height: 50px;
    width: 400px;
    font-size: 18px;
    line-height: 50px;
    margin-bottom: 20px;
  }

  #testnetButton {
    margin-top: 10px;
    height: 50px;
    width: 400px;
    font-size: 18px;
    line-height: 50px;
  }

  #transactionInfo {
    width: 650px;
    height: 650px;
    display: flex;
    flex-direction: column;
    align-content: center;
    flex-wrap: nowrap;
    align-items: center;
    color: white;
  }

    #txStatus {
      margin-top: 50px;
      font-family: 'Gemunu Libre', sans-serif;
      font-size: 48px;
      letter-spacing: 1px;
      text-align: center;
    }

    #txLink {
      margin-top: 12px;
      text-decoration: underline;
      font-size: 16px;
      font-family: 'Major Mono Display', monospace;
      cursor: pointer;
    }

    #txError{
      margin-top: 10px;
      color: #c52525;
    }

    #txGallery {
      margin-top: 30px;
      font-family: 'Gemunu Libre', sans-serif;
      font-size: 28px;
      letter-spacing: 1px;
      text-align: center;
    }

    #goBack {
      margin-top: 50px;
      height: 28px;
      width: 100px;
      font-size: 24px;
      line-height: 28px;
    }


    @media only screen and (max-width: 549px) {

      #title {
        font-size: 100px;
      }

      #instructions {
        font-size: 28px;
        margin-bottom: 30px;
        width: 90vw;
        margin-top: 10px;
      }

      #optionsContainer {
        width: 300px;
        height: 400px;
      }

      #optionsScroller {
        margin-top: 20px;
        height: 330px;
        width: 280px;
      }


    #almanacConfig {
      width: 375px;
      height: 850px;
    }

      .label {
        font-size: 24px;
      }

      #MarketSelect {
        width: 250px;
        margin-top: 5px;
      }

        #marketIcon {
          width: 80px;
          height: 35px;
        }

  .separator {
    height: 30px;
  }

    #DateSelect {
      margin-top: 0px;
      margin-bottom: 10px;
      width: 250px;
      flex-direction: column;
    }

      #daySelect {
        width: 250px;
      }

      #monthSelect {
        width: 250px;
      }

      #yearSelect {
        width: 250px;
      }
  
        .dateLabel {
          margin-top: 20px;
          font-size: 24px;
          margin-bottom: 5px;
        }

  #mintButton {
    width: 290px;
    font-size: 40px;
    padding: 25px;
    margin-bottom: 20px;
  }

    #mintButton:after {
      margin: 8px;

    }

    #infoMessage {
      padding-bottom: 60px;
  }

  #connectButton {
    width: 250px;
    font-size: 24px;
  }

  #arbitrumButton {
    width: 250px;
    font-size: 12px;
  }

  #testnetButton {
    width: 250px;
    font-size: 12px;
  }

  #transactionInfo {
    width: 350px;
    height: 850px;
  }

#txLink {
      margin-top: 10px;
      font-size: 14px;
      text-align: center;
      line-height: 20px;
    }

    #txGallery {
      margin-top: 30px;
      font-family: 'Gemunu Libre', sans-serif;
      font-size: 24px;
      letter-spacing: 1px;
      text-align: center;
    }

    #goBack {
      margin-top: 50px;
      height: 28px;
      width: 100px;
      font-size: 24px;
      line-height: 28px;
    }
  }

</style>