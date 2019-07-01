'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
const config = require('electron-json-config')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      webSecurity: false
    }
  })

  mainWindow.maximize()

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('open-file-dialog', (event, modelName) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
    filters: [{
      name: 'NLPAT File Type',
      extensions: ['na']
    }]
  }, (path) => {
    if (path) {
      event.sender.send('selected-open-file-' + modelName, path)
    }
  })
})

ipcMain.on('open-file-dialog-all-type', (event, modelName) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
    filters: [{
      name: 'All Files',
      extensions: ['*']
    }]
  }, (path) => {
    if (path) {
      event.sender.send('selected-open-file-' + modelName, path)
    }
  })
})

ipcMain.on('save-as-file-dialog', (event, modelName) => {
  dialog.showSaveDialog({
    filters: [{
      name: 'NLPAT File Type',
      extensions: ['na']
    }]
  }, (path) => {
    if (path) {
      event.sender.send('selected-save-file-' + modelName, path)
    }
  })
})

ipcMain.on('export-file-dialog', (event, modelName) => {
  dialog.showSaveDialog({
    filters: [{
      name: 'Txt',
      extensions: ['']
    }]
  }, (path) => {
    if (path) {
      event.sender.send('export-save-file-' + modelName, path)
    }
  })
})

ipcMain.on('save-file', (event, path, modelName) => {
  event.sender.send('direct-save-file-' + modelName, path)
})

ipcMain.on('show-message', (event, msg) => {
  dialog.showMessageBox({
    title: '提示',
    type: 'error',
    message: msg
  })
})

ipcMain.on('set-config', (event, key, value) => {
  config.set(key, value)
})

ipcMain.on('del-config', (event, key) => {
  config.delete(key)
})

ipcMain.on('get-all-config', (event, modelName) => {
  event.sender.send('get-all-config-reply-' + modelName, config.all())
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
