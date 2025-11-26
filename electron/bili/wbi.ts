// Wbi 签名相关逻辑
import md5 from 'md5'

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
]

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig: string) => mixinKeyEncTab.map(n => orig[n]).join('').slice(0, 32)

// 为请求参数进行 wbi 签名
export function encWbi(params: Record<string, any>, img_key: string, sub_key: string) {
  const mixin_key = getMixinKey(img_key + sub_key)
  const curr_time = Math.round(Date.now() / 1000)
  const chr_filter = /[!'()*]/g

  // 1. 过滤 value 中的特殊字符，合并 wts
  const query = Object.keys(params)
    .sort() // Key 排序
    .map((key) => {
      let value = params[key]
      if (typeof value === 'string') {
        value = value.replace(chr_filter, '')
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')
    
  const wbi_params = `${query}&wts=${curr_time}`
  // 2. 计算 w_rid
  const w_rid = md5(wbi_params + mixin_key)
  return `${wbi_params}&w_rid=${w_rid}`
}

// 获取 Wbi Keys
export async function getWbiKeys(cookie: string) {
  try {
    const res = await fetch('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Cookie': cookie
      }
    })
    const json = await res.json()
    
    const img_url = json.data.wbi_img.img_url
    const sub_url = json.data.wbi_img.sub_url
    
    return {
      img_key: img_url.substring(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.')),
      sub_key: sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'))
    }
  } catch (error) {
    console.error('Failed to get Wbi keys:', error)
    // 返回默认 key 或抛出异常
    return { img_key: '', sub_key: '' }
  }
}

