const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      display: flex;
      min-height: 0;
      flex: 1;
      color: #f3f4f6;
      font-family: "Segoe UI", sans-serif;
      text-align: center;
    }

    main {
      display: grid;
      min-width: 0;
      height: 100%;
      min-height: 0;
      flex: 1;
      place-content: center;
      padding: 48px;
    }

    .mark {
      display: grid;
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      place-items: center;
      border: 1px solid #343943;
      border-radius: 18px;
      color: #a5b4fc;
      font-size: 30px;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.04em;
    }

    p {
      margin: 10px 0 0;
      color: #969ba7;
      font-size: 15px;
    }

    .file-info-panel {
      flex: 0 1 400px;
      min-width: 0;
      max-width: 100%;
      height: 100%;
      overflow: auto;
      background: #191b21;
      box-shadow: 8px 0 24px rgb(0 0 0 / 35%);
      text-align: left;
    }

    .file-info-panel[hidden] {
      display: none;
    }

    .file-info-header {
      display: flex;
      min-height: 56px;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid #30333b;
    }

    .file-info-header h2 {
      margin: 0;
      color: #f3f4f6;
      font-size: 15px;
      font-weight: 600;
    }

    .close-button {
      display: grid;
      width: 32px;
      height: 32px;
      place-items: center;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: #c4c7cf;
      cursor: pointer;
      font-size: 22px;
    }

    .close-button:hover,
    .close-button:focus-visible {
      background: #30333b;
      color: #fff;
    }
  </style>
  <aside class="file-info-panel" aria-label="File information" hidden>
    <header class="file-info-header">
      <h2>File information</h2>
      <button class="close-button" type="button" aria-label="Close file information">&times;</button>
    </header>
  </aside>
  <main id="image-canvas">
    <div class="mark" aria-hidden="true">⌕</div>
    <h1>Loupe View</h1>
    <p>Your image workspace is ready.</p>
  </main>
`;

class SingleImageViewScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.fileInfoPanel = this.shadowRoot.querySelector(".file-info-panel");
    this.shadowRoot
      .querySelector(".close-button")
      .addEventListener("click", () => this.setFileInfoPanelOpen(false));
  }

  toggleFileInfoPanel() {
    this.setFileInfoPanelOpen(this.fileInfoPanel.hidden);
  }

  setFileInfoPanelOpen(isOpen) {
    this.fileInfoPanel.hidden = !isOpen;
  }
}

customElements.define("single-image-view-screen", SingleImageViewScreen);
