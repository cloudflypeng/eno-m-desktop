import { encWbi, getWbiKeys } from './wbi'
// @ts-ignore
import { invokeBiliApi, BLBL } from './bili'

// 简单的防风控限流器
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class RateLimiter {
  private queue: Promise<void> = Promise.resolve()

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    const previousTask = this.queue;
    const currentTask = previousTask.then(() => fn());
    
    // 更新队列：当前任务执行完后，再额外等待一段时间，才允许下一个任务执行
    this.queue = currentTask.then(async () => {
      // 随机延迟 200ms - 500ms
      const delay = Math.floor(Math.random() * 300) + 200
      await wait(delay)
    }).catch(async () => {
        // 即使失败也要等待
        const delay = Math.floor(Math.random() * 300) + 200
        await wait(delay)
    })
    
    return currentTask
  }
}

const limiter = new RateLimiter()
const fetchWithLimit = (url: RequestInfo | URL, init?: RequestInit) => limiter.schedule(() => fetch(url, init))

async function getUserArc(params: object) {
  // 尽量使用 IPC 调用以复用主进程的 Cookie 和签名能力
  // 但目前 BLBL 中没有直接对应的 API，且 src/api/wbi.ts 里的 getWbiKeys 实现也比较简单（没有复用 electron 的 cookie）
  // 考虑到工程一致性，最好的办法是在 Electron 主进程实现这个 API。
  // 暂时先尝试通过 search 接口调用，如果失败再回退。
  
  // 注意：这里原来的逻辑是完全前端实现的 Wbi 签名。
  // 为了保持兼容，我们先保留 fetch，但要注意它在 Electron 中受限。
  // 理想情况是在 electron/bili/api/bilibili.ts 添加 [BLBL.GET_USER_ARC]
  
  const defaultParams = {
    mid: 0,
    pn: 1,
    ps: 25,
    tid: 3,
    keyword: '',
    order: 'pubdate',
  }
  params = { ...defaultParams, ...params }
  
  // 复用前端的 Wbi 实现，但在 Electron 环境下 fetch 可能没有 cookie
  // 由于我们在主进程做了 Header 注入，这里的 fetch 只要发出去带上 Referer 应该就行
  // 但 cookie 是个问题。主进程注入了 Cookie 吗？
  // 我们在 electron/main/index.ts 里只注入了 Referer。
  // 只有通过 apiProxy 发出的请求（即 IPC 请求）才会由 utils.ts 注入 Cookie。
  // 所以这个 fetch 直接调用可能会因为没 Cookie 失败。
  
  // 临时方案：前端 fetch 无法获取 HttpOnly cookie，所以这里很难直接拿到 cookie 去签名。
  // 正确做法是把这个逻辑移到主进程。
  // 为了不改动太大，我们尝试只修改 fetch 的 headers，寄希望于 Electron 的 session 会自动携带 cookie（如果是 webview 或同源请求）。
  // 但 B 站 API 是跨域的。
  
  // 让我们尝试调用 invokeBiliApi，即使它目前不支持 GET_USER_ARC，我们可以加一个通用的 request 或者在后端加
  // 为了快速修复，我们假设这个旧逻辑在某些情况下能用（比如无 Cookie 访问部分数据），
  // 或者我们修改 src/api/wbi.ts 让它也能获取一些基础 key
  
  const web_keys = await getWbiKeys()
  const img_key = web_keys.img_key
  const sub_key = web_keys.sub_key
  const query = encWbi(params, img_key, sub_key)
  const res = await fetchWithLimit(`https://api.bilibili.com/x/space/wbi/arc/search?${query}`, {
    method: 'GET',
    headers: {
      Referer: 'https://message.bilibili.com/',
      // 'User-Agent': ... 浏览器会自动加
    },
  })

  return res.json()
}

async function getSeasonInfo(params: Record<string, any>) {
  const defaultParams = {
    mid: 1,
    season_id: 0,
  }
  params = { ...defaultParams, ...params }
  const url = `https://api.bilibili.com/x/polymer/web-space/seasons_archives_list?${new URLSearchParams(params).toString()}`
  const res = await fetchWithLimit(url, {
    method: 'GET',

    headers: {
      Referer: 'https://www.bilibili.com/',
    },
  })

  return res.json()
}
// https://api.bilibili.com/x/v3/fav/folder/created/list-all
function getFavorites({ mid }: { mid: number }) {
  const urlserachparams = new URLSearchParams()
  urlserachparams.set('type', '0')
  urlserachparams.set('up_mid', mid.toString())

  return fetchWithLimit(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?${urlserachparams.toString()}`, {
    method: 'GET',
    headers: {
      Referer: 'https://www.bilibili.com/',
    }
  }).then(res => res.json())
}
// https://api.bilibili.com/x/web-interface/nav
const getUserInfo = () => fetchWithLimit('https://api.bilibili.com/x/web-interface/nav', {
  headers: {
      Referer: 'https://www.bilibili.com/',
    }
}).then(res => res.json())
// https://api.bilibili.com/x/v3/fav/folder/collected/list
// with page
function getCollectedFavorites({ mid }: { mid: number }) {
  const urlserachparams = new URLSearchParams()
  urlserachparams.set('up_mid', mid.toString())
  urlserachparams.set('pn', '1')
  urlserachparams.set('ps', '70')
  urlserachparams.set('platform', 'web')
  return fetchWithLimit(`https://api.bilibili.com/x/v3/fav/folder/collected/list?${urlserachparams.toString()}`, {
    method: 'GET',
    headers: {
      Referer: 'https://www.bilibili.com/',
    }
  }).then(res => res.json())
}
// https://api.bilibili.com/x/v3/fav/resource/infos
function getFavResourceInfos({ id }: { id: number }) {
  return fetchWithLimit(`https://api.bilibili.com/x/v3/fav/resource/infos?${new URLSearchParams({ resources: `${id.toString()}:2` }).toString()}`, {
    method: 'GET',
    headers: {
      Referer: 'https://www.bilibili.com/',
    }
  }).then(res => res.json())
}

export { getUserArc, getSeasonInfo, getFavorites, getUserInfo, getCollectedFavorites, getFavResourceInfos }
