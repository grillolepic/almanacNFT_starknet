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

    <div id="secondSection">
      <div class="marketsInfo noSelect">pick from 10+ markets</div>
      <div id="marketsContainer">
        <div v-for="n in [0,1,2,3,4,5,6,7,8,9,10,11,12,13]" :key="n">
          <div class="marketImage noSelect" :style="`background-image:url('img/markets/${n}.png')`"></div>
          <div class="marketText noSelect">{{getMarketText(n)}}</div>
        </div>
      </div>
      <div class="marketsInfo2 noSelect">more markets coming soon!</div>
    </div>

    <div id="thirdSection">
      <div class="marketsInfo noSelect">capture a day<span class="lowWeight">'</span>s sentiment</div>
      <div id="typesContainer">
        <div class="almanacType">
          <video autoplay class="typeVideo" muted>
            <source src="/img/bull.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <div class="typeName"><span class="trasnp">Bullish Days</span> 🚀</div>
        </div>
        <div class="almanacType">
          <video autoplay class="typeVideo" muted>
            <source src="/img/bear.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <div class="typeName"><span class="trasnp">Bearish Days</span> 🐻</div>
        </div>
        <div class="almanacType">
          <video autoplay class="typeVideo" muted>
            <source src="/img/wtf.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <div class="typeName"><span class="trasnp">WTF Days</span> 🤔</div>
        </div>
      </div>
    </div>

    <div id="fourthSection">
      <div class="marketsInfo noSelect">participate in<br>milestone raffles</div>
      <div id="milestoneContainer">
        <div id="milestoneVideoContainer">
            <video autoplay class="milestoneVideo" muted>
              <source src="/img/bitcoin.mp4" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <div class="milestoneInfo noSelect">milestone #1 commemorates the registration of the 'bitcoin.org' domain by satoshi nakamoto</div>
          </div>
        <div id="milestoneTextContainer">
            <div class="milestoneInfo2 noSelect">Every minted Almanac will participate on daily, Starknet-VRF raffles for the 30+ Milestone NFTs, celebrating special days in crypto history.</div>
            <div class="milestoneInfo3 noSelect">participate just by holding an AlmAnAc!</div>
        </div>
      </div>
    </div>

    <div id="faqSection">
      <div id="faqTitle" class="noSelect">faq</div>
      <div id="questionsContainer">

        <div class="qa">
          <div class="question noSelect">What is Almanac?</div>
          <div class="answer noSelect">Almanac is a collection of 10.000 unique crypto-trading day NFTs on StarkNet.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Why Starknet?</div>
          <div class="answer noSelect">Almanac celebrates crypto's past, so what better place to launch than on crypto's future?</div>
        </div>
        <div class="qa">
          <div class="question noSelect">How much will an Almanac cost?</div>
          <div class="answer noSelect">The cost of minting an Almanac will be 0.03 ETH.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Wen launch?</div>
          <div class="answer noSelect">Development is mostly done. We'll launch when we find StarkNet is ready, with functional bridges and NFT marketplaces. Soon.</div>
        </div>

        <div class="qa">
          <div class="question noSelect">Why do Almanacs have different background colors?</div>
          <div class="answer noSelect">The background color of the Almanacs represent the daily price change. Some days might produce unexpected, weird colors.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Do Almanacs have different rarities?</div>
          <div class="answer noSelect">Apart from the special Milestone Almanacs, all other NFTs are technically equal, but with inherent differences. Very bullish or bearish days might end up being rare, same as local tops and bottoms.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Where is the data obtained from?</div>
          <div class="answer noSelect">Data is obtained from a few exchange's APIs and from <a href="https://www.cryptocompare.com/">CryptoCompare</a> when no other source is available.</div>
        </div>

        <div class="qa">
          <div class="question noSelect">Can I add any title to an Almanac?</div>
          <div class="answer noSelect">With some common sense exceptions, any title is acceptable and will be allowed.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Where are titles stored?</div>
          <div class="answer noSelect">Titles are not stored inside the NFT itself, but on the NFT's metadata.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Will I always be able to change an Almanac's title?</div>
          <div class="answer noSelect">Once all Almanacs are minted, a deadline will be set to title editing. After that, the Almanacs' metadata will be fixed.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Can I add a title to a Milestone Almanac?</div>
          <div class="answer noSelect">No, Milestone Almanacs already have a fixed title.</div>
        </div>

        <div class="qa">
          <div class="question noSelect">How will Milestones be distributed?</div>
          <div class="answer noSelect">A raffle with verifiable randomness will pick the winner of every Milestrone NFT from the publicly minted Almanac owners.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Why does the NFT show as unavailable on mint?</div>
          <div class="answer noSelect">Only one Almanac can be minted of a given market and date. If the mint screen shows that the selecte market and date is not available, then that Almanac NFT has already been minted.</div>
        </div>


        <div class="qa">
          <div class="question noSelect">Why cannot I mint Almanacs from before a given date?</div>
          <div class="answer noSelect">Hourly data is difficult to obtain from very far away dates.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Why do some Almanac candles look weird?</div>
          <div class="answer noSelect">Sometimes, especially for very old dates, some source data can be missing, buggy or simply look a little weird compared to higher volume dates.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Is there a roadmap?</div>
          <div class="answer noSelect">Almanac is a finished product, but I'm building various things on StarkNet and I'll always keep Almanac holders in mind... 👀</a>.</div>
        </div>
        <div class="qa">
          <div class="question noSelect">Where can I stay updated on the latest news?</div>
          <div class="answer noSelect">Follow @<a href="https://twitter.com/almanacNFT">almanacNFT on Twitter</a>.</div>
        </div>


      </div>
  </div>

    <div id="finalSection">
      <div class="developedBy noSelect">by Grillo</div>
      <a href="https://twitter.com/defisaurus"><div class="tw noSelect"></div></a>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'Home',
    data() { return {} },
    methods: {
      getMarketText(number) {
       return ["BTC/USD","ETH/USD","ETH/BTC","ADA/USD","TRX/USD","MATIC/USD","DOT/USD","SOL/USD","LUNA/USD","AVAX/USD","LINK/USD","DOGE/USD","SHIB/USD","APE/USD"][number];
      }
    },
    mounted() {}
  }
