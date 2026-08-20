export class PresetMutatorKnob {
  constructor(target, { value = 50, min = 0, max = 100, onChange = () => {} } = {}) {
    if (!target) {
      throw new Error("PresetMutatorKnob target element is required.");
    }

    this.target = target;
    this.min = Number(min);
    this.max = Number(max);
    this.onChange = onChange;
    this.value = this.clamp(Number(value));
    this.visualValue = this.value;
    this.animationFrame = null;
    this.pointerFrame = null;
    this.pendingClientY = null;
    this.lastNotifiedValue = Math.round(this.value);
    this.isDragging = false;
    this.dragStartY = 0;
    this.dragStartValue = this.value;
    this.dragSensitivity = 3.1;
    this.visualSmoothing = 0.22;

    this.render();
    this.bind();
    this.update(this.value, { notify: false, immediate: true });
  }

  clamp(value) {
    return Math.min(this.max, Math.max(this.min, Number.isFinite(value) ? value : this.min));
  }

  ratioForValue(value) {
    return (this.clamp(value) - this.min) / (this.max - this.min || 1);
  }

  valueForRatio(ratio) {
    return this.clamp(this.min + ratio * (this.max - this.min));
  }

  angleForValue(value) {
    return -135 + this.ratioForValue(value) * 270;
  }

  render() {
    const ticks = Array.from({ length: 25 }, (_, index) => {
      const angle = -135 + index * (270 / 24);
      const major = index % 6 === 0;
      return `<span class="preset-knob-tick${major ? " is-major" : ""}" style="--tick-angle: ${angle}deg"></span>`;
    }).join("");

    this.target.classList.add("preset-mutator-knob");
    this.target.innerHTML = `
      <div class="preset-knob-shell" role="presentation">
        <div class="preset-knob-ring" aria-hidden="true">
          <div class="preset-knob-ticks">${ticks}</div>
          <div class="preset-knob-face" aria-hidden="true">
            <div class="preset-knob-indicator"></div>
            <div class="preset-knob-cap"></div>
          </div>
        </div>
        <div
          class="preset-knob-control"
          role="slider"
          tabindex="0"
          aria-label="Mutation Amount"
          aria-valuemin="${this.min}"
          aria-valuemax="${this.max}"
        ></div>
      </div>
      <div class="preset-knob-readout">
        <span>Subtle</span>
        <strong><span class="preset-knob-value"></span>% Mutation</strong>
        <span>Extreme</span>
      </div>
      <div class="preset-knob-center-label">Mutation</div>
    `;

    this.face = this.target.querySelector(".preset-knob-face");
    this.control = this.target.querySelector(".preset-knob-control");
    this.valueNode = this.target.querySelector(".preset-knob-value");
  }

  bind() {
    this.control.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.control.focus({ preventScroll: true });
      this.isDragging = true;
      this.dragStartY = event.clientY;
      this.dragStartValue = this.value;
      this.target.classList.add("is-dragging");
      this.control.setPointerCapture(event.pointerId);
    });

    this.control.addEventListener("pointermove", (event) => {
      if (this.isDragging) {
        event.preventDefault();
        this.scheduleDragUpdate(event.clientY);
      }
    });

    this.control.addEventListener("pointerup", (event) => {
      this.flushDragUpdate();
      this.isDragging = false;
      this.target.classList.remove("is-dragging");
      this.control.releasePointerCapture(event.pointerId);
    });

    this.control.addEventListener("pointercancel", () => {
      this.cancelDragUpdate();
      this.isDragging = false;
      this.target.classList.remove("is-dragging");
    });

    this.control.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 10 : 1;
      const keys = {
        ArrowLeft: -step,
        ArrowDown: -step,
        ArrowRight: step,
        ArrowUp: step,
        Home: this.min - this.value,
        End: this.max - this.value,
      };

      if (!(event.key in keys)) {
        return;
      }

      event.preventDefault();
      this.update(this.value + keys[event.key]);
    });
  }

  scheduleDragUpdate(clientY) {
    this.pendingClientY = clientY;

    if (!this.pointerFrame) {
      this.pointerFrame = window.requestAnimationFrame(() => this.flushDragUpdate());
    }
  }

  flushDragUpdate() {
    if (this.pointerFrame) {
      window.cancelAnimationFrame(this.pointerFrame);
      this.pointerFrame = null;
    }

    if (this.pendingClientY === null) {
      return;
    }

    this.updateFromClientY(this.pendingClientY);
    this.pendingClientY = null;
  }

  cancelDragUpdate() {
    if (this.pointerFrame) {
      window.cancelAnimationFrame(this.pointerFrame);
      this.pointerFrame = null;
    }

    this.pendingClientY = null;
  }

  updateFromClientY(clientY) {
    const verticalDelta = this.dragStartY - clientY;
    const nextValue = this.dragStartValue + verticalDelta / this.dragSensitivity;
    this.update(nextValue);
  }

  renderVisual(immediate = false) {
    if (immediate) {
      this.visualValue = this.value;
    } else {
      const distance = this.value - this.visualValue;
      this.visualValue += distance * this.visualSmoothing;

      if (Math.abs(distance) < 0.035) {
        this.visualValue = this.value;
      }
    }

    this.face.style.setProperty("--knob-angle", `${this.angleForValue(this.visualValue)}deg`);

    if (this.visualValue !== this.value) {
      this.animationFrame = window.requestAnimationFrame(() => this.renderVisual());
      return;
    }

    this.animationFrame = null;
  }

  scheduleVisualUpdate(immediate = false) {
    if (immediate) {
      if (this.animationFrame) {
        window.cancelAnimationFrame(this.animationFrame);
      }
      this.animationFrame = null;
      this.renderVisual(true);
      return;
    }

    if (!this.animationFrame) {
      this.animationFrame = window.requestAnimationFrame(() => this.renderVisual());
    }
  }

  update(value, { notify = true, immediate = false } = {}) {
    this.value = this.clamp(value);
    const rounded = Math.round(this.value);

    this.scheduleVisualUpdate(immediate);
    this.control.setAttribute("aria-valuenow", String(rounded));
    this.control.setAttribute("aria-valuetext", `${rounded}% mutation`);
    this.valueNode.textContent = String(rounded);

    if (notify && rounded !== this.lastNotifiedValue) {
      this.lastNotifiedValue = rounded;
      this.onChange(rounded);
    }
  }
}
