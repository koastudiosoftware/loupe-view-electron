const template = document.createElement("template");
const stylesUrl = new URL("./settings_screen.css", import.meta.url).href;

template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <main>
    <header class="heading">
      <button class="back-button" type="button" aria-label="Back to image viewer" title="Back to image viewer">
        <span class="back-icon" aria-hidden="true"></span>
      </button>
      <div>
        <h1>Settings</h1>
        <p>Browse application preferences by category.</p>
      </div>
    </header>
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
                  <span class="setting-description">Choose the size used for cached previews.</span>
                </span>
                <select id="thumbnail-size">
                  <option value="small">Small (128 px)</option>
                  <option value="medium" selected>Medium (256 px)</option>
                  <option value="large">Large (512 px)</option>
                  <option value="extra-large">Extra large (1024 px)</option>
                </select>
              </label>
              <div class="setting-row cache-directory-row">
                <div>
                  <span class="setting-label">Thumbnail cache directory</span>
                  <span class="setting-description">Location used to store cached thumbnails.</span>
                  <code class="directory-path">C:&#92;Users&#92;Public&#92;Pictures&#92;LoupeView&#92;ThumbnailCache</code>
                </div>
                <div class="directory-actions">
                  <button class="secondary-button" type="button" disabled title="Available when thumbnail caching is implemented">
                    Open in File Explorer
                  </button>
                  <button class="secondary-button" type="button" disabled title="Available when thumbnail caching is implemented">
                    Delete all cached thumbnails
                  </button>
                  <button class="secondary-button" type="button" disabled title="Available when thumbnail caching is implemented">
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

            <section class="setting-group" aria-labelledby="file-settings-title">
              <h3 id="file-settings-title">Files</h3>
              <label class="setting-row toggle-row" for="enable-file-deletes">
                <span>
                  <span class="setting-label">Enable file deletes</span>
                  <span class="setting-description">Allow deleting files from the image viewer.</span>
                </span>
                <input id="enable-file-deletes" type="checkbox" checked />
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
                    value="C:&#92;Users&#92;Public&#92;Pictures"
                    aria-label="Default directory path"
                  />
                  <button class="secondary-button" type="button" disabled title="Directory browsing will be available when settings are applied">
                    Browse…
                  </button>
                </div>
              </div>
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
          <div class="placeholder">File settings will be available here.</div>
        </section>
        <section class="settings-panel" data-panel="keyboard" hidden>
          <h2>Keyboard</h2>
          <div class="placeholder">Keyboard settings will be available here.</div>
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
    this.defaultDirectoryFields = this.shadowRoot.querySelector(
      "#default-directory-fields",
    );

    this.categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.selectCategory(button.dataset.category);
      });
    });

    this.directorySelect.addEventListener("change", () => {
      this.defaultDirectoryFields.hidden =
        this.directorySelect.value !== "default-path";
    });

    this.shadowRoot
      .querySelector(".back-button")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("screen-navigate", {
            bubbles: true,
            composed: true,
            detail: { screen: "single-image-view" },
          }),
        );
      });
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
}

customElements.define("settings-screen", SettingsScreen);
