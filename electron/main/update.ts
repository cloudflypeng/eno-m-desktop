import { ipcMain, app, dialog, net } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'

const GITHUB_REPO = 'cloudflypeng/eno-m-desktop'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`

interface ReleaseInfo {
  tag_name: string
  assets: Array<{
    name: string
    browser_download_url: string
  }>
  body?: string
}

// 比较版本号
function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.replace('v', '').split('.').map(Number)
  const v2Parts = v2.replace('v', '').split('.').map(Number)

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const a = v1Parts[i] || 0
    const b = v2Parts[i] || 0
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

// 获取平台对应的安装文件名
function getInstallerName(): string | null {
  const platform = process.platform
  const arch = process.arch

  if (platform === 'darwin') {
    return 'ENO-M-Mac-*.dmg'
  } else if (platform === 'win32' && arch === 'x64') {
    return 'ENO-M-Windows-*-Setup.exe'
  }
  return null
}

// 从文件名检查版本
function extractVersionFromFilename(filename: string): string | null {
  const match = filename.match(/ENO-M-(?:Mac|Windows)-(\d+\.\d+\.\d+)/i)
  return match ? `v${match[1]}` : null
}

// 检查 GitHub Releases 获取最新版本
async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  return new Promise((resolve) => {
    const request = net.request(GITHUB_API)

    request.on('response', (response) => {
      let data = ''

      response.on('data', (chunk) => {
        data += chunk
      })

      response.on('end', () => {
        try {
          const release = JSON.parse(data) as ReleaseInfo
          resolve(release)
        } catch (error) {
          console.error('Failed to parse release:', error)
          resolve(null)
        }
      })
    })

    request.on('error', (error) => {
      console.error('Failed to fetch release:', error)
      resolve(null)
    })

    request.end()
  })
}

// 下载文件
async function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest)
    const request = net.request(url)

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        file.write(chunk)
      })

      response.on('end', () => {
        file.end()
      })
    })

    request.on('error', (error) => {
      console.error('Download error:', error)
      file.destroy()
      fs.unlink(dest, () => { })
      resolve(false)
    })

    file.on('finish', () => {
      resolve(true)
    })

    file.on('error', (error) => {
      console.error('File write error:', error)
      fs.unlink(dest, () => { })
      resolve(false)
    })

    request.end()
  })
}

// 提供给渲染进程的 IPC 处理
export function setupUpdateHandlers() {
  // 检查更新
  ipcMain.handle('check-for-updates', async () => {
    try {
      const currentVersion = `v${app.getVersion()}`
      const release = await fetchLatestRelease()

      if (!release) {
        return {
          success: false,
          updateAvailable: false,
          error: '无法连接到 GitHub',
          currentVersion,
        }
      }

      const latestVersion = release.tag_name
      const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

      return {
        success: true,
        updateAvailable: hasUpdate,
        currentVersion,
        latestVersion,
        releaseNotes: release.body || '',
        downloadUrl: null, // 会在下载时获取
      }
    } catch (error: any) {
      return {
        success: false,
        updateAvailable: false,
        error: error.message,
        currentVersion: `v${app.getVersion()}`,
      }
    }
  })

  // 下载并安装更新
  ipcMain.handle('download-and-install-update', async () => {
    try {
      const release = await fetchLatestRelease()
      if (!release) {
        return { success: false, error: '无法获取最新版本信息' }
      }

      const installerPattern = getInstallerName()
      if (!installerPattern) {
        return { success: false, error: '不支持的平台' }
      }

      // 查找匹配的安装文件
      const regex = installerPattern.replace(/\*/g, '[\\w.-]+')
      const asset = release.assets.find((a) =>
        new RegExp(`^${regex}$`, 'i').test(a.name)
      )

      if (!asset) {
        return { success: false, error: '找不到对应的安装文件' }
      }

      // 下载到临时目录
      const tempDir = os.tmpdir()
      const downloadPath = path.join(tempDir, `eno-m-update-${Date.now()}${path.extname(asset.name)}`)

      console.log(`Downloading update from: ${asset.browser_download_url}`)
      const success = await downloadFile(asset.browser_download_url, downloadPath)

      if (!success) {
        return { success: false, error: '下载失败' }
      }

      console.log(`Downloaded to: ${downloadPath}`)

      // 根据平台安装
      if (process.platform === 'darwin') {
        // macOS: 使用 open 命令打开 DMG
        spawn('open', [downloadPath], { detached: true })
      } else if (process.platform === 'win32') {
        // Windows: 直接执行安装程序
        spawn(downloadPath, [], { detached: true, stdio: 'ignore' })
      }

      return {
        success: true,
        message: '更新已下载，安装程序即将启动',
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取应用版本
  ipcMain.handle('get-app-version', () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
    }
  })
}
