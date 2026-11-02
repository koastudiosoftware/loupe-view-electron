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
