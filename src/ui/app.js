import "./components/single_image_viewer_title_bar.js";
import "./components/single_image_viewer_status_bar.js";
import "./components/directory_view_status_bar.js";
import "./screens/single_image_view_screen.js";
import "./screens/directory_view_screen.js";
import "./screens/settings_screen.js";

const screens = new Map(
  [...document.querySelectorAll("[data-screen]")].map((screen) => [
    screen.dataset.screen,
    screen,
  ]),
);
const showScreen = (screenName) => {
  const activeScreen = screens.get(screenName);
  if (!activeScreen) {
    throw new Error(`Unknown screen: ${screenName}`);
  }

  screens.forEach((screen) => {
    screen.hidden = screen !== activeScreen;
  });
  return activeScreen;
};

document.addEventListener("screen-navigate", (event) => {
  showScreen(event.detail?.screen);
});

document.addEventListener("file-info-open", () => {
  const activeScreen = showScreen("single-image-view");
  activeScreen
    .querySelector("single-image-view-screen")
    .setFileInfoPanelOpen(true);
});
