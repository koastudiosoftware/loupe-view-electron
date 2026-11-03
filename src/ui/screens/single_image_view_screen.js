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
    <button class="canvas-back-button" type="button" aria-label="Back to directory view" title="Back to directory view">
      <span class="back-icon" aria-hidden="true"></span>
    </button>
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
    this.shadowRoot
      .querySelector(".canvas-back-button")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("screen-navigate", {
            bubbles: true,
            composed: true,
            detail: { screen: "directory-view" },
          }),
        );
      });
    this.imageRequestId = 0;
    this.imageLoadRequestId = 0;
    this.zoomScale = 1;
    this.panX = 0;
    this.panY = 0;
    this.activePointerId = null;
    this.handleZoomChange = (event) => {
      this.zoomScale = event.detail.zoom / 100;
      this.constrainPan();
    };
    this.handlePanKeydown = (event) => {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
          event.key,
        ) ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        this.closest("[data-screen]")?.hidden ||
        this.imagePreview.hidden
      ) {
        return;
      }

      const focusedControl = event.composedPath().some(
        (target) =>
          target instanceof HTMLElement &&
          target.getClientRects().length > 0 &&
          target.matches(
            "button, input, select, textarea, [contenteditable=true]",
          ),
      );
      if (focusedControl) {
        return;
      }

      const { maxX, maxY } = this.getPanLimits();
      const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
      if ((horizontal && maxX === 0) || (!horizontal && maxY === 0)) {
        return;
      }

      event.preventDefault();
      const direction =
        event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      this.panBy(
        horizontal ? direction * 40 : 0,
        horizontal ? 0 : direction * 40,
      );
    };
    this.resizeObserver = new ResizeObserver(() => this.constrainPan());
    this.imageCanvas.addEventListener("pointerdown", (event) => {
      if (
        event.button !== 0 ||
        event.target.closest(".canvas-back-button") ||
        this.imagePreview.hidden ||
        !this.isOverImage(event.clientX, event.clientY)
      ) {
        return;
      }

      const { maxX, maxY } = this.getPanLimits();
      if (maxX === 0 && maxY === 0) {
        return;
      }

      event.preventDefault();
      this.activePointerId = event.pointerId;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.dragPanX = this.panX;
      this.dragPanY = this.panY;
      this.imageCanvas.setPointerCapture(event.pointerId);
      this.imageCanvas.classList.add("panning");
    });
    this.imageCanvas.addEventListener("pointermove", (event) => {
      if (event.pointerId !== this.activePointerId) {
        return;
      }

      this.panX = this.dragPanX + event.clientX - this.dragStartX;
      this.panY = this.dragPanY + event.clientY - this.dragStartY;
      this.constrainPan();
    });
    const stopPanning = (event) => {
      if (event.pointerId !== this.activePointerId) {
        return;
      }

      this.activePointerId = null;
      this.imageCanvas.classList.remove("panning");
      if (this.imageCanvas.hasPointerCapture(event.pointerId)) {
        this.imageCanvas.releasePointerCapture(event.pointerId);
      }
    };
    this.imageCanvas.addEventListener("pointerup", stopPanning);
    this.imageCanvas.addEventListener("pointercancel", stopPanning);
    this.imageCanvas.addEventListener("lostpointercapture", stopPanning);
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
    this.imagePreview.addEventListener("load", () => this.constrainPan());
    this.shadowRoot
      .querySelector(".close-button")
      .addEventListener("click", () => this.setFileInfoPanelOpen(false));
  }

  connectedCallback() {
    document.addEventListener("zoom-change", this.handleZoomChange);
    document.addEventListener("keydown", this.handlePanKeydown);
    this.resizeObserver.observe(this.imageCanvas);
  }

  disconnectedCallback() {
    document.removeEventListener("zoom-change", this.handleZoomChange);
    document.removeEventListener("keydown", this.handlePanKeydown);
    this.resizeObserver.disconnect();
  }

  getPanLimits() {
    const { naturalWidth, naturalHeight } = this.imagePreview;
    const { clientWidth, clientHeight } = this.imageCanvas;
    if (!naturalWidth || !naturalHeight || !clientWidth || !clientHeight) {
      return { maxX: 0, maxY: 0 };
    }

    const fitScale = Math.min(
      clientWidth / naturalWidth,
      clientHeight / naturalHeight,
    );
    return {
      maxX: Math.max(
        0,
        (naturalWidth * fitScale * this.zoomScale - clientWidth) / 2,
      ),
      maxY: Math.max(
        0,
        (naturalHeight * fitScale * this.zoomScale - clientHeight) / 2,
      ),
    };
  }

  isOverImage(clientX, clientY) {
    const bounds = this.imageCanvas.getBoundingClientRect();
    const { maxX, maxY } = this.getPanLimits();
    const fitScale = Math.min(
      bounds.width / this.imagePreview.naturalWidth,
      bounds.height / this.imagePreview.naturalHeight,
    );
    const imageWidth =
      this.imagePreview.naturalWidth * fitScale * this.zoomScale;
    const imageHeight =
      this.imagePreview.naturalHeight * fitScale * this.zoomScale;
    const centerX = bounds.left + bounds.width / 2 + this.panX;
    const centerY = bounds.top + bounds.height / 2 + this.panY;
    return (
      clientX >= centerX - imageWidth / 2 &&
      clientX <= centerX + imageWidth / 2 &&
      clientY >= centerY - imageHeight / 2 &&
      clientY <= centerY + imageHeight / 2 &&
      (maxX > 0 || maxY > 0)
    );
  }

  constrainPan() {
    if (!this.imageCanvas.clientWidth || !this.imageCanvas.clientHeight) {
      return;
    }

    const { maxX, maxY } = this.getPanLimits();
    this.panX = Math.max(-maxX, Math.min(maxX, this.panX));
    this.panY = Math.max(-maxY, Math.min(maxY, this.panY));
    this.imageCanvas.classList.toggle("pannable", maxX > 0 || maxY > 0);
    this.imagePreview.style.setProperty(
      "--image-zoom-scale",
      String(this.zoomScale),
    );
    this.imagePreview.style.setProperty("--image-pan-x", `${this.panX}px`);
    this.imagePreview.style.setProperty("--image-pan-y", `${this.panY}px`);
  }

  panBy(deltaX, deltaY) {
    this.panX += deltaX;
    this.panY += deltaY;
    this.constrainPan();
  }

  async setImage(imagePath) {
    const requestId = ++this.imageRequestId;
    this.dispatchEvent(
      new CustomEvent("zoom-reset", {
        bubbles: true,
        composed: true,
      }),
    );
    this.panX = 0;
    this.panY = 0;
    this.constrainPan();
    this.imageError.hidden = true;
    try {
      const [imageUrl, fileMetadata] = await Promise.all([
        window.windowControls.getImageUrl(imagePath),
        window.windowControls.getImageMetadata(imagePath),
      ]);
      if (requestId !== this.imageRequestId) {
        return;
      }

      this.imageLoadRequestId = requestId;
      this.imagePreview.onload = () => {
        if (requestId !== this.imageRequestId) {
          return;
        }

        this.dispatchEvent(
          new CustomEvent("image-metadata", {
            bubbles: true,
            composed: true,
            detail: {
              ...fileMetadata,
              width: this.imagePreview.naturalWidth,
              height: this.imagePreview.naturalHeight,
            },
          }),
        );
        this.constrainPan();
      };
      this.imagePreview.alt = imagePath.split(/[\\/]/).pop();
      this.imagePreview.hidden = false;
      this.imageCanvas.classList.add("has-image");
      this.imagePreview.src = imageUrl;
      this.constrainPan();
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
