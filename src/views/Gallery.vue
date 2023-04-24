<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStarknetStore } from '@/store/starknet'
import { useAlmanacStore } from '@/store/almanac'
const starknetStore = useStarknetStore()
const almanacStore = useAlmanacStore()

const route = useRoute()
const titleRegex = new RegExp("^[a-zA-Z\ '!?]{0,65}$")

const selectOpen = ref(false)
const selectType = ref('market')
const selectTitle = ref('Market:')
const selectOptions = ref([])
const inputOpen = ref(false)
const inputText = ref('')
const invalidCharacters = ref(false)

updateId()
watch(
  () => route.params.id,
  async (newId) => {
    updateId()
  }
)

watch(inputText, (inputTextString, prevInputTextString) => {
  invalidCharacters.value = !titleRegex.test(inputTextString)
  inputText.value = inputTextString.substring(0, 65)
})

function updateId() {
  if (route.params.id == '') {
    almanacStore.resetSelectedAlmanac()
  } else {
    almanacStore.selectAlmanac(parseInt(route.params.id))
  }
}

function videoLink() {
  return `https://spaces.irreparabile.xyz/almanac/starknet/video/${String(
    almanacStore.selectedAlmanac.id
  ).padStart(5, '0')}.mp4`
}

function almanacStyle(index) {
  let style = `background-image: url("https://spaces.irreparabile.xyz/almanac/starknet/image/${String(
    almanacStore.filteredAlmanacs[index].id
  ).padStart(5, '0')}.png");`
  return style
}

function switchOwner() {
  almanacStore.filterAlmanacs({ onlyUser: !almanacStore.filter.onlyUser })
}

function switchSortBy() {
  if (almanacStore.filter.sortBy == 'id') {
    almanacStore.filterAlmanacs({ sortBy: 'day_up' })
  } else if (almanacStore.filter.sortBy == 'day_up') {
    almanacStore.filterAlmanacs({ sortBy: 'day_down' })
  } else if (almanacStore.filter.sortBy == 'day_down') {
    almanacStore.filterAlmanacs({ sortBy: 'change_up' })
  } else if (almanacStore.filter.sortBy == 'change_up') {
    almanacStore.filterAlmanacs({ sortBy: 'change_down' })
  } else {
    almanacStore.filterAlmanacs({ sortBy: 'id' })
  }
}

function changePage(target) {
  if (!almanacStore.filter.changing) {
    if (target == 'prev') {
      if (almanacStore.filter.page > 0) {
        almanacStore.filterAlmanacs({ page: almanacStore.filter.page - 1 })
      }
    } else if (target == 'next') {
      if (almanacStore.filter.page != almanacStore.galleryPages) {
        almanacStore.filterAlmanacs({ page: almanacStore.filter.page + 1 })
      }
    } else {
      almanacStore.filterAlmanacs({ page: parseInt(almanacStore.filter.page) })
    }
  }
}

function showInput(visible) {
  inputOpen.value = visible
  if (visible) {
    inputText.value = ''
  }
}

function showSelect(visible, section = 'market') {
  selectOpen.value = visible
  if (visible) {
    selectType.value = section
    if (section == 'market') {
      let options = [{ name: 'show all', value: 'all' }].concat(almanacStore.markets)
      selectOptions.value = options
    }
  }
}

function isOptionSelected(index) {
  if (selectType.value == 'market') {
    if (almanacStore.filter.market == null) {
      return index == 0
    } else {
      return index == almanacStore.filter.market + 1
    }
  }
}

function optionMarketIconStyle(index) {
  if (index > 0) {
    return `background-image: url("${almanacStore.markets[index - 1].image}")`
  }
  return ''
}

function selectOption(index) {
  if (selectType.value == 'market') {
    if (index == 0) {
      almanacStore.filterAlmanacs({ market: null })
    } else {
      almanacStore.filterAlmanacs({ market: index - 1 })
    }
  }
}

async function changeTitle(remove) {
  if (remove) {
    return await almanacStore.updateTitle({
      id: almanacStore.selectedAlmanac.id,
      title: ''
    })
  }

  if (inputText.value.length > 0 && !invalidCharacters.value) {
    if (inputText.value.length > 65) {
      inputText.value = inputText.value.substring(0, 65)
    }
    await almanacStore.updateTitle({
      id: almanacStore.selectedAlmanac.id,
      title: inputText.value
    })
    showInput(false)
  }
}
</script>

