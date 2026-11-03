const template = document.createElement("template");
const stylesUrl = new URL("./single_image_view_screen.css", import.meta.url).href;

template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <aside class="file-info-panel" aria-label="File information" hidden>
    <header class="file-info-header">
      <h2>File information</h2>
      <button class="close-button" type="button" aria-label="Close file information">&times;</button>
    </header>
    <div class="file-info-actions" role="group" aria-label="File information categories">
      <button class="file-info-action" type="button" aria-label="File Details">
        <span class="file-info-icon lab-profile-icon" aria-hidden="true"></span>
        <span>File Details</span>
      </button>
      <button class="file-info-action" type="button" aria-label="EXIF Details">
        <span class="file-info-icon photo-camera-icon" aria-hidden="true"></span>
        <span>EXIF Details</span>
      </button>
      <button class="file-info-action" type="button" aria-label="Image Specs">
        <span class="file-info-icon image-icon" aria-hidden="true"></span>
        <span>Image Specs</span>
      </button>
    </div>
  </aside>
  <main id="image-canvas">
    <div class="mark" aria-hidden="true">⌕</div>
    <h1>Loupe View</h1>
    <p class="welcome-message">Your image workspace is ready.</p>
    <img class="image-preview" alt="" hidden />
    <p class="image-error" role="alert" hidden></p>
  </main>
`;

class SingleImageViewScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.fileInfoPanel = this.shadowRoot.querySelector(".file-info-panel");
    this.imageCanvas = this.shadowRoot.querySelector("#image-canvas");
    this.imagePreview = this.shadowRoot.querySelector(".image-preview");
    this.imageError = this.shadowRoot.querySelector(".image-error");
    this.imageRequestId = 0;
    this.imageLoadRequestId = 0;
    this.handleZoomChange = (event) => {
      this.imagePreview.style.setProperty(
        "--image-zoom-scale",
        String(event.detail.zoom / 100),
      );
    };
    this.imageCanvas.addEventListener(
      "wheel",
      (event) => {
        if (
          this.imagePreview.hidden ||
          !this.imageCanvas.classList.contains("has-image") ||
          event.deltaY === 0
        ) {
          return;
        }

        event.preventDefault();
        this.dispatchEvent(
          new CustomEvent("zoom-step", {
            bubbles: true,
            composed: true,
            detail: { delta: event.deltaY < 0 ? 10 : -10 },
          }),
        );
      },
      { passive: false },
    );
    this.imagePreview.addEventListener("error", () => {
      if (this.imageLoadRequestId === this.imageRequestId) {
        this.imagePreview.hidden = true;
        this.imageError.textContent = "Unable to display this image.";
        this.imageError.hidden = false;
      }
    });
    this.shadowRoot
      .querySelector(".close-button")
      .addEventListener("click", () => this.setFileInfoPanelOpen(false));
  }

  connectedCallback() {
    document.addEventListener("zoom-change", this.handleZoomChange);
  }

  disconnectedCallback() {
    document.removeEventListener("zoom-change", this.handleZoomChange);
  }

  async setImage(imagePath) {
    const requestId = ++this.imageRequestId;
    this.imageError.hidden = true;
    try {
      const imageUrl = await window.windowControls.getImageUrl(imagePath);
      if (requestId !== this.imageRequestId) {
        return;
      }

      this.imageLoadRequestId = requestId;
      this.imagePreview.src = imageUrl;
      this.imagePreview.alt = imagePath.split(/[\\/]/).pop();
      this.imagePreview.hidden = false;
      this.imageCanvas.classList.add("has-image");
    } catch (error) {
      if (requestId !== this.imageRequestId) {
        return;
      }

      console.error(`Unable to open image "${imagePath}":`, error);
      this.imageCanvas.classList.add("has-image");
      this.imageError.textContent =
        `Unable to open image: ${error.message ?? String(error)}`;
      this.imageError.hidden = false;
    }
  }

  toggleFileInfoPanel() {
    this.setFileInfoPanelOpen(this.fileInfoPanel.hidden);
  }

  setFileInfoPanelOpen(isOpen) {
    this.fileInfoPanel.hidden = !isOpen;
  }
}

customElements.define("single-image-view-screen", SingleImageViewScreen);
