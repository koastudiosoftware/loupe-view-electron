const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      display: block;
      height: 40px;
      flex: 0 0 40px;
    }

    * {
      box-sizing: border-box;
    }

    header {
      display: flex;
      height: 100%;
      align-items: center;
      background: #191b21;
      color: #d7d9df;
      font-family: "Segoe UI", sans-serif;
      -webkit-app-region: drag;
      user-select: none;
    }

    .branding {
      padding-left: 14px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }

    .screen-content {
      display: flex;
      min-width: 0;
      height: 100%;
      flex: 1;
      align-items: center;
      padding: 0 12px;
    }

    .screen-content ::slotted(*) {
      -webkit-app-region: no-drag;
    }

    .window-controls {
      display: flex;
      height: 100%;
      -webkit-app-region: no-drag;
    }

    .window-controls button {
      display: grid;
      width: 46px;
      height: 100%;
      padding: 0;
      place-items: center;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }

    .window-controls button:hover {
      background: #30333b;
    }

    .window-controls .close-button:hover {
      background: #c42b1c;
      color: white;
    }

    .window-controls svg {
      width: 12px;
      height: 12px;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1;
    }

    .restore-icon {
      display: none;
    }

    .window-controls[data-maximized="true"] .maximize-icon {
      display: none;
    }

    .window-controls[data-maximized="true"] .restore-icon {
      display: block;
    }

    .window-controls button:focus-visible {
      outline: 2px solid #a5b4fc;
      outline-offset: -3px;
    }
  </style>
  <header>
    <div class="branding"><slot name="branding">Loupe View</slot></div>
    <div class="screen-content"><slot name="screen-content"></slot></div>
    <div class="window-controls">
      <button data-action="minimize" type="button" aria-label="Minimize window" title="Minimize">
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 6h8" />
        </svg>
      </button>
      <button data-action="maximize" type="button" aria-label="Maximize window" title="Maximize">
        <svg class="maximize-icon" viewBox="0 0 12 12" aria-hidden="true">
          <rect x="1.5" y="1.5" width="9" height="9" />
        </svg>
        <svg class="restore-icon" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3.5 3.5V1.5h7v7h-2" />
          <rect x="1.5" y="3.5" width="7" height="7" />
        </svg>
      </button>
      <button class="close-button" data-action="close" type="button" aria-label="Close window" title="Close">
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="m2 2 8 8M10 2l-8 8" />
        </svg>
      </button>
    </div>
  </header>
`;

class AppTitleBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.controls = this.shadowRoot.querySelector(".window-controls");
    this.maximizeButton = this.shadowRoot.querySelector(
      '[data-action="maximize"]',
    );
    this.handleMaximizedChange = this.handleMaximizedChange.bind(this);

    this.shadowRoot.addEventListener("click", (event) => {
      const action = event
        .composedPath()
        .find((target) => target instanceof HTMLElement && target.dataset.action)
        ?.dataset.action;

      if (action === "minimize") {
        window.windowControls.minimize();
      } else if (action === "maximize") {
        window.windowControls.toggleMaximize();
      } else if (action === "close") {
        window.windowControls.close();
      }
    });
  }

  connectedCallback() {
    this.removeMaximizedListener = window.windowControls.onMaximizedChange(
      this.handleMaximizedChange,
    );
  }

  disconnectedCallback() {
    this.removeMaximizedListener?.();
  }

  handleMaximizedChange(isMaximized) {
    this.controls.dataset.maximized = String(isMaximized);
    this.maximizeButton.setAttribute(
      "aria-label",
      isMaximized ? "Restore window" : "Maximize window",
    );
    this.maximizeButton.title = isMaximized ? "Restore" : "Maximize";
  }
}

customElements.define("app-title-bar", AppTitleBar);
