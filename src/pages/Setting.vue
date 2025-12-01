<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDownloadStore } from '~/store/downloadStore'
import Message from '~/components/message'

const downloadStore = useDownloadStore()

// 更新检查状态
const checkingUpdate = ref(false)
const downloadingUpdate = ref(false)
const downloadProgress = ref(0)
const updateAvailable = ref(false)
const currentVersion = ref('')
const latestVersion = ref('')
const releaseNotes = ref('')
const updateError = ref('')
const updateChecked = ref(false)

const downloadPathDisplay = computed(() => {
  return downloadStore.config.downloadPath || '未设置（使用默认目录）'
})

async function selectDownloadPath() {
  try {
    const result = await (window as any).ipcRenderer.invoke('select-directory')
    if (result.success && result.path) {
      downloadStore.setDownloadPath(result.path)
      Message.show({
        type: 'success',
        message: `下载目录已设置为：${result.path}`,
      })
    }
  } catch (error) {
    console.error(error)
    Message.show({
      type: 'error',
      message: '选择目录失败',
    })
  }
}

function resetDownloadPath() {
  downloadStore.resetConfig()
  Message.show({
    type: 'success',
    message: '已重置为默认设置',
  })
}

// 检查更新
async function checkForUpdates() {
  checkingUpdate.value = true
  updateError.value = ''
  updateChecked.value = false

  try {
    const result = await (window as any).ipcRenderer?.invoke('check-for-updates')

    if (result?.success) {
      currentVersion.value = result.currentVersion
      latestVersion.value = result.latestVersion
      releaseNotes.value = result.releaseNotes || ''
      updateAvailable.value = result.updateAvailable
      updateChecked.value = true

      if (result.updateAvailable) {
        Message.show({
          type: 'success',
          message: `发现新版本 ${result.latestVersion}`,
        })
      } else {
        Message.show({
          type: 'info',
          message: '已是最新版本',
        })
      }
    } else {
      updateError.value = result?.error || '检查更新失败'
      Message.show({
        type: 'error',
        message: updateError.value,
      })
    }
  } catch (error: any) {
    updateError.value = error.message || '检查更新出错'
    Message.show({
      type: 'error',
      message: updateError.value,
    })
  } finally {
    checkingUpdate.value = false
  }
}

// 下载并安装更新
async function downloadAndInstallUpdate() {
  downloadingUpdate.value = true
  updateError.value = ''
  downloadProgress.value = 0

  try {
    const result = await (window as any).ipcRenderer?.invoke('download-and-install-update')

    if (result?.success) {
      Message.show({
        type: 'success',
        message: '更新已下载，安装程序即将启动',
      })
      // 安装程序会自动启动
    } else {
      updateError.value = result?.error || '下载更新失败'
      Message.show({
        type: 'error',
        message: updateError.value,
      })
    }
  } catch (error: any) {
    updateError.value = error.message || '下载更新出错'
    Message.show({
      type: 'error',
      message: updateError.value,
    })
  } finally {
    downloadingUpdate.value = false
  }
}

// 获取应用版本
async function initVersion() {
  try {
    const versionInfo = await (window as any).ipcRenderer?.invoke('get-app-version')
    if (versionInfo) {
      currentVersion.value = `v${versionInfo.version}`
    }
  } catch (error) {
    console.error('Failed to get app version:', error)
  }
}

// 组件挂载时获取版本
onMounted(() => {
  initVersion()
})
</script>

