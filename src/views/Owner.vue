<template>
  <div class="viewContainer">
    <div id="title" class="noSelect">owner</div>
    <div v-if="argent.connected && argent.address && argent.networkOk && argent.isOwner">
        <div id="spinner" v-if="argent.initialLoading"></div>
        <div v-else>

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
    ...mapActions('argent', []),
  },
  computed: mapState({
      argent: (state) => state.argent,
  }),
}
</script>

<style scoped>
</style>