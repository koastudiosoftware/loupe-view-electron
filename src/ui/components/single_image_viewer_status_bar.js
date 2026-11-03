const template = document.createElement("template");
const stylesUrl = new URL("./single_image_viewer_status_bar.css", import.meta.url)
  .href;
template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
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
      <button class="status-button" data-action="file-info" type="button" aria-label="Image information" title="Image information">
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
          <span class="metadata-value" data-metadata="file-type">—</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Dimensions</span>
          <span class="metadata-value" data-metadata="dimensions">— × —</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">File size</span>
          <span class="metadata-value" data-metadata="file-size">—</span>
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
    this.metadataFields = {
      fileType: this.shadowRoot.querySelector('[data-metadata="file-type"]'),
      dimensions: this.shadowRoot.querySelector(
        '[data-metadata="dimensions"]',
      ),
      fileSize: this.shadowRoot.querySelector('[data-metadata="file-size"]'),
    };
    this.handleImageOpen = () => this.updateImageMetadata(null);
    this.handleImageMetadata = (event) =>
      this.updateImageMetadata(event.detail);
    this.currentZoom = Number(this.zoomSlider.value);
    this.handleZoomStep = (event) => {
      const zoom = Math.max(
        Number(this.zoomSlider.min),
        Math.min(
          Number(this.zoomSlider.max),
          this.currentZoom + event.detail.delta,
        ),
      );
      if (zoom !== this.currentZoom) {
        this.updateZoom(String(zoom));
      }
    };
    this.handleZoomReset = () => this.updateZoom("100");
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
      } else if (action === "file-info") {
        this.dispatchEvent(
          new CustomEvent("file-info-open", {
            bubbles: true,
            composed: true,
          }),
        );
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
    document.addEventListener("zoom-step", this.handleZoomStep);
    document.addEventListener("zoom-reset", this.handleZoomReset);
    document.addEventListener("image-open", this.handleImageOpen);
    document.addEventListener("image-metadata", this.handleImageMetadata);
    this.removeFullscreenListener = window.windowControls.onFullscreenChange(
      (isFullScreen) => this.updateFullscreenState(isFullScreen),
    );
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("zoom-step", this.handleZoomStep);
    document.removeEventListener("zoom-reset", this.handleZoomReset);
    document.removeEventListener("image-open", this.handleImageOpen);
    document.removeEventListener("image-metadata", this.handleImageMetadata);
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
    this.currentZoom = Number(this.zoomSlider.value);
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

  updateImageMetadata(metadata) {
    this.metadataFields.fileType.textContent = metadata?.fileType ?? "—";
    this.metadataFields.dimensions.textContent =
      metadata
        ? `${metadata.width.toLocaleString()} × ${metadata.height.toLocaleString()}`
        : "— × —";
    this.metadataFields.fileSize.textContent = metadata
      ? this.formatFileSize(metadata.fileSize)
      : "—";
  }

  formatFileSize(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB", "TB"];
    let size = bytes / 1024;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
    }).format(size)} ${units[unitIndex]}`;
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
