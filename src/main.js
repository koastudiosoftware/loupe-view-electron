const path = require("node:path");
const fs = require("node:fs/promises");
const { app, BrowserWindow, ipcMain } = require("electron");

const defaultSettings = {
  "cache-thumbnails": true,
  "thumbnail-size": "medium",
  "remember-window-size": true,
  "remember-window-position": true,
  "enable-file-deletes": true,
  "directory-to-open": "last-visited",
  "default-directory-path": "C:\\Users\\Public\\Pictures",
  "allow-image-enlargement": true,
  "auto-rotate-exif": true,
  "show-hidden-files": false,
  "show-parent-folder": true,
  "case-sensitive-sort": false,
  "natural-sort-order": true,
};
const settingsPath = () => path.join(app.getPath("userData"), "settings.json");
let settingsWriteQueue = Promise.resolve();

function normalizeSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new TypeError("Settings must be an object.");
  }

  const normalized = { ...defaultSettings };
  for (const [key, defaultValue] of Object.entries(defaultSettings)) {
    if (!Object.prototype.hasOwnProperty.call(settings, key)) {
      continue;
    }

    const value = settings[key];
    if (typeof defaultValue === "boolean" && typeof value !== "boolean") {
      throw new TypeError(`Invalid value for setting "${key}".`);
    }
    if (typeof defaultValue === "string" && typeof value !== "string") {
      throw new TypeError(`Invalid value for setting "${key}".`);
    }
    if (
      key === "thumbnail-size" &&
      !["small", "medium", "large", "extra-large"].includes(value)
    ) {
      throw new TypeError(`Invalid value for setting "${key}".`);
    }
    if (
      key === "directory-to-open" &&
      !["last-visited", "default-path"].includes(value)
    ) {
      throw new TypeError(`Invalid value for setting "${key}".`);
    }

    normalized[key] = value;
  }

  return normalized;
}

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

ipcMain.handle("settings:load", async () => {
  try {
    const contents = await fs.readFile(settingsPath(), "utf8");
    return normalizeSettings(JSON.parse(contents));
  } catch (error) {
    if (error.code === "ENOENT") {
      return { ...defaultSettings };
    }

    throw error;
  }
});

ipcMain.handle("settings:save", async (_event, settings) => {
  const normalized = normalizeSettings(settings);
  const save = settingsWriteQueue.then(async () => {
    const targetPath = settingsPath();
    const temporaryPath = `${targetPath}.tmp`;
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(
      temporaryPath,
      `${JSON.stringify(normalized, null, 2)}\n`,
      { encoding: "utf8" },
    );
    await fs.rename(temporaryPath, targetPath);
  });
  settingsWriteQueue = save.catch(() => {});
  await save;
  return normalized;
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
