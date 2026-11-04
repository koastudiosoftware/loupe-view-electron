const template = document.createElement("template");
const stylesUrl = new URL("./settings_screen.css", import.meta.url).href;
const scrollbarStylesUrl = new URL("../common/scrollbar.css", import.meta.url)
  .href;

template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <link rel="stylesheet" href="${scrollbarStylesUrl}" />
  <main>
    <header class="heading">
      <button class="back-button" type="button" aria-label="Back" title="Back">
        <span class="back-icon" aria-hidden="true"></span>
      </button>
      <div>
        <h1>Settings</h1>
        <p>Browse application preferences by category.</p>
      </div>
    </header>
    <p class="settings-storage-error" role="alert" hidden></p>
    <div class="settings-layout">
      <nav class="category-list" aria-label="Settings categories">
        <button
          class="category-button"
          type="button"
          data-category="general"
          aria-current="page"
        >
          General
        </button>
        <button
          class="category-button"
          type="button"
          data-category="image"
          aria-current="false"
        >
          Image
        </button>
        <button
          class="category-button"
          type="button"
          data-category="files"
          aria-current="false"
        >
          Files
        </button>
        <button
          class="category-button"
          type="button"
          data-category="keyboard"
          aria-current="false"
        >
          Keyboard
        </button>
      </nav>
      <div class="settings-content">
        <section class="settings-panel" data-panel="general">
          <h2>General</h2>
          <div class="settings-groups">
            <section class="setting-group" aria-labelledby="thumbnail-settings-title">
              <h3 id="thumbnail-settings-title">Thumbnails</h3>
              <label class="setting-row toggle-row" for="cache-thumbnails">
                <span>
                  <span class="setting-label">Cache thumbnails</span>
                  <span class="setting-description">Store generated thumbnails for faster browsing.</span>
                </span>
                <input id="cache-thumbnails" type="checkbox" checked />
              </label>
              <label class="setting-row" for="thumbnail-size">
                <span>
                  <span class="setting-label">Thumbnail size</span>
                  <span class="setting-description">Choose the size used for generated previews.</span>
                </span>
                <select id="thumbnail-size">
                  <option value="small">Small (128 px)</option>
                  <option value="medium" selected>Medium (256 px)</option>
                  <option value="large">Large (512 px)</option>
                  <option value="extra-large">Extra large (1024 px)</option>
                </select>
              </label>
              <div class="setting-row cache-directory-row">
                <div class="cache-directory-field">
                  <span class="setting-label">Thumbnail cache directory</span>
                  <span class="setting-description">Location used to store cached thumbnails.</span>
                  <div class="cache-directory-picker">
                    <input
                      class="directory-path-input"
                      id="thumbnail-cache-directory"
                      type="text"
                      aria-label="Thumbnail cache directory"
                    />
                    <button
                      class="secondary-button"
                      id="browse-thumbnail-cache-directory"
                      type="button"
                    >
                      Browse…
                    </button>
                  </div>
                </div>
                <div class="directory-actions">
                  <button class="secondary-button" type="button" disabled title="Cache management is not available yet">
                    Open in File Explorer
                  </button>
                  <button class="secondary-button" type="button" disabled title="Cache management is not available yet">
                    Delete all cached thumbnails
                  </button>
                  <button class="secondary-button" type="button" disabled title="Cache management is not available yet">
                    Delete orphaned thumbnails
                  </button>
                </div>
              </div>
            </section>

            <section class="setting-group" aria-labelledby="window-settings-title">
              <h3 id="window-settings-title">Window</h3>
              <label class="setting-row toggle-row" for="remember-window-size">
                <span class="setting-label">Remember window size</span>
                <input id="remember-window-size" type="checkbox" checked />
              </label>
              <label class="setting-row toggle-row" for="remember-window-position">
                <span class="setting-label">Remember window position</span>
                <input id="remember-window-position" type="checkbox" checked />
              </label>
            </section>

            <section class="setting-group" aria-labelledby="navigation-settings-title">
              <h3 id="navigation-settings-title">Directories</h3>
              <label class="setting-row" for="directory-single-click-action">
                <span>
                  <span class="setting-label">Directory Single Click Action</span>
                  <span class="setting-description">Choose whether a single click opens or selects a directory.</span>
                </span>
                <select id="directory-single-click-action">
                  <option value="open">Open</option>
                  <option value="select" selected>Select</option>
                </select>
              </label>
              <label class="setting-row directory-row" for="directory-to-open">
                <span>
                  <span class="setting-label">Directory to open</span>
                  <span class="setting-description">Choose where the image viewer starts browsing.</span>
                </span>
                <select id="directory-to-open">
                  <option value="last-visited" selected>Last visited</option>
                  <option value="default-path">Default path</option>
                </select>
              </label>
              <div class="default-directory-fields" id="default-directory-fields" hidden>
                <label class="setting-label" for="default-directory-path">Default path</label>
                <div class="path-picker">
                  <input
                    id="default-directory-path"
                    type="text"
                    aria-label="Default directory path"
                  />
                  <button class="secondary-button" id="browse-default-directory" type="button">
                    Browse…
                  </button>
                </div>
              </div>
            </section>

            <section class="setting-group" aria-labelledby="file-settings-title">
              <h3 id="file-settings-title">Files</h3>
              <label class="setting-row" for="file-single-click-action">
                <span>
                  <span class="setting-label">File Single Click Action</span>
                  <span class="setting-description">Choose whether a single click opens or selects an image.</span>
                </span>
                <select id="file-single-click-action">
                  <option value="open">Open</option>
                  <option value="select" selected>Select</option>
                </select>
              </label>
              <label class="setting-row toggle-row" for="enable-file-deletes">
                <span>
                  <span class="setting-label">Enable file deletes</span>
                  <span class="setting-description">Allow deleting files from the image viewer.</span>
                </span>
                <input id="enable-file-deletes" type="checkbox" checked />
              </label>
            </section>
          </div>
        </section>
        <section class="settings-panel" data-panel="image" hidden>
          <h2>Image</h2>
          <div class="settings-groups">
            <section class="setting-group" aria-labelledby="image-display-settings-title">
              <h3 id="image-display-settings-title">Display</h3>
              <label class="setting-row toggle-row" for="allow-image-enlargement">
                <span>
                  <span class="setting-label">Allow enlargement of image for zoom to fit</span>
                  <span class="setting-description">Enlarge smaller images to fill the available view.</span>
                </span>
                <input id="allow-image-enlargement" type="checkbox" checked />
              </label>
              <label class="setting-row toggle-row" for="auto-rotate-exif">
                <span>
                  <span class="setting-label">Auto-rotate image using EXIF information</span>
                  <span class="setting-description">Apply the image orientation recorded in its EXIF metadata.</span>
                </span>
                <input id="auto-rotate-exif" type="checkbox" checked />
              </label>
            </section>
          </div>
        </section>
        <section class="settings-panel" data-panel="files" hidden>
          <h2>Files</h2>
          <div class="settings-groups">
            <section class="setting-group" aria-labelledby="file-list-settings-title">
              <h3 id="file-list-settings-title">File list</h3>
              <label class="setting-row toggle-row" for="show-hidden-files">
                <span class="setting-label">Show hidden files and folders</span>
                <input id="show-hidden-files" type="checkbox" />
              </label>
              <label class="setting-row toggle-row" for="show-parent-folder">
                <span class="setting-label">Show ".." in folder list</span>
                <input id="show-parent-folder" type="checkbox" checked />
              </label>
              <label class="setting-row toggle-row" for="case-sensitive-sort">
                <span class="setting-label">Case-sensitive sort</span>
                <input id="case-sensitive-sort" type="checkbox" />
              </label>
              <label class="setting-row toggle-row" for="natural-sort-order">
                <span class="setting-label">Natural sort order</span>
                <input id="natural-sort-order" type="checkbox" checked />
              </label>
            </section>
            <section class="setting-group" aria-labelledby="file-types-title">
              <h3 id="file-types-title">File types</h3>
              <div class="file-types-table-wrapper">
                <table class="file-types-table">
                  <thead>
                    <tr>
                      <th scope="col">Enabled</th>
                      <th scope="col">Extension</th>
                      <th scope="col">Windows file type description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><input id="file-type-jpg" type="checkbox" checked aria-label="Enable JPG files" /></td>
                      <td>.jpg</td><td data-file-type-description=".jpg">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-jpeg" type="checkbox" checked aria-label="Enable JPEG files" /></td>
                      <td>.jpeg</td><td data-file-type-description=".jpeg">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-png" type="checkbox" checked aria-label="Enable PNG files" /></td>
                      <td>.png</td><td data-file-type-description=".png">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-gif" type="checkbox" checked aria-label="Enable GIF files" /></td>
                      <td>.gif</td><td data-file-type-description=".gif">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-bmp" type="checkbox" checked aria-label="Enable BMP files" /></td>
                      <td>.bmp</td><td data-file-type-description=".bmp">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-tif" type="checkbox" checked aria-label="Enable TIF files" /></td>
                      <td>.tif</td><td data-file-type-description=".tif">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-tiff" type="checkbox" checked aria-label="Enable TIFF files" /></td>
                      <td>.tiff</td><td data-file-type-description=".tiff">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-webp" type="checkbox" checked aria-label="Enable WebP files" /></td>
                      <td>.webp</td><td data-file-type-description=".webp">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-heic" type="checkbox" checked aria-label="Enable HEIC files" /></td>
                      <td>.heic</td><td data-file-type-description=".heic">Loading…</td>
                    </tr>
                    <tr>
                      <td><input id="file-type-avif" type="checkbox" checked aria-label="Enable AVIF files" /></td>
                      <td>.avif</td><td data-file-type-description=".avif">Loading…</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
        <section class="settings-panel" data-panel="keyboard" hidden>
          <h2>Keyboard</h2>
          <section class="setting-group" aria-label="Keyboard shortcuts">
            <div class="file-types-table-wrapper">
              <table class="file-types-table keyboard-shortcuts-table">
                <colgroup>
                  <col style="width: 34%" />
                  <col style="width: 28%" />
                  <col style="width: 38%" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" aria-sort="none">
                      <button class="sort-header" type="button" data-sort-column="action">
                        Action
                      </button>
                      <span
                        class="column-resizer"
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize Action column"
                        tabindex="0"
                      ></span>
                    </th>
                    <th scope="col" aria-sort="none">
                      <button class="sort-header" type="button" data-sort-column="keys">
                        Key(s)
                      </button>
                      <span
                        class="column-resizer"
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize Key(s) column"
                        tabindex="0"
                      ></span>
                    </th>
                    <th scope="col" aria-sort="none">
                      <button class="sort-header" type="button" data-sort-column="tooltip">
                        Tooltip
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Open image</td>
                    <td>Ctrl+O</td>
                    <td>Open an image file</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </div>
  </main>
