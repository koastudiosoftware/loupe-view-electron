const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("windowControls", {
  close: () => ipcRenderer.send("window:close"),
  minimize: () => ipcRenderer.send("window:minimize"),
  toggleMaximize: () => ipcRenderer.send("window:toggle-maximize"),
  toggleFullscreen: () => ipcRenderer.send("window:toggle-fullscreen"),
  restoreWindowDefaults: () =>
    ipcRenderer.invoke("window:restore-defaults"),
  onWindowDefaultsRestored: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("window:defaults-restored", listener);
    return () => ipcRenderer.removeListener("window:defaults-restored", listener);
  },
  getPanelLayout: () => ipcRenderer.invoke("directory:get-panel-layout"),
  setPanelLayout: (layout) =>
    ipcRenderer.invoke("directory:set-panel-layout", layout),
  listDirectories: (directoryPath) =>
    ipcRenderer.invoke("directory:list", directoryPath),
  listImageSiblings: (imagePath) =>
    ipcRenderer.invoke("image:list-siblings", imagePath),
  getLastVisitedDirectory: () =>
    ipcRenderer.invoke("directory:get-last-visited"),
  setLastVisitedDirectory: (directoryPath) =>
    ipcRenderer.invoke("directory:set-last-visited", directoryPath),
  getImageUrl: (imagePath) => ipcRenderer.invoke("image:get-url", imagePath),
  getImageInfo: (imagePath) => ipcRenderer.invoke("image:get-info", imagePath),
  openFolder: (folderPath) => ipcRenderer.invoke("folder:open", folderPath),
  getThumbnail: (imagePath) => ipcRenderer.invoke("thumbnail:get", imagePath),
  chooseThumbnailCacheDirectory: () =>
    ipcRenderer.invoke("thumbnail-cache:choose-directory"),
  chooseDefaultDirectory: (directoryPath) =>
    ipcRenderer.invoke("directory:choose-default", directoryPath),
  getFileTypeDescriptions: () => ipcRenderer.invoke("file-types:descriptions"),
  loadSettings: () => ipcRenderer.invoke("settings:load"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  loadViewerFlyoutState: () =>
    ipcRenderer.invoke("viewer-flyout-state:load"),
  saveViewerFlyoutState: (state) =>
    ipcRenderer.invoke("viewer-flyout-state:save", state),
  onMaximizedChange: (callback) => {
    const listener = (_event, isMaximized) => callback(isMaximized);
    ipcRenderer.on("window:maximized", listener);
    return () => ipcRenderer.removeListener("window:maximized", listener);
  },
  onFullscreenChange: (callback) => {
    const listener = (_event, isFullScreen) => callback(isFullScreen);
    ipcRenderer.on("window:fullscreen", listener);
    return () => ipcRenderer.removeListener("window:fullscreen", listener);
  },
});
