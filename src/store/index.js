import { createStore } from 'vuex';

const store = createStore({
  modules: {
    argent: require('./argent').default
  }
});

export default store;