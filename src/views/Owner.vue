<template>
  <div class="viewContainer">
    <div id="title" class="noSelect">owner</div>
    <div v-if="argent.connected && argent.address && argent.networkOk && argent.isOwner">
        <div id="spinner" v-if="argent.initialLoading"></div>
        <div v-else>
            <div id="launchButton" class="button noSelect" @click="launch">launch</div>
        </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Owner',
  data() { return {}},
  mounted: function() {},
  components: {},
  methods: {
    ...mapActions('argent', ['launch']),
  },
  computed: mapState({
      argent: (state) => state.argent,
  }),
}
</script>

<style scoped>
  #launchButton {
    margin-top: 100px;
    width: 290px;
    font-size: 40px;
    padding: 25px;
    margin-bottom: 20px;
  }

    #launchButton:after {
      margin: 8px;

    }
</style>