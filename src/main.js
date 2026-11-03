const path = require("node:path");
const fs = require("node:fs/promises");
const { app, BrowserWindow, ipcMain, screen } = require("electron");

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
const windowStatePath = () =>
  path.join(app.getPath("userData"), "window-state.json");
let settingsWriteQueue = Promise.resolve();
let windowStateWriteQueue = Promise.resolve();

async function readSettings() {
  try {
    const contents = await fs.readFile(settingsPath(), "utf8");
    return normalizeSettings(JSON.parse(contents));
  } catch (error) {
    if (error.code === "ENOENT") {
      return { ...defaultSettings };
    }

    throw error;
  }
}

async function readWindowState() {
  try {
    const contents = await fs.readFile(windowStatePath(), "utf8");
    const state = JSON.parse(contents);
    if (
      !state ||
      !Number.isInteger(state.x) ||
      !Number.isInteger(state.y) ||
      !Number.isInteger(state.width) ||
      !Number.isInteger(state.height) ||
      state.width <= 0 ||
      state.height <= 0
    ) {
      throw new TypeError("Saved window state is invalid.");
    }
    return state;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    console.error("Unable to restore saved window bounds:", error);
    return null;
  }
}

async function writeWindowState(bounds, isMaximized) {
  const save = windowStateWriteQueue.then(async () => {
    const targetPath = windowStatePath();
    const temporaryPath = `${targetPath}.tmp`;
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(
      temporaryPath,
      `${JSON.stringify({ ...bounds, isMaximized }, null, 2)}\n`,
      { encoding: "utf8" },
    );
    await fs.rename(temporaryPath, targetPath);
  });
  windowStateWriteQueue = save.catch(() => {});
  await save;
}

function getWindowBounds(settings, savedState) {
  const defaults = { width: 1200, height: 800 };
  if (!savedState) {
    return defaults;
  }

  const savedBounds = {
    x: savedState.x,
    y: savedState.y,
    width: savedState.width,
    height: savedState.height,
  };
  const matchingDisplay = screen.getDisplayMatching(savedBounds);
  const { workArea } = matchingDisplay;
  const bounds = {
    width: defaults.width,
    height: defaults.height,
  };

  if (settings["remember-window-size"]) {
    bounds.width = Math.min(
      Math.max(savedState.width, 640),
      Math.max(workArea.width, 640),
    );
    bounds.height = Math.min(
      Math.max(savedState.height, 480),
      Math.max(workArea.height, 480),
    );
  }

  const isOnScreen = screen.getAllDisplays().some((display) => {
    const area = display.workArea;
    return (
      savedBounds.x < area.x + area.width &&
      savedBounds.x + savedBounds.width > area.x &&
      savedBounds.y < area.y + area.height &&
      savedBounds.y + savedBounds.height > area.y
    );
  });
  if (settings["remember-window-position"] && isOnScreen) {
    bounds.x = Math.min(
      Math.max(savedState.x, workArea.x),
      workArea.x + workArea.width - bounds.width,
    );
    bounds.y = Math.min(
      Math.max(savedState.y, workArea.y),
      workArea.y + workArea.height - bounds.height,
    );
  }

  return bounds;
}

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

async function createWindow() {
  let settings;
  try {
    settings = await readSettings();
  } catch (error) {
    console.error("Unable to load settings for window restoration:", error);
    settings = { ...defaultSettings };
  }
  const savedState = await readWindowState();
  const window = new BrowserWindow({
    ...getWindowBounds(settings, savedState),
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

  let boundsSaveTimer;
  const saveBounds = () => {
    clearTimeout(boundsSaveTimer);
    boundsSaveTimer = setTimeout(() => {
      writeWindowState(window.getNormalBounds(), window.isMaximized()).catch(
        (error) => {
          console.error("Unable to persist window bounds:", error);
        },
      );
    }, 250);
  };

  window.on("maximize", () => {
    window.webContents.send("window:maximized", true);
    saveBounds();
  });
  window.on("unmaximize", () => {
    window.webContents.send("window:maximized", false);
    saveBounds();
  });
  window.on("enter-full-screen", () => {
    window.webContents.send("window:fullscreen", true);
  });
  window.on("leave-full-screen", () => {
    window.webContents.send("window:fullscreen", false);
  });

  window.on("move", saveBounds);
  window.on("resize", saveBounds);
  window.on("close", () => {
    clearTimeout(boundsSaveTimer);
    writeWindowState(window.getNormalBounds(), window.isMaximized()).catch(
      (error) => {
        console.error("Unable to persist window bounds:", error);
      },
    );
  });

  await window.loadFile(path.join(__dirname, "index.html"));
  if (savedState?.isMaximized === true) {
    window.maximize();
  }
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
  return readSettings();
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

app.whenReady().then(async () => {
  console.log("Loupe View Electron is ready.");
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch((error) => {
        console.error("Unable to create application window:", error);
      });
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
