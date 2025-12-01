import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface DownloadConfig {
  downloadPath: string
  createAuthorFolder: boolean
}

export const useDownloadStore = defineStore('download', {
  state: () => ({
    config: useLocalStorage('download-config', {
      downloadPath: '',
      createAuthorFolder: true,
    } as DownloadConfig),
  }),

  getters: {
    getDownloadPath(): string {
      return this.config.downloadPath
    },
    getCreateAuthorFolder(): boolean {
      return this.config.createAuthorFolder
    },
  },

  actions: {
    setDownloadPath(path: string) {
      this.config.downloadPath = path
    },
    setCreateAuthorFolder(value: boolean) {
      this.config.createAuthorFolder = value
    },
    resetConfig() {
      this.config.downloadPath = ''
      this.config.createAuthorFolder = true
    },
  },
})
