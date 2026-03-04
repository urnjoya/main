// For model
const categoryBtn = document.getElementById("categoryBtn");
const categoryModal = document.getElementById("categoryModal");
const categoryClose = document.getElementById("categoryClose");
const categoryOverlay = document.getElementById("categoryOverlay");

categoryBtn.addEventListener("click", () => {
    categoryModal.classList.add("active");
    document.body.classList.add("modal-open");
});

function closeModal() {
    categoryModal.classList.remove("active");
    document.body.classList.remove("modal-open");
}

categoryClose.addEventListener("click", closeModal);
categoryOverlay.addEventListener("click", closeModal);
