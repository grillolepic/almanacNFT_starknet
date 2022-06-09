<template>
    <div id="Navbar">
        <router-link :to="'/'"><div id="Logo"></div></router-link>

        <router-link :to="'/mint'"><span class="link" :class="{ 'selected': currentPath == '/mint' }" v-if="!isMobile">mint</span></router-link>
        <router-link :to="'/gallery'"><span class="link" :class="{ 'selected': currentPath == '/gallery' }" v-if="!isMobile">gallery</span></router-link>
        <!--router-link :to="'/milestones'"><span class="link" :class="{ 'selected': currentPath == '/milestones' }" v-if="!isMobile">milestones</span></router-link>
        <router-link :to="'/FAQ'"><span class="link" :class="{ 'selected': currentPath == '/FAQ' }" v-if="!isMobile">faq</span></router-link-->

        <div id="ConnectButton" class="button" :class="{ 'orange-btn': argent.connected && argent.address && !argent.networkOk, 'green-btn': argent.connected && argent.address && argent.networkOk }" @click="toggleConnect" v-if="!isMobile">
            <span id="argentX" v-if="!argent.connected"></span>
            <span>{{btnConnectText}}</span>
        </div>
    
        <div id="MenuButton" @click="showMenu(true)" v-if="isMobile"></div>
        <div id="Menu" :class="{ 'show-menu': menu }" v-if="isMobile" v-touch:swipe.right="swipeHandler">
            <router-link :to="'/'" @click="showMenu(false)"><div id="Logo" class="in-menu-logo"></div></router-link>
            <router-link :to="'/mint'" @click="showMenu(false)"><span class="link in-menu" :class="{ 'selected': currentPath == '/mint' }">mint</span></router-link>
            <router-link :to="'/gallery'" @click="showMenu(false)"><span class="link in-menu" :class="{ 'selected': currentPath == '/gallery' }">gallery</span></router-link>
            <!--router-link :to="'/milestones'" @click="showMenu(false)"><span class="link" :class="{ 'selected': currentPath == '/milestones' }" v-if="!isMobile">milestones</span></router-link>
            <router-link :to="'/FAQ'" @click="showMenu(false)"><span class="link" :class="{ 'selected': currentPath == '/FAQ' }" v-if="!isMobile">faq</span></router-link-->

            <div id="ConnectButton" class="button" :class="{ 'orange-btn': argent.connected && argent.address && !argent.networkOk, 'green-btn': argent.connected && argent.address && argent.networkOk }"
                @click="toggleConnect"><span>{{btnConnectText}}</span></div>
        </div>

        <div id="GreyBg" :class="{ 'show-menu-bg': menu }" v-if="isMobile" @click="showMenu(false)" v-touch:swipe.right="swipeHandler"></div>
    </div>  
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { useRoute } from 'vue-router';
import useBreakpoints from '../helpers/useBreakpoints';

export default {
    name: 'NavBar',
    setup(props) {
        const { width, height, type } = useBreakpoints();
        return { width, type };
    },
    data() {
        return {
            menu: false
        }
    },
    computed: mapState({
        argent: (state) => state.argent,
        btnConnectText: (state) => {
            if (state.argent.connected && state.argent.address) {
                if (state.argent.networkOk) {
                    return state.argent.address.toLowerCase().substring(0,7) + "..." + state.argent.address.toLowerCase().substring(state.argent.address.length-7,state.argent.address.length);
                } else {
                    return "unsupported network";
                }
            } else {
                return "connect";
            }
        },
        currentPath: function() { return useRoute().path; },
        isMobile: function () {
            return (this.type != 'lg');
        }
    }),
    methods: {
    ...mapActions('argent', ['connectArgentX','logout']),
    toggleConnect: function (event) {
        if (this.argent.connected && this.argent.address) {
            if (this.argent.networkOk) {
                this.logout();
            }
        } else {
            this.connectArgentX();
        }
    },
    showMenu: function (b) {
        this.menu = b;
    },
    swipeHandler(event) {
        this.showMenu(false);
	},
  }
};
</script>

<style scoped>
    #Navbar {
        z-index: 100;
        height: 80px;
        margin-top: 10px;
        width: 95%;
    }

    #MenuButton {
        background-image: url('/public/img/menu.png');
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
        box-shadow: 0px 0px 20px #000000AA;
    }

    .show-menu {
        transform: translateX(0px) !important;
    }

    #GreyBg {
        z-index: 500;
        background-color: rgba(0, 0, 0, 0);
        transition: ease-in-out 0.5s;
        position: fixed;
        top:0px;
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
        background-image: url('/public/img/favicon/android-chrome-512x512.png');
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
        height: 6em!important;
        margin-bottom: 1em;
    }

    #ConnectButton {
        margin-top: 0.8rem;
        margin-right: 1rem;
        float: right;
        font-family: 'Major Mono Display', monospace;
    }

    #argentX {
        display: inline-block;
        width: 20px;
        height: 14px;
        background-image: url('/public/img/argentX.png');
        background-size: contain;
        background-repeat: no-repeat;
    }

    .green-btn:hover {
        background-image: linear-gradient(-45deg, #dc4545, #b36a6a);
    }
    .green-btn:hover .text {
        background-image: linear-gradient(-45deg, #dc4545, #b36a6a);
    }
    .green-btn:hover span { display:none; }
    .green-btn:hover:before {
        content:"disconnect";
    }
    .green-btn {
        width: 200px;
    }
</style>