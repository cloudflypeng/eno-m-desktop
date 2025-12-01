import { session, app, safeStorage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

// 管理全局 Cookie
let globalCookie = ''
const COOKIE_FILE = path.join(app.getPath('userData'), 'bili_cookie.dat')

export async function initCookie() {
  try {
    // 1. 优先尝试读取本地存储的 Cookie
    if (fs.existsSync(COOKIE_FILE)) {
      const raw = fs.readFileSync(COOKIE_FILE)
      let decrypted = ''
      try {
        if (safeStorage.isEncryptionAvailable()) {
          decrypted = safeStorage.decryptString(raw)
        } else {
          decrypted = raw.toString('utf-8')
        }
      } catch (e) {
        console.error('Failed to decrypt cookie file:', e)
      }
      if (decrypted && decrypted.trim().length > 0) {
        globalCookie = decrypted.trim()
        console.log('Loaded global cookie from file')
        return
      }
    }

    // 2. 如果没有本地 Cookie，尝试访问 B 站主页获取游客 Cookie
    const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    })
    
    // 获取 set-cookie header
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      // 简单处理：将所有 set-cookie 合并
      globalCookie = setCookie
      console.log('Initialized guest cookie:', globalCookie)
    }
  } catch (error) {
    console.error('Failed to initialize cookie:', error)
  }
}

export function getGlobalCookie() {
  return globalCookie
}

export function setGlobalCookie(cookie: string) {
  globalCookie = cookie
  // 持久化存储
  try {
    let buff: Buffer
    if (safeStorage.isEncryptionAvailable()) {
      buff = safeStorage.encryptString(cookie)
    } else {
      buff = Buffer.from(cookie, 'utf-8')
    }
    fs.writeFileSync(COOKIE_FILE, buff)
    console.log('Cookie saved to file')
  } catch (error) {
    console.error('Failed to save cookie to file:', error)
  }
}

