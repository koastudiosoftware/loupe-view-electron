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
      margin-right: 12px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.01em;
      white-space: nowrap;
    }

    .toolbar-actions {
      display: flex;
      height: 100%;
      -webkit-app-region: no-drag;
    }

    .toolbar-actions button {
      display: grid;
      width: 46px;
      height: 100%;
      padding: 0;
      place-items: center;
      border: 0;
      background: transparent;
      color: #b6bac5;
      cursor: pointer;
    }

    .toolbar-actions button:hover {
      background: #30333b;
      color: #f3f4f6;
    }

    .toolbar-actions button:focus-visible {
      outline: 2px solid #a5b4fc;
      outline-offset: -2px;
    }

    .toolbar-actions svg {
      width: 17px;
      height: 17px;
      fill: currentColor;
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
    <div class="toolbar-actions">
      <button type="button" aria-label="Settings" title="Settings">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
          />
        </svg>
      </button>
      <button type="button" aria-label="Print" title="Print">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 12v2H8v-4h8v2zm2-2v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4h-2z"
          />
          <circle cx="18" cy="11.5" r="1" />
        </svg>
      </button>
      <button type="button" aria-label="Delete" title="Delete">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
          />
        </svg>
      </button>
    </div>
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

class SingleImageViewerTitleBar extends HTMLElement {
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

customElements.define("app-title-bar", SingleImageViewerTitleBar);
