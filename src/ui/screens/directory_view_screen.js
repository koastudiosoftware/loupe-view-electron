const template = document.createElement("template");
const stylesUrl = new URL("./directory_view_screen.css", import.meta.url).href;

template.innerHTML = `
  <link rel="stylesheet" href="${stylesUrl}" />
  <div class="directory-layout">
    <section class="directory-panel panel-top" id="directory-top-panel">
      <h2>Top panel</h2>
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
    <section class="directory-panel panel-bottom" id="directory-bottom-panel">
      <h2>Bottom panel</h2>
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
    <section class="directory-panel panel-main" id="directory-main-panel">
      <h2>Main panel</h2>
    </section>
  </div>
`;

class DirectoryViewScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.layout = this.shadowRoot.querySelector(".directory-layout");
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