<template>
  <div class="page-inner relative">
    <!-- 顶部架构效果 -->
    <div class="fixed top-0 left-[280px] right-0 h-40 bg-gradient-to-b from-[#1db954]/5 via-[#121212]/20 to-[#121212] pointer-events-none z-0" />
    
    <!-- 内容区域 -->
    <div class="relative z-10 max-w-4xl">
      <!-- 页面标题 -->
      <div class="mb-12 mt-4">
        <h1 class="text-display mb-2">设置</h1>
        <p class="text-body-small">自定义你的下载和应用配置</p>
      </div>

      <!-- 关于应用卡片 -->
      <div class="card-base card-hover card-interactive rounded-2xl p-8 mb-8">
        <!-- 卡片背景 -->
        <div class="card-overlay rounded-2xl" />
        <div class="card-glow" />

        <!-- 内容 -->
        <div class="relative z-20">
          <!-- 标题 -->
          <div class="flex items-center gap-3 mb-8">
            <div class="w-2 h-8 bg-gradient-to-b from-[#667eea] to-transparent rounded-full" />
            <h2 class="text-heading-1">关于应用</h2>
          </div>

          <!-- 版本信息 -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-body-small text-text-tertiary mb-2">当前版本</p>
                <p class="text-heading-2">{{ currentVersion }}</p>
              </div>
            </div>

            <!-- 检查更新按钮 -->
            <button
              @click="checkForUpdates"
              :disabled="checkingUpdate || downloadingUpdate"
              class="btn-primary w-full mb-4"
              :class="{ 'opacity-50 cursor-not-allowed': checkingUpdate || downloadingUpdate }"
            >
              <div class="flex items-center justify-center gap-2">
                <span v-if="checkingUpdate" class="i-mingcute:loading-3-line animate-spin" />
                <span v-else class="i-mingcute:refresh-2-line" />
                <span>{{ checkingUpdate ? '检查中...' : '检查更新' }}</span>
              </div>
            </button>

            <!-- 检查结果 -->
            <div v-if="updateChecked && !updateError" class="mb-4">
              <div v-if="updateAvailable" class="p-4 rounded-lg bg-[#667eea]/10 border border-[#667eea]/20">
                <div class="flex items-start gap-3 mb-4">
                  <div class="i-mingcute:information-line text-[#667eea] text-lg flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <p class="font-medium text-white mb-2">发现新版本</p>
                    <p class="text-sm text-text-secondary mb-4">
                      新版本 <span class="text-[#667eea] font-medium">{{ latestVersion }}</span> 现已可用
                    </p>

                    <!-- 版本说明 -->
                    <div v-if="releaseNotes" class="mb-4 p-3 bg-black/30 rounded border border-[#667eea]/10">
                      <p class="text-xs font-medium text-text-tertiary mb-2">更新说明：</p>
                      <p class="text-xs text-text-secondary line-clamp-3">{{ releaseNotes }}</p>
                    </div>

                    <!-- 下载进度 -->
                    <div v-if="downloadingUpdate" class="mb-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs text-text-tertiary">下载进度</span>
                        <span class="text-xs font-medium text-[#667eea]">{{ downloadProgress }}%</span>
                      </div>
                      <div class="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300"
                          :style="{ width: downloadProgress + '%' }"
                        />
                      </div>
                    </div>

                    <!-- 更新按钮 -->
                    <button
                      @click="downloadAndInstallUpdate"
                      :disabled="downloadingUpdate"
                      class="btn-primary w-full"
                      :class="{ 'opacity-50 cursor-not-allowed': downloadingUpdate }"
                    >
                      <div class="flex items-center justify-center gap-2">
                        <span v-if="downloadingUpdate" class="i-mingcute:loading-3-line animate-spin" />
                        <span v-else class="i-mingcute:download-line" />
                        <span>{{ downloadingUpdate ? '下载中...' : '立即更新' }}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="p-4 rounded-lg bg-[#1db954]/10 border border-[#1db954]/20">
                <div class="flex items-center gap-3">
                  <div class="i-mingcute:check-circle-line text-[#1db954] text-lg" />
                  <p class="text-sm">已是最新版本 ✓</p>
                </div>
              </div>
            </div>

            <!-- 错误提示 -->
            <div v-if="updateError" class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <div class="flex items-start gap-3">
                <div class="i-mingcute:close-circle-line text-red-500 text-lg flex-shrink-0 mt-0.5" />
                <p class="text-sm text-red-400">{{ updateError }}</p>
              </div>
            </div>
          </div>

          <!-- 说明信息 -->
          <div class="p-4 rounded-lg bg-[#667eea]/5 border border-[#667eea]/10">
            <div class="flex gap-3">
              <div class="i-mingcute:information-line text-[#667eea] text-lg flex-shrink-0 mt-0.5" />
              <div class="text-sm">
                <p class="font-medium text-white mb-2">更新说明：</p>
                <ul class="space-y-1 text-text-secondary text-xs">
                  <li>• 应用会自动检查 GitHub Releases 中的最新版本</li>
                  <li>• 更新将从 GitHub 下载，可能需要稳定的网络连接</li>
                  <li>• 下载完成后安装程序会自动启动</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 边框光晕 -->
        <div class="card-border-glow rounded-2xl" />
      </div>

      <!-- 下载设置卡片 -->
      <div class="card-base card-hover card-interactive rounded-2xl p-8 mb-8">
        <!-- 卡片背景 -->
        <div class="card-overlay rounded-2xl" />
        <div class="card-glow" />

        <!-- 内容 -->
        <div class="relative z-20">
          <!-- 标题 -->
          <div class="flex items-center gap-3 mb-8">
            <div class="w-2 h-8 bg-gradient-to-b from-[#1db954] to-transparent rounded-full" />
            <h2 class="text-heading-1">下载设置</h2>
          </div>

          <!-- 下载路径 -->
          <div class="mb-8">
            <label class="text-body font-medium mb-4 block">下载位置</label>
            <div class="flex gap-3 mb-4">
              <button
                class="btn-secondary flex-1"
                @click="selectDownloadPath"
              >
                <div class="flex items-center justify-center gap-2">
                  <div class="i-mingcute:folder-open-fill" />
                  <span>{{ downloadStore.config.downloadPath ? '更改位置' : '选择位置' }}</span>
                </div>
              </button>
              <button
                v-if="downloadStore.config.downloadPath"
                class="btn-secondary"
                @click="resetDownloadPath"
              >
                <div class="flex items-center gap-2">
                  <span class="i-mingcute:refresh-2-line" />
                  重置
                </div>
              </button>
            </div>
            
            <!-- 当前路径显示 -->
            <div class="p-4 rounded-lg bg-[#1a1a1a] border border-[#404040] text-mono text-sm">
              <p class="text-text-tertiary text-xs mb-2">当前下载位置：</p>
              <p class="text-white break-all font-mono">
                {{ downloadPathDisplay }}
              </p>
            </div>
          </div>

          <!-- 按歌手创建文件夹 -->
          <div class="mb-8">
            <label class="flex items-center gap-4 cursor-pointer group">
              <input
                v-model="downloadStore.config.createAuthorFolder"
                type="checkbox"
                class="w-5 h-5 rounded cursor-pointer accent-[#1db954]"
              >
              <div>
                <span class="text-body font-medium group-hover:text-white transition-colors">
                  按歌手名称创建文件夹
                </span>
                <p class="text-text-tertiary text-sm mt-1">
                  启用时，下载的歌曲将按歌手名称创建子文件夹保存
                </p>
              </div>
            </label>
          </div>

          <!-- 说明信息 -->
          <div class="p-4 rounded-lg bg-[#1db954]/10 border border-[#1db954]/20">
            <div class="flex gap-3">
              <div class="i-mingcute:information-line text-[#1db954] text-lg flex-shrink-0 mt-0.5" />
              <div class="text-sm">
                <p class="font-medium text-white mb-3">使用说明：</p>
                <ul class="space-y-2 text-text-secondary">
                  <li>• 未设置位置时，默认保存到 <code class="bg-black/30 px-2 py-1 rounded">~/Downloads/eno-music</code></li>
                  <li>• 启用文件夹后，目录结构为：<code class="bg-black/30 px-2 py-1 rounded">下载目录/歌手名/歌曲.mp3</code></li>
                  <li>• 下载功能需要安装 FFmpeg</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 边框光晕 -->
        <div class="card-border-glow rounded-2xl" />
      </div>
    </div>
  </div>
</template>