<template>
  <div id="inputContainer" :class="{ 'show-select-bg': inputOpen.valueOf() }">
    <div id="inputBackground" @click="showInput(false)" v-if="inputOpen.valueOf()"></div>
    <div id="inputFieldContainer" :class="{ 'hide-input-options': !inputOpen.valueOf() }">
      <div id="optionsBg">
        <div id="optionsTitle2" class="label">Change Title</div>
        <input
          id="inputField"
          v-model="inputText"
          maxlength="65"
          :disabled="almanacStore.selectedAlmanac.changing"
        />
        <div id="inputWarning" :class="{ red: inputText.length > 65 || invalidCharacters }">
          {{ invalidCharacters ? 'invalid characters' : `${inputText.length}/65 characters` }}
        </div>
        <div
          id="changeTitleConfirmButton"
          class="button noSelect"
          :class="{
            'disabled-btn': inputText.length == 0 || almanacStore.selectedAlmanac.changing
          }"
          @click="changeTitle(false)"
        >
          confirm
        </div>
      </div>
    </div>
  </div>

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
              v-if="selectType == 'market' && index > 0"
              :style="optionMarketIconStyle(index)"
            ></div>
            <span>{{ selectOptions[index].name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="viewContainer">
    <div v-if="almanacStore.selectedAlmanac.id == null && !almanacStore.serverError">
      <div id="title" class="noSelect">gallery</div>

      <div
        id="loadingMessage"
        v-if="almanacStore.loadingAlmanacs || almanacStore.almanacs.length == 0"
      >
        <div class="message" v-if="almanacStore.loadingAlmanacs">Loading Almanac NFTs...</div>
        <div class="messageContainer" v-else>
          <div class="message">No almanacs minted</div>
          <router-link :to="'/mint'"
            ><div id="mintNowButton" class="button noSelect">mint yours now</div></router-link
          >
        </div>
      </div>
      <div id="galleryContainer" v-else>
        <div id="settings">
          <div
            class="filterOption"
            v-if="starknetStore.connected && starknetStore.address && starknetStore.networkOk"
          >
            <div class="filterTitle noSelect">Owned by:</div>
            <div class="filterShow noSelect" @click="switchOwner()">
              {{ almanacStore.filter.onlyUser ? 'me' : 'show all' }}
            </div>
          </div>
          <div class="filterOption">
            <div class="filterTitle noSelect">Market:</div>
            <div class="filterShow noSelect" @click="showSelect(true)">
              {{
                almanacStore.filter.market != null
                  ? almanacStore.markets[almanacStore.filter.market].name
                  : 'show all'
              }}
            </div>
          </div>
          <div class="filterOption">
            <div class="filterTitle noSelect">Sort By:</div>
            <div class="filterShow noSelect" @click="switchSortBy()">
              {{ almanacStore.filter.sortBy.replace('_up', '   ▲').replace('_down', '   ▼') }}
            </div>
          </div>
        </div>
        <div id="nftContainer">
          <div v-for="(nft, index) in almanacStore.filteredAlmanacs" :key="index">
            <div class="containNft">
              <router-link
                :to="{ name: 'gallery', params: { id: almanacStore.filteredAlmanacs[index].id } }"
              >
                <div class="almanacNft noSelect" :style="almanacStyle(index)"></div
              ></router-link>
              <div class="almanacName noSelect">
                Almanac #{{ almanacStore.filteredAlmanacs[index].id }}
              </div>
              <div class="almanacDescription noSelect">
                {{
                  almanacStore.filteredAlmanacs[index].title.length > 0
                    ? almanacStore.filteredAlmanacs[index].title
                    : almanacStore.filteredAlmanacs[index].description
                }}
              </div>
            </div>
          </div>
        </div>
        <div id="pagesContainer" class="noSelect">
          <div
            :class="{ disabledPage: almanacStore.filter.page == 0 || almanacStore.filter.changing }"
            class="pageLabel noSelect"
            @click="changePage('prev')"
          >
            &lt;
          </div>
          <div class="currentPageNumber noSelect">{{ almanacStore.filter.page + 1 }}</div>
          <div
            :class="{
              disabledPage:
                almanacStore.filter.page == almanacStore.galleryPages ||
                almanacStore.filter.changing
            }"
            class="pageLabel noSelect"
            @click="changePage('next')"
          >
            &gt;
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div id="spinner" v-if="almanacStore.selectedAlmanac.loading"></div>
      <div v-else>
        <div id="bigSelectedContainer" v-if="almanacStore.selectedAlmanac.id != null">
          <div id="detailContainer" v-if="almanacStore.selectedAlmanac.exists">
            <div id="detailVideo">
              <video autoplay id="nftVideo" muted>
                <source :src="videoLink()" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div id="detailAttributes">
              <div id="almanacDetailName">Almanac #{{ almanacStore.selectedAlmanac.id }}</div>
              <div id="almanacDetailTitle">
                {{
                  almanacStore.selectedAlmanac.title == ''
                    ? almanacStore.selectedAlmanac.description
                    : almanacStore.selectedAlmanac.title
                }}
              </div>
              <div id="almanacDetailDescription">
                {{
                  almanacStore.selectedAlmanac.title == ''
                    ? ''
                    : almanacStore.selectedAlmanac.description
                }}
              </div>
              <div id="almanacDetailMarket">
                <div
                  id="marketIconDescription"
                  :style="optionMarketIconStyle(almanacStore.selectedAlmanac.market + 1)"
                ></div>
              </div>
              <div
                class="detailLabel"
                v-if="
                  starknetStore.networkOk &&
                  almanacStore.selectedAlmanac.owner != null &&
                  !almanacStore.selectedAlmanac.userOwned
                "
              >
                Owner:
              </div>
              <div class="detailLabel" v-if="almanacStore.selectedAlmanac.userOwned">
                Owned by you
              </div>
              <div
                id="almanacDetailOwner"
                v-if="
                  starknetStore.networkOk &&
                  almanacStore.selectedAlmanac.owner != null &&
                  !almanacStore.selectedAlmanac.userOwned
                "
              >
                {{ almanacStore.selectedAlmanac.owner }}
              </div>
              <div id="buttonsContainer">
                <div
                  id="changeTitleButton"
                  v-if="almanacStore.selectedAlmanac.userOwned"
                  class="button noSelect"
                  :class="{ 'disabled-btn': almanacStore.selectedAlmanac.changing }"
                  @click="showInput(true)"
                >
                  {{ almanacStore.selectedAlmanac.title == '' ? 'add title' : 'change title' }}
                </div>
                <div
                  id="removeTitleButton"
                  v-if="
                    almanacStore.selectedAlmanac.userOwned &&
                    almanacStore.selectedAlmanac.title.length > 0
                  "
                  class="button noSelect"
                  :class="{ 'disabled-btn': almanacStore.selectedAlmanac.changing }"
                  @click="changeTitle(true)"
                >
                  remove title
                </div>
                <div id="tradeOn">
                  <div class="tradeOnText noSelect">view on:</div>
                  <div id="marketplaces">
                    <a :href="`${almanacStore.aspectUri}/${almanacStore.selectedAlmanac.id}`"
                      ><div class="aspectLogo"></div
                    ></a>
                    <div class="tradeOnText noSelect">or</div>
                    <a :href="`${almanacStore.mintsquareUri}/${almanacStore.selectedAlmanac.id}`"
                      ><div class="mintSquareLogo"></div
                    ></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div id="notExistsContainer">
              <div id="notExistsSelected">
                Almanac #{{ almanacStore.selectedAlmanac.id }} does not exist
              </div>
            </div>
          </div>
          <router-link :to="{ name: 'gallery', params: { id: '' } }"
            ><div id="backButton">go back</div></router-link
          >
        </div>
        <div id="bigSelectedContainer" v-else>
          <div id="noServer">AlmAnAc server seems to be down. try again later.</div>
          <div id="tradeOn">
            <div class="tradeOnText noSelect">or trade on</div>
            <a :href="`${almanacStore.aspectUri}`"><div class="aspectLogo"></div></a>
            <div class="tradeOnText noSelect" v-if="!isMobile">and</div>
            <a :href="`${almanacStore.mintsquareUri}/nfts`"><div class="mintSquareLogo"></div></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#spinner {
  width: 50px;
  height: 50px;
  background-image: url('/img/spinner.svg');
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

.red {
  color: red !important;
}

#inputBackground {
  width: 100vw;
  height: 100vh;
  position: fixed;
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

#optionsTitle2 {
  color: white;
  font-size: 42px;
  letter-spacing: 1px;
}

#changeTitleConfirmButton {
  margin-top: 22px;
  height: 50px;
  width: 200px;
  font-size: 16px;
  line-height: 30px;
  font-family: 'Major Mono Display', monospace;
}

#inputWarning {
  font-family: 'Major Mono Display', monospace;
  font-size: 12px;
  color: white;
  margin-top: 9px;
}

.detailLabel {
  margin-top: 20px;
}

#bigSelectedContainer {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
}

#notExistsContainer {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
}

#notExistsSelected {
  color: white;
  margin-top: 100px;
  font-family: 'Major Mono Display', monospace;
  font-size: 32px;
  text-transform: lowercase;
}

#detailContainer {
  display: flex;
  flex-direction: row;
  min-height: calc(100vh - 500px);
  margin-top: 50px;
  align-content: center;
  align-items: center;
  width: 100%;
}
#nftVideo {
  width: 700px;
  height: 700px;
}

#detailVideo {
  width: 720px;
}

#detailAttributes {
  display: flex;
  flex-direction: column;
  color: white;
  width: 580px;
  justify-content: flex-start;
  flex-wrap: nowrap;
  height: 700px;
}

#almanacDetailTitle {
  font-size: 62px;
}

#marketIconDescription {
  margin-top: 20px;
  width: 120px;
  height: 45px;
  background-size: contain;
  background-repeat: no-repeat;
}

#almanacDetailOwner {
  font-size: 12px;
  margin-top: 5px;
  text-transform: lowercase;
  font-family: 'Major Mono Display', monospace;
}

#buttonsContainer {
  display: flex;
  flex-direction: column;
  position: absolute;
  align-items: center;
  align-content: center;
  bottom: 100px;
  width: 30vw;
}

#removeTitleButton {
  height: 60px;
  width: 300px;
  font-size: 20px;
  line-height: 30px;
  font-family: 'Major Mono Display', monospace;
  margin-bottom: 40px;
}

#changeTitleButton {
  margin-bottom: 30px;
  height: 60px;
  width: 300px;
  font-size: 20px;
  line-height: 30px;
  font-family: 'Major Mono Display', monospace;
}

#backButton {
  font-size: 32px;
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
  height: 90px;
  width: 500px;
  font-size: 32px;
  line-height: 40px;
  font-family: 'Major Mono Display', monospace;
}

#galleryContainer {
  margin-top: 30px;
  margin-bottom: 80px;
  width: 100%;
  max-width: 1370px;
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
  content: '';
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
  font-size: 26px;
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
  width: 60px;
  text-align: center;
  font-family: 'Major Mono Display', monospace;
  font-size: 36px;
}

.disabledPage {
  color: grey;
  cursor: default;
}

#noServer {
  color: white;
  font-family: 'Major Mono Display', monospace;
  margin-top: 200px;
}

#tradeOn {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-content: center;
  align-items: center;
  margin-bottom: 30px;
  margin-top: 30px;
}
.tradeOnText {
  color: white;
  font-family: 'Major Mono Display', monospace;
  margin: 10px;
}

#marketplaces {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.aspectLogo {
  width: 130px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('/img/aspect.png');
}

.mintSquareLogo {
  width: 217px;
  height: 50px;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('/img/mintSquare.png');
}

#tradeOn2 {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-content: center;
  align-items: center;
  margin-bottom: 30px;
  margin-top: 30px;
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

  #detailContainer {
    flex-direction: column;
    width: 100%;
  }
  #nftVideo {
    width: 90vw;
    height: 90vw;
  }

  #detailVideo {
    width: 90vw;
  }

  #detailAttributes {
    width: 90vw;
    height: unset;
  }

  #almanacDetailTitle {
    font-size: 38px;
  }

  #almanacDetailOwner {
    font-size: 7.2px;
    margin-top: 5px;
    text-transform: lowercase;
    font-family: 'Major Mono Display', monospace;
  }

  #buttonsContainer {
    display: flex;
    flex-direction: column;
    position: unset;
    margin-top: 40px;
    width: 90vw;
    bottom: 50px;
    margin-bottom: 60px;
  }

  #removeTitleButton {
    height: 30px;
    width: 250px;
    font-size: 20px;
    line-height: 30px;
    margin-left: unset;
    margin-top: 25px;
    margin-bottom: unset;
  }

  #changeTitleButton {
    margin-bottom: unset;
    height: 60px;
    width: 100%;
    font-size: 20px;
    line-height: 30px;
    font-family: 'Major Mono Display', monospace;
    margin-left: unset;
  }

  #backButton {
    margin-bottom: 40px;
    margin-top: 0px;
  }

  #marketplaces {
    flex-direction: column;
  }

  #loadingMessage {
    width: 100%;
  }

  .message {
    margin-bottom: 40px;
  }

  #mintNowButton {
    margin-bottom: 100px;
    height: 70px;
    width: 90vw;
    font-size: 20px;
    line-height: 40px;
  }
}
</style>
