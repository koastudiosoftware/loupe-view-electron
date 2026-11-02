const path = require("node:path");
const fs = require("node:fs/promises");
const { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    frame: false,
    title: "Loupe View",
    backgroundColor: "#2A2A2A",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  window.on("maximize", () => {
    window.webContents.send("window:maximized", true);
  });
  window.on("unmaximize", () => {
    window.webContents.send("window:maximized", false);
  });
  window.on("enter-full-screen", () => {
    window.webContents.send("window:fullscreen", true);
  });
  window.on("leave-full-screen", () => {
    window.webContents.send("window:fullscreen", false);
  });

  window.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.on("window:toggle-maximize", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    return;
  }

  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
});

ipcMain.on("window:minimize", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("window:toggle-fullscreen", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.setFullScreen(!window.isFullScreen());
  }
});

ipcMain.on("window:close", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.handle("directory:list", async (_event, requestedPath) => {
  if (typeof requestedPath !== "string" || !path.isAbsolute(requestedPath)) {
    throw new TypeError("Directory path must be an absolute path.");
  }

  const directoryPath = path.resolve(requestedPath);
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  return {
    path: directoryPath,
    parentPath: path.dirname(directoryPath),
    rootPath: path.parse(directoryPath).root,
    directories: entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: path.join(directoryPath, entry.name),
      })),
    files: entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        name: entry.name,
        path: path.join(directoryPath, entry.name),
      })),
  };
});

app.whenReady().then(() => {
  console.log("Loupe View Electron is ready.");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
