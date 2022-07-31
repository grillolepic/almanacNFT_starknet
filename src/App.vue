<template>
  <div id="mainContainer">
    <div id="limitContainer">
      <NavBar/>
      <router-view/>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';

export default {
  name: 'App',
  data() { return {} },
  components: { NavBar },
  created() {},
  methods: {},
  computed: {}
};

</script>

<style>
  :root{
    --max-width: 1370px;
  }

  html, body {
    min-height: 100vh;
    margin: 0px;
    padding: 0px;
    outline: none !important;
    overflow-x: hidden;
    font-size: 21px;
    font-family: 'Gemunu Libre', sans-serif;
    background: rgb(39 19 72);
  }

  #mainContainer {
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: nowrap;
    align-content: flex-start;
    width: 100vw;
    min-height: 50vh;
    position: absolute;
    top: 0px;
    left: 0px;
    background: rgb(39 19 72);
    background: linear-gradient(0deg, rgb(39 19 72) 0%, rgba(18,11,43,1) 100%);
  }

  #limitContainer {
    width: 100vw;
    max-width: var(--max-width);
    display: flex;
    align-content: space-between;
    justify-content: center;
    flex-flow: column;
    align-items: center;
  }

  .viewContainer {
    width: 100vw;
    max-width: var(--max-width);
    flex: 1;
    display: flex;
    align-content: center;
    justify-content: center;
    flex-wrap: nowrap;
    flex-direction: column;
    align-items: center;
  }

  #title {
    font-size: 130px;
    color: white;
    text-align: center;
    position: relative;
    left: 12px;
    font-family: 'Major Mono Display', monospace;
  }

  .button {
    border: 8em;
    cursor: pointer;
    outline: none;
    font-size: 16px;
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
    -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
        -moz-user-select: none;
          -ms-user-select: none;
              user-select: none;
    text-decoration: none !important;
    font-family: 'Major Mono Display', monospace;
  }

  .button .text {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(45deg, #4568dc, #b06ab3);
    -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
        -moz-user-select: none;
          -ms-user-select: none;
              user-select: none;
  }

  .button:after {
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

  .button:hover {
    background-image: linear-gradient(-45deg, #4568dc, #b06ab3);
    box-shadow: 0 12px 24px rgba(128, 128, 128, 0.1);
  }

  .button:hover .text {
    background-image: linear-gradient(-45deg, #4568dc, #b06ab3);
  }

  .green-btn {
    background-image: linear-gradient(45deg, #45dc4d, #6cb36a);
  }

  .green-btn .text {
      background-image: linear-gradient(45deg, #45dc4d, #6cb36a);
  }

  .green-btn:hover {
      background-image: linear-gradient(-45deg, #45dc4d, #6cb36a);
  }

  .green-btn:hover .text {
      background-image: linear-gradient(-45deg, #45dc4d, #6cb36a);
  }

  .orange-btn {
    background-image: linear-gradient(45deg, #dc9645, #b38b6a);
  }

  .orange-btn .text {
      background-image: linear-gradient(45deg, #dc9645, #b38b6a);
  }

  .orange-btn:hover {
      background-image: linear-gradient(-45deg, #dc9645, #b38b6a);
  }

  .orange-btn:hover .text {
      background-image: linear-gradient(-45deg, #dc9645, #b38b6a);
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }

  .sc5::-webkit-scrollbar {
    width: 15px;
    height: 15px;
  }
  .sc5::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.1);
  }
  .sc5::-webkit-scrollbar-thumb {
    background-image: linear-gradient(45deg, #4568dc, #b06ab3);
    border-radius: 10px;
    box-shadow: rgba(0,0,0,.12) 0 3px 13px 1px;
    -webkit-box-shadow: rgba(0,0,0,.12) 0 3px 13px 1px;
  }

  .noSelect {
      -webkit-user-select: none;
      -khtml-user-select: none;
        -moz-user-select: none;
          -ms-user-select: none;
              user-select: none;
  }

  a {
    text-decoration: none;
  }

  .s-dialog__content {
    border-radius: 30px !important;
  }

  .s-card {
    background: #181821 !important;
    border-radius: 30px !important;
  }

  .s-list-item {
    background: #4568dc !important;
    background-color: #181821 !important;
    border: none !important;
    border-radius: 35px;
  }

  .s-list-item__content {
    background-color: #181821 !important;
  }

  .s-list-item__title {
    font-family: 'Major Mono Display', monospace !important;
    text-transform: lowercase !important;
  }

  #inputContainer {
    z-index: 500;
    background-color: rgba(0, 0, 0, 0);
    transition: ease-in-out 0.2s;
    position: fixed;
    top:0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

    #inputFieldContainer {
      width: 500px;
      height: 230px;
      transition: ease-in-out 0.2s;
      display: flex;
    }

    .hide-input-options {
        transform: scale(0) !important;
    }

  #inputField {
    width: 435px;
    font-size: 32px;
    background-color: #22224a;
    border: 0px;
    border-radius: 5px;
    margin-top: 20px;
    color: white;
    font-family: 'Gemunu Libre', sans-serif;
    height: 37px;
    padding: 10px;
  }


  #selectContainer {
    z-index: 500;
    background-color: rgba(0, 0, 0, 0);
    transition: ease-in-out 0.2s;
    position: fixed;
    top:0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

    .show-select-bg {
        pointer-events: all !important;
        background-color: rgba(0, 0, 0, 0.8) !important;
    }

    #optionsContainer {
      width: 500px;
      height: 400px;
      transition: ease-in-out 0.2s;
      display: flex;
    }

    #optionsBg {
      width: 100%;
      height: 100%;;
      -webkit-transform: translate(0);
      transform: translate(0);
      background-image: linear-gradient(45deg, #4568dc, #b06ab3);
      padding: 0.7em 2em;
      border-radius: 25px;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-content: center;
      justify-content: flex-start;
      align-items: center;
      overflow: hidden;
    }

      #optionsBg:after {
        content: "";
        border-radius: 25px;
        position: absolute;
        margin: 4px;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: -1;
        background: #101022;
      }

      #optionsTitle {
        margin-top: 10px;
      }

      #optionsScroller {
        background-color: #0d0d1c;
        border-radius: 25px;
        margin-top: 30px;
        height: 300px;
        width: 400px;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-content: center;
        align-items: center;
        overflow-y: scroll;
      }

        .optionsOption {
          border-radius: 25px;
          width: 100%;
          min-height: 60px;
          color: white;
          font-size: 21px;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center;
          align-content: center;
          cursor: pointer;
          font-family: 'Major Mono Display', monospace;
        }

        .optionsOption:hover {
          background-color: rgba(255,255,255,0.2);
        }

        .selectedOption {
          background-color: rgba(255,255,255,0.05);
        }

    .hide-options {
        transform: scale(0) !important;
    }




  @media only screen and (max-width: 549px) {}

  @media only screen and (min-width: 550px) {}
</style>