</script>

<style scoped>
  #firstSection {
    /*min-height: calc(100vh - 90px);*/
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


  #secondSection {
    /*min-height: calc(100vh - 90px);*/
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: nowrap;
    background: rgb(0,0,0);
    background: -moz-linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0.4) 90%, rgba(0,0,0,0) 100%);
    background: -webkit-linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0.4) 90%, rgba(0,0,0,0) 100%);
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0.4) 90%, rgba(0,0,0,0) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
    padding-top: 40px;
    padding-bottom: 40px;
  }

    .marketsInfo {
      color: white;
      text-align: center;
      font-size: 64px;
      font-family: 'Major Mono Display', monospace;
      margin-bottom: 25px;
      margin-top: 30px;
      max-width: 1200px;
      line-height: 85px;
      font-weight: 800;
    }

    .marketsInfo2 {
      color: white;
      text-align: center;
      font-size: 29px;
      font-family: 'Major Mono Display', monospace;
      margin-top: 15px;
      margin-bottom: 30px;
    }

  #marketsContainer {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    width: 560px;
  }
  .marketImage {
    width: 80px;
    height: 45px;
    background-size: contain;
    background-repeat: no-repeat;
    margin: 0px 15px 0px 15px;
  }

  .marketText {
    color: #ffffff80;
    text-align: center;
    margin-bottom: 15px;
    font-size: 16px;
  }

  #thirdSection {
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: nowrap;
    padding-top: 20px;
    padding-bottom: 30px;
  }

    #typesContainer {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-evenly;
    }

      .almanacType {
        display: flex;
        margin: 0px 20px 0px 20px;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: center;
        align-items: center;
      }

        .typeVideo {
          width: 300px;
          height: 300px;
          background-color: #120c2c;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
        }

      .typeName {
        text-align: center;
        font-size: 36px;
        margin-top: 10px;
        margin-bottom: 25px;
        font-weight: 200;
      }


  #fourthSection {
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: nowrap;
    padding-bottom: 20px;
    background: rgb(0,0,0);
    background: -moz-linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 100%);
    background: -webkit-linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 100%);
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
  }

    #milestoneContainer {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      align-content: flex-start;
      justify-content: center;
    }

      .milestoneVideo {
        width: 500px;
        height: 500px;
        margin: 0px 30px;
        background-image: linear-gradient(45deg, #dcac45, #c87e10);
        padding: 2px;
        box-shadow: 1px 1px 10px rgba(255, 255, 255, 0.438);
      }

    .milestoneInfo {
      color: #ffc100;
      text-align: center;
      font-size: 18px;
      font-family: 'Major Mono Display', monospace;
      margin: 15px 30px 30px 30px;
      line-height: 25px;
    }

      #milestoneVideoContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 500px;
        align-content: center;
      }

      #milestoneTextContainer {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        max-width: 500px;
        margin-left: 30px;
      }

      .milestoneInfo2 {
        color: #ffffff80;
        text-align: center;
        font-size: 35px;
        line-height: 60px;
        width: 450px;
        margin-left: 25px;
        font-weight: 200;
      }

      .milestoneInfo3 {
        color: white;
        text-align: center;
        font-size: 36px;
        font-family: 'Major Mono Display', monospace;
        text-align: center;
        margin-top: 25px;
        margin-bottom: 128px;
        letter-spacing: 5px;
        line-height: 45px;
      }

    #faqSection {
      width: 100vw;
      display: flex;
      flex-direction: column;
      align-items: center;
      align-content: center;
      justify-content: center;
      flex-wrap: nowrap;
      padding-top: 30px;
      padding-bottom: 50px;
      background: rgba(0,0,0,0.3);
      background: -moz-linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.6) 100%);
      background: -webkit-linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,0.5) 80%,  rgba(0,0,0,0.6) 100%);
      background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,0.5) 80%,  rgba(0,0,0,0.6) 100%);
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
    }

    #questionsContainer {
      width: 100vw;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
      flex-wrap: wrap;
    }

    #faqTitle {
      font-size: 130px;
      color: white;
      font-family: 'Major Mono Display', monospace;
      text-align: center;
      margin-bottom: 45px;
    }
    .qa {
      display: flex;
      flex-direction: column;
      margin: 0px 40px 40px 40px;
    }

    .question {
      font-size: 34px;
      color: white;
      margin-bottom: 15px;
      letter-spacing: 2px;
      width: 300px;
    }
    .answer {
      text-align: justify;
      font-size: 24px;
      color: #ffffff80;
      width: 300px;
      font-weight: 200;
      letter-spacing: 1px;
    }

    .answer a {
      color: #ffffff80;
      text-decoration: underline;
    }


    #finalSection {
      width: 100vw;
      display: flex;
      flex-direction: row;
      align-items: center;
      align-content: center;
      justify-content: center;
      flex-wrap: nowrap;
      padding-top: 30px;
      padding-bottom: 40px;
      background: rgba(0,0,0,0.6)
    }

    .developedBy {
      color: white;
      letter-spacing: 2px;
      margin-right: 10px;
    }

    .tw {
      background-image: url('/public/img/twitter.png');
      width: 45px;
      height: 45px;
      background-size: contain;
      background-repeat: no-repeat;
    }

    .trasnp {
      color: #ffffff80;
      font-size: 28px;
    }

  .lowWeight {
    font-weight: 200;
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

      .milestoneVideo {
        width: 400px;
        height: 400px;
      }

      .milestoneInfo2 {
        width: 365px;
        margin-left: 0px;
        line-height: 45px;
        font-size: 33px;
        margin-bottom: 25px;
      }

      .milestoneInfo3 {
        font-size: 24px;
        margin-top: 15px;
        margin-bottom: 100px;
        line-height: 34px;
      }

      #milestoneTextContainer {
        max-width: 400px;
        margin: 0px;
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

    .marketsInfo {
      font-size: 39px;
      max-width: 90vw;
      line-height: 50px;
      font-family: 'Major Mono Display', monospace;
    }

  #marketsContainer {
    width: 90vw;
  }

  #thirdSection {
    padding-top: 0px;
    padding-bottom: 0px;
  }

      .almanacType {
        margin: 0px;
      }

        .typeVideo {
          width: 320px;
          height: 320px;
        }

      .typeName {
        color: white;
        text-align: center;
        font-size: 24px;
        margin-top: 10px;
        margin-bottom: 25px;
      }


  #fourthSection {
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: nowrap;
    padding-bottom: 20px;
    background: rgb(0,0,0);
    background: -moz-linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 100%);
    background: -webkit-linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 100%);
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#000000",endColorstr="#000000",GradientType=1);
  }

    #milestoneContainer {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      align-content: flex-start;
      justify-content: center;
    }

      .milestoneVideo {
        width: 320px;
        height: 320px;
        margin: 0px;
      }

    .milestoneInfo {
      font-size: 12px;
      line-height: 14px;
    }

      #milestoneTextContainer {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 90vw;
        margin-left: 0px;
      }

      .milestoneInfo2 {
        font-size: 21px;
        line-height: 30px;
        width: 80vw;
        margin: 0px;
      }

      .milestoneInfo3 {
        font-size: 20px;
        line-height: 28px;
        margin-top: 25px;
        margin-bottom: 30px;
      }

    #milestoneTextContainer {
      align-items: center;
      align-content: center;
    }

    #faqTitle {
      font-size: 80px;
    }

    .question {
      width: 90vw;
    }

    .answer {
      width: 90vw;
    }

  }
</style>