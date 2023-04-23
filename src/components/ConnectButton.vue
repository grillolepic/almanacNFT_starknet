<script setup>
import { useStarknetStore } from '@/store/starknet'
import { computed } from 'vue'

const starknetStore = useStarknetStore()

const btnConnectText = computed(() => {
  if (starknetStore.connected && starknetStore.address) {
    if (starknetStore.networkOk) {
      if (starknetStore.starkName == null) {
        return starknetStore.shortAddress(12)
      } else {
        return starknetStore.starkName
      }
    } else {
      return 'unsupported network'
    }
  } else {
    return 'connect'
  }
})

function toggleConnect(event) {
  if (starknetStore.connected && starknetStore.address) {
    if (starknetStore.networkOk) {
      starknetStore.logout()
    }
  } else {
    starknetStore.connectStarknet()
  }
}
</script>

<template>
  <div
    id="ConnectButton"
    class="button noSelect"
    :class="{
      'orange-btn': starknetStore.connected && starknetStore.address && !starknetStore.networkOk,
      'green-btn': starknetStore.connected && starknetStore.address && starknetStore.networkOk,
      'connected-button':
        starknetStore.connected && starknetStore.address && starknetStore.networkOk
    }"
    @click="toggleConnect"
  >
    <span id="argentX" class="containNoRepeatCenter" v-if="!starknetStore.connected"></span>
    <span>{{ btnConnectText }}</span>
  </div>
</template>

<style scoped>
#ConnectButton {
  font-family: 'Major Mono Display', monospace;
}

#argentX {
  display: inline-block;
  width: 20px;
  height: 14px;
  background-image: url('/img/argentX.png');
}

.connected-button:hover span {
  display: none;
}
.connected-button:hover:before {
  content: 'disconnect';
}
.connected-button {
  width: 250px;
}
</style>
