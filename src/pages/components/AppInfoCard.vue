<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentVersion: string
  latestVersion: string
  releaseNotes: string
  updateAvailable: boolean
  updateChecked: boolean
  checkingUpdate: boolean
  downloadingUpdate: boolean
  downloadProgress: number
  updateError: string
}

const props = defineProps<Props>()
defineEmits<{
  checkUpdates: []
  downloadUpdate: []
}>()

const updateStatusText = computed(() => {
  if (!props.updateChecked) return '检查更新'
  if (props.updateAvailable) return '发现新版本'
  return '已是最新版本'
})

const updateStatusColor = computed(() => {
  if (!props.updateChecked) return 'text-text-tertiary'
  if (props.updateAvailable) return 'text-[#ffa500]'
  return 'text-[#1db954]'
})
</script>

<template>
  <div class="card-base card-hover card-interactive rounded-2xl p-8 mb-8">
    <div class="card-overlay rounded-2xl" />
    <div class="card-glow" />
    <div class="relative z-20">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-2 h-8 bg-gradient-to-b from-[#1db954] to-transparent rounded-full" />
        <h2 class="text-heading-1">关于应用</h2>
      </div>

      <!-- 版本信息 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-body-small text-text-tertiary mb-2">当前版本</p>
            <p class="text-body">{{ currentVersion }}</p>
          </div>
          <button
            :disabled="checkingUpdate"
            :class="updateStatusColor"
            class="text-sm font-medium transition-colors"
            @click="$emit('checkUpdates')"
          >
            {{ updateStatusText }}
          </button>
        </div>
        
        <div v-if="updateAvailable" class="mb-4">
          <p class="text-body-small text-text-tertiary mb-2">最新版本</p>
          <p class="text-body text-[#ffa500]">{{ latestVersion }}</p>
        </div>

        <!-- 更新进度 -->
        <div v-if="downloadingUpdate" class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-tertiary">下载进度</span>
            <span class="text-sm text-white">{{ Math.round(downloadProgress) }}%</span>
          </div>
          <div class="w-full h-2 bg-[#282828] rounded-full overflow-hidden">
            <div class="h-full bg-[#1db954] transition-all" :style="{ width: downloadProgress + '%' }" />
          </div>
        </div>

        <!-- 更新按钮 -->
        <div v-if="updateAvailable && !downloadingUpdate" class="mb-4">
          <button class="btn-primary w-full" @click="$emit('downloadUpdate')">
            <div class="flex items-center justify-center gap-2">
              <span class="i-mingcute:download-line" />
              <span>下载更新</span>
            </div>
          </button>
        </div>

        <!-- 错误信息 -->
        <div v-if="updateError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p class="text-xs text-red-400">{{ updateError }}</p>
        </div>

        <!-- 发布说明 -->
        <div v-if="releaseNotes" class="mt-4 p-3 rounded-lg bg-[#667eea]/5 border border-[#667eea]/10">
          <p class="text-sm font-medium text-white mb-2">发布说明</p>
          <p class="text-xs text-text-secondary whitespace-pre-wrap">{{ releaseNotes }}</p>
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
    <div class="card-border-glow rounded-2xl" />
  </div>
</template>
