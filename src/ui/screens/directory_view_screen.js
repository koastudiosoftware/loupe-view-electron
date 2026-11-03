const template = document.createElement("template");
const stylesUrl = new URL("./directory_view_screen.css", import.meta.url).href;
const scrollbarStylesUrl = new URL("../common/scrollbar.css", import.meta.url)
  .href;
const fileTypeSettingIds = {
  ".jpg": "file-type-jpg",
  ".jpeg": "file-type-jpeg",
  ".png": "file-type-png",
  ".gif": "file-type-gif",
  ".bmp": "file-type-bmp",
  ".tif": "file-type-tif",
  ".tiff": "file-type-tiff",
  ".webp": "file-type-webp",
  ".heic": "file-type-heic",
  ".avif": "file-type-avif",
};

template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <link rel="stylesheet" href="${scrollbarStylesUrl}" />
  <div class="directory-layout">
    <section class="directory-panel panel-top themed-scrollbar" id="directory-top-panel" aria-label="Directories">
      <header class="directory-header">
        <p class="directory-path" aria-live="polite"></p>
      </header>
      <div class="directory-list" role="listbox" aria-label="Directory listing"></div>
      <p class="directory-error" role="alert" hidden></p>
    </section>
    <div
      class="panel-divider vertical-divider"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize directory panels"
      aria-controls="directory-top-panel directory-main-panel"
      aria-valuemin="300"
      aria-valuemax="500"
      aria-valuenow="300"
      tabindex="0"
    ></div>
    <section class="directory-panel panel-bottom themed-scrollbar" id="directory-bottom-panel">
      <div class="file-list" role="listbox" aria-label="Files in current directory"></div>
    </section>
    <div
      class="panel-divider horizontal-divider"
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize left panels"
      aria-controls="directory-top-panel directory-bottom-panel"
      aria-valuemin="120"
      aria-valuenow="50"
      tabindex="0"
    ></div>
    <section class="directory-panel panel-main themed-scrollbar" id="directory-main-panel">
      <div class="file-grid" role="group" aria-label="Files in current directory"></div>
      <p class="directory-error file-grid-error" role="status">Loading file type settings…</p>
    </section>
  </div>
  <directory-view-status-bar></directory-view-status-bar>
