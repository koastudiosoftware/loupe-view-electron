const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      display: block;
      min-height: 0;
      flex: 1;
      color: #f3f4f6;
      font-family: "Segoe UI", sans-serif;
      text-align: center;
    }

    main {
      display: grid;
      width: 100%;
      height: 100%;
      min-height: 0;
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
  </style>
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
  }
}

customElements.define("single-image-view-screen", SingleImageViewScreen);
