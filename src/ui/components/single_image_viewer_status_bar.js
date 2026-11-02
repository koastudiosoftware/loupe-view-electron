const template = document.createElement("template");
const fitScreenIconUrl = new URL(
  "../../../assets/material-icons_fit_screen.svg",
  import.meta.url,
).href;
const fullscreenIconUrl = new URL(
  "../../../assets/material-icons_fullscreen.svg",
  import.meta.url,
).href;
const addIconUrl = new URL(
  "../../../assets/material-icons_add.svg",
  import.meta.url,
).href;
const removeIconUrl = new URL(
  "../../../assets/material-icons_remove.svg",
  import.meta.url,
).href;
template.innerHTML = `
  <style>
    :host {
      display: block;
      min-height: 54px;
      flex: 0 0 54px;
    }

    :host([hidden]) {
      display: none;
    }

    :host([data-screen-hidden]) {
      display: none;
    }

    * {
      box-sizing: border-box;
    }

    .status-bar {
      display: flex;
      height: 54px;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 16px;
      border-top: 1px solid #30333b;
      background: #191b21;
      color: #c5c8d0;
      font-family: "Segoe UI", sans-serif;
      user-select: none;
    }

    .status-group,
    .zoom-controls,
    .image-metadata {
      display: flex;
      min-width: 0;
      align-items: center;
    }

    .status-group {
      gap: 8px;
    }

    .status-button {
      display: grid;
      width: 32px;
      height: 32px;
      flex: 0 0 32px;
      padding: 0;
      place-items: center;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: #b6bac5;
      cursor: pointer;
    }

    .status-button:hover,
    .status-button[aria-pressed="true"] {
      background: #30333b;
      color: #f3f4f6;
    }

    .status-button:focus-visible,
    .zoom-controls input:focus-visible {
      outline: 2px solid #a5b4fc;
      outline-offset: 2px;
    }

    .status-button svg {
      width: 17px;
      height: 17px;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.5;
    }

    .status-divider {
      width: 1px;
      height: 24px;
      flex: 0 0 1px;
      margin: 0 4px;
      background: #343741;
    }

    .image-metadata {
      gap: 18px;
    }

    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      white-space: nowrap;
    }

    .metadata-label {
      color: #858a97;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .metadata-value {
      color: #d7d9df;
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }

    .zoom-controls {
      gap: 7px;
    }

    .zoom-controls .status-button {
      width: 28px;
      flex-basis: 28px;
    }

    .zoom-controls .zoom-icon {
      width: 16px;
      height: 16px;
    }

    .fit-screen-icon {
      background-color: currentColor;
      mask: url("${fitScreenIconUrl}") center / contain no-repeat;
      -webkit-mask: url("${fitScreenIconUrl}") center / contain no-repeat;
    }

    .enter-fullscreen-icon {
      background-color: currentColor;
      mask: url("${fullscreenIconUrl}") center / contain no-repeat;
      -webkit-mask: url("${fullscreenIconUrl}") center / contain no-repeat;
    }

    .zoom-in-icon {
      background-color: currentColor;
      mask: url("${addIconUrl}") center / contain no-repeat;
      -webkit-mask: url("${addIconUrl}") center / contain no-repeat;
    }

    .zoom-out-icon {
      background-color: currentColor;
      mask: url("${removeIconUrl}") center / contain no-repeat;
      -webkit-mask: url("${removeIconUrl}") center / contain no-repeat;
    }

    .status-button svg.view-carousel-icon,
    .status-button svg.slideshow-icon,
    .status-button svg.info-icon {
      fill: currentColor;
      stroke: none;
    }

    .zoom-controls input[type="range"] {
      width: 140px;
      height: 20px;
      accent-color: #a5b4fc;
      cursor: pointer;
    }

    .zoom-picker {
      position: relative;
    }

    .zoom-picker summary {
      display: flex;
      height: 30px;
      min-width: 78px;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 8px;
      border: 1px solid #3b3e48;
      border-radius: 4px;
      background: #22242b;
      color: #d7d9df;
      font-size: 11px;
      list-style: none;
      cursor: pointer;
    }

    .zoom-picker summary::-webkit-details-marker {
      display: none;
    }

    .zoom-picker summary::after {
      width: 6px;
      height: 6px;
      border-right: 1px solid currentColor;
      border-bottom: 1px solid currentColor;
      content: "";
      transform: translateY(-2px) rotate(45deg);
    }

    .zoom-picker[open] summary::after {
      transform: translateY(2px) rotate(225deg);
    }

    .zoom-picker summary:focus-visible,
    .zoom-picker-menu button:focus-visible {
      outline: 2px solid #a5b4fc;
      outline-offset: 2px;
    }

    .zoom-picker-menu {
      position: absolute;
      z-index: 1;
      right: 0;
      bottom: calc(100% + 8px);
      display: flex;
      min-width: 100%;
      max-height: 60vh;
      flex-direction: column;
      overflow-y: auto;
      padding: 4px;
      border: 1px solid #3b3e48;
      border-radius: 4px;
      background: #22242b;
      box-shadow: 0 6px 18px #0008;
    }

    .zoom-picker-menu button {
      padding: 6px 10px;
      border: 0;
      border-radius: 3px;
      background: transparent;
      color: #d7d9df;
      font: inherit;
      font-size: 11px;
      text-align: left;
      white-space: nowrap;
      cursor: pointer;
    }

    .zoom-picker-menu button:hover,
    .zoom-picker-menu button[aria-pressed="true"] {
      background: #30333b;
      color: #f3f4f6;
    }

    .exit-fullscreen-icon {
      display: none;
    }

    .is-fullscreen .enter-fullscreen-icon {
      display: none;
    }

    .is-fullscreen .exit-fullscreen-icon {
      display: block;
    }

    @media (max-width: 850px) {
      .status-bar {
        gap: 8px;
        padding: 0 8px;
      }

      .image-metadata {
        gap: 10px;
      }

      .zoom-controls {
        gap: 4px;
      }

      .zoom-controls input[type="range"] {
        width: 86px;
      }
    }

    @media (max-width: 680px) {
      .image-metadata .metadata-item:first-child {
        display: none;
      }

      .zoom-controls input[type="range"] {
        width: 70px;
      }
    }
  </style>
  <footer
    class="status-bar"
    aria-label="Image status and zoom controls"
    title="Press H to hide or show this status bar"
  >
    <div class="status-group">
      <button
        class="status-button"
        data-action="single-image-view"
        type="button"
        aria-label="Film view"
        title="Film view"
      >
        <svg
          class="zoom-icon view-carousel-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect fill="none" height="24" width="24" />
          <path
            fill="currentColor"
            d="M2,7h4v10H2V7z M7,19h10V5H7V19z M18,7h4v10h-4V7z"
          />
        </svg>
      </button>
      <button class="status-button" type="button" aria-label="Start slideshow" title="Slideshow">
        <svg
          class="slideshow-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path fill="none" d="M0 0h24v24H0V0z" />
          <path
            fill="currentColor"
            d="M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
          />
        </svg>
      </button>
      <span class="status-divider" aria-hidden="true"></span>
      <button class="status-button" type="button" aria-label="Image information" title="Image information">
        <svg class="info-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="none" d="M0 0h24v24H0V0z" />
          <path
            fill="currentColor"
            d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          />
        </svg>
      </button>
      <span class="status-divider" aria-hidden="true"></span>
      <div class="image-metadata" aria-label="Image details">
        <div class="metadata-item">
          <span class="metadata-label">Type</span>
          <span class="metadata-value">—</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Dimensions</span>
          <span class="metadata-value">— × —</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">File size</span>
          <span class="metadata-value">—</span>
        </div>
      </div>
    </div>
    <div class="zoom-controls">
      <button class="status-button" data-action="fit" type="button" aria-label="Zoom to fit" title="Zoom to fit">
        <span class="zoom-icon fit-screen-icon" aria-hidden="true"></span>
      </button>
      <button class="status-button" data-action="out" type="button" aria-label="Zoom out" title="Zoom out">
        <span class="zoom-icon zoom-out-icon" aria-hidden="true"></span>
      </button>
      <input data-zoom-slider type="range" min="10" max="800" step="10" value="100" aria-label="Zoom level" />
      <button class="status-button" data-action="in" type="button" aria-label="Zoom in" title="Zoom in">
        <span class="zoom-icon zoom-in-icon" aria-hidden="true"></span>
      </button>
      <details class="zoom-picker">
        <summary data-zoom-label aria-label="Choose zoom preset">100%</summary>
        <div class="zoom-picker-menu" aria-label="Zoom presets">
          <button
            data-action="preset"
            data-zoom="fit"
            type="button"
          >
            Fit
          </button>
          <button data-action="preset" data-zoom="800" type="button">800%</button>
          <button data-action="preset" data-zoom="700" type="button">700%</button>
          <button data-action="preset" data-zoom="600" type="button">600%</button>
          <button data-action="preset" data-zoom="500" type="button">500%</button>
          <button data-action="preset" data-zoom="400" type="button">400%</button>
          <button data-action="preset" data-zoom="300" type="button">300%</button>
          <button data-action="preset" data-zoom="200" type="button">200%</button>
          <button data-action="preset" data-zoom="150" type="button">150%</button>
          <button data-action="preset" data-zoom="100" type="button">100%</button>
          <button data-action="preset" data-zoom="75" type="button">75%</button>
          <button data-action="preset" data-zoom="50" type="button">50%</button>
          <button data-action="preset" data-zoom="25" type="button">25%</button>
        </div>
      </details>
      <button class="status-button" data-action="fullscreen" type="button" aria-label="Enter fullscreen" title="Enter fullscreen">
        <span class="enter-fullscreen-icon zoom-icon" aria-hidden="true"></span>
        <svg class="exit-fullscreen-icon zoom-icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 7h4V3m6 0v4h4M7 17v-4H3m14 0h-4v4" />
        </svg>
      </button>
    </div>
  </footer>
`;

class ImageStatusBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.zoomSlider = this.shadowRoot.querySelector("[data-zoom-slider]");
    this.zoomLabel = this.shadowRoot.querySelector("[data-zoom-label]");
    this.zoomPicker = this.shadowRoot.querySelector(".zoom-picker");
    this.zoomPresetButtons = [
      ...this.shadowRoot.querySelectorAll('[data-action="preset"]'),
    ];
    this.fullscreenButton = this.shadowRoot.querySelector(
      '[data-action="fullscreen"]',
    );
    this.handleKeydown = this.handleKeydown.bind(this);

    this.shadowRoot.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "fit") {
        this.updateZoom("100");
      } else if (action === "out") {
        this.updateZoom(String(Math.max(10, Number(this.zoomSlider.value) - 10)));
      } else if (action === "in") {
        this.updateZoom(String(Math.min(800, Number(this.zoomSlider.value) + 10)));
      } else if (action === "fullscreen") {
        window.windowControls.toggleFullscreen();
      } else if (action === "single-image-view") {
        this.dispatchEvent(
          new CustomEvent("screen-navigate", {
            bubbles: true,
            composed: true,
            detail: { screen: "single-image-view" },
          }),
        );
      } else if (action === "preset") {
        const preset = event.target.closest("[data-zoom]");
        this.updateZoom(
          preset.dataset.zoom === "fit" ? "100" : preset.dataset.zoom,
        );
        this.zoomPicker.open = false;
      }
    });

    this.zoomSlider.addEventListener("input", () => {
      this.updateZoom(this.zoomSlider.value);
    });
  }

  connectedCallback() {
    document.addEventListener("keydown", this.handleKeydown);
    this.removeFullscreenListener = window.windowControls.onFullscreenChange(
      (isFullScreen) => this.updateFullscreenState(isFullScreen),
    );
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleKeydown);
    this.removeFullscreenListener?.();
  }

  handleKeydown(event) {
    if (this.hidden || this.hasAttribute("data-screen-hidden")) {
      return;
    }

    const target = event.composedPath()[0];
    if (
      event.key.toLowerCase() === "h" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
    ) {
      this.hidden = !this.hidden;
    }
  }

  updateZoom(value) {
    this.zoomSlider.value = value;
    this.zoomLabel.textContent = `${value}%`;
    this.zoomLabel.setAttribute("aria-label", `Current zoom ${value} percent`);
    this.zoomLabel.title = `Current zoom: ${value}%`;
    this.zoomPresetButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.zoom === value),
      );
    });
    this.dispatchEvent(
      new CustomEvent("zoom-change", {
        bubbles: true,
        composed: true,
        detail: { zoom: Number(value) },
      }),
    );
  }

  updateFullscreenState(isFullScreen) {
    this.fullscreenButton.setAttribute(
      "aria-label",
      isFullScreen ? "Exit fullscreen" : "Enter fullscreen",
    );
    this.fullscreenButton.title = isFullScreen
      ? "Exit fullscreen"
      : "Enter fullscreen";
    this.fullscreenButton.classList.toggle("is-fullscreen", isFullScreen);
  }
}

customElements.define("image-status-bar", ImageStatusBar);
