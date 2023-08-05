<template>
  <div>
    <button
      class="button-open-modal btn btn-primary"
      style="display: none"
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
            >OK</button>
          </div>
        </div>
      </div>
    </div>
    <div class="scratch-card-container">
      <div
        class="scratch-card"
        id="js-container"
      >
        <canvas
          class="canvas"
          id="js-canvas"
        ></canvas>
        <form
          class="form"
          style="visibility: hidden"
        >
          <h2>Chúc Mừng!</h2>
          <h3>Bạn Đã Nhận Được Món Quà</h3>
          <h1>
            <strong><code class="gift-name"></code></strong>
          </h1>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { select, getDataReward, getRandomArbitrary } from "../js/helper";
import dataReward from "../data/reward.json";
import { OnOpenModal } from "../js/modal";
import SpinOff from "../images/spin_off.png";

const DIMENSION = 495;

export const handleSubmitClaimReward = async (dataReward, cb) => {
  let data_url = location.origin + "/minigame_information.php";
  try {
    const response = await fetch(data_url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(dataReward),
    });
    cb();
    return response.json();
  } catch (error) {
    console.log(error, "=========");
  }
};

export const onLoadScratchCard = (dataReward) => {
  const prize = select(
    dataReward.map((e) => e.name),
    dataReward.map((e) => e.weight)
  );

  let isDrawing, lastPoint;
  let scratchCard = document.querySelector(".scratch-card"),
    canvas = document.getElementById("js-canvas"),
    giftName = document.querySelector(".gift-name"),
    canvasWidth = canvas.width,
    canvasHeight = canvas.height,
    ctx = canvas.getContext("2d"),
    image = new Image(),
    brush = new Image();

  const prizeItem = dataReward.find((e) => e.name === prize);

  image.src = prizeItem.image_src;
  image.crossOrigin = "Anonymous";
  image.style.objectFit = "cover";

  giftName.innerHTML = prize;

  image.onload = function () {
    ctx.drawImage(image, 0, 0, DIMENSION, DIMENSION);
    document.querySelectorAll(".form")[0].style.visibility = "visible";
  };
  brush.src = SpinOff;
  brush.style.width = "10px";
  brush.style.height = "10px";

  canvas.addEventListener("mousedown", handleMouseDown, false);
  canvas.addEventListener("touchstart", handleMouseDown, false);
  canvas.addEventListener("mousemove", handleMouseMove, false);
  canvas.addEventListener("touchmove", handleMouseMove, false);
  canvas.addEventListener("mouseup", handleMouseUp, false);
  canvas.addEventListener("touchend", handleMouseUp, false);

  function distanceBetween(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  function angleBetween(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  function getFilledInPixels(stride) {
    if (!stride || stride < 1) {
      stride = 1;
    }

    let pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight),
      pdata = pixels.data,
      l = pdata.length,
      total = l / stride,
      count = 0;

    for (let i = (count = 0); i < l; i += stride) {
      if (parseInt(pdata[i]) === 0) {
        count++;
      }
    }

    return Math.round((count / total) * 100);
  }

  function getMouse(e, canvas) {
    let offsetX = 0,
      offsetY = 0,
      mx,
      my;

    if (canvas.offsetParent !== undefined) {
      do {
        offsetX += canvas.offsetLeft;
        offsetY += canvas.offsetTop;
      } while ((canvas = canvas.offsetParent));
    }

    mx = (e.pageX || e.touches[0].clientX) - offsetX;
    my = (e.pageY || e.touches[0].clientY) - offsetY;

    return { x: mx, y: my };
  }

  function handlePercentage(filledInPixels) {
    filledInPixels = filledInPixels || 0;
    if (filledInPixels > 70 && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);

      OnOpenModal(`
      <h2>Congratulation!</h2>
      <h3>The gift is: </h3>
      <h1><code>${prize}</code></h1>
      `);
    }
  }

  function handleMouseDown(e) {
    isDrawing = true;
    lastPoint = getMouse(e, canvas);
  }

  function handleMouseMove(e) {
    if (!isDrawing) {
      return;
    }

    e.preventDefault();

    let currentPoint = getMouse(e, canvas),
      dist = distanceBetween(lastPoint, currentPoint),
      angle = angleBetween(lastPoint, currentPoint),
      x,
      y;

    for (let i = 0; i < dist; i++) {
      x = lastPoint.x + Math.sin(angle) * i - 25;
      y = lastPoint.y + Math.cos(angle) * i - 25;
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(brush, x, y, 50, 50);
    }

    lastPoint = currentPoint;
    handlePercentage(getFilledInPixels(32));
  }

  function handleMouseUp(e) {
    isDrawing = false;
  }
};

export default {
  name: "AppHome",
  data() {
    return {
      claimRewardData: null,
    };
  },
  destroyed() {
    window.removeEventListener("resize", this.myEventHandler);
  },
  methods: {
    myEventHandler() {
      const $_id = document.getElementById.bind(document);
      let width = window.innerWidth;

      if (width <= 500) {
        $_id("js-canvas").setAttribute("width", width + "px");
        $_id("js-canvas").setAttribute("height", width + "px");

        $_id("js-container").style.width = width + "px";
        $_id("js-container").style.height = width + "px";
      } else {
        width = 500;
        $_id("js-canvas").setAttribute("width", width + "px");
        $_id("js-canvas").setAttribute("height", width + "px");

        $_id("js-container").style.width = width + "px";
        $_id("js-container").style.height = width + "px";
      }
    },
    onClaimReward() {
      console.log("Claim reward");
      handleSubmitClaimReward(this.claimRewardData[0] || {}, function () {
        this.claimRewardData = null;
      });
    },
  },
  async mounted() {
    this.myEventHandler();
    const user_id = this.$route.query.jwt ?? 1;
    const data = await getDataReward({
      user_id, //+getJwtToken(),
      lucky_type_id: 3,
      reward_type_id: 1,
    });
    this.claimRewardData = data;
    onLoadScratchCard(data);
  },
};
</script>

<style scoped>
h2 {
  color: #404040;
}
</style>
