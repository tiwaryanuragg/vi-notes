import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("viNotesDesktop", {
	platform: process.platform,
	appMode: "desktop",
});
