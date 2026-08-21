const SIDE = 322;
const ACTIVE = 438;
const GAP = 36;
const CENTER_LEFT = 706;
const DRAG_THRESHOLD = 64;

const chips = document.querySelectorAll(".chip");
const qtyValue = document.querySelector("[data-qty-value]");
const qtyButtons = document.querySelectorAll("[data-qty]");
const track = document.querySelector("[data-track]");
const certsRoot = document.querySelector("[data-certs]");
const certs = [...document.querySelectorAll("[data-cert]")];

let quantity = 5;
let active = certs.findIndex((card) => card.classList.contains("is-active"));
let drag = null;
let skipClick = false;

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((item) => {
      item.classList.toggle("is-selected", item === chip);
      item.setAttribute("aria-pressed", item === chip ? "true" : "false");
    });
  });
});

qtyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quantity = Math.max(1, quantity + Number(button.dataset.qty));
    qtyValue.textContent = String(quantity);
  });
});

function leftOf(index, activeIndex) {
  let x = 0;
  for (let i = 0; i < index; i += 1) {
    x += (i === activeIndex ? ACTIVE : SIDE) + GAP;
  }
  return x;
}

function translateX(activeIndex, dragX = 0) {
  return CENTER_LEFT - leftOf(activeIndex, activeIndex) + dragX;
}

function render(animate = true, dragX = 0) {
  certs.forEach((card, index) => {
    const selected = index === active;
    card.classList.toggle("is-active", selected);
    card.toggleAttribute("aria-current", selected);
  });
  track.classList.toggle("is-dragging", !animate);
  track.style.transform = `translateX(${translateX(active, dragX)}px)`;
}

function goTo(index, animate = true) {
  const total = certs.length;
  active = ((index % total) + total) % total;
  render(animate);
}

certs.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (skipClick) {
      skipClick = false;
      return;
    }
    goTo(index);
  });
});

certsRoot.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) {
    return;
  }
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    lastX: event.clientX,
    moved: false,
  };
  certsRoot.setPointerCapture(event.pointerId);
  render(false);
});

certsRoot.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  const dx = event.clientX - drag.startX;
  if (Math.abs(dx) > 4) {
    drag.moved = true;
  }
  drag.lastX = event.clientX;
  render(false, dx);
});

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  const dx = event.clientX - drag.startX;
  const moved = drag.moved;
  drag = null;
  skipClick = moved;
  if (dx <= -DRAG_THRESHOLD) {
    goTo(active + 1);
    return;
  }
  if (dx >= DRAG_THRESHOLD) {
    goTo(active - 1);
    return;
  }
  render(true);
}

certsRoot.addEventListener("pointerup", endDrag);
certsRoot.addEventListener("pointercancel", endDrag);

certsRoot.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goTo(active + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goTo(active - 1);
  }
});

render(false);
