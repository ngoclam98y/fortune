<template>
	<div>
		<button class="button-open-modal btn btn-primary" style="display: none;" type="button" data-bs-toggle="modal" data-bs-target="#myModal">
			Open modal
		</button>
		<div class="modal fade" id="myModal">
			<div class="modal-dialog modal-dialog-centered modal-lg">
				<div class="modal-content">
					<div class="modal-body"></div>
					<div class="modal-footer">
						<button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>
		<div class="coin">
			<div class="coin-counter"></div>
			<div class="text-winner">Chúc mừng bạn đã hoàn thành nhiệm vụ</div>
			<div class="coin-container">
				<div class="front"></div>
				<div class="front_b"></div>
				<div class="back"></div>
				<div class="back_b"></div>
			</div>
		</div>
	</div>
</template>
<script>
import { select, getDataReward, getRandomArbitrary } from "../js/helper";
import dataReward from "../data/reward.json";
import { OnOpenModal } from "../js/modal";
const initTimer = 10;
let countCounter;
let coinContainer;
let timeCounter;
let counterIntervalId;
let textWinner;

const onCoinCountDown = () => {
	counterIntervalId = setInterval(() => {
		countCounter.textContent = timeCounter;

		if (timeCounter < 0) {
			coinContainer.style.display = "block";
			textWinner.style.display = "block";
			countCounter.style.display = "none";
			countCounter.textContent = "0";
			clearInterval(counterIntervalId);
			return;
		} else {
			timeCounter--;
		}
	}, 1000);
};

export const onLoadCoin = (dataReward) => {
	console.log(dataReward, "dataReward");
	coinContainer = document.querySelector(".coin-container");
	textWinner = document.querySelector(".text-winner");
	countCounter = document.querySelector(".coin-counter");
	coinContainer.style.display = "none";
	countCounter.textContent = initTimer;
	timeCounter = initTimer;

	onCoinCountDown();
};

export default {
	name: "AppHome",
	async mounted() {
		const user_id = this.$route.query.jwt ?? 1;
		const data = await getDataReward({
			user_id, //+getJwtToken(),
			lucky_type_id: 4,
			reward_type_id: 1,
		});
		onLoadCoin(data);
	},
};
</script>
