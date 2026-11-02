const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      display: block;
      min-height: 0;
      flex: 1;
      overflow-y: auto;
      color: #f3f4f6;
      font-family: "Segoe UI", sans-serif;
    }

    main {
      width: min(100%, 760px);
      margin: 0 auto;
      padding: 48px 32px;
    }

    .heading {
      margin-bottom: 32px;
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
      font-size: 14px;
    }

    .placeholder {
      padding: 24px;
      border: 1px solid #30333b;
      border-radius: 8px;
      background: #191b21;
      color: #b6bac5;
      font-size: 14px;
    }

    .back-button {
      margin-top: 24px;
      padding: 8px 14px;
      border: 1px solid #3b3e48;
      border-radius: 5px;
      background: #22242b;
      color: #d7d9df;
      font: inherit;
      cursor: pointer;
    }

    .back-button:hover {
      background: #30333b;
      color: #f3f4f6;
    }

    .back-button:focus-visible {
      outline: 2px solid #a5b4fc;
      outline-offset: 2px;
    }
  </style>
  <main>
    <header class="heading">
      <h1>Settings</h1>
      <p>Application preferences will be available here.</p>
    </header>
    <section class="placeholder" aria-label="Settings placeholder">
      Settings are coming soon.
    </section>
    <button class="back-button" type="button">Back to image viewer</button>
  </main>
`;

class SettingsScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
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
}

customElements.define("settings-screen", SettingsScreen);
