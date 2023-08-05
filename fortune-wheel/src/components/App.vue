<template>
  <div>
    <button
      class="button-open-modal btn btn-primary"
      style="display: none;"
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#myModal"
    >
      Open modal
    </button>
    <div
      class="modal fade"
      id="myModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="onClaimReward"
            >Ok</button>
          </div>
        </div>
      </div>
    </div>
    <!-- <router-view /> -->
    <div class="wheel-container">
      <div
        class="the_wheel"
        align="center"
        valign="center"
      >
        <canvas
          id="canvas"
          width="434"
          height="582"
        >
          <p
            style="{color: white}"
            align="center"
          >Sorry, your browser doesn't support canvas. Please try another.</p>
        </canvas>
      </div>
      <div class="power_controls">
        <button id="spin_button">Play</button>
        <button id="reset_button">Reset</button>
      </div>
    </div>
  </div>
</template>
<script>
import Winwheel from "../js/winnin-wheel";
import randomcolor from "randomcolor";
import TickMp3 from "../sounds/tick.mp3";
import SpinOff from "../images/spin_off.png";
import { select } from "../js/helper";
// import dataReward from "../data/reward.json";
import { OnOpenModal } from "../js/modal";
let spinButton;
let resetButton;
let theWheel;

const onLoadAssets = () => {
  spinButton = document.getElementById("spin_button");
  resetButton = document.getElementById("reset_button");
  theWheel = document.querySelector(".the_wheel");

  // theWheel.style.backgroundImage = `url(${WheelBack})`;
};

export const handleSubmitClaimReward = async (dataReward, cb) => {
  let data_url = location.origin + "/minigame_information.php";
  const response = await fetch(data_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(dataReward),
  });
  cb();
  return response.json();
};

export const onLoadWheel = (dataReward) => {
  onLoadAssets();

  spinButton.addEventListener("click", () => {
    startSpin();
  });

  resetButton.addEventListener("click", () => {
    resetWheel();
  });

  let theWheel = new Winwheel({
    outerRadius: 200,
    innerRadius: 0,
    textFontSize: 24,
    responsive: true,
    textOrientation: "vertical",
    textAlignment: "outer",
    numSegments: dataReward.length,
    segments: dataReward.map((e) => ({
      fillStyle: randomcolor(),
      text: e.name,
    })),
    animation: {
      type: "spinToStop",
      duration: 3,
      spins: 5,
      callbackFinished: alertPrize,
      callbackSound: playSound,
      soundTrigger: "pin",
    },
    pins: {
      number: 24,
      fillStyle: "silver",
      outerRadius: 4,
      responsive: true,
    },
  });

  let audio = new Audio(TickMp3);

  function playSound() {
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  }

  var wheelPower = 0;
  var wheelSpinning = false;

  powerSelected(1);

  function powerSelected(powerLevel) {
    if (wheelSpinning == false) {
      wheelPower = powerLevel;

      spinButton.src = SpinOff;
      spinButton.className = "clickable";
    }
  }

  function startSpin() {
    if (wheelSpinning == false) {
      spinButton.src = SpinOff;
      spinButton.className = "";

      calculatePrize();

      wheelSpinning = true;
    }
  }

  function resetWheel() {
    theWheel.stopAnimation(false);
    theWheel.rotationAngle = 0;
    theWheel.draw();

    wheelSpinning = false;
  }

  function calculatePrize() {
    // ?
    const prize = select(
      dataReward.map((e) => e.name),
      dataReward.map((e) => e.weight)
    );
    const prizeIndex = dataReward.findIndex((e) => e.name === prize);
    const offset = 360 / dataReward.length;
    const minAngel = offset * (prizeIndex + 1);
    const stopAngle =
      Math.floor(Math.random() * (minAngel + offset - minAngel + 1)) + minAngel;

    theWheel.animation.stopAngle = stopAngle;

    // console.log(stopAngle, prize, prizeIndex, "dataReward");
    // console.log(theWheel.getRandomForSegment(dataReward.length));
    theWheel.startAnimation();
  }

  function alertPrize(indicatedSegment) {
    if (indicatedSegment.text == "LOOSE TURN") {
      OnOpenModal(`
        <h2>Congratulation!</h2>
        <h3>The gift is: </h3>
        <h1><code>Sorry but you loose a turn.</code></h1>
    `);
    } else if (indicatedSegment.text == "BANKRUPT") {
      OnOpenModal(`
      <h2>Congratulation!</h2>
      <h3>The gift is: </h3>
      <h1><code>Oh no, you have gone BANKRUPT!</code></h1>
  `);
    } else {
      OnOpenModal(`
        <h2>Congratulation!</h2>
        <h3>The gift is: </h3>
        <h1><code>You have won ${indicatedSegment.text}</code></h1>
    `);
    }
    wheelSpinning = false;
    theWheel.stopAnimation(false);
    theWheel.rotationAngle = 0;
  }
};

export default {
  name: "AppHome",
  data() {
    return {
      claimRewardData: null,
    };
  },
  methods: {
    onClaimReward() {
      console.log("onClaimReward");
      // this.$router.push("/reward");
      handleSubmitClaimReward(this.claimRewardData[0] || {}, function () {
        this.claimRewardData = null;
      });
    },
  },
  async mounted() {
    const user_id = this.$route.query.jwt ?? 1;
    const url = location.origin;
    const dataReward = await fetch(url + "/minigame/data/wheel.json").then(
      (res) => res.json()
    );
    const getDataReward = ({ user_id, lucky_type_id, reward_type_id }) => {
      return dataReward.filter((e) => {
        return (
          e.user_id === user_id &&
          e.lucky_type_id === lucky_type_id &&
          e.reward_type_id === reward_type_id
        );
      });
    };
    const data = getDataReward({
      user_id, //+getJwtToken(),
      lucky_type_id: 1,
      reward_type_id: 1,
    });
    this.claimRewardData = data;

    onLoadWheel(data);
  },
};
</script>

<style scoped>
h2 {
  color: #404040;
}
</style>
