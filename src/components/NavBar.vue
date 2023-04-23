<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStarknetStore } from '@/store/starknet'
import { useAlmanacStore } from '@/store/almanac'
import useBreakpoints from '../helpers/useBreakpoints'
import ConnectButton from './ConnectButton.vue'

const route = useRoute()

const { type } = useBreakpoints()
const starknetStore = useStarknetStore()
const almanacStore = useAlmanacStore()

const menu = ref(false)

function showMenu(show) {
  menu.value = show
}

function swipeHandler(event) {
  this.showMenu(false)
}

function isMobile() {
  return type.value != 'lg'
}
</script>

<template>
  <div id="Navbar">
    <router-link :to="'/'"><div id="Logo"></div></router-link>

    <router-link :to="'/mint'"
      ><span
        class="link noSelect"
        :class="{ selected: route.name == '/mint' }"
        v-if="!isMobile() && almanacStore.enabled"
        >mint</span
      ></router-link
    >
    <router-link :to="'/random'"
      ><span
        class="link noSelect"
        :class="{ selected: route.name == '/random' }"
        v-if="!isMobile() && almanacStore.enabled"
        >random mint</span
      ></router-link
    >
    <router-link :to="'/gallery'"
      ><span
        class="link noSelect"
        :class="{ selected: route.name?.includes('/gallery') }"
        v-if="!isMobile() && almanacStore.enabled"
        >gallery</span
      ></router-link
    >

    <ConnectButton v-if="!isMobile()" class="fullscreen-connect-button" />

    <div id="MenuButton" @click="showMenu(true)" v-if="isMobile()"></div>
    <div
      id="Menu"
      :class="{ 'show-menu': menu }"
      v-if="isMobile"
      v-touch:swipe.right="swipeHandler"
    >
      <router-link :to="'/'" @click="showMenu(false)"
        ><div id="Logo" class="in-menu-logo"></div
      ></router-link>
      <router-link :to="'/mint'" @click="showMenu(false)" v-if="almanacStore.enabled"
        ><span class="link in-menu" :class="{ selected: route.name == '/mint' }"
          >mint</span
        ></router-link
      >
      <router-link :to="'/random'" @click="showMenu(false)" v-if="almanacStore.enabled"
        ><span class="link in-menu" :class="{ selected: route.name == '/random' }"
          >random mint</span
        ></router-link
      >
      <router-link :to="'/gallery'" @click="showMenu(false)" v-if="almanacStore.enabled"
        ><span class="link in-menu" :class="{ selected: route.name == '/gallery' }"
          >gallery</span
        ></router-link
      >
      <ConnectButton class="menu-connect-button" />
    </div>

    <div
      id="GreyBg"
      :class="{ 'show-menu-bg': menu }"
      v-if="isMobile()"
      @click="showMenu(false)"
      v-touch:swipe.right="swipeHandler"
    ></div>
  </div>
</template>

<style scoped>
#Navbar {
  z-index: 100;
  height: 80px;
  margin-top: 10px;
  width: 95%;
}

#MenuButton {
  background-image: url('/img/menu.png');
  height: 40px;
  width: 40px;
  float: right;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 10px;
  cursor: pointer;
}

#Menu {
  position: fixed;
  width: 300px;
  height: 100vh;
  right: 0px;
  top: 0px;
  background-color: rgb(21 16 50);
  transform: translateX(400px);
  transition: ease-in-out 0.5s;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: flex-start;
  align-items: center;
  box-shadow: 0px 0px 20px #000000aa;
}

.fullscreen-connect-button {
  margin-top: 0.8rem;
  margin-right: 1rem;
  float: right;
}

.menu-connect-button {
  margin-top: 0.8rem;
}

.show-menu {
  transform: translateX(0px) !important;
}

#GreyBg {
  z-index: 500;
  background-color: rgba(0, 0, 0, 0);
  transition: ease-in-out 0.5s;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.show-menu-bg {
  pointer-events: all !important;
  background-color: rgba(0, 0, 0, 0.4) !important;
}

.selected {
  color: white !important;
}

.link {
  float: left;
  float: left;
  line-height: 70px;
  padding-left: 20px;
  color: white;
  font-size: 1.3em;
  padding-left: 1em;
  padding-right: 1em;
  text-align: center;
  font-size: 18px;
  font-family: 'Major Mono Display', monospace;
}

.in-menu {
  width: 300px;
}

.link:hover {
  color: rgb(190, 190, 190);
}

#Logo {
  float: left;
  background-image: url('/img/favicon/android-chrome-512x512.png');
  background-repeat: no-repeat;
  background-size: contain;
  height: 50px;
  width: 50px;
  margin-top: 9px;
  transition: ease 0.1s;
}

#Logo:hover {
  filter: brightness(1.2);
  transform: scale(1.05);
}

.in-menu-logo {
  width: 6em !important;
  height: 6em !important;
  margin-bottom: 1em;
}
</style>
