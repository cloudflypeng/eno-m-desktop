import { session } from 'electron'

// 管理全局 Cookie
let globalCookie = ''

export async function initCookie() {
  try {
    // 尝试访问 B 站主页获取 cookie
    const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    })
    
    // 获取 set-cookie header
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      // 简单处理：将所有 set-cookie 合并，虽然 fetch api 可能只返回第一个或者合并的 string
      // 这里我们假设它返回的是标准格式
      globalCookie = setCookie
      console.log('Initialized global cookie:', globalCookie)
      
      // 同时设置到 electron 的 session 中，方便后续可能的 webview 或其他请求自动携带
      if (session.defaultSession) {
        // 解析 cookie 字符串并设置比较复杂，这里主要依靠 api 请求手动带上 Header
        // 如果需要持久化到 session，需要解析 cookie 字符串
      }
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
}

