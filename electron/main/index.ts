import { app, BrowserWindow, shell, ipcMain, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { apiProxy } from '../bili/api/index'
import { initCookie, setGlobalCookie } from '../bili/cookie'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 注册协议
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('eno-m', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('eno-m')
}

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

// 处理协议链接
function handleUrl(url: string) {
  console.log('handleUrl', url)
  if (!url) return
  try {
    const urlObj = new URL(url)
    if (urlObj.protocol === 'eno-m:') {
      const cookie = urlObj.searchParams.get('cookie')
      if (cookie) {
        setGlobalCookie(cookie)
        console.log('Cookie set from URL protocol')
        // 可以选择通知渲染进程
        if (win && !win.isDestroyed() && !win.webContents.isDestroyed()) {
          win.webContents.send('cookie-updated', cookie)
        }
      }
    }
  } catch (error) {
    console.error('Failed to handle URL:', error)
  }
}

const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  // 初始化 cookie
  initCookie()
  
  win = new BrowserWindow({
    title: 'Main window',
    // icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    icon: path.join(process.env.VITE_PUBLIC, 'download.png'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(() => {
  createWindow()
  // 拦截 B 站图片请求，设置 Referer 防止 403
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: [
      '*://*.hdslb.com/*',
      '*://*.bilivideo.com/*',
      '*://*.mcdn.bilivideo.cn/*',
      'https://*.bilibili.com/*',
      'https://*.bilivideo.com/*',
      'https://*.bilivideo.cn/*',
    ]
  }, (details, callback) => {
    details.requestHeaders['Referer'] = 'https://www.bilibili.com/'
    callback({ requestHeaders: details.requestHeaders })
  })
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', (event, commandLine, _workingDirectory) => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
  // Windows 下处理协议链接
  const url = commandLine.find(arg => arg.startsWith('eno-m://'))
  if (url) handleUrl(url)
})

// macOS 下处理协议链接
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleUrl(url)
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('bili-api', async (_, message) => {
  try {
    const res = await apiProxy(message)
    return res
  } catch (error) {
    console.error('Bili API invoke error:', error)
    throw error
  }
})
