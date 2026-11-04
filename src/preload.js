const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("windowControls", {
  close: () => ipcRenderer.send("window:close"),
  minimize: () => ipcRenderer.send("window:minimize"),
  toggleMaximize: () => ipcRenderer.send("window:toggle-maximize"),
  toggleFullscreen: () => ipcRenderer.send("window:toggle-fullscreen"),
  listDirectories: (directoryPath) =>
    ipcRenderer.invoke("directory:list", directoryPath),
  getImageUrl: (imagePath) => ipcRenderer.invoke("image:get-url", imagePath),
  getImageInfo: (imagePath) => ipcRenderer.invoke("image:get-info", imagePath),
  openFolder: (folderPath) => ipcRenderer.invoke("folder:open", folderPath),
  getThumbnail: (imagePath) => ipcRenderer.invoke("thumbnail:get", imagePath),
  chooseThumbnailCacheDirectory: () =>
    ipcRenderer.invoke("thumbnail-cache:choose-directory"),
  getFileTypeDescriptions: () => ipcRenderer.invoke("file-types:descriptions"),
  loadSettings: () => ipcRenderer.invoke("settings:load"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
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
