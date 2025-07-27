import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  onMediaSelected: (callback) => {
    ipcRenderer.on("media-selected", (_event, paths) => {
      callback(paths);
    });
  },
  toggleFullScreen: () => ipcRenderer.invoke("toggle-full-screen"),
  isFullScreen: () => ipcRenderer.invoke("is-full-screen"),
});