`;

class DirectoryViewScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.layout = this.shadowRoot.querySelector(".directory-layout");
    this.directoryList = this.shadowRoot.querySelector(".directory-list");
    this.fileList = this.shadowRoot.querySelector(".file-list");
    this.fileGrid = this.shadowRoot.querySelector(".file-grid");
    this.fileGridError = this.shadowRoot.querySelector(".file-grid-error");
    this.directoryPathLabel = this.shadowRoot.querySelector(".directory-path");
    this.directoryError = this.shadowRoot.querySelector(".directory-error");
    this.currentPath = null;
    this.parentPath = null;
    this.rootPath = null;
    this.files = [];
    this.fileTypeSettings = null;
    this.settingsChangeVersion = 0;
    this.fileGridRenderVersion = 0;
    this.loadRequestId = 0;
    this.handleSettingsChanged = (event) => {
      this.settingsChangeVersion += 1;
      this.fileTypeSettings = event.detail;
      const thumbnailSettingChanged = [
        "cache-thumbnails",
        "thumbnail-size",
        "thumbnail-cache-directory",
        ...Object.values(fileTypeSettingIds),
      ].some(
        (key) =>
          this.previousFileTypeSettings?.[key] !== this.fileTypeSettings[key],
      );
      this.previousFileTypeSettings = this.fileTypeSettings;
      if (thumbnailSettingChanged) {
        this.fileGridError.hidden = true;
        this.renderFileGrid();
      }
    };
    document.addEventListener("settings-changed", this.handleSettingsChanged);
    this.directoryList.addEventListener("click", (event) => {
      const entry = event.target.closest(".directory-entry");
      if (!entry || entry.disabled) {
        return;
      }

      this.selectEntry(this.directoryList, entry);
    });
    this.directoryList.addEventListener("dblclick", (event) => {
      const entry = event.target.closest(".directory-entry");
      if (!entry || entry.disabled) {
        return;
      }

      const targetPath = entry.dataset.path;
      if (targetPath) {
        this.loadDirectory(targetPath);
      }
    });
    this.fileList.addEventListener("click", (event) => {
      const entry = event.target.closest(".file-entry");
      if (entry) {
        this.selectEntry(this.fileList, entry);
      }
    });
    this.fileGrid.addEventListener("click", (event) => {
      const item = event.target.closest(".file-grid-item");
      if (item) {
        this.selectEntry(this.fileGrid, item);
      }
    });
    this.configureResizer(
      this.shadowRoot.querySelector(".vertical-divider"),
      "columns",
      300,
      150,
      500,
    );
    this.configureResizer(
      this.shadowRoot.querySelector(".horizontal-divider"),
      "rows",
      120,
    );
  }

  connectedCallback() {
    if (!this.settingsLoadPromise) {
      this.settingsLoadPromise = this.loadFileTypeSettings();
    }

    if (!this.currentPath) {
      this.loadDirectory("C:\\");
    }
  }

  async loadFileTypeSettings() {
    const requestVersion = this.settingsChangeVersion;
    try {
      const settings = await window.windowControls.loadSettings();
      if (requestVersion !== this.settingsChangeVersion) {
        return;
      }

      this.fileTypeSettings = settings;
      this.previousFileTypeSettings = settings;
      this.fileGridError.hidden = true;
      this.renderFileGrid();
    } catch (error) {
      console.error("Unable to load file type settings:", error);
      if (requestVersion === this.settingsChangeVersion) {
        this.fileGridError.textContent =
          "Unable to load file type settings; the file grid is unavailable.";
        this.fileGridError.hidden = false;
        this.renderFileGrid();
      }
    }
  }

  async loadDirectory(directoryPath) {
    const requestId = ++this.loadRequestId;
    this.directoryError.hidden = true;
    this.directoryError.textContent = "";
    this.directoryList.replaceChildren();
    this.fileList.replaceChildren();
    this.fileGrid.replaceChildren();

    try {
      const listing = await window.windowControls.listDirectories(directoryPath);
      if (requestId !== this.loadRequestId) {
        return;
      }

      this.currentPath = listing.path;
      this.parentPath = listing.parentPath;
      this.rootPath = listing.rootPath;
      this.files = listing.files;
      this.directoryPathLabel.textContent = listing.path;
      this.renderDirectories(listing.directories);
      this.renderFiles();
    } catch (error) {
      if (requestId !== this.loadRequestId) {
        return;
      }

      this.currentPath = directoryPath;
      this.directoryPathLabel.textContent = directoryPath;
      this.directoryError.textContent = `Unable to load directories: ${error.message}`;
      this.directoryError.hidden = false;
      this.files = [];
      this.fileList.replaceChildren();
      this.fileGrid.replaceChildren();
    }
  }

  renderDirectories(directories) {
    const atRoot =
      this.currentPath.toLowerCase() === this.rootPath.toLowerCase();
    const parentEntry = document.createElement("button");
    parentEntry.className = "directory-entry parent-entry";
    parentEntry.type = "button";
    parentEntry.textContent = "..";
    parentEntry.dataset.path = atRoot ? "" : this.parentPath;
    parentEntry.setAttribute("role", "option");
    parentEntry.setAttribute("aria-selected", "false");
    parentEntry.disabled = atRoot;
    this.directoryList.append(parentEntry);

    for (const directory of directories) {
      const entry = document.createElement("button");
      entry.className = "directory-entry";
      entry.type = "button";
      entry.textContent = directory.name;
      entry.dataset.path = directory.path;
      entry.setAttribute("role", "option");
      entry.setAttribute("aria-selected", "false");
      this.directoryList.append(entry);
    }
  }

  renderFiles() {
    this.fileList.replaceChildren();

    for (const file of this.files) {
      const entry = document.createElement("button");
      entry.className = "file-entry";
      entry.type = "button";
      entry.setAttribute("role", "option");
      entry.setAttribute("aria-selected", "false");
      entry.textContent = file.name;
      this.fileList.append(entry);
    }

    this.renderFileGrid();
  }

  renderFileGrid() {
    const renderVersion = ++this.fileGridRenderVersion;
    const files = this.files.filter((file) => {
      if (!this.fileTypeSettings) {
        return false;
      }

      const extensionIndex = file.name.lastIndexOf(".");
      if (extensionIndex <= 0) {
        return false;
      }
      const extension = file.name.slice(extensionIndex).toLowerCase();
      const settingId = fileTypeSettingIds[extension];
      return settingId ? this.fileTypeSettings[settingId] : false;
    });
    this.fileGrid.replaceChildren();

    for (const file of files) {
      const gridItem = document.createElement("button");
      gridItem.className = "file-grid-item";
      gridItem.type = "button";
      gridItem.setAttribute("aria-pressed", "false");
      gridItem.title = file.name;
      const preview = document.createElement("img");
      preview.className = "file-grid-preview";
      preview.alt = "";
      preview.hidden = true;
      const label = document.createElement("span");
      label.className = "file-grid-label";
      label.textContent = file.name;
      gridItem.append(preview, label);
      this.fileGrid.append(gridItem);
      this.loadThumbnail(file, preview, gridItem, renderVersion);
    }
  }

  async loadThumbnail(file, preview, gridItem, renderVersion) {
    try {
      const thumbnail = await window.windowControls.getThumbnail(file.path);
      if (renderVersion !== this.fileGridRenderVersion) {
        return;
      }
      preview.src = thumbnail.url;
      preview.hidden = false;
      gridItem.classList.toggle("original-image", thumbnail.isOriginal);
    } catch (error) {
      console.error(`Unable to load thumbnail for "${file.path}":`, error);
      if (renderVersion === this.fileGridRenderVersion) {
        gridItem.title = `${file.name}\nThumbnail unavailable: ${error.message ?? String(error)}`;
      }
    }
  }

  selectEntry(list, selectedEntry) {
    for (const entry of list.querySelectorAll(
      ".directory-entry, .file-entry, .file-grid-item",
    )) {
      const isSelected = entry === selectedEntry;
      if (entry.classList.contains("file-grid-item")) {
        entry.setAttribute("aria-pressed", String(isSelected));
      } else {
        entry.setAttribute("aria-selected", String(isSelected));
      }
      entry.classList.toggle("selected", isSelected);
    }
  }

  configureResizer(
    resizer,
    axis,
    minimumFirstSize,
    minimumSecondSize = minimumFirstSize,
    maximumFirstSize = Number.POSITIVE_INFINITY,
  ) {
    const templateProperty =
      axis === "columns" ? "gridTemplateColumns" : "gridTemplateRows";
    let startPointer = 0;
    let startFirstSize = 0;
    let startSecondSize = 0;
    const firstPanel = resizer.getAttribute("aria-controls").split(" ")[0];
    const secondPanel = resizer.getAttribute("aria-controls").split(" ")[1];

    const getPanels = () => [
      this.shadowRoot.getElementById(firstPanel),
      this.shadowRoot.getElementById(secondPanel),
    ];

    const initializeSizes = () => {
      const [first, second] = getPanels();
      const firstSize =
        axis === "columns"
          ? first.getBoundingClientRect().width
          : first.getBoundingClientRect().height;
      const secondSize =
        axis === "columns"
          ? second.getBoundingClientRect().width
          : second.getBoundingClientRect().height;
      if (!firstSize || !secondSize) {
        return false;
      }

      startFirstSize = firstSize;
      startSecondSize = secondSize;
      resizer.setAttribute("aria-valuenow", String(Math.round(firstSize)));
      return true;
    };

    const applySizes = (firstSize, secondSize) => {
      this.layout.style[templateProperty] =
        `${firstSize}px 6px ${secondSize}px`;
      resizer.setAttribute("aria-valuenow", String(Math.round(firstSize)));
    };

    resizer.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!initializeSizes()) {
        return;
      }

      startPointer = axis === "columns" ? event.clientX : event.clientY;
      resizer.setPointerCapture(event.pointerId);
    });

    resizer.addEventListener("pointermove", (event) => {
      if (!resizer.hasPointerCapture(event.pointerId)) {
        return;
      }

      const pointer = axis === "columns" ? event.clientX : event.clientY;
      const delta = pointer - startPointer;
      applyDelta(delta);
    });

    const stopResizing = (event) => {
      if (resizer.hasPointerCapture(event.pointerId)) {
        resizer.releasePointerCapture(event.pointerId);
      }
    };
    resizer.addEventListener("pointerup", stopResizing);
    resizer.addEventListener("pointercancel", stopResizing);

    resizer.addEventListener("keydown", (event) => {
      const negativeKey = axis === "columns" ? "ArrowLeft" : "ArrowUp";
      const positiveKey = axis === "columns" ? "ArrowRight" : "ArrowDown";
      if (event.key !== negativeKey && event.key !== positiveKey) {
        return;
      }

      event.preventDefault();
      if (!initializeSizes()) {
        return;
      }

      const delta = event.key === positiveKey ? 10 : -10;
      applyDelta(delta);
    });

    const applyDelta = (delta) => {
      const availableMaximum =
        startFirstSize + startSecondSize - minimumSecondSize;
      const upperBound = Math.max(
        minimumFirstSize,
        Math.min(maximumFirstSize, availableMaximum),
      );
      const firstSize = Math.max(
        minimumFirstSize,
        Math.min(startFirstSize + delta, upperBound),
      );
      applySizes(firstSize, startFirstSize + startSecondSize - firstSize);
    };
  }
}

customElements.define("directory-view-screen", DirectoryViewScreen);
