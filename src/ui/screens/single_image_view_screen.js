const template = document.createElement("template");
const stylesUrl = new URL("./single_image_view_screen.css", import.meta.url).href;
const scrollbarStylesUrl = new URL("../common/scrollbar.css", import.meta.url)
  .href;
const exifTagLabels = {
  "EXIF ApertureValue": "Aperture Value",
  "EXIF BrightnessValue": "Brightness",
  "EXIF ColorSpace": "Color Space",
  "EXIF ComponentsConfiguration": "Components Configuration",
  "EXIF DateTimeDigitized": "Date Time (Digitized)",
  "EXIF DateTimeOriginal": "Date Time (Original)",
  "EXIF DigitalZoomRatio": "Digital Zoom Ratio",
  "EXIF ExifImageLength": "EXIF Image Length",
  "EXIF ExifImageWidth": "EXIF Image Width",
  "EXIF ExifVersion": "EXIF Version",
  "EXIF ExposureBiasValue": "Exposure Bias",
  "EXIF ExposureMode": "Exposure Mode",
  "EXIF ExposureProgram": "Exposure Program",
  "EXIF ExposureTime": "Exposure Time",
  "EXIF FNumber": "F-Number",
  "EXIF Flash": "Flash",
  "EXIF FlashPixVersion": "FlashPix Version",
  "EXIF FocalLength": "Focal Length",
  "EXIF FocalLengthIn35mmFilm": "Focal Length in 35mm Film",
  "EXIF InteroperabilityOffset": "Interoperability Offset",
  "EXIF ISOSpeedRatings": "ISO Speed",
  "EXIF LightSource": "Light Source",
  "EXIF MakerNote": "Maker Note",
  "EXIF MaxApertureValue": "Max Aperture",
  "EXIF MeteringMode": "Metering Mode",
  "EXIF SceneCaptureType": "Scene Capture Type",
  "EXIF SceneType": "Scene Type",
  "EXIF SensingMethod": "Sensing Method",
  "EXIF ShutterSpeedValue": "Shutter Speed",
  "EXIF SubSecTime": "Sub-second Time",
  "EXIF SubSecTimeDigitized": "Sub-second Time (Digitized)",
  "EXIF SubSecTimeOriginal": "Sub-second Time (Original)",
  "EXIF WhiteBalance": "White Balance",
  "GPS GPSAltitude": "Altitude",
  "GPS GPSAltitudeRef": "Altitude Reference",
  "GPS GPSDate": "Date",
  "GPS GPSLatitude": "Latitude",
  "GPS GPSLatitudeRef": "Latitude Reference",
  "GPS GPSLongitude": "Longitude",
  "GPS GPSLongitudeRef": "Longitude Reference",
  "GPS GPSProcessingMethod": "Processing Method",
  "GPS GPSTimeStamp": "Timestamp",
  "Image DateTime": "Date and Time",
  "Image ExifOffset": "EXIF Offset",
  "Image GPSInfo": "GPS Info Offset",
  "Image ImageLength": "Image Height",
  "Image ImageWidth": "Image Width",
  "Image Make": "Camera Maker",
  "Image Model": "Camera Model",
  "Image Orientation": "Orientation",
  "Image ResolutionUnit": "Resolution Unit",
  "Image XResolution": "Horizontal Resolution",
  "Image YCbCrPositioning": "YCbCr Positioning",
  "Image YResolution": "Vertical Resolution",
  "Interoperability InteroperabilityIndex": "Interoperability Index",
  "Thumbnail Compression": "Compression",
  "Thumbnail JPEGInterchangeFormat": "JPEG Interchange Format",
  "Thumbnail JPEGInterchangeFormatLength": "JPEG Interchange Format Length",
  "Thumbnail Orientation": "Orientation",
  "Thumbnail ResolutionUnit": "Resolution Unit",
  "Thumbnail XResolution": "Horizontal Resolution",
  "Thumbnail YResolution": "Vertical Resolution",
};
const flashValueLabels = {
  "Flash did not fire": "No",
  "Flash fired": "Yes",
  "Flash did not fire, compulsory flash mode": "No, Compulsory",
  "Flash did not fire, compulsory flash suppression": "No, Suppressed",
  "Flash did not fire, auto mode": "No, Auto",
  "Flash fired, compulsory flash mode": "Yes, Compulsory",
  "Flash fired, auto mode": "Yes, Auto",
  "Flash fired, auto mode, red-eye reduction": "Yes, Auto, Red-Eye",
  "Flash fired, red-eye reduction mode": "Yes, Red-Eye",
  "Flash did not fire, red-eye reduction mode": "No, Red-Eye",
  "Flash fired, return light not detected": "Yes (No Return)",
  "Flash fired, return light detected": "Yes (Return)",
};
const meteringModeLabels = {
  CenterWeightedAverage: "Center-Weighted Average",
  Average: "Average",
  Spot: "Spot",
  MultiSpot: "Multi-Spot",
  Pattern: "Matrix / Pattern",
  Matrix: "Matrix / Pattern",
  Partial: "Partial",
  Unknown: "Unknown",
  Other: "Other",
};

