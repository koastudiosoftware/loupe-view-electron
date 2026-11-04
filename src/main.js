const path = require("node:path");
const fs = require("node:fs/promises");
const { createHash, randomUUID } = require("node:crypto");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { pathToFileURL } = require("node:url");
const exifr = require("exifr");
const sharp = require("sharp");
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeImage,
  screen,
  shell,
} = require("electron");

const execFileAsync = promisify(execFile);
const imageFileExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
  ".webp",
  ".heic",
  ".avif",
];
function getDefaultSettings() {
  return {
    "cache-thumbnails": true,
    "thumbnail-size": "medium",
    "remember-window-size": true,
    "remember-window-position": true,
    "enable-file-deletes": true,
    "directory-single-click-action": "select",
    "file-single-click-action": "select",
    "directory-to-open": "last-visited",
    "default-directory-path": app.getPath("pictures"),
    "allow-image-enlargement": true,
    "auto-rotate-exif": true,
    "show-hidden-files": false,
    "show-parent-folder": true,
    "case-sensitive-sort": false,
    "natural-sort-order": true,
    "file-type-jpg": true,
    "file-type-jpeg": true,
    "file-type-png": true,
    "file-type-gif": true,
    "file-type-bmp": true,
    "file-type-tif": true,
    "file-type-tiff": true,
    "file-type-webp": true,
    "file-type-heic": true,
    "file-type-avif": true,
  };
}
const settingsPath = () => path.join(app.getPath("userData"), "settings.json");
const lastVisitedDirectoryPath = () =>
  path.join(app.getPath("userData"), "last-visited-directory.json");
const panelLayoutPath = () =>
  path.join(app.getPath("userData"), "panel-layout.json");
const windowStatePath = () =>
  path.join(app.getPath("userData"), "window-state.json");
let settingsWriteQueue = Promise.resolve();
let windowStateWriteQueue = Promise.resolve();
let panelLayoutWriteQueue = Promise.resolve();
const resetBoundsByWindow = new WeakMap();

async function readSettings() {
  try {
    const contents = await fs.readFile(settingsPath(), "utf8");
    return normalizeSettings(JSON.parse(contents));
  } catch (error) {
    if (error.code === "ENOENT") {
      return getDefaultSettings();
    }

    throw error;
  }
}

async function readLastVisitedDirectory() {
  try {
    const contents = await fs.readFile(lastVisitedDirectoryPath(), "utf8");
    const savedPath = JSON.parse(contents);
    if (typeof savedPath !== "string" || !path.isAbsolute(savedPath)) {
      throw new TypeError("Saved last-visited directory is invalid.");
    }

    const directoryPath = path.resolve(savedPath);
    const directoryStat = await fs.stat(directoryPath);
    if (!directoryStat.isDirectory()) {
      throw new TypeError("Saved last-visited path is not a directory.");
    }
    return directoryPath;
  } catch (error) {
    if (error.code === "ENOENT") {
      return app.getPath("pictures");
    }

    console.error("Unable to restore last-visited directory:", error);
    return app.getPath("pictures");
  }
}

