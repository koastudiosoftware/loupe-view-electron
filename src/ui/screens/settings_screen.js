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
          <div class="placeholder">General settings will be available here.</div>
        </section>
        <section class="settings-panel" data-panel="image" hidden>
          <h2>Image</h2>
          <div class="placeholder">Image settings will be available here.</div>
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

    this.categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.selectCategory(button.dataset.category);
      });
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
