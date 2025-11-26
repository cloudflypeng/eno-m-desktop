import { BLBL } from '../../electron/bili/msg.define'

interface BiliApiParams {
  [key: string]: any
}

export const invokeBiliApi = async (query: BLBL, params: BiliApiParams = {}) => {
  // @ts-ignore
  const ipcRenderer = window.ipcRenderer
  
  if (!ipcRenderer) {
    console.warn('ipcRenderer is not available. Are you running in Electron?')
    return Promise.reject(new Error('ipcRenderer not available'))
  }

  return ipcRenderer.invoke('bili-api', {
    contentScriptQuery: query,
    ...params
  })
}

export { BLBL }

