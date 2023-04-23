<script setup>
import moment from 'moment'
import { ref, computed } from 'vue'
import { useStarknetStore } from '@/store/starknet'
import { useAlmanacStore } from '@/store/almanac'
const starknetStore = useStarknetStore()
const almanacStore = useAlmanacStore()

const selectOpen = ref(false)
const selectType = ref('market')
const selectTitle = ref('Choose the Market for your Almanac')
const selectOptions = ref([])

function resetUI() {
  starknetStore.resetTransaction()
}

function showSelect(visible, section = 'market') {
  if (!almanacStore.queryingDataAvailable || !visible || almanacStore.waitingInput) {
    selectOpen.value = visible
    if (visible) {
      almanacStore.resetDelay()
      selectType.value = section

      if (section == 'market') {
        selectTitle.value = 'Choose the Market for your Almanac'
        selectOptions.value = almanacStore.markets
      } else {
        let currentDate = moment.utc().subtract(1, 'day')
        let startingDate = moment.utc(almanacStore.startDate)
        let selectedDate = moment
          .utc(almanacStore.startDate)
          .add(almanacStore.almanacInput.daysSince, 'day')
        selectOptions.value = []

        let minDate = moment.utc(almanacStore.markets[almanacStore.almanacInput.market].minDate)

        if (section == 'day') {
          selectTitle.value = 'Choose the day of the month'
          let minDay = 1
          let maxDay = selectedDate.daysInMonth()

          if (
            currentDate.year() == selectedDate.year() &&
            currentDate.month() == selectedDate.month()
          ) {
            maxDay = currentDate.get('date')
          }

          if (minDate.year() == selectedDate.year() && minDate.month() == selectedDate.month()) {
            minDay = minDate.get('date')
          }

          for (let i = minDay; i <= maxDay; i++) {
            selectOptions.value.push({
              name: i > 9 ? i.toString() : `0${i.toString()}`
            })
          }
        } else if (section == 'month') {
          selectTitle.value = 'Choose the month'
          let minMonth = 0
          let maxMonth = 12

          if (currentDate.year() == selectedDate.year()) {
            maxMonth = currentDate.month() + 1
          }
          if (minDate.year() == selectedDate.year()) {
            minMonth = minDate.month()
          }

          for (let i = minMonth; i < maxMonth; i++) {
            if (i == 0) {
              selectOptions.value.push({ name: 'january', value: i })
            } else if (i == 1) {
              selectOptions.value.push({ name: 'february', value: i })
            } else if (i == 2) {
              selectOptions.value.push({ name: 'march', value: i })
            } else if (i == 3) {
              selectOptions.value.push({ name: 'april', value: i })
            } else if (i == 4) {
              selectOptions.value.push({ name: 'may', value: i })
            } else if (i == 5) {
              selectOptions.value.push({ name: 'june', value: i })
            } else if (i == 6) {
              selectOptions.value.push({ name: 'july', value: i })
            } else if (i == 7) {
              selectOptions.value.push({ name: 'august', value: i })
            } else if (i == 8) {
              selectOptions.value.push({ name: 'september', value: i })
            } else if (i == 9) {
              selectOptions.value.push({ name: 'october', value: i })
            } else if (i == 10) {
              selectOptions.value.push({ name: 'november', value: i })
            } else if (i == 11) {
              selectOptions.value.push({ name: 'december', value: i })
            }
          }
        } else if (section == 'year') {
          selectTitle.value = 'Choose the year'
          for (let i = minDate.year(); i <= currentDate.year(); i++) {
            selectOptions.value.push({ name: i.toString() })
          }
        }
      }
    } else {
      almanacStore.setAlmanac({})
    }
  }
}

function optionMarketIconStyle(index) {
  return `background-image: url("${almanacStore.markets[index].image}")`
}

function isOptionSelected(index) {
  if (selectType.value == 'market') {
    return index == almanacStore.almanacInput.market
  } else {
    let currentDate = moment.utc().subtract(1, 'day')
    let startingDate = moment.utc(almanacStore.startDate)
    let selectedDate = moment
      .utc(almanacStore.startDate)
      .add(almanacStore.almanacInput.daysSince, 'day')

    if (selectType.value == 'day') {
      return index == selectedDate.date() - 1
    } else if (selectType.value == 'month') {
      return selectOptions.value[index].name == selectedDate.format('MMM').toLowerCase()
    } else if (selectType.value == 'year') {
      return selectOptions.value[index].name == selectedDate.year()
    }
  }
}

