const SIDE = 322;
const ACTIVE = 438;
const GAP = 36;
const PITCH = (ACTIVE + SIDE) / 2 + GAP;
const CENTER_LEFT = 706;
const CENTER_X = CENTER_LEFT + ACTIVE / 2;
const SETTLE_MS = 300;
const RUBBER = 0.32;
const FLICK_VELOCITY = 0.55;

// Figma 1085:35586 — three stacked certificates, unrotated top-left
// relative to the front card (490, 303) inside the 1440 frame.
const FAN = {
  "-1": { dx: -21.16796875, dy: 30.009765625, rot: -6, z: 1 },
  0: { dx: 0, dy: 0, rot: 0, z: 3 },
  1: { dx: 20.829513549804688, dy: -23.279399871826172, rot: 4.99, z: 2 },
};

const chips = document.querySelectorAll(".chip");
const qtyValue = document.querySelector("[data-qty-value]");
const qtyButtons = document.querySelectorAll("[data-qty]");
const certsRoot = document.querySelector("[data-certs]");
const certs = [...document.querySelectorAll("[data-cert]")];
const notches = [...document.querySelectorAll(".stub__notch")];
const lastIndex = certs.length - 1;

let quantity = 5;
let position = certs.findIndex((card) => card.classList.contains("is-active"));
if (position < 0) {
  position = 0;
}

let drag = null;
let skipClick = false;
let settleFrame = 0;
const samples = [];

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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function proximity(offset) {
  const distance = Math.abs(offset);
  if (distance >= 1) {
    return 0;
  }
  return 1 - distance;
}

function rubber(value) {
  if (value < 0) {
    return value * RUBBER;
  }
  if (value > lastIndex) {
    return lastIndex + (value - lastIndex) * RUBBER;
  }
  return value;
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function layout(p) {
  const weights = certs.map((_, index) => proximity(index - p));
  const widths = weights.map((t) => SIDE + (ACTIVE - SIDE) * t);
  const centers = [];
  let cursor = 0;
  widths.forEach((width) => {
    centers.push(cursor + width / 2);
    cursor += width + GAP;
  });

  const leftIndex = clamp(Math.floor(p), 0, lastIndex);
  const rightIndex = clamp(Math.ceil(p), 0, lastIndex);
  const mix = p - leftIndex;
  const focus = centers[leftIndex] + (centers[rightIndex] - centers[leftIndex]) * mix;
  const shift = CENTER_X - focus;

  const restP = Math.round(clamp(p, 0, lastIndex));
  const restMix = 1 - Math.min(1, Math.abs(p - restP) * 2);

  certs.forEach((card, index) => {
    const t = weights[index];
    let scale = widths[index] / ACTIVE;
    let left = centers[index] + shift - ACTIVE / 2;
    let top = 0;
    let rot = 0;
    const fan = FAN[index - restP];
    if (fan && restMix > 0) {
      left += (CENTER_LEFT + fan.dx - left) * restMix;
      top = fan.dy * restMix;
      rot = fan.rot * restMix;
      scale += (1 - scale) * restMix;
    }
    const visualRadius = 16 / scale;
    const seat = clamp((t - 0.82) / 0.18, 0, 1);
    const topRadius = visualRadius + (24 - visualRadius) * seat;
    const bottomRadius = visualRadius * (1 - seat);

    card.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
    card.style.opacity = String(0.7 + 0.3 * t);
    card.style.borderRadius = `${topRadius}px ${topRadius}px ${bottomRadius}px ${bottomRadius}px`;
    card.style.zIndex = fan && restMix > 0.5 ? String(fan.z) : String(Math.round(t * 100));
    const face = card.querySelector("[data-face]");
    if (face) {
      face.style.transform = `rotate(${rot}deg)`;
    }
    card.classList.toggle("is-active", t > 0.5);
    card.toggleAttribute("aria-current", t > 0.92);
  });

  const closest = Math.max(...weights);
  const notchOpacity = clamp((closest - 0.78) / 0.22, 0, 1);
  notches.forEach((notch) => {
    notch.style.opacity = String(notchOpacity);
  });
}

function stopSettle() {
  if (settleFrame) {
    cancelAnimationFrame(settleFrame);
    settleFrame = 0;
  }
}

function settleTo(target) {
  stopSettle();
  const from = position;
  const to = clamp(target, 0, lastIndex);
  const distance = Math.abs(to - from);
  const duration = clamp(SETTLE_MS * (0.55 + distance * 0.45), 220, 320);
  const start = performance.now();

  function frame(now) {
    const t = clamp((now - start) / duration, 0, 1);
    position = from + (to - from) * easeOutCubic(t);
    layout(position);
    if (t < 1) {
      settleFrame = requestAnimationFrame(frame);
      return;
    }
    position = to;
    layout(position);
    settleFrame = 0;
  }

  settleFrame = requestAnimationFrame(frame);
}

function goTo(index) {
  settleTo(index);
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
  stopSettle();
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startP: position,
    moved: false,
  };
  samples.length = 0;
  samples.push({ x: event.clientX, time: event.timeStamp });
  certsRoot.setPointerCapture(event.pointerId);
});

certsRoot.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  const dx = event.clientX - drag.startX;
  if (Math.abs(dx) > 4) {
    drag.moved = true;
  }
  samples.push({ x: event.clientX, time: event.timeStamp });
  if (samples.length > 6) {
    samples.shift();
  }
  position = rubber(drag.startP - dx / PITCH);
  layout(position);
});

function flickVelocity() {
  if (samples.length < 2) {
    return 0;
  }
  const first = samples[0];
  const last = samples[samples.length - 1];
  const dt = last.time - first.time;
  if (dt < 16) {
    return 0;
  }
  return ((last.x - first.x) / dt) * (1000 / PITCH);
}

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  skipClick = drag.moved;
  const velocity = flickVelocity();
  drag = null;

  let target = Math.round(position);
  if (velocity <= -FLICK_VELOCITY) {
    target = Math.ceil(position);
  } else if (velocity >= FLICK_VELOCITY) {
    target = Math.floor(position);
  }
  settleTo(target);
}

certsRoot.addEventListener("pointerup", endDrag);
certsRoot.addEventListener("pointercancel", endDrag);

certsRoot.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goTo(Math.round(position) + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goTo(Math.round(position) - 1);
  }
});

layout(position);
