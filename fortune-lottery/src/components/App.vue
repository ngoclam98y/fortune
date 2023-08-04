<template>
	<div>
		<button class="button-open-modal btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#myModal">
			Open modal
		</button>
		<div class="modal fade" id="myModal">
			<div class="modal-dialog modal-dialog-centered modal-lg">
				<div class="modal-content">
					<div class="modal-body"></div>
					<div class="modal-footer">
						<button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="onOkClick">
							OK
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="lottery"></div>
	</div>
</template>
<script>
import Winwheel from "../js/winnin-wheel";
import randomcolor from "randomcolor";
import TickMp3 from "../sounds/tick.mp3";
import SpinOff from "../images/spin_off.png";
import { select, getDataReward, getRandomArbitrary } from "../js/helper";
import dataReward from "../data/reward.json";
import { OnOpenModal } from "../js/modal";
let lotteryContainer;
let lotteryButton;
let lotteryItems;
let items = [1, 2, 3, 4, 5, 6, 7, 8];
let weights = [0.2, 0.1, 0.02, 0.02, 0.02, 0.6, 0.02, 0.02];
const arrIdx = [0, 1, 2, 4, 7, 6, 5, 3];
const offsetTimer = 30;

let lotteryTimer;
let index;
let prevIndex;
let speed;
let currentLoop;
let loop;
let prize;
let prizeData;
let isSpinning;

const spinLottery = () => {
	clearTimeout(lotteryTimer);

	if (currentLoop === loop) {
		if (index === prizeData.index) {
			lotteryItems[index].classList.add("lottery-item-win");
			isSpinning = false;
			lotteryButton.style.pointerEvents = "visible";
			lotteryButton.style.opacity = "1";

			OnOpenModal(`
          <h2>Congratulation!</h2>
        <h3>The gift is: </h3>
        <h1><code>${prizeData.item}</code></h1>
      `);
			return;
		}
	}

	lotteryItems[arrIdx[index]].classList.add("lottery-item-active");

	setTimeout(() => {
		lotteryItems[arrIdx[prevIndex]].classList.remove("lottery-item-active");

		if (currentLoop >= loop - 2) {
			speed += offsetTimer;
		} else {
			if (index % 7 === 0) {
				speed -= offsetTimer;
			}

			if (speed < 50) {
				speed = offsetTimer;
			}
		}

		if (index + 1 > lotteryItems.length - 1) {
			prevIndex = index;
			index = 0;
		} else {
			prevIndex = index;
			index++;
		}
	}, speed + offsetTimer);

	if (index === arrIdx.length - 1) {
		currentLoop++;
	}

	lotteryTimer = setTimeout(spinLottery, speed);
};

const appendItem = (arr) => {
	for (let i = 0; i < arr.length; i++) {
		const item = document.createElement("div");
		item.classList.add("lottery-item");

		const imgSrc = document.createElement("img");
		imgSrc.src = arr[i].image_src;

		const text = document.createElement("div");
		text.innerHTML = arr[i].name;
		text.classList.add("lottery-text");

		item.appendChild(imgSrc);
		item.appendChild(text);

		lotteryContainer.appendChild(item);
	}
};

export const onLoadLottery = (dataReward) => {
	lotteryContainer = document.querySelector(".lottery");

	items = dataReward.map((e) => e.name);
	weights = dataReward.map((e) => e.weight);

	const arr1 = dataReward.slice(0, 4);
	const arr2 = dataReward.slice(4, 8);

	appendItem(arr1);

	const textnode = document.createElement("div");
	textnode.innerHTML = "Quay";
	textnode.classList.add("lottery-button");
	lotteryContainer.appendChild(textnode);

	appendItem(arr2);

	lotteryButton = document.querySelector(".lottery-button");
	lotteryItems = document.querySelectorAll(".lottery-item");

	lotteryButton.addEventListener("click", () => {
		lotteryTimer = 0;
		index = 0;
		prevIndex = index;
		speed = 200;
		currentLoop = 0;
		loop = getRandomArbitrary(10, 14);
		prize = select(items, weights);
		prizeData = {
			item: prize,
			index: items.findIndex((e) => e === prize),
		};

		for (let i = 0; i < lotteryItems.length; ++i) {
			lotteryItems[i].classList.remove("lottery-item-active");
			lotteryItems[i].classList.remove("lottery-item-win");
		}
		lotteryButton.style.pointerEvents = "none";
		lotteryButton.style.opacity = "0.8";
		isSpinning = true;
		spinLottery();
	});
};

export default {
	name: "App",
	methods: {
		onOkClick() {
			console.log("ok");
		},
	},
	async mounted() {
		const user_id = this.$route.query.jwt ?? 1;
		const data = await getDataReward({
			user_id, //+getJwtToken(),
			lucky_type_id: 2,
			reward_type_id: 1,
		});
		onLoadLottery(data);
	},
};
</script>
<style scoped>
h2 {
	color: #404040;
}
</style>