async function writeLastVisitedDirectory(directoryPath) {
  const targetPath = lastVisitedDirectoryPath();
  const temporaryPath = `${targetPath}.tmp`;
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(temporaryPath, `${JSON.stringify(directoryPath)}\n`, {
    encoding: "utf8",
  });
  await fs.rename(temporaryPath, targetPath);
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

async function readPanelLayout() {
  try {
    const layout = JSON.parse(await fs.readFile(panelLayoutPath(), "utf8"));
    if (
      !layout ||
      typeof layout.columnRatio !== "number" ||
      typeof layout.rowRatio !== "number" ||
      layout.columnRatio <= 0 ||
      layout.columnRatio >= 1 ||
      layout.rowRatio <= 0 ||
      layout.rowRatio >= 1
    ) {
      throw new TypeError("Saved panel layout is invalid.");
    }
    return layout;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    console.error("Unable to restore saved panel layout:", error);
    return null;
  }
}

async function writePanelLayout(layout) {
  const save = panelLayoutWriteQueue.then(async () => {
    const targetPath = panelLayoutPath();
    const temporaryPath = `${targetPath}.tmp`;
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(temporaryPath, `${JSON.stringify(layout)}\n`, {
      encoding: "utf8",
    });
    await fs.rename(temporaryPath, targetPath);
  });
  panelLayoutWriteQueue = save.catch(() => {});
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

  const defaults = getDefaultSettings();
  const normalized = { ...defaults };
  for (const [key, defaultValue] of Object.entries(defaults)) {
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
    if (
      key === "default-directory-path" &&
      !path.isAbsolute(value.trim())
    ) {
      throw new TypeError("Default directory path must be an absolute path.");
    }
    if (
      (key === "directory-single-click-action" ||
        key === "file-single-click-action") &&
      !["open", "select"].includes(value)
    ) {
      throw new TypeError(`Invalid value for setting "${key}".`);
    }

    normalized[key] = value;
  }

  if (
    settings["default-directory-path"] === "C:\\Users\\Public\\Pictures"
  ) {
    normalized["default-directory-path"] = defaults["default-directory-path"];
  }

  const cacheDirectory = settings["thumbnail-cache-directory"];
  if (cacheDirectory === undefined) {
    normalized["thumbnail-cache-directory"] = path.join(
      app.getPath("pictures"), "LoupeView", "ThumbnailCache",
    );
  } else if (
    typeof cacheDirectory !== "string" ||
    !path.isAbsolute(cacheDirectory.trim())
  ) {
    throw new TypeError("Thumbnail cache directory must be an absolute path.");
  } else {
    normalized["thumbnail-cache-directory"] = path.resolve(
      cacheDirectory.trim(),
    );
  }

  return normalized;
}

async function createWindow() {
  let settings;
  try {
    settings = await readSettings();
  } catch (error) {
    console.error("Unable to load settings for window restoration:", error);
    settings = getDefaultSettings();
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
  const isAtResetBounds = () => {
    const resetBounds = resetBoundsByWindow.get(window);
    if (!resetBounds || window.isMaximized() || window.isFullScreen()) {
      return false;
    }
    const bounds = window.getNormalBounds();
    return (
      bounds.x === resetBounds.x &&
      bounds.y === resetBounds.y &&
      bounds.width === resetBounds.width &&
      bounds.height === resetBounds.height
    );
  };
  const saveBounds = () => {
    if (isAtResetBounds()) {
      return;
    }
    resetBoundsByWindow.delete(window);
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
    if (!isAtResetBounds()) {
      writeWindowState(window.getNormalBounds(), window.isMaximized()).catch(
        (error) => {
          console.error("Unable to persist window bounds:", error);
        },
      );
    }
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

ipcMain.handle("window:restore-defaults", async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    throw new Error("Unable to restore default window and panel sizes.");
  }

  await panelLayoutWriteQueue;
  const targetPanelLayout = panelLayoutPath();
  await fs.rm(targetPanelLayout, { force: true });

  if (window.isFullScreen()) {
    window.setFullScreen(false);
  }
  if (window.isMaximized()) {
    window.unmaximize();
  }
  window.setSize(1200, 800);
  window.center();
  const bounds = window.getNormalBounds();
  resetBoundsByWindow.set(window, bounds);
  await writeWindowState(bounds, false);
  window.webContents.send("window:defaults-restored");
});

ipcMain.handle("directory:get-panel-layout", async () =>
  readPanelLayout(),
);

ipcMain.handle("directory:set-panel-layout", async (_event, layout) => {
  if (
    !layout ||
    typeof layout !== "object" ||
    !Number.isFinite(layout.columnRatio) ||
    !Number.isFinite(layout.rowRatio) ||
    layout.columnRatio <= 0 ||
    layout.columnRatio >= 1 ||
    layout.rowRatio <= 0 ||
    layout.rowRatio >= 1
  ) {
    throw new TypeError("Panel layout ratios must be between zero and one.");
  }
  await writePanelLayout({
    columnRatio: layout.columnRatio,
    rowRatio: layout.rowRatio,
  });
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
      .filter((entry) => entry.name.toLowerCase() !== "$recycle.bin")
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

ipcMain.handle("directory:get-last-visited", async () =>
  readLastVisitedDirectory(),
);

ipcMain.handle("directory:set-last-visited", async (_event, requestedPath) => {
  if (typeof requestedPath !== "string" || !path.isAbsolute(requestedPath)) {
    throw new TypeError("Directory path must be an absolute path.");
  }

  const directoryPath = path.resolve(requestedPath);
  const directoryStat = await fs.stat(directoryPath);
  if (!directoryStat.isDirectory()) {
    throw new Error("The requested path is not a directory.");
  }

  await writeLastVisitedDirectory(directoryPath);
});

ipcMain.handle("thumbnail-cache:choose-directory", async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    throw new Error("Unable to open the thumbnail cache directory picker.");
  }

  const settings = await readSettings();
  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    title: "Choose Thumbnail Cache Directory",
    defaultPath: settings["thumbnail-cache-directory"],
    properties: ["openDirectory"],
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle("directory:choose-default", async (event, requestedPath) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    throw new Error("Unable to open the default directory picker.");
  }

  const settings = await readSettings();
  const defaultPath =
    typeof requestedPath === "string" && path.isAbsolute(requestedPath)
      ? path.resolve(requestedPath)
      : settings["default-directory-path"];
  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    title: "Choose Default Directory",
    defaultPath,
    properties: ["openDirectory"],
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle("image:get-url", async (_event, requestedPath) => {
  if (typeof requestedPath !== "string" || !path.isAbsolute(requestedPath)) {
    throw new TypeError("Image path must be an absolute path.");
  }

  const imagePath = path.resolve(requestedPath);
  const fileStat = await fs.stat(imagePath);
  if (!fileStat.isFile()) {
    throw new Error("The requested image is not a file.");
  }

  return pathToFileURL(imagePath).href;
});

function makeExifValuesSerializable(value) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Buffer.isBuffer(value) || ArrayBuffer.isView(value)) {
    return "[Binary Data / Array]";
  }
  if (Array.isArray(value)) {
    return value.map(makeExifValuesSerializable);
  }
  if (value && typeof value === "object") {
    if (value instanceof ArrayBuffer) {
      return "[Binary Data / Array]";
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        makeExifValuesSerializable(child),
      ]),
    );
  }
  return value;
}