function selectOption(index) {
  let currentDate = moment.utc().subtract(1, 'day')
  let startingDate = moment.utc(almanacStore.startDate)
  let selectedDate = moment
    .utc(almanacStore.startDate)
    .add(almanacStore.almanacInput.daysSince, 'day')

  if (selectType.value == 'market') {
    let minDate = moment.utc(almanacStore.markets[index].minDate)

    if (minDate.isAfter(selectedDate)) {
      almanacStore.setAlmanac({
        market: index,
        daysSince: minDate.diff(startingDate, 'days') + 1
      })
    } else {
      almanacStore.setAlmanac({
        market: index
      })
    }
  } else {
    if (selectType.value == 'day') {
      selectedDate.date(parseInt(selectOptions.value[index].name))
    } else if (selectType.value == 'month') {
      selectedDate.month(selectOptions.value[index].value)
    } else if (selectType.value == 'year') {
      selectedDate.year(selectOptions.value[index].name)
    }

    let minDate = moment.utc(almanacStore.markets[almanacStore.almanacInput.market].minDate)

    if (selectedDate.isSameOrAfter(currentDate)) {
      selectedDate = currentDate
    }
    if (selectedDate.isSameOrBefore(startingDate)) {
      selectedDate = startingDate
    }
    if (selectedDate.isSameOrBefore(minDate)) {
      selectedDate = minDate.add(1, 'days')
    }

    almanacStore.setAlmanac({
      daysSince: selectedDate.diff(startingDate, 'days')
    })
  }

  selectOpen.value = false
}

function mint() {
  if (
    almanacStore.almanacInput.nftAvailable &&
    almanacStore.almanacInput.dataAvailable &&
    !almanacStore.waitingInput &&
    almanacStore.priceOk
  ) {
    almanacStore.mintAlmanac()
    window.scrollTo(0, 0)
  }
}

function printTxStatus(event) {
  if (starknetStore.transaction.status == 0) {
    return 'Waiting for Wallet'
  }
  if (starknetStore.transaction.status == 1) {
    return 'Waiting for confirmation'
  }
  if (starknetStore.transaction.status == 2) {
    return 'Done!'
  }
  if (starknetStore.transaction.status == -1) {
    return 'Transaction failed!'
  }
  return ''
}

function goToLink(link) {
  window.open(link)
}

const selectMarketIconStyle = computed(() => {
  return `background-image: url("${almanacStore.markets[almanacStore.almanacInput.market].image}")`
})

const selectedDate = computed(() => {
  let selectedDate = moment(almanacStore.startDate).add(almanacStore.almanacInput.daysSince, 'day')
  let minDate = moment.utc(almanacStore.markets[almanacStore.almanacInput.market].minDate)
  if (selectedDate.isBefore(minDate)) {
    selectedDate = minDate
  }
  return selectedDate.get('date') > 9 ? selectedDate.get('date') : `0${selectedDate.get('date')}`
})

const selectedMonth = computed(() => {
  let selectedDate = moment(almanacStore.startDate).add(almanacStore.almanacInput.daysSince, 'day')
  let minDate = moment.utc(almanacStore.markets[almanacStore.almanacInput.market].minDate)
  if (selectedDate.isBefore(minDate)) {
    selectedDate = minDate
  }
  return selectedDate.format('MMM').toLowerCase()
})

const selectedYear = computed(() => {
  let selectedDate = moment(almanacStore.startDate).add(almanacStore.almanacInput.daysSince, 'day')
  let minDate = moment.utc(almanacStore.markets[almanacStore.almanacInput.market].minDate)
  if (selectedDate.isBefore(minDate)) {
    selectedDate = minDate
  }
  return selectedDate.get('year').toString()
})
</script>

