import "./components/single_image_viewer_title_bar.js";
import "./components/single_image_viewer_status_bar.js";
import "./screens/single_image_view_screen.js";
import "./screens/settings_screen.js";

const screens = new Map(
  [...document.querySelectorAll("[data-screen]")].map((screen) => [
    screen.dataset.screen,
    screen,
  ]),
);

document.addEventListener("screen-navigate", (event) => {
  const activeScreen = screens.get(event.detail?.screen);
  if (!activeScreen) {
    throw new Error(`Unknown screen: ${event.detail?.screen}`);
  }

  screens.forEach((screen) => {
    screen.hidden = screen !== activeScreen;
  });
});