ipcMain.handle("image:get-info", async (_event, requestedPath) => {
  if (typeof requestedPath !== "string" || !path.isAbsolute(requestedPath)) {
    throw new TypeError("Image path must be an absolute path.");
  }

  const imagePath = path.resolve(requestedPath);
  const fileStat = await fs.stat(imagePath);
  if (!fileStat.isFile()) {
    throw new Error("The requested image is not a file.");
  }

  const [exifResult, imageResult] = await Promise.allSettled([
    fs
      .readFile(imagePath)
      .then((imageBuffer) =>
        exifr.parse(imageBuffer, {
          tiff: true,
          ifd1: true,
          interop: true,
          makerNote: true,
          userComment: true,
          mergeOutput: false,
        }),
      ),
    sharp(imagePath).metadata(),
  ]);
  const exif =
    exifResult.status === "fulfilled" && exifResult.value
      ? makeExifValuesSerializable(exifResult.value)
      : {};
  const imageMetadata =
    imageResult.status === "fulfilled" ? imageResult.value : null;

  return {
    file: {
      folderLocation: path.dirname(imagePath),
      fileName: path.basename(imagePath),
      fileType: path.extname(imagePath).slice(1).toUpperCase(),
      modifiedAt: fileStat.mtime.toISOString(),
      fileSize: fileStat.size,
    },
    exif,
    exifError:
      exifResult.status === "rejected"
        ? (exifResult.reason?.message ?? String(exifResult.reason))
        : null,
    image: imageMetadata
      ? {
          format: imageMetadata.format,
          mediaType: imageMetadata.mediaType,
          width: imageMetadata.width,
          height: imageMetadata.height,
          autoOrient: imageMetadata.autoOrient,
          space: imageMetadata.space,
          channels: imageMetadata.channels,
          depth: imageMetadata.depth,
          bitsPerSample: imageMetadata.bitsPerSample,
          isProgressive: imageMetadata.isProgressive,
          isPalette: imageMetadata.isPalette,
          hasAlpha: imageMetadata.hasAlpha,
          compression: imageMetadata.compression,
        }
      : null,
    imageError:
      imageResult.status === "rejected"
        ? (imageResult.reason?.message ?? String(imageResult.reason))
        : null,
  };
});

ipcMain.handle("folder:open", async (_event, requestedPath) => {
  if (typeof requestedPath !== "string" || !path.isAbsolute(requestedPath)) {
    throw new TypeError("Folder path must be an absolute path.");
  }

  const folderPath = path.resolve(requestedPath);
  const folderStat = await fs.stat(folderPath);
  if (!folderStat.isDirectory()) {
    throw new Error("The requested path is not a folder.");
  }

  const error = await shell.openPath(folderPath);
  if (error) {
    throw new Error(`Unable to open folder: ${error}`);
  }
});

