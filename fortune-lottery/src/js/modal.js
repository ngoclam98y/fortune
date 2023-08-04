export const OnOpenModal = (bodyHtml) => {
	const modalBody = document.querySelector(".modal .modal-body");
	const myModal = document.querySelector(".button-open-modal");

	modalBody.innerHTML = bodyHtml;

	myModal.click();
	console.log("modal opened");
};
