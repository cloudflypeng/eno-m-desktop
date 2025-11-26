// 对于fetch的常见后处理
// 1. 直接返回data
// 2. json化后返回data

type FetchAfterHandler = ((data: Response) => Promise<any>) | ((data: any) => any)

async function toJsonHandler(data: Response): Promise<any> {
  const text = await data.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('JSON Parse Error. Response text:', text)
    throw new Error(`Response is not JSON: ${text.slice(0, 100)}...`)
  }
}
function toData(data: Promise<any>): Promise<any> {
  return data
}

// if need sendResponse, use this
// return a FetchAfterHandler function
function sendResponseHandler(sendResponse: any) {
  return (data: any) => sendResponse(data)
}

// 定义后处理流
const AHS: {
  J: FetchAfterHandler[]
  J_D: FetchAfterHandler[]
  J_S: FetchAfterHandler[]
  S: FetchAfterHandler[]
} = {
  J: [toJsonHandler],
  J_D: [toJsonHandler, toData],
  J_S: [toJsonHandler, sendResponseHandler],
  S: [sendResponseHandler],
}

interface Message {
  contentScriptQuery: string
  [key: string]: any
}

interface _FETCH {
  method: string
  headers?: {
    [key: string]: any
  }
  body?: any
}

interface API {
  url: string
  _fetch: _FETCH
  params?: {
    [key: string]: any
  }
  afterHandle: ((response: Response) => Response | Promise<Response>)[]
}
// 重载API 可以为函数
type APIFunction = (message: Message, sender?: any, sendResponse?: any) => any
type APIType = API | APIFunction
interface APIMAP {
  [key: string]: APIType
}
import { getGlobalCookie } from './cookie'
import { encWbi, getWbiKeys } from './wbi'

// ... existing imports

// 工厂函数API_LISTENER_FACTORY
function apiListenerFactory(API_MAP: APIMAP) {
  return async (message: Message, sender?: any, sendResponse?: any) => {
    const contentScriptQuery = message.contentScriptQuery
    // 检测是否有contentScriptQuery
    if (!contentScriptQuery || !API_MAP[contentScriptQuery])
      return console.error(`Cannot find this contentScriptQuery: ${contentScriptQuery}`)
    if (API_MAP[contentScriptQuery] instanceof Function)
      return (API_MAP[contentScriptQuery] as APIFunction)(message, sender, sendResponse)

    try {
      let { contentScriptQuery, ...rest } = message
      // rest above two part body or params
      rest = rest || {}

      let { _fetch, url, params = {}, afterHandle } = API_MAP[contentScriptQuery] as API
      const { method, headers, body } = _fetch as _FETCH
      const isGET = method.toLocaleLowerCase() === 'get'
      // merge params and body
      let targetParams = Object.assign({}, params)
      let targetBody = Object.assign({}, body)
      Object.keys(rest).forEach((key) => {
        if (body && body[key] !== undefined)
          targetBody[key] = rest[key]
        else
          targetParams[key] = rest[key]
      })

      const cookie = getGlobalCookie()
      
      // Wbi 签名处理: 只有部分接口需要，且通常在 params 中
      // 这里我们简单判断一下，如果是 SEARCH 相关的，尝试加上 wbi 签名
      // 或者我们可以统一尝试加 wbi，或者在 API 定义里加标记
      // 简单起见，我们在所有 GET 请求且 url 包含特定的 path 时加上 wbi
      const needWbi = url.includes('/x/web-interface/search/type') || url.includes('/x/space/wbi')
      
      let queryString = ''

      if (needWbi) {
         const keys = await getWbiKeys(cookie)
         if (keys.img_key && keys.sub_key) {
           queryString = encWbi(targetParams, keys.img_key, keys.sub_key)
         } else {
            // 降级处理
           const urlParams = new URLSearchParams()
           for (const key in targetParams) {
             if (targetParams[key])
               urlParams.append(key, targetParams[key])
           }
           queryString = urlParams.toString()
         }
      } else {
        // generate params normal
        if (Object.keys(targetParams).length) {
          const urlParams = new URLSearchParams()
          for (const key in targetParams) {
            if (targetParams[key])
              urlParams.append(key, targetParams[key])
          }
          queryString = urlParams.toString()
        }
      }

      if (queryString) {
        url += `?${queryString}`
      }

      // generate body
      if (!isGET) {
        targetBody = (headers && headers['Content-Type'] && headers['Content-Type'].includes('application/x-www-form-urlencoded'))
          ? new URLSearchParams(targetBody)
          : JSON.stringify(targetBody)
      }
      // get cant take body
      const fetchOpt: any = { 
        method, 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com/',
          'Cookie': cookie,
          ...headers 
        }
      }
// ...

      if (!isGET) {
        Object.assign(fetchOpt, { body: targetBody })
      }
// ... existing code


      // fetch and after handle
      let baseFunc = fetch(url, fetchOpt)
      afterHandle.forEach((func) => {
        if (func.name === sendResponseHandler.name && sendResponse)
          // sendResponseHandler 是一个特殊的后处理函数，需要传入sendResponse
          baseFunc = baseFunc.then(sendResponseHandler(sendResponse))
        else
          baseFunc = baseFunc.then(func)
      })
      baseFunc.catch(console.error)
      return baseFunc
    }
    catch (e) {
      console.error(e)
    }
  }
}

export {
  type FetchAfterHandler,
  toJsonHandler,
  toData,
  sendResponseHandler,
  AHS,
  type Message,
  type _FETCH,
  type API,
  type APIMAP,
  apiListenerFactory,
}
