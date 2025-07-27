import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
const isDev = !app.isPackaged;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      webSecurity: false,
    },
    icon: path.join(__dirname, "..","assets","app.png"),
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  //mainWindow.webContents.openDevTools();

  const supportedExtensions = [
    "mp4",
    "webm",
    "ogg",
    "mp3",
    "wav",
    "aac",
    "flac",
  ];

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "Media", extensions: supportedExtensions }],
            });
            if (!canceled && filePaths.length > 0) {
              mainWindow.webContents.send("media-selected", [filePaths[0]]);
            }
          },
        },
        {
          label: "Open Folder",
          click: async () => {
            const { canceled, filePaths: folderPaths } =
              await dialog.showOpenDialog({
                properties: ["openDirectory"],
              });
            if (!canceled && folderPaths.length > 0) {
              const selectedFolder = folderPaths[0];
              try {
                const filesInFolder = await fs.readdir(selectedFolder);
                const mediaFiles = filesInFolder
                  .filter((file) => {
                    const ext = path.extname(file).toLowerCase().substring(1);
                    return supportedExtensions.includes(ext);
                  })
                  .map((file) => path.join(selectedFolder, file))
                  .sort();

                if (mediaFiles.length > 0) {
                  mainWindow.webContents.send("media-selected", mediaFiles);
                } else {
                  dialog.showMessageBox(mainWindow, {
                    type: "info",
                    title: "No Media Found",
                    message:
                      "No supported video or audio files found in the selected folder.",
                  });
                }
              } catch (error) {
                console.error("Error reading directory:", error);
                dialog.showErrorBox(
                  "Error",
                  "Could not read the selected directory."
                );
              }
            }
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  // ipc handler for toggling full screen
  ipcMain.handle("toggle-full-screen", (event) => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
    return !isFullScreen;
  });

  // ipc handler for getting full screen state
  ipcMain.handle("is-full-screen", () => {
    return mainWindow.isFullScreen();
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