template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <link rel="stylesheet" href="${scrollbarStylesUrl}" />
  <aside class="file-info-panel" aria-label="File information" hidden>
    <header class="file-info-header">
      <h2>Info</h2>
      <button class="close-button" type="button" aria-label="Close file information">&times;</button>
    </header>
    <div class="file-info-actions" role="tablist" aria-label="File information categories">
      <button class="file-info-action" id="file-details-tab" type="button" role="tab" aria-selected="true" aria-controls="file-details-panel" data-info-tab="file-details" aria-label="File Details">
        <span class="file-info-icon lab-profile-icon" aria-hidden="true"></span>
        <span>File Details</span>
      </button>
      <button class="file-info-action" id="exif-details-tab" type="button" role="tab" aria-selected="false" aria-controls="exif-details-panel" data-info-tab="exif-details" aria-label="EXIF Details">
        <span class="file-info-icon photo-camera-icon" aria-hidden="true"></span>
        <span>EXIF Details</span>
      </button>
      <button class="file-info-action" id="image-specs-tab" type="button" role="tab" aria-selected="false" aria-controls="image-specs-panel" data-info-tab="image-specs" aria-label="Image Specs">
        <span class="file-info-icon image-icon" aria-hidden="true"></span>
        <span>Image Specs</span>
      </button>
    </div>
    <div class="file-info-content themed-scrollbar">
      <section id="file-details-panel" class="info-tab-panel" role="tabpanel" aria-labelledby="file-details-tab" data-info-panel="file-details"></section>
      <section id="exif-details-panel" class="info-tab-panel" role="tabpanel" aria-labelledby="exif-details-tab" data-info-panel="exif-details" hidden></section>
      <section id="image-specs-panel" class="info-tab-panel" role="tabpanel" aria-labelledby="image-specs-tab" data-info-panel="image-specs" hidden></section>
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
    this.infoTabs = [
      ...this.shadowRoot.querySelectorAll("[data-info-tab]"),
    ];
    this.infoPanels = [
      ...this.shadowRoot.querySelectorAll("[data-info-panel]"),
    ];
    this.infoPanelsByTab = new Map(
      this.infoPanels.map((panel) => [panel.dataset.infoPanel, panel]),
    );
    this.infoTabs.forEach((tab) => {
      tab.addEventListener("click", () => this.showInfoTab(tab.dataset.infoTab));
      tab.addEventListener("keydown", (event) => {
        const tabIndex = this.infoTabs.indexOf(tab);
        let nextIndex;
        if (event.key === "ArrowRight") {
          nextIndex = (tabIndex + 1) % this.infoTabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (tabIndex - 1 + this.infoTabs.length) % this.infoTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = this.infoTabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        this.infoTabs[nextIndex].focus();
        this.showInfoTab(this.infoTabs[nextIndex].dataset.infoTab);
      });
    });
    this.showInfoTab("file-details");
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
    this.infoRequestId = 0;
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
    const infoRequestId = ++this.infoRequestId;
    this.renderInfoMessage("Loading image information…");
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
      const [imageUrl, imageInfo] = await Promise.all([
        window.windowControls.getImageUrl(imagePath),
        window.windowControls.getImageInfo(imagePath),
      ]);
      if (requestId !== this.imageRequestId) {
        return;
      }
      if (infoRequestId === this.infoRequestId) {
        this.renderImageInfo(imageInfo);
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
              fileType: imageInfo.file.fileType,
              fileSize: imageInfo.file.fileSize,
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
      if (infoRequestId === this.infoRequestId) {
        this.renderInfoMessage(
          `Unable to load image information: ${error.message ?? String(error)}`,
        );
      }
    }
  }

  showInfoTab(tabName) {
    this.infoTabs.forEach((tab) => {
      const selected = tab.dataset.infoTab === tabName;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    this.infoPanels.forEach((panel) => {
      panel.hidden = panel.dataset.infoPanel !== tabName;
    });
  }

  renderInfoMessage(message) {
    this.infoPanels.forEach((panel) => {
      panel.replaceChildren();
      const paragraph = document.createElement("p");
      paragraph.className = "info-message";
      paragraph.textContent = message;
      panel.append(paragraph);
    });
  }

  renderImageInfo(imageInfo) {
    this.renderFileDetails(imageInfo.file);
    this.renderExifDetails(imageInfo.exif, imageInfo.exifError);
    this.renderImageSpecs(imageInfo.image, imageInfo.imageError, imageInfo.exif);
  }

  renderFileDetails(file) {
    const panel = this.infoPanelsByTab.get("file-details");
    const section = this.createInfoSection(
      null,
      [
        ["Folder Location", file.folderLocation],
        ["File Name", file.fileName],
        ["Date and Time", this.formatDateTime(file.modifiedAt)],
        ["Size Info", this.formatFileSize(file.fileSize)],
      ],
      { stacked: true, linkLabels: ["Folder Location"] },
    );
    panel.replaceChildren(section);
  }

  renderExifDetails(exif, error) {
    const panel = this.infoPanelsByTab.get("exif-details");
    panel.replaceChildren();
    if (error) {
      this.appendInfoMessage(panel, `Unable to read EXIF data: ${error}`);
      return;
    }

    const sections = [
      ["ifd0", "IMAGE"],
      ["exif", "EXIF"],
      ["gps", "GPS"],
      ["interop", "INTEROPERABILITY"],
      ["ifd1", "THUMBNAIL"],
    ];
    for (const [group, title] of sections) {
      const tags = exif?.[group];
      if (!tags || typeof tags !== "object" || Array.isArray(tags)) {
        continue;
      }

      const rows = Object.entries(tags)
        .filter(
          ([name, value]) =>
            value !== null &&
            value !== undefined &&
            !(group === "gps" && /^(latitude|longitude)$/i.test(name)),
        )
        .map(([name, value]) => [
          this.formatExifTag(name, title),
          this.formatExifValue(value, name),
        ])
        .sort(([firstLabel], [secondLabel]) =>
          firstLabel.localeCompare(secondLabel),
        );
      if (rows.length) {
        panel.append(
          this.createInfoSection(title, rows, { rowClassName: "exif-info-row" }),
        );
      }
    }

    if (!panel.childElementCount) {
      this.appendInfoMessage(panel, "No EXIF tags found in this image.");
    }
  }

  renderImageSpecs(image, error, exif) {
    const panel = this.infoPanelsByTab.get("image-specs");
    panel.replaceChildren();
    if (!image) {
      this.appendInfoMessage(
        panel,
        `Unable to read image specifications: ${error ?? "Image format is not supported."}`,
      );
      return;
    }

    const width = image.autoOrient?.width ?? image.width;
    const height = image.autoOrient?.height ?? image.height;
    const dimensions = [];
    if (width) dimensions.push(["Width", `${width.toLocaleString()} px`]);
    if (height) dimensions.push(["Height", `${height.toLocaleString()} px`]);
    if (dimensions.length) {
      panel.append(this.createInfoSection("Dimensions", dimensions));
    }

    const specifications = [];
    if (width && height) {
      specifications.push([
        "Resolution (Megapixels)",
        `${((width * height) / 1_000_000).toFixed(1)} MP`,
      ]);
      specifications.push(["Aspect Ratio", this.getAspectRatio(width, height)]);
      specifications.push([
        "Orientation",
        width === height ? "Square" : width > height ? "Landscape" : "Portrait",
      ]);
    }
    const format = image.format?.toUpperCase();
    if (format) specifications.push(["File Type Name", format]);
    const mimeType = image.mediaType ?? this.getMimeType(image.format);
    if (mimeType) specifications.push(["MIME Type", mimeType]);
    const colorModel = this.getColorModel(image.space);
    if (colorModel) specifications.push(["Color Model", colorModel]);
    const bitDepth = this.getBitDepth(image);
    if (bitDepth) specifications.push(["Bit Depth", bitDepth]);
    const compression = this.getCompression(image, exif);
    if (compression) specifications.push(["Compression", compression]);
    const interlacing = this.getInterlacing(image, exif);
    if (interlacing) specifications.push(["Interlacing", interlacing]);
    if (typeof image.isProgressive === "boolean") {
      specifications.push([
        "Rendering",
        image.isProgressive ? "Progressive Scan" : "Standard Scan",
      ]);
    }
    if (specifications.length) {
      panel.append(this.createInfoSection("Specifications", specifications));
    }
  }

  createInfoSection(title, rows, options = {}) {
    const section = document.createElement("section");
    section.className = "info-section";
    if (title) {
      const heading = document.createElement("h3");
      heading.textContent = title;
      section.append(heading);
    }
    const list = document.createElement("dl");
    list.className = "info-rows";
    rows.forEach(([label, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }
      const row = document.createElement("div");
      row.className = "info-row";
      if (options.stacked) {
        row.classList.add("file-detail-row");
      }
      if (options.rowClassName) {
        row.classList.add(options.rowClassName);
      }
      const term = document.createElement("dt");
      term.textContent = label;
      const detail = document.createElement("dd");
      if (options.linkLabels?.includes(label)) {
        const link = document.createElement("button");
        link.className = "folder-location-link";
        link.type = "button";
        link.textContent = value;
        link.title = value;
        link.addEventListener("click", async () => {
          try {
            await window.windowControls.openFolder(value);
          } catch (error) {
            console.error(`Unable to open folder "${value}":`, error);
            this.appendInfoMessage(
              section,
              `Unable to open folder: ${error.message ?? String(error)}`,
            );
          }
        });
        detail.append(link);
      } else {
        detail.textContent = value;
        detail.title = value;
      }
      row.append(term, detail);
      list.append(row);
    });
    if (list.childElementCount) {
      section.append(list);
    }
    return section;
  }

  appendInfoMessage(panel, message) {
    const paragraph = document.createElement("p");
    paragraph.className = "info-message";
    paragraph.textContent = message;
    panel.append(paragraph);
  }

  formatDateTime(value) {
    const exifDateTime =
      typeof value === "string" &&
      value.match(
        /^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{1,2}):(\d{1,2}):(\d{1,2})/,
      );
    if (exifDateTime) {
      return `${exifDateTime[1]}-${exifDateTime[2]}-${exifDateTime[3]} ${this.padTimePart(exifDateTime[4])}:${this.padTimePart(exifDateTime[5])}:${this.padTimePart(exifDateTime[6])}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return this.formatDate(value);
    }
    return `${date.getFullYear()}-${this.padTimePart(date.getMonth() + 1)}-${this.padTimePart(date.getDate())} ${this.padTimePart(date.getHours())}:${this.padTimePart(date.getMinutes())}:${this.padTimePart(date.getSeconds())}`;
  }

  formatDate(value) {
    if (typeof value !== "string") {
      return String(value);
    }
    const date = value.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})$/);
    return date ? `${date[1]}-${date[2]}-${date[3]}` : value;
  }

  padTimePart(value) {
    return String(value).padStart(2, "0");
  }

  formatExifTime(value) {
    const time =
      typeof value === "string"
        ? value.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.\d+)?$/)
        : null;
    if (time) {
      return `${this.padTimePart(time[1])}:${this.padTimePart(time[2])}:${this.padTimePart(time[3])}`;
    }

    const parts = Array.isArray(value) ? value : null;
    if (!parts || parts.length < 3) {
      return null;
    }
    const timeParts = parts.slice(0, 3).map((part) => {
      if (typeof part === "object" && part !== null) {
        return Number(part.numerator) / Number(part.denominator);
      }
      if (typeof part === "string" && /^\d+\/\d+$/.test(part)) {
        const [numerator, denominator] = part.split("/").map(Number);
        return numerator / denominator;
      }
      return Number(part);
    });
    if (
      timeParts.some((part) => !Number.isFinite(part)) ||
      timeParts[0] < 0 ||
      timeParts[0] > 23 ||
      timeParts[1] < 0 ||
      timeParts[1] > 59 ||
      timeParts[2] < 0 ||
      timeParts[2] > 60
    ) {
      return null;
    }
    return timeParts.map((part) => this.padTimePart(Math.floor(part))).join(":");
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let size = bytes / 1024;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
    }).format(size)} ${units[unit]}`;
  }

  formatExifTag(tag, group) {
    const category = {
      IMAGE: "Image",
      INTEROPERABILITY: "Interoperability",
      THUMBNAIL: "Thumbnail",
    }[group] ?? group;
    return (
      exifTagLabels[`${category} ${tag}`] ??
      tag.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    );
  }

  formatExifValue(value, tag = "") {
    if (tag === "GPSLatitude" || tag === "GPSLongitude") {
      const coordinate = this.formatGpsCoordinate(
        value,
        tag === "GPSLatitude" ? "latitude" : "longitude",
      );
      if (coordinate) return coordinate;
    }
    if (tag === "GPSAltitude") {
      const altitude = this.getExifRational(value);
      if (altitude !== null) {
        return `${Number(altitude.toPrecision(6))} m`;
      }
    }
    if (tag === "Flash" && typeof value === "string") {
      return flashValueLabels[value] ?? value;
    }
    if (tag === "MeteringMode" && typeof value === "string") {
      return meteringModeLabels[value] ?? value;
    }
    if (/^(CreateDate|ModifyDate)$/i.test(tag)) {
      return this.formatDateTime(value);
    }
    if (/^FocalLength(?:In35mm(?:Film|Format))?$/i.test(tag)) {
      if (typeof value === "string" && /\smm$/i.test(value)) {
        return value;
      }
      const focalLength = this.getExifRational(value);
      if (focalLength !== null) {
        return `${Number(focalLength.toPrecision(6))} mm`;
      }
      return `${String(value)} mm`;
    }
    if (
      tag === "FNumber" ||
      tag === "ApertureValue" ||
      tag === "MaxApertureValue"
    ) {
      const aperture = this.getExifRational(value);
      if (aperture !== null && aperture > 0) {
        const fNumber =
          tag === "FNumber" ? aperture : 2 ** (aperture / 2);
        return `f/${this.formatAperture(fNumber)}`;
      }
    }
    if (tag === "ShutterSpeedValue" || tag === "ExposureTime") {
      const seconds = this.getExifRational(value);
      if (seconds !== null && seconds > 0) {
        return this.formatExposureTime(
          tag === "ShutterSpeedValue" ? 2 ** -seconds : seconds,
        );
      }
    }
    if (value instanceof Date) {
      return this.formatDateTime(value);
    }
    if (Array.isArray(value)) {
      if (/TimeStamp$/i.test(tag)) {
        const time = this.formatExifTime(value);
        if (time) return time;
      }
      return value.map((part) => this.formatExifValue(part)).join(", ");
    }
    if (value && typeof value === "object") {
      return Object.entries(value)
        .map(
          ([key, part]) =>
            `${this.formatExifTag(key)}: ${this.formatExifValue(part, key)}`,
        )
        .join(", ");
    }
    if (typeof value === "string") {
      if (/DateTime/i.test(tag)) return this.formatDateTime(value);
      if (/Date$/i.test(tag)) return this.formatDate(value);
      const dateTime =
        value.match(
          /^(\d{4}):(\d{2}):(\d{2})[ T](\d{1,2}):(\d{1,2}):(\d{1,2})$/,
        );
      if (dateTime) return this.formatDateTime(value);
      if (/TimeStamp$/i.test(tag)) {
        return this.formatExifTime(value) ?? value;
      }
      if (/^\d{4}[:\-]\d{2}[:\-]\d{2}$/.test(value)) {
        return this.formatDate(value);
      }
      if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return this.formatDateTime(value);
      }
    }
    return String(value);
  }

  formatGpsCoordinate(value, axis) {
    const components = Array.isArray(value)
      ? value.map((part) => this.getExifRational(part))
      : null;
    let degrees;
    let minutes;
    let seconds;

    if (components?.length === 3 && components.every(Number.isFinite)) {
      [degrees, minutes, seconds] = components.map(Math.abs);
    } else {
      const decimalDegrees = this.getExifRational(value);
      if (decimalDegrees === null) return null;
      const absoluteDegrees = Math.abs(decimalDegrees);
      degrees = Math.floor(absoluteDegrees);
      const fractionalMinutes = (absoluteDegrees - degrees) * 60;
      minutes = Math.floor(fractionalMinutes);
      seconds = (fractionalMinutes - minutes) * 60;
    }

    if (
      degrees > (axis === "latitude" ? 90 : 180) ||
      minutes >= 60 ||
      seconds >= 60 ||
      degrees < 0 ||
      minutes < 0 ||
      seconds < 0
    ) {
      return null;
    }

    seconds = Math.round(seconds * 100) / 100;
    if (seconds >= 60) {
      seconds = 0;
      minutes += 1;
    }
    if (minutes >= 60) {
      minutes = 0;
      degrees += 1;
    }

    const formattedSeconds = seconds
      .toFixed(2)
      .replace(/\.?0+$/, "");
    return `${degrees}° ${minutes}′ ${formattedSeconds}″`;
  }

  formatAperture(value) {
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  getExifRational(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string") {
      const rational = value.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
      if (rational) {
        const numerator = Number(rational[1]);
        const denominator = Number(rational[2]);
        return denominator ? numerator / denominator : null;
      }
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    }
    if (Array.isArray(value) && value.length === 2) {
      const [numerator, denominator] = value.map(Number);
      return Number.isFinite(numerator) &&
        Number.isFinite(denominator) &&
        denominator !== 0
        ? numerator / denominator
        : null;
    }
    if (value && typeof value === "object") {
      const numerator = Number(value.numerator);
      const denominator = Number(value.denominator);
      return Number.isFinite(numerator) &&
        Number.isFinite(denominator) &&
        denominator !== 0
        ? numerator / denominator
        : null;
    }
    return null;
  }

  formatExposureTime(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return String(seconds);
    }
    const reciprocal = Math.round(1 / seconds);
    const fraction =
      seconds < 1 &&
      reciprocal > 0 &&
      Math.abs(1 / reciprocal - seconds) <= seconds * 0.01
        ? { numerator: 1, denominator: reciprocal }
        : this.approximateFraction(seconds);
    return fraction.denominator === 1
      ? `${fraction.numerator} s`
      : `${fraction.numerator}/${fraction.denominator} s`;
  }

  approximateFraction(value) {
    let remainder = value;
    let previousNumerator = 0;
    let numerator = 1;
    let previousDenominator = 1;
    let denominator = 0;
    for (let iteration = 0; iteration < 32; iteration += 1) {
      const whole = Math.floor(remainder);
      const nextNumerator = whole * numerator + previousNumerator;
      const nextDenominator = whole * denominator + previousDenominator;
      if (nextDenominator > 10_000) {
        break;
      }
      previousNumerator = numerator;
      numerator = nextNumerator;
      previousDenominator = denominator;
      denominator = nextDenominator;
      if (Math.abs(numerator / denominator - value) < 1e-8) {
        break;
      }
      const fractionalPart = remainder - whole;
      if (fractionalPart === 0) {
        break;
      }
      remainder = 1 / fractionalPart;
    }
    return { numerator, denominator };
  }

  getAspectRatio(width, height) {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  }

  getMimeType(format) {
    const mimeTypes = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      tiff: "image/tiff",
      gif: "image/gif",
      bmp: "image/bmp",
      heif: "image/heif",
      avif: "image/avif",
    };
    return mimeTypes[format];
  }

  getColorModel(space) {
    const colorModels = {
      srgb: "RGB",
      rgb: "RGB",
      "b-w": "Grayscale",
      grey16: "Grayscale",
      cmyk: "CMYK",
      lab: "Lab",
      xyz: "XYZ",
    };
    return colorModels[space] ?? space?.toUpperCase();
  }

  getBitDepth(image) {
    const depthBits = {
      uchar: 8,
      char: 8,
      ushort: 16,
      short: 16,
      uint: 32,
      int: 32,
      float: 32,
      double: 64,
    };
    const bitsPerChannel = image.bitsPerSample ?? depthBits[image.depth];
    if (!bitsPerChannel || !image.channels) {
      return null;
    }
    const bitsPerPixel = bitsPerChannel * image.channels;
    const type =
      image.isPalette
        ? "Indexed Color"
        : image.channels <= 2
          ? "Grayscale"
          : image.hasAlpha
            ? "True Color + Alpha"
            : "True Color";
    return `${bitsPerPixel}-bit (${type})`;
  }

  getCompression(image, exif) {
    const tagCompression =
      exif?.ifd0?.Compression ?? exif?.ihdr?.Compression;
    if (tagCompression) return this.formatExifValue(tagCompression);
    if (image.compression) return image.compression.toUpperCase();
    return null;
  }

  getInterlacing(image, exif) {
    const interlace = exif?.ihdr?.Interlace;
    return interlace === null || interlace === undefined
      ? null
      : this.formatExifValue(interlace);
  }

  toggleFileInfoPanel() {
    this.setFileInfoPanelOpen(this.fileInfoPanel.hidden);
  }

  setFileInfoPanelOpen(isOpen) {
    this.fileInfoPanel.hidden = !isOpen;
  }
}

customElements.define("single-image-view-screen", SingleImageViewScreen);
