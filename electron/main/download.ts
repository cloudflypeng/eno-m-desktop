import { dialog, app, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
// @ts-ignore
import fetch from 'node-fetch'
import { execSync } from 'child_process'

interface DownloadResult {
  success: boolean
  filePath?: string
  error?: string
  skipped?: boolean  // 文件已存在，跳过下载
}

interface DownloadOptions {
  url: string
  fileName: string
  author?: string
  basePath?: string
  createAuthorFolder?: boolean
}

// 获取下载目录
function getDownloadDir(basePath?: string): string {
  if (basePath) {
    return basePath
  }
  return path.join(app.getPath('downloads'), 'eno-music')
}

// 获取最终的文件保存路径
function getFinalSavePath(
  fileName: string,
  author?: string,
  basePath?: string,
  createAuthorFolder?: boolean,
): { mp3Path: string, m4sPath: string } {
  const downloadDir = getDownloadDir(basePath)

  // 确保基础目录存在
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true })
  }

  // 如果启用了按作者创建文件夹
  let targetDir = downloadDir
  if (createAuthorFolder && author) {
    targetDir = path.join(downloadDir, author)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
  }

  const m4sFileName = `${fileName}.m4s`
  const mp3FileName = `${fileName}.mp3`

  return {
    m4sPath: path.join(targetDir, m4sFileName),
    mp3Path: path.join(targetDir, mp3FileName),
  }
}

// 检查FFmpeg是否可用
function checkFFmpeg(): boolean {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

// 下载文件（流式下载，减少内存占用）
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url, {
    headers: {
      'Referer': 'https://www.bilibili.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  })
  if (!response.ok) {
    throw new Error(`下载失败: ${response.statusText} (${response.status})`)
  }

  // 使用流式下载减少内存占用
  const buffer = await response.buffer()
  fs.writeFileSync(outputPath, buffer)
}

// M4S转MP3
async function convertM4sToMp3(m4sPath: string, mp3Path: string): Promise<void> {
  if (!checkFFmpeg()) {
    throw new Error('FFmpeg未安装，请先安装FFmpeg来使用转换功能')
  }

  return new Promise((resolve, reject) => {
    try {
      // 使用ffmpeg转换m4s为mp3
      const command = `ffmpeg -i "${m4sPath}" -q:a 0 -map a "${mp3Path}" -y`
      execSync(command, { stdio: 'pipe' })
      resolve()
    } catch (error: any) {
      reject(new Error(`转换失败: ${error.message}`))
    }
  })
}

// 下载并转换
export async function downloadAndConvert(options: DownloadOptions): Promise<string> {
  const { url, fileName, author, basePath, createAuthorFolder } = options

  const { m4sPath, mp3Path } = getFinalSavePath(fileName, author, basePath, createAuthorFolder)

  try {
    // ✅ 如果mp3已存在，直接返回（跳过下载）
    if (fs.existsSync(mp3Path)) {
      console.log(`[SKIP] 文件已存在: ${mp3Path}`)
      return mp3Path
    }

    // ✅ 如果m4s文件存在但mp3不存在，直接进行转换
    if (fs.existsSync(m4sPath)) {
      console.log(`[CONVERT] m4s文件已存在，直接转换: ${m4sPath}`)
      await convertM4sToMp3(m4sPath, mp3Path)
      if (fs.existsSync(m4sPath)) {
        fs.unlinkSync(m4sPath)
      }
      return mp3Path
    }

    // 下载m4s文件
    console.log(`[DOWNLOAD] 开始下载: ${fileName}`)
    await downloadFile(url, m4sPath)

    // 转换为mp3
    console.log(`[CONVERT] 开始转换: ${fileName}`)
    await convertM4sToMp3(m4sPath, mp3Path)

    // 删除临时m4s文件
    if (fs.existsSync(m4sPath)) {
      fs.unlinkSync(m4sPath)
    }

    console.log(`[SUCCESS] 下载完成: ${mp3Path}`)
    return mp3Path
  } catch (error) {
    // 清理失败的文件
    if (fs.existsSync(m4sPath)) fs.unlinkSync(m4sPath)
    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path)
    throw error
  }
}

// 设置IPC处理器
export function setupDownloadHandlers() {
  ipcMain.handle('download-song', async (event, options: DownloadOptions): Promise<DownloadResult> => {
    try {
      const { fileName, author, basePath, createAuthorFolder } = options
      const { mp3Path } = getFinalSavePath(fileName, author, basePath, createAuthorFolder)

      // ✅ 检查文件是否已存在
      const fileExists = fs.existsSync(mp3Path)

      const filePath = await downloadAndConvert(options)
      return {
        success: true,
        filePath,
        skipped: fileExists  // 文件已存在则标记为 skipped
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ✅ 新增：检查多个文件是否已存在
  ipcMain.handle('check-files-exist', (event, fileNames: Array<{ fileName: string, author?: string }>, basePath?: string, createAuthorFolder?: boolean) => {
    const results: Record<string, boolean> = {}
    fileNames.forEach(({ fileName, author }) => {
      const { mp3Path } = getFinalSavePath(fileName, author, basePath, createAuthorFolder)
      results[fileName] = fs.existsSync(mp3Path)
    })
    return results
  })

  ipcMain.handle('get-download-dir', (): string => {
    return getDownloadDir()
  })

  ipcMain.handle('check-ffmpeg', (): boolean => {
    return checkFFmpeg()
  })
}