ipcMain.handle("thumbnail:get", async (_event, requestedPath) => {
  if (typeof requestedPath !== "string" || !path.isAbsolute(requestedPath)) {
    throw new TypeError("Image path must be an absolute path.");
  }

  const imagePath = path.resolve(requestedPath);
  const settings = await readSettings();
  const extension = path.extname(imagePath).toLowerCase();
  const settingId = {
    ".jpg": "file-type-jpg",
    ".jpeg": "file-type-jpeg",
    ".png": "file-type-png",
    ".gif": "file-type-gif",
    ".bmp": "file-type-bmp",
    ".tif": "file-type-tif",
    ".tiff": "file-type-tiff",
    ".webp": "file-type-webp",
    ".heic": "file-type-heic",
    ".avif": "file-type-avif",
  }[extension];
  if (!settingId || !settings[settingId]) {
    throw new Error(`Image type "${extension || "unknown"}" is not enabled.`);
  }

  const targetSize = {
    small: 128,
    medium: 256,
    large: 512,
    "extra-large": 1024,
  }[settings["thumbnail-size"]];
  const fileStat = await fs.stat(imagePath);
  if (!fileStat.isFile()) {
    throw new Error("The requested image is not a file.");
  }

  const image = nativeImage.createFromPath(imagePath);
  if (image.isEmpty()) {
    throw new Error("Electron could not decode this image.");
  }

  const imageSize = image.getSize();
  if (imageSize.width <= targetSize && imageSize.height <= targetSize) {
    return {
      url: pathToFileURL(imagePath).href,
      isOriginal: true,
    };
  }

  const cacheDirectory = settings["thumbnail-cache-directory"];
  const resizeScale =
    targetSize / Math.max(imageSize.width, imageSize.height);
  const thumbnailSize = {
    width: Math.max(1, Math.round(imageSize.width * resizeScale)),
    height: Math.max(1, Math.round(imageSize.height * resizeScale)),
  };
  const cacheKey = createHash("sha256")
    .update(
      `${imagePath.toLowerCase()}\0${fileStat.size}\0${fileStat.mtimeMs}\0${thumbnailSize.width}x${thumbnailSize.height}`,
    )
    .digest("hex");
  const cachePath = path.join(cacheDirectory, `${cacheKey}.png`);

  if (settings["cache-thumbnails"]) {
    let cachedBuffer;
    try {
      cachedBuffer = await fs.readFile(cachePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    if (cachedBuffer) {
      try {
        if (!nativeImage.createFromBuffer(cachedBuffer).isEmpty()) {
          return {
            url: `data:image/png;base64,${cachedBuffer.toString("base64")}`,
            isOriginal: false,
          };
        }
      } catch {
        // A corrupt cache entry is discarded and regenerated below.
      }
      await fs.unlink(cachePath).catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
    }
  }

  const thumbnail = image.resize({
    width: thumbnailSize.width,
    height: thumbnailSize.height,
    quality: "good",
  });
  const thumbnailBuffer = thumbnail.toPNG();

  if (settings["cache-thumbnails"]) {
    await fs.mkdir(cacheDirectory, { recursive: true });
    const temporaryPath = `${cachePath}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, thumbnailBuffer);
    await fs.rename(temporaryPath, cachePath);
  }

  return {
    url: `data:image/png;base64,${thumbnailBuffer.toString("base64")}`,
    isOriginal: false,
  };
});

ipcMain.handle("file-types:descriptions", async () => {
  if (process.platform !== "win32") {
    throw new Error("Windows file type descriptions are only available on Windows.");
  }

  const extensions = JSON.stringify(imageFileExtensions);
  const script = `
    $ErrorActionPreference = 'Stop'
    $signature = @'
using System;
using System.Runtime.InteropServices;

public static class LoupeShellFileInfo {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct SHFILEINFO {
        public IntPtr hIcon;
        public int iIcon;
        public uint dwAttributes;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]
        public string szDisplayName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)]
        public string szTypeName;
    }

    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    public static extern IntPtr SHGetFileInfo(
        string path,
        uint fileAttributes,
        out SHFILEINFO fileInfo,
        uint fileInfoSize,
        uint flags
    );
}
'@
    Add-Type -TypeDefinition $signature
    $extensions = ConvertFrom-Json '${extensions}'
    $results = foreach ($extension in $extensions) {
      $fileInfo = New-Object LoupeShellFileInfo+SHFILEINFO
      [void][LoupeShellFileInfo]::SHGetFileInfo(
        "LoupeView$extension",
        0x80,
        [ref]$fileInfo,
        [uint32][Runtime.InteropServices.Marshal]::SizeOf($fileInfo),
        0x410
      )
      [pscustomobject]@{
        extension = $extension
        description = $fileInfo.szTypeName
      }
    }
    ConvertTo-Json -InputObject @($results) -Compress
  `;
  const encodedScript = Buffer.from(script, "utf16le").toString("base64");
  const { stdout } = await execFileAsync(
    "powershell.exe",
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", encodedScript],
    { windowsHide: true, timeout: 10000, maxBuffer: 1024 * 1024 },
  );
  const results = JSON.parse(stdout.trim());

  if (!Array.isArray(results)) {
    throw new Error("Windows returned an invalid file type description list.");
  }

  return Object.fromEntries(
    results.map(({ extension, description }) => [extension, description]),
  );
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
