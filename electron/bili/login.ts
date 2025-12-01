import { net, session } from 'electron'
import { setGlobalCookie, getGlobalCookie } from './cookie'
import { URLSearchParams } from 'node:url'
import qrcode from 'qrcode'

// Bilibili QR 登录相关 API
// 参考：passport.bilibili.com 二维码登录流程

interface QRGenerateResult {
  url: string
  oauthKey: string
  qrImage: string // Base64 encoded QR code image
}

interface QRPollResult {
  status: 'pending' | 'scanned' | 'confirmed' | 'failed'
  cookie?: string
  message?: string
}

function requestJson(url: string, method: 'GET' | 'POST' = 'GET', body?: URLSearchParams, extraHeaders: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = net.request({ url, method })
    // 必要请求头：User-Agent、Referer、Origin，避免风控拦截
    req.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    req.setHeader('Referer', 'https://www.bilibili.com/')
    req.setHeader('Origin', 'https://passport.bilibili.com')
    req.setHeader('Accept', 'application/json, text/plain, */*')
    req.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8')
    req.setHeader('Accept-Encoding', 'gzip, deflate, br')

    // 携带已有 Cookie 可降低 405/风控概率
    const cookie = getGlobalCookie?.()
    if (cookie) req.setHeader('Cookie', cookie)

    // 设置 POST 请求的 Content-Type
    if (method === 'POST') {
      if (!extraHeaders['Content-Type']) {
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      }
    }

    // 额外头覆盖
    for (const [k, v] of Object.entries(extraHeaders)) {
      req.setHeader(k, v)
    }

    let buf = ''
    let responseHeaders: any = {}
    req.on('response', (res) => {
      const status = res.statusCode || 0
      responseHeaders = res.headers || {}
      res.on('data', (chunk) => (buf += chunk))
      res.on('end', () => {
        // 非 2xx 直接报错，附带文本
        if (status < 200 || status >= 300) {
          return reject(new Error(`HTTP ${status}: ${buf?.slice(0, 200)}`))
        }
        try {
          const result = JSON.parse(buf)
          // 附加响应头信息供后续使用
          result._headers = responseHeaders
          resolve(result)
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)

    // 发送 POST 请求体
    if (method === 'POST' && body) {
      const bodyStr = body.toString()
      req.setHeader('Content-Length', Buffer.byteLength(bodyStr).toString())
      req.write(bodyStr)
    }

    req.end()
  })
}

export async function generateQR(): Promise<QRGenerateResult> {
  const urls = [
    'https://passport.bilibili.com/x/passport-login/web/qrcode/generate',
  ]
  let lastErr: any
  for (const url of urls) {
    try {
      const json = await requestJson(url, 'GET')
      console.log(json)
      if (json?.code === 0 && json?.data?.url) {
        const data = json.data
        const qrcodeUrl = data.url
        const oauthKey = data.qrcode_key || data.oauthKey || data.key

        // 生成 QR 码图片（Base64）
        let qrImage = ''
        try {
          qrImage = await qrcode.toDataURL(qrcodeUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
        } catch (e) {
          console.error('Failed to generate QR code image:', e)
          // 如果生成失败，返回空字符串，前端可以显示错误
          qrImage = ''
        }

        return { url: qrcodeUrl, oauthKey, qrImage }
      }
      lastErr = new Error('Bad response')
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`生成二维码失败: ${lastErr?.message || lastErr}`)
}

export async function pollQR(oauthKey: string): Promise<QRPollResult> {
  // 轮询仅需要 qrcode_key (作为 URL 参数，使用 GET 方法)
  // 根据文档：https://socialsisteryi.github.io/bilibili-API-collect/docs/login/login_action/QR.html
  // 请求方式：GET
  // 返回的 data.code: 0=成功, 86101=未扫码, 86090=已扫码未确认, 86038=二维码失效

  const pollUrl = `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${encodeURIComponent(oauthKey)}`

  try {
    console.log(`Polling QR code with URL: ${pollUrl}`)
    const json = await requestJson(pollUrl, 'GET')

    console.log('Poll response:', json)

    // 返回结构：code===0 表示请求成功
    if (json?.code !== 0) {
      console.warn('Poll response code is not 0:', json?.code, json?.message)
      // 服务器返回错误，但不是网络错误，返回 pending 继续等待
      return { status: 'pending', message: json?.message || '服务器错误' }
    }

    // 检查 data.code，这个才是真正的扫码状态
    const code = json.data?.code
    console.log('QR scan status code:', code)

    if (code === 0) {
      // 登录成功！获取 Cookie
      let cookieStr = ''

      // 方法1：从响应头的 Set-Cookie 中获取
      if (json._headers && json._headers['set-cookie']) {
        const setCookieHeader = json._headers['set-cookie']
        console.log('Set-Cookie header found:', setCookieHeader)
        // Set-Cookie 可能是数组或字符串
        if (Array.isArray(setCookieHeader)) {
          // 提取每个 Cookie 的 name=value 部分
          cookieStr = setCookieHeader.map((cookie: string) => {
            const parts = cookie.split(';')[0].trim()
            return parts
          }).join('; ')
        } else if (typeof setCookieHeader === 'string') {
          const parts = setCookieHeader.split(';')[0].trim()
          cookieStr = parts
        }
      }

      // 方法2：备用方案，从 session 读取
      if (!cookieStr) {
        console.log('No Set-Cookie in response headers, trying session.defaultSession.cookies')
        const cookies = await session.defaultSession.cookies.get({ domain: '.bilibili.com' })
        cookieStr = cookies.map((c) => `${c.name}=${c.value}`).join('; ')
      }

      console.log('Login confirmed, cookies obtained:', cookieStr?.substring(0, 50) + '...')

      // 持久化到全局 Cookie
      if (cookieStr) {
        try { setGlobalCookie(cookieStr) } catch (e) {
          console.error('Failed to set global cookie:', e)
        }
      }

      // 通知渲染进程用户信息已更新
      const { BrowserWindow } = await import('electron')
      const wins = BrowserWindow.getAllWindows()
      wins.forEach(win => {
        if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
          win.webContents.send('bili-user-updated')
        }
      })
      return { status: 'confirmed', cookie: cookieStr, message: '登录成功！' }
    } else if (code === 86101) {
      // 未扫码
      return { status: 'pending', message: '等待扫码...' }
    } else if (code === 86090) {
      // 已扫码，等待确认
      return { status: 'scanned', message: '已扫码，请在手机上确认' }
    } else if (code === 86038) {
      // 二维码已失效
      return { status: 'failed', message: '二维码已失效，请重新生成' }
    } else {
      // 其他状态
      return { status: 'pending', message: `状态: ${json.data?.message || code}，继续等待...` }
    }
  } catch (error: any) {
    // 网络错误或 HTTP 错误，记录但继续轮询
    console.error('Poll request failed:', error.message)
    // 返回 pending 让前端继续轮询
    return { status: 'pending', message: `网络错误: ${error.message}，继续尝试...` }
  }
}

export async function fetchUserInfo(): Promise<{ isLogin: boolean; uname?: string; face?: string }> {
  const json = await requestJson('https://api.bilibili.com/x/web-interface/nav')
  if (json?.code === 0) {
    return { isLogin: !!json.data?.isLogin, uname: json.data?.uname, face: json.data?.face }
  }
  return { isLogin: false }
}