<template>
  <div id="selectContainer" :class="{ 'show-select-bg': selectOpen }" @click="showSelect(false)">
    <div id="optionsContainer" :class="{ 'hide-options': !selectOpen }">
      <div id="optionsBg">
        <div id="optionsTitle" class="label">{{ selectTitle }}:</div>
        <div id="optionsScroller" class="sc5">
          <div
            class="optionsOption"
            v-for="(item, index) in selectOptions"
            :key="item.id"
            @click="selectOption(index)"
            :class="{ selectedOption: isOptionSelected(index) }"
          >
            <div
              id="marketIcon"
              v-if="selectType == 'market'"
              :style="optionMarketIconStyle(index)"
            ></div>
            <span>{{ selectOptions[index].name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="viewContainer">
    <div id="title" class="noSelect">mint</div>
    <div
      v-if="
        starknetStore.connected &&
        starknetStore.address &&
        !almanacStore.serverError &&
        almanacStore.supplyOk &&
        almanacStore.enabled
      "
    >
      <div v-if="starknetStore.isStarknetTestnet || !starknetStore.networkOk">
        <div id="almanacConfig" class="noSelect">
          <div id="instructions" style="margin-top: 50px">
            AlmanacNFT has already launched on StarkNet Mainnet and is no longer available on
            testnet.
          </div>
        </div>
      </div>

      <div v-else>
        <div id="spinner" v-if="almanacStore.initialLoading"></div>
        <div v-else>
          <div id="almanacConfig" v-if="starknetStore.transaction.status == null">
            <div id="instructions" class="noSelect">
              Choose the market and the date of your Almanac NFT
            </div>

            <div class="label noSelect">Market</div>
            <div
              id="MarketSelect"
              class="comboBox noSelect"
              :class="{
                'disabled-btn': almanacStore.queryingDataAvailable && !almanacStore.waitingInput
              }"
              @click="showSelect(true, 'market')"
            >
              <div id="marketIcon" class="noSelect" :style="selectMarketIconStyle"></div>
              <span class="noSelect">{{
                almanacStore.markets[almanacStore.almanacInput.market].name
              }}</span>
            </div>

            <div class="separator"></div>

            <div id="DateSelect">
              <div class="datePart">
                <div class="dateLabel noSelect">Day</div>
                <div
                  id="daySelect"
                  class="comboBox noSelect"
                  :class="{
                    'disabled-btn': almanacStore.queryingDataAvailable && !almanacStore.waitingInput
                  }"
                  @click="showSelect(true, 'day')"
                >
                  <span>{{ selectedDate }}</span>
                </div>
              </div>
              <div class="datePart">
                <div class="dateLabel noSelect">Month</div>
                <div
                  id="monthSelect"
                  class="comboBox noSelect"
                  :class="{
                    'disabled-btn': almanacStore.queryingDataAvailable && !almanacStore.waitingInput
                  }"
                  @click="showSelect(true, 'month')"
                >
                  <span>{{ selectedMonth }}</span>
                </div>
              </div>
              <div class="datePart">
                <div class="dateLabel noSelect">Year</div>
                <div
                  id="yearSelect"
                  class="comboBox noSelect"
                  :class="{
                    'disabled-btn': almanacStore.queryingDataAvailable && !almanacStore.waitingInput
                  }"
                  @click="showSelect(true, 'year')"
                >
                  <span>{{ selectedYear }}</span>
                </div>
              </div>
            </div>

            <div class="separator"></div>

            <div class="checker">
              <div
                class="checkerStatus"
                :class="{
                  unavailable:
                    !almanacStore.queryingNftAvailable &&
                    !almanacStore.almanacInput.nftAvailable &&
                    !almanacStore.waitingInput,
                  querying: almanacStore.queryingNftAvailable && !almanacStore.waitingInput,
                  waiting: almanacStore.waitingInput
                }"
              ></div>
              <div class="checkerInfo noSelect">nft available</div>
            </div>
            <div class="checker">
              <div
                class="checkerStatus"
                :class="{
                  unavailable:
                    !almanacStore.queryingDataAvailable &&
                    !almanacStore.almanacInput.dataAvailable &&
                    !almanacStore.waitingInput,
                  querying: almanacStore.queryingDataAvailable && !almanacStore.waitingInput,
                  waiting: almanacStore.waitingInput
                }"
              ></div>
              <div class="checkerInfo noSelect">data available</div>
            </div>

            <div
              id="mintButton"
              class="button noSelect"
              :class="{
                'green-btn':
                  almanacStore.almanacInput.dataAvailable &&
                  almanacStore.almanacInput.nftAvailable &&
                  !almanacStore.waitingInput &&
                  almanacStore.priceOk,
                'disabled-btn':
                  !almanacStore.almanacInput.dataAvailable ||
                  !almanacStore.almanacInput.nftAvailable ||
                  almanacStore.waitingInput ||
                  !almanacStore.priceOk
              }"
              @click="mint"
            >
              mint
            </div>

            <div id="infoMessage">
              <span
                v-if="
                  !almanacStore.almanacInput.dataAvailable &&
                  !almanacStore.queryingDataAvailable &&
                  !almanacStore.queryingNftAvailable
                "
                class="noSelect"
                >it seems like hourly data for this market/day is currently unavailable</span
              >
              <span v-else>
                <span
                  v-if="
                    !almanacStore.almanacInput.nftAvailable &&
                    !almanacStore.queryingNftAvailable &&
                    !almanacStore.queryingDataAvailable
                  "
                  class="noSelect"
                  >it seems like the nft for this market and day has already been minted</span
                >
                <span v-else>
                  <span v-if="!almanacStore.priceOk" class="noSelect"
                    >not enough ether (price: {{ almanacStore.price }} ether)</span
                  >
                  <span class="infoCost noSelect" v-if="almanacStore.priceOk"
                    >price: {{ almanacStore.price }} ether</span
                  >
                </span>
              </span>
            </div>
          </div>

          <div id="transactionInfo" v-else>
            <div id="txStatus">{{ printTxStatus() }}</div>
            <div
              id="txLink"
              v-if="starknetStore.transaction.link != null"
              init
              @click="goToLink(starknetStore.transaction.link)"
            >
              view transaction on voyager
            </div>
            <div id="txError" v-if="starknetStore.transaction.error != null">
              {{ starknetStore.transaction.error.toLowerCase() }}
            </div>
            <div v-if="starknetStore.transaction.status == 2">
              <div id="txGallery">
                Your Almanac will be created shortly.<br />Look for it in the Gallery!
              </div>
            </div>
            <div
              v-if="starknetStore.transaction.status == -1 || starknetStore.transaction.status == 2"
            >
              <div id="goBack" class="button noSelect" @click="resetUI()">back</div>
            </div>
          </div>

          <div style="height: 100px"></div>
        </div>
      </div>
    </div>

    <div v-else>
      <div
        v-if="
          almanacStore.serverError || almanacStore.markets == null || !starknetStore.initialized
        "
      >
        <div id="spinner" v-if="almanacStore.markets == null || !starknetStore.initialized"></div>
        <div id="almanacConfig" v-else>
          <div id="instructions" style="margin-top: 50px">
            AlmanacNFT server seems to be down. Try again later.
          </div>
        </div>
      </div>
      <div v-else>
        <div v-if="!almanacStore.supplyOk">
          <div id="almanacConfig">
            <div id="instructions" style="margin-top: 50px">
              All public Almanacs have been minted.
            </div>
            <router-link :to="'/gallery'"
              ><div id="connectButton" class="button noSelect">view gallery</div></router-link
            >
          </div>
        </div>
        <div v-else>
          <div v-if="starknetStore.connected && !almanacStore.enabled">
            <div id="almanacConfig">
              <div id="instructions" style="margin-top: 50px">
                AlmanacNFT is currently disabled for new mints.
              </div>
            </div>
          </div>
          <div id="almanacConfig" v-else-if="!starknetStore.connected">
            <div id="instructions" style="margin-top: 50px">
              Connect your StarkNet Wallet to begin:
            </div>
            <div id="connectButton" class="button noSelect" @click="starknetStore.connectStarknet">
              <span id="argentX" v-if="!starknetStore.connected"></span>
              connect
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  height: 60px;
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
  content: '';
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
  height: 90px;
  width: 610px;
  font-size: 40px;
  padding: 20px 0px 5px 0px;
  border: 200px;
}

#argentX {
  display: inline-block;
  width: 34px;
  height: 34px;
  background-image: url('/img/argentX.png');
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
  background-image: linear-gradient(45deg, #ededed, #dfdfdf);
  box-shadow: 1px 1px 10px rgb(255 255 0 / 44%);
  transition: box-shadow 0.25s;
}

.querying {
  background-image: linear-gradient(45deg, #efca50, #dfa71b);
  box-shadow: 1px 1px 10px rgb(255 255 0 / 44%);
  transition: box-shadow 0.25s;
}

.unavailable {
  background-image: linear-gradient(45deg, #dc4545, #c52525);
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
  height: 85px;
  width: 420px;
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

#txError {
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
  height: 64px;
  width: 190px;
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
    width: 90%;
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
    width: 100%;
    margin-right: 0px;
    flex-direction: column;
  }

  #daySelect {
    width: 90%;
  }

  #monthSelect {
    width: 90%;
  }

  #yearSelect {
    width: 90%;
  }

  .dateLabel {
    margin-top: 20px;
    font-size: 24px;
    margin-bottom: 5px;
  }

  #mintButton {
    width: 90%;
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
