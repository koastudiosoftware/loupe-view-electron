const template = document.createElement("template");
const stylesUrl = new URL("./directory_view_status_bar.css", import.meta.url)
  .href;
template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <footer
    class="status-bar"
    aria-label="Directory zoom controls"
    title="Press H to hide or show this status bar"
  >
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

class DirectoryViewStatusBar extends HTMLElement {
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
    if (this.hidden || this.getClientRects().length === 0) {
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

customElements.define("directory-view-status-bar", DirectoryViewStatusBar);
