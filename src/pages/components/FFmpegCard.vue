<script setup lang="ts">
import { computed } from 'vue'

interface FFmpegInfo {
  found?: boolean
  installed?: boolean
  version?: string
  path?: string
}

interface Props {
  ffmpegInfo: FFmpegInfo | null
  ffmpegLoading: boolean
  ffmpegError: string
  downloadingFfmpeg: boolean
  downloadProgress: number
}

const props = defineProps<Props>()
defineEmits<{
  checkFFmpeg: []
  downloadFFmpeg: []
}>()

const isInstalled = computed(() => {
  if (!props.ffmpegInfo) return false
  return props.ffmpegInfo.found !== undefined ? props.ffmpegInfo.found : props.ffmpegInfo.installed || false
})

const statusText = computed(() => {
  if (!props.ffmpegInfo) return '未检测'
  return isInstalled.value ? '已安装' : '未安装'
})

const statusColor = computed(() => {
  if (!props.ffmpegInfo) return 'text-text-tertiary'
  return isInstalled.value ? 'text-[#1db954]' : 'text-orange-400'
})
</script>

<template>
  <div class="card-base card-hover card-interactive rounded-2xl p-8 mb-8">
    <div class="card-overlay rounded-2xl" />
    <div class="card-glow" />
    <div class="relative z-20">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-2 h-8 bg-gradient-to-b from-[#667eea] to-transparent rounded-full" />
        <h2 class="text-heading-1">FFmpeg 工具</h2>
      </div>

      <!-- 状态信息 -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-body-small text-text-tertiary mb-2">安装状态</p>
            <p :class="statusColor" class="text-body font-medium">
              {{ statusText }}
            </p>
          </div>
          <button
            :disabled="ffmpegLoading"
            class="px-4 py-2 rounded-lg bg-[#667eea]/10 hover:bg-[#667eea]/20 text-[#667eea] font-medium transition-colors text-sm"
            @click="$emit('checkFFmpeg')"
          >
            {{ ffmpegLoading ? '检测中...' : '重新检测' }}
          </button>
        </div>

        <!-- 版本信息 -->
        <div v-if="isInstalled" class="mb-4 space-y-2">
          <div>
            <p class="text-body-small text-text-tertiary mb-1">版本</p>
            <p class="text-body text-white font-mono">{{ ffmpegInfo?.version || '未知' }}</p>
          </div>
          <div>
            <p class="text-body-small text-text-tertiary mb-1">路径</p>
            <p class="text-xs text-text-secondary font-mono break-all bg-[#282828] p-2 rounded">
              {{ ffmpegInfo?.path || '未知' }}
            </p>
          </div>
        </div>

        <!-- 下载进度 -->
        <div v-if="downloadingFfmpeg" class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-text-tertiary">下载进度</span>
            <span class="text-sm text-white">{{ Math.round(downloadProgress) }}%</span>
          </div>
          <div class="w-full h-2 bg-[#282828] rounded-full overflow-hidden">
            <div class="h-full bg-[#667eea] transition-all" :style="{ width: downloadProgress + '%' }" />
          </div>
        </div>

        <!-- 下载按钮 -->
        <div v-if="!isInstalled && !downloadingFfmpeg" class="mb-4">
          <button class="btn-primary w-full" @click="$emit('downloadFFmpeg')">
            <div class="flex items-center justify-center gap-2">
              <span class="i-mingcute:download-line" />
              <span>下载 FFmpeg</span>
            </div>
          </button>
        </div>

        <!-- 错误信息 -->
        <div v-if="ffmpegError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p class="text-xs text-red-400">{{ ffmpegError }}</p>
        </div>
      </div>

      <!-- 说明信息 -->
      <div class="p-4 rounded-lg bg-[#667eea]/5 border border-[#667eea]/10">
        <div class="flex gap-3">
          <div class="i-mingcute:information-line text-[#667eea] text-lg flex-shrink-0 mt-0.5" />
          <div class="text-sm">
            <p class="font-medium text-white mb-2">关于 FFmpeg：</p>
            <ul class="space-y-1 text-text-secondary text-xs">
              <li>• FFmpeg 是一个强大的多媒体框架，用于处理音视频</li>
              <li>• 本应用使用 FFmpeg 进行音频转码和处理</li>
              <li>• 系统未检测到 FFmpeg 时，可点击下载自动安装</li>
              <li>• 也可以自行安装到系统环境变量中</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="card-border-glow rounded-2xl" />
  </div>
</template>