`;

class SettingsScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.categoryButtons = [
      ...this.shadowRoot.querySelectorAll(".category-button"),
    ];
    this.settingsPanels = [
      ...this.shadowRoot.querySelectorAll(".settings-panel"),
    ];
    this.directorySelect = this.shadowRoot.querySelector("#directory-to-open");
    this.thumbnailCacheDirectoryInput = this.shadowRoot.querySelector(
      "#thumbnail-cache-directory",
    );
    this.thumbnailCacheDirectoryBrowseButton = this.shadowRoot.querySelector(
      "#browse-thumbnail-cache-directory",
    );
    this.defaultDirectoryPathInput = this.shadowRoot.querySelector(
      "#default-directory-path",
    );
    this.defaultDirectoryBrowseButton = this.shadowRoot.querySelector(
      "#browse-default-directory",
    );
    this.settingsControls = [
      ...this.shadowRoot.querySelectorAll("input[id], select[id]"),
    ];
    this.settingsStorageError = this.shadowRoot.querySelector(
      ".settings-storage-error",
    );
    this.defaultDirectoryFields = this.shadowRoot.querySelector(
      "#default-directory-fields",
    );
    this.keyboardShortcutsTable = this.shadowRoot.querySelector(
      ".keyboard-shortcuts-table",
    );
    this.keyboardTableColumns = [
      ...this.keyboardShortcutsTable.querySelectorAll("col"),
    ];

    this.keyboardShortcutsTable
      .querySelectorAll(".sort-header")
      .forEach((button) => {
        button.addEventListener("click", () => {
          this.dispatchEvent(
            new CustomEvent("settings-sort-request", {
              bubbles: true,
              composed: true,
              detail: {
                table: "keyboard-shortcuts",
                column: button.dataset.sortColumn,
              },
            }),
          );
        });
      });

    this.keyboardShortcutsTable
      .querySelectorAll(".column-resizer")
      .forEach((resizer, index) => {
        this.configureColumnResizer(resizer, index);
      });

    this.categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.selectCategory(button.dataset.category);
      });
    });

    this.directorySelect.addEventListener("change", () => {
      this.updateDefaultDirectoryFields();
    });

    this.thumbnailCacheDirectoryBrowseButton.addEventListener(
      "click",
      () => this.browseThumbnailCacheDirectory(),
    );
    this.defaultDirectoryBrowseButton.addEventListener("click", () =>
      this.browseDefaultDirectory(),
    );

    this.shadowRoot
      .querySelector(".back-button")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("settings-back", {
            bubbles: true,
            composed: true,
          }),
        );
      });
  }

  connectedCallback() {
    if (!this.settingsLoadPromise) {
      this.settingsLoadPromise = this.loadSettings();
    }
  }

  async loadSettings() {
    this.settingsControls.forEach((control) => {
      control.disabled = true;
    });

    try {
      const settings = await window.windowControls.loadSettings();
      this.settingsControls.forEach((control) => {
        if (control.type === "checkbox") {
          control.checked = settings[control.id];
        } else {
          control.value = settings[control.id];
        }
        control.disabled = false;
        this.addSettingsSaveListener(control);
      });
      this.updateDefaultDirectoryFields();
      this.loadFileTypeDescriptions();
    } catch (error) {
      this.showSettingsStorageError(
        `Unable to load settings: ${error.message ?? String(error)}`,
      );
    }
  }

  addSettingsSaveListener(control) {
    const eventName = control.type === "text" ? "input" : "change";
    control.addEventListener(eventName, () => this.saveSettings());
  }

  async browseThumbnailCacheDirectory() {
    this.thumbnailCacheDirectoryBrowseButton.disabled = true;
    try {
      const selectedPath =
        await window.windowControls.chooseThumbnailCacheDirectory();
      if (selectedPath) {
        this.thumbnailCacheDirectoryInput.value = selectedPath;
        await this.saveSettings();
      }
    } catch (error) {
      this.showSettingsStorageError(
        `Unable to choose thumbnail cache directory: ${error.message ?? String(error)}`,
      );
    } finally {
      this.thumbnailCacheDirectoryBrowseButton.disabled = false;
    }
  }

  async browseDefaultDirectory() {
    this.defaultDirectoryBrowseButton.disabled = true;
    try {
      const selectedPath =
        await window.windowControls.chooseDefaultDirectory();
      if (selectedPath) {
        this.defaultDirectoryPathInput.value = selectedPath;
        await this.saveSettings();
      }
    } catch (error) {
      this.showSettingsStorageError(
        `Unable to choose default directory: ${error.message ?? String(error)}`,
      );
    } finally {
      this.defaultDirectoryBrowseButton.disabled = false;
    }
  }

  async loadFileTypeDescriptions() {
    try {
      const descriptions =
        await window.windowControls.getFileTypeDescriptions();
      this.shadowRoot
        .querySelectorAll("[data-file-type-description]")
        .forEach((cell) => {
          const description = descriptions[cell.dataset.fileTypeDescription];
          cell.textContent = description || "Unknown file type";
        });
    } catch (error) {
      this.showSettingsStorageError(
        `Unable to load Windows file type descriptions: ${error.message ?? String(error)}`,
      );
    }
  }

  async saveSettings() {
    const requestId = (this.settingsSaveRequestId ?? 0) + 1;
    this.settingsSaveRequestId = requestId;
    const settings = Object.fromEntries(
      this.settingsControls.map((control) => [
        control.id,
        control.type === "checkbox" ? control.checked : control.value,
      ]),
    );

    try {
      await window.windowControls.saveSettings(settings);
      if (requestId === this.settingsSaveRequestId) {
        this.showSettingsStorageError("");
        this.dispatchEvent(
          new CustomEvent("settings-changed", {
            bubbles: true,
            composed: true,
            detail: settings,
          }),
        );
      }
    } catch (error) {
      if (requestId === this.settingsSaveRequestId) {
        this.showSettingsStorageError(
          `Unable to save settings: ${error.message ?? String(error)}`,
        );
      }
    }
  }

  showSettingsStorageError(message) {
    this.settingsStorageError.textContent = message;
    this.settingsStorageError.hidden = !message;
  }

  updateDefaultDirectoryFields() {
    this.defaultDirectoryFields.hidden =
      this.directorySelect.value !== "default-path";
  }

  selectCategory(category) {
    this.categoryButtons.forEach((button) => {
      button.setAttribute(
        "aria-current",
        button.dataset.category === category ? "page" : "false",
      );
    });
    this.settingsPanels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== category;
    });
  }

  configureColumnResizer(resizer, columnIndex) {
    const column = this.keyboardTableColumns[columnIndex];
    const adjacentColumn = this.keyboardTableColumns[columnIndex + 1];
    const minimumWidth = 80;
    let widthsInitialized = false;

    const initializeWidths = () => {
      if (widthsInitialized) {
        return true;
      }

      const widths = this.keyboardTableColumns.map(
        (tableColumn) => tableColumn.getBoundingClientRect().width,
      );
      if (widths.some((width) => width === 0)) {
        return false;
      }

      this.keyboardTableColumns.forEach((tableColumn, index) => {
        tableColumn.style.width = `${widths[index]}px`;
      });
      widthsInitialized = true;
      return true;
    };

    const resizeBy = (delta) => {
      if (!initializeWidths()) {
        return;
      }

      const currentWidth = column.getBoundingClientRect().width;
      const adjacentWidth = adjacentColumn.getBoundingClientRect().width;
      const adjustedDelta = Math.max(
        minimumWidth - currentWidth,
        Math.min(delta, adjacentWidth - minimumWidth),
      );
      column.style.width = `${currentWidth + adjustedDelta}px`;
      adjacentColumn.style.width = `${adjacentWidth - adjustedDelta}px`;
    };

    resizer.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!initializeWidths()) {
        return;
      }

      resizer.setPointerCapture(event.pointerId);
      resizer.dataset.startX = String(event.clientX);
      resizer.dataset.startWidth = String(
        column.getBoundingClientRect().width,
      );
      resizer.dataset.adjacentWidth = String(
        adjacentColumn.getBoundingClientRect().width,
      );
    });

    resizer.addEventListener("pointermove", (event) => {
      if (!resizer.hasPointerCapture(event.pointerId)) {
        return;
      }

      const delta = event.clientX - Number(resizer.dataset.startX);
      const startWidth = Number(resizer.dataset.startWidth);
      const adjacentWidth = Number(resizer.dataset.adjacentWidth);
      const adjustedDelta = Math.max(
        minimumWidth - startWidth,
        Math.min(delta, adjacentWidth - minimumWidth),
      );
      column.style.width = `${startWidth + adjustedDelta}px`;
      adjacentColumn.style.width = `${adjacentWidth - adjustedDelta}px`;
    });

    const stopResizing = (event) => {
      if (resizer.hasPointerCapture(event.pointerId)) {
        resizer.releasePointerCapture(event.pointerId);
      }
    };
    resizer.addEventListener("pointerup", stopResizing);
    resizer.addEventListener("pointercancel", stopResizing);
    resizer.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      resizeBy(event.key === "ArrowRight" ? 10 : -10);
    });
  }
}

customElements.define("settings-screen", SettingsScreen);
