const template = document.createElement("template");
const stylesUrl = new URL("./image_histogram.css", import.meta.url).href;
template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <section class="histogram-panel" aria-label="Image histogram">
    <header class="histogram-titlebar">
      <h2>Histogram</h2>
      <button class="close-button" type="button" aria-label="Close histogram" title="Close">
        <span class="close-icon" aria-hidden="true"></span>
      </button>
    </header>
    <div class="histogram-content">
      <p class="histogram-message" role="status">Loading histogram…</p>
      <canvas class="histogram-chart" width="512" height="220" aria-label="RGB image histogram" hidden></canvas>
      <div class="histogram-legend" aria-hidden="true" hidden>
        <span class="red">Red</span>
        <span class="green">Green</span>
        <span class="blue">Blue</span>
      </div>
    </div>
  </section>
`;

class ImageHistogram extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.titlebar = this.shadowRoot.querySelector(".histogram-titlebar");
    this.chart = this.shadowRoot.querySelector(".histogram-chart");
    this.context = this.chart.getContext("2d");
    this.message = this.shadowRoot.querySelector(".histogram-message");
    this.legend = this.shadowRoot.querySelector(".histogram-legend");
    this.dragPointerId = null;
    this.titlebar.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) {
        return;
      }

      const bounds = this.getBoundingClientRect();
      this.dragPointerId = event.pointerId;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.dragStartLeft = bounds.left;
      this.dragStartTop = bounds.top;
      this.titlebar.setPointerCapture(event.pointerId);
      this.style.left = `${bounds.left - this.parentElement.getBoundingClientRect().left}px`;
      this.style.top = `${bounds.top - this.parentElement.getBoundingClientRect().top}px`;
      this.style.right = "auto";
      this.style.bottom = "auto";
    });
    this.titlebar.addEventListener("pointermove", (event) => {
      if (event.pointerId !== this.dragPointerId) {
        return;
      }

      const parentBounds = this.parentElement.getBoundingClientRect();
      const bounds = this.getBoundingClientRect();
      const left = Math.max(
        0,
        Math.min(
          parentBounds.width - bounds.width,
          this.dragStartLeft + event.clientX - this.dragStartX - parentBounds.left,
        ),
      );
      const top = Math.max(
        0,
        Math.min(
          parentBounds.height - bounds.height,
          this.dragStartTop + event.clientY - this.dragStartY - parentBounds.top,
        ),
      );
      this.style.left = `${left}px`;
      this.style.top = `${top}px`;
    });
    const stopDragging = (event) => {
      if (event.pointerId !== this.dragPointerId) {
        return;
      }

      this.dragPointerId = null;
      if (this.titlebar.hasPointerCapture(event.pointerId)) {
        this.titlebar.releasePointerCapture(event.pointerId);
      }
    };
    this.titlebar.addEventListener("pointerup", stopDragging);
    this.titlebar.addEventListener("pointercancel", stopDragging);
    this.titlebar.addEventListener("lostpointercapture", stopDragging);
    this.shadowRoot
      .querySelector(".close-button")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("histogram-close", {
            bubbles: true,
            composed: true,
          }),
        );
      });
  }

  setData(channels) {
    const validChannels =
      channels &&
      ["red", "green", "blue"].every(
        (channel) =>
          Array.isArray(channels[channel]) &&
          channels[channel].length === 256 &&
          channels[channel].every(Number.isFinite),
      );
    if (!validChannels) {
      throw new TypeError("Histogram data must contain 256 bins per RGB channel.");
    }

    this.drawHistogram(channels);
    this.chart.hidden = false;
    this.legend.hidden = false;
    this.message.hidden = true;
  }

  setLoading() {
    this.chart.hidden = true;
    this.legend.hidden = true;
    this.message.textContent = "Loading histogram…";
    this.message.classList.remove("error");
    this.message.hidden = false;
  }

  setError(message) {
    this.chart.hidden = true;
    this.legend.hidden = true;
    this.message.textContent = message;
    this.message.classList.add("error");
    this.message.hidden = false;
  }

  drawHistogram(channels) {
    const { width, height } = this.chart;
    const padding = { top: 10, right: 8, bottom: 18, left: 8 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const maximum = Math.max(...channels.red, ...channels.green, ...channels.blue, 1);
    this.context.clearRect(0, 0, width, height);
    this.context.strokeStyle = "#41444e";
    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.moveTo(padding.left, padding.top + plotHeight + 0.5);
    this.context.lineTo(width - padding.right, padding.top + plotHeight + 0.5);
    this.context.stroke();

    for (const [channel, color] of [
      ["red", "255, 82, 82"],
      ["green", "105, 220, 125"],
      ["blue", "93, 160, 255"],
    ]) {
      this.context.fillStyle = `rgba(${color}, 0.22)`;
      this.context.beginPath();
      this.context.moveTo(padding.left, padding.top + plotHeight);
      channels[channel].forEach((value, index) => {
        const x = padding.left + (index / 255) * plotWidth;
        const y = padding.top + plotHeight - (value / maximum) * plotHeight;
        this.context.lineTo(x, y);
      });
      this.context.lineTo(padding.left + plotWidth, padding.top + plotHeight);
      this.context.closePath();
      this.context.fill();

      this.context.strokeStyle = `rgb(${color})`;
      this.context.lineWidth = 1.5;
      this.context.beginPath();
      channels[channel].forEach((value, index) => {
        const x = padding.left + (index / 255) * plotWidth;
        const y = padding.top + plotHeight - (value / maximum) * plotHeight;
        if (index === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      });
      this.context.stroke();
    }
  }
}

customElements.define("image-histogram", ImageHistogram);
