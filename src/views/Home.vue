<template>
  <div class="viewContainer">
    <div id="firstSection">
      <div id="logo"></div>
      <div id="description" class="noSelect">
        📉 10,000 unique crypto trading days 📈<br>
      </div>
      <div id="exampleContainer">
        <div id="exampleVideo">
          <video autoplay id="landingVideo" muted>
            <source src="/img/landing.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        <div id="explainerContainer">
          <div class="explainerItem noSelect">Pick a market,</div>
          <div class="explainerItem noSelect">Pick a date &</div>
          <div class="explainerItem noSelect">Mint a day in crypto!</div>
          <div class="onlyText noSelect">only on</div>
          <div class="starknetLogo noSelect"></div>
          
        </div>
      </div>
      <router-link :to="'/mint'"><div id="mintNowButton" class="button noSelect">mint yours now</div></router-link>

      <div id="tradeOn">
          <div class="tradeOnText noSelect">trade on</div>
          <a href="https://testnet.aspect.co/collection/0x0175e2980c223827a8d5d616b81f5613b3f0cc22798686726ab29ad17b05dc4a"><div class="aspectLogo"></div></a>
      </div>

    </div>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    data() { return {} },
    methods: {},
    mounted() {}
  }
</script>

<style scoped>

  #firstSection {
    min-height: calc(100vh - 90px);
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: nowrap;
  }

    #logo {
      width: 900px;
      max-width: 90%;
      height: 176px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-image: url('/public/img/almanac.png');
    }

    #description {
      color: white;
      text-align: center;
      font-size: 1.4em;
      font-family: 'Major Mono Display', monospace;
    }

    #exampleContainer {
      display: flex;
      width: 1000px;
      margin-top: 80px;
    }

      #exampleVideo {
        width: 500px;
        height: 500px;
        background-color: #120c2c;
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
      }

        #landingVideo {
          width: 500px;
          height: 500px;
        }

      #explainerContainer {
        width: 500px;
        height: 500px;
        color: white;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
      }

        .explainerItem {
          font-family: 'Gemunu Libre', sans-serif;
          font-size: 48px;
          line-height: 35px;
          margin: 20px;
          text-align: center;
        }

        #learnMore {
          margin-top: 50px;
          color: white;
          text-decoration: underline solid 1px;
          font-size: 1.4em; 
        }

        .onlyText {
          margin-top: 50px;
        }

        .starknetLogo {
          width: 400px;
          height: 90px;
          background-repeat: no-repeat;
          background-size: contain;
          background-image: url('/public/img/starknet.png');
        }

    #mintNowButton {
      margin-top: 100px;
      margin-bottom: 70px;
      height: 40px;
      width: 400px;
      font-size: 32px;
      line-height: 40px;
      font-family: 'Major Mono Display', monospace;
    }

  #tradeOn {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    align-content: center;
    align-items: center;
    margin-bottom: 30px;
  }

  .tradeOnText {
    color: white;
    font-family: 'Major Mono Display', monospace;
    margin-right: 20px;
  }

  .aspectLogo {
    width: 130px;
    height: 50px;
    background-repeat: no-repeat;
    background-size: contain;
    background-image: url('/public/img/aspect.png');
  }

  @media only screen and (max-width: 999px) and (min-width: 550px) {

    #exampleContainer {
      width: 700px;
    }

      #exampleVideo {
        width: 400px;
        height: 400px;
      }

        #landingVideo {
          width: 400px;
          height: 400px;
        }

      #explainerContainer {
        width: 300px;
        height: 400px;
      }

        .explainerItem {
          font-size: 36px;
          line-height: 35px;
          margin: 20px;
        }
    
    .starknetLogo {
          width: 230px;
    }
  }


  @media only screen and (max-width: 549px) {
    #logo {
      height: 75px;
    }

    #description {
      font-size: 12px;
      margin-bottom: 20px;
    }

    #exampleContainer {
      width: 90%;
      flex-direction: column;
      margin-top: 20px;
    }

      #exampleVideo {
        width: 90vw;
        height: 90vw;
      }

        #landingVideo {
          width: 90vw;
          height: 90vw;
        }

      #explainerContainer {
        width: 90vw;
        height: auto;
        margin-top: 20px;
      }

        .explainerItem {
          font-size: 36px;
          line-height: 36px;
          margin: 5px;
        }

    #mintNowButton {
      margin-top: 32px;
      margin-bottom: 30px;
      height: 30px;
      width: 200px;
      font-size: 18px;
      line-height: 32px;
    }

    .starknetLogo {
          width: 270px;
    }

  .tradeOnText {
    font-size: 12px;
    margin-right: 20px;
  }

  .aspectLogo {
    width: 80px;
    height: 30px;
  }
  }
</style>