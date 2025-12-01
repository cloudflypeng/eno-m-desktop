<script setup>
import { useDownloadStore } from '~/store/downloadStore'
import Message from '~/components/message'

const downloadStore = useDownloadStore()

const downloadPathDisplay = computed(() => {
  return downloadStore.config.downloadPath || '未设置（使用默认目录）'
})

async function selectDownloadPath() {
  try {
    const result = await window.ipcRenderer.invoke('select-directory')
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

