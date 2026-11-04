const template = document.createElement("template");
const stylesUrl = new URL("./directory_view_status_bar.css", import.meta.url)
  .href;
template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <footer class="status-bar" aria-label="Directory file summary">
    <dl class="file-summary">
      <div class="summary-item">
        <dt>Total files</dt>
        <dd data-summary="total-file-count">0</dd>
      </div>
      <div class="summary-item">
        <dt>Selected files</dt>
        <dd data-summary="selected-file-count">0</dd>
      </div>
      <div class="summary-item">
        <dt>Total size</dt>
        <dd data-summary="total-file-size">0 B</dd>
      </div>
      <div class="summary-item">
        <dt>Selected size</dt>
        <dd data-summary="selected-file-size">0 B</dd>
      </div>
    </dl>
  </footer>
`;

class DirectoryViewStatusBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.summaryFields = Object.fromEntries(
      [...this.shadowRoot.querySelectorAll("[data-summary]")].map((field) => [
        field.dataset.summary,
        field,
      ]),
    );
    this.handleStatusChange = (event) => this.updateSummary(event.detail);
  }

  connectedCallback() {
    document.addEventListener(
      "directory-status-change",
      this.handleStatusChange,
    );
  }

  disconnectedCallback() {
    document.removeEventListener(
      "directory-status-change",
      this.handleStatusChange,
    );
  }

  updateSummary(summary) {
    this.summaryFields["total-file-count"].textContent =
      summary.totalFileCount.toLocaleString();
    this.summaryFields["selected-file-count"].textContent =
      summary.selectedFileCount.toLocaleString();
    this.summaryFields["total-file-size"].textContent = this.formatFileSize(
      summary.totalFileSize,
    );
    this.summaryFields["selected-file-size"].textContent = this.formatFileSize(
      summary.selectedFileSize,
    );
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
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
}

customElements.define("directory-view-status-bar", DirectoryViewStatusBar);
