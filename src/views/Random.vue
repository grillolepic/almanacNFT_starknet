<script setup>
import moment from 'moment'
import { ref, computed, onMounted } from 'vue'
import { useStarknetStore } from '@/store/starknet'
import { useAlmanacStore } from '@/store/almanac'
import useBreakpoints from '@/helpers/useBreakpoints';

const { isMobile } = useBreakpoints()
const starknetStore = useStarknetStore()
const almanacStore = useAlmanacStore()

const selectOpen = ref(false)
const selectOptions = ref([{ id: 0, name: 'any market', image: '' }])

if (selectOptions.value.length == 1 && almanacStore.markets.length > 0) {
  let options = [...almanacStore.markets]
  options.splice(0, 0, { id: 0, name: 'any market', image: '' })
  selectOptions.value = options
}

onMounted(() => {
  almanacStore.randomize(0)
})

function resetUI() {
  starknetStore.resetTransaction()
}

function showSelect(visible) {
  if (selectOptions.value.length == 1) {
    let options = [...almanacStore.markets]
    options.splice(0, 0, { id: 0, name: 'any market', image: '' })
    selectOptions.value = options
  }

  if (!almanacStore.findingRandom || !visible) {
    selectOpen.value = visible
  }
}

function optionMarketIconStyle(index) {
  return `background-image: url("${selectOptions.value[index].image}")`
}

function isOptionSelected(index) {
  return index == almanacStore.randomMarket
}

function selectOption(index) {
  almanacStore.randomize(index)
  selectOpen.value = false
}

function redoRandom() {
  almanacStore.randomize(almanacStore.randomMarket)
}

function mint() {
  if (almanacStore.priceOk) {
    almanacStore.mintAlmanac()
    window.scrollTo(0, 0)
  }
}

function printTxStatus() {
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

const selectRandomMarketIconStyle = computed(() => {
  if (almanacStore.randomMarket > 0) {
    return `background-image: url("${almanacStore.markets[almanacStore.randomMarket - 1].image}")`
  }
  return ''
})

const selectMarketIconStyle = computed(() => {
  return `background-image: url("${almanacStore.markets[almanacStore.almanacInput.market].image}")`
})

const randomDate = computed(() => {
  if (almanacStore.almanacInput.daysSince > 0) {
    let selectedDate = moment
      .utc(almanacStore.startDate)
      .add(almanacStore.almanacInput.daysSince, 'day')

    let day = selectedDate.date()
    let month = selectedDate.format('MMMM')
    let year = selectedDate.year()

    return `${day} of ${month}, ${year}`
  }

  return ''
})
</script>

<template>
  <div id="selectContainer" :class="{ 'show-select-bg': selectOpen }" @click="showSelect(false)">
    <div id="optionsContainer" :class="{ 'hide-options': !selectOpen }">
      <div id="optionsBg">
        <div id="optionsTitle" class="label">Choose the Market for your Almanac:</div>
        <div id="optionsScroller" class="sc5">
          <div
            class="optionsOption"
            v-for="(item, index) in selectOptions"
            :key="item.id"
            @click="selectOption(index)"
            :class="{ selectedOption: isOptionSelected(index) }"
          >
            <div id="marketIcon" v-if="index > 0" :style="optionMarketIconStyle(index)"></div>
            <span>{{ selectOptions[index].name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="viewContainer">
    <div id="title" class="noSelect"><span class="smaller_title">random</span><br />mint</div>
    <div
      v-if="
        starknetStore.connected &&
        starknetStore.address &&
        starknetStore.networkOk &&
        !almanacStore.serverError &&
        almanacStore.supplyOk
      "
    >
      <div v-if="starknetStore.isStarknetTestnet">
        <div id="almanacConfig" class="noSelect">
          <div id="instructions" style="margin-top: 50px">
            AlmanacNFT has already launched on Starknet Alpha Mainnet and is no longer available on
            testnet.
          </div>
        </div>
      </div>

      <div v-else>
        <div id="spinner" v-if="almanacStore.initialLoading"></div>
        <div v-else>
          <div id="almanacConfig" v-if="starknetStore.transaction.status == null">
            <div id="instructions" class="noSelect">
              ¿Can't find an available Almanac or just feeling lucky?<br />Mint a random Almanac
              NFT!
            </div>

            <div class="flex flex-center max-width" :class="{ row: !isMobile, column: isMobile }">
              <div class="label noSelect market-label">Market:</div>
              <div
                id="MarketSelect"
                class="comboBox noSelect"
                :class="{
                  'disabled-btn': almanacStore.findingRandom
                }"
                @click="showSelect(true)"
              >
                <div
                  id="marketIcon"
                  v-if="almanacStore.randomMarket > 0"
                  class="noSelect"
                  :style="selectRandomMarketIconStyle"
                ></div>
                <span class="noSelect">{{ selectOptions[almanacStore.randomMarket].name }}</span>
              </div>
            </div>

            <div v-if="!almanacStore.findingRandom" class="randomized flex flex-center row">
              <div id="marketIcon" class="noSelect" :style="selectMarketIconStyle"></div>
              <div class="label-big noSelect">{{ randomDate }}</div>
              <div class="redo containNoRepeatCenter" @click="redoRandom()"></div>
            </div>
            <div class="inline-spinner" v-if="almanacStore.findingRandom"></div>

            <div
              id="mintButton"
              class="button noSelect"
              :class="{
                'green-btn':
                  almanacStore.almanacInput.dataAvailable &&
                  almanacStore.almanacInput.nftAvailable &&
                  almanacStore.priceOk,
                'disabled-btn':
                  !almanacStore.almanacInput.dataAvailable ||
                  !almanacStore.almanacInput.nftAvailable ||
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
                  !almanacStore.findingRandom &&
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
                    !almanacStore.findingRandom
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
          <div v-if="starknetStore.connected">
            <div id="almanacConfig">
              <div id="instructions" style="margin-top: 50px">
                AlmanacNFT is currently running only on the StarknNet Görli Testnet.
              </div>
            </div>
          </div>
          <div id="almanacConfig" v-else>
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
.redo {
  width: 30px;
  height: 30px;
  border-radius: 25px;
  margin-left: 15px;
  background-image: url('/img/reload.svg');
  transition-duration: 200ms;
}

.redo:hover {
  -webkit-filter: drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.7));
  filter: drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.7));
  cursor: pointer;
  transform: rotate(360deg);
}

.market-label {
  line-height: 88px;
  margin-right: 15px;
}

#title {
  line-height: 75px;
  margin-bottom: 45px;
}
.smaller_title {
  font-size: 50px;
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
  margin-bottom: 20px;
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

.label-big {
  color: white;
  font-size: 36px;
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
  width: 350px;
  margin-top: 0.8rem;
  margin-bottom: 1.6rem;
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

  .label-big {
    color: white;
    font-size: 24px;
  }

  #MarketSelect {
    width: 90%;
    margin-top: 5px;
  }

  .market-label {
    line-height: 40px;
    margin-right: 0px;
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
