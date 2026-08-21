const chips = document.querySelectorAll(".chip");
const qtyValue = document.querySelector("[data-qty-value]");
const qtyButtons = document.querySelectorAll("[data-qty]");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((item) => {
      item.classList.toggle("is-selected", item === chip);
      item.setAttribute("aria-pressed", item === chip ? "true" : "false");
    });
  });
});

let quantity = 5;

qtyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quantity = Math.max(1, quantity + Number(button.dataset.qty));
    qtyValue.textContent = String(quantity);
  });
});
