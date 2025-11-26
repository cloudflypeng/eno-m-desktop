<script setup>
import cn from 'classnames'
import { ref, watch, onMounted, computed, useSlots } from 'vue'

const props = defineProps({
  open: Boolean,
  title: String,
})
const emit = defineEmits(['visibleChange'])
const slots = useSlots()
const dialogRef = ref(null)

watch(() => props.open, (open) => {
  if (open) {
    dialogRef.value?.showModal()
    document.body.style.overflow = 'hidden' // 防止背景滚动
  } else {
    dialogRef.value?.close()
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  dialogRef.value?.addEventListener('close', () => {
    emit('visibleChange', false)
    document.body.style.overflow = ''
  })
})

function close() {
  emit('visibleChange', false)
}

function clickDialog(e) {
  const rect = dialogRef.value.getBoundingClientRect()
  const isInDialog = 
    rect.top <= e.clientY && 
    e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX && 
    e.clientX <= rect.left + rect.width
  
  if (!isInDialog) {
    close()
  }
}

// 判断是否有footer
const hasFooter = computed(() => !!slots.footer)
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef" 
      class="backdrop:bg-black/60 backdrop:backdrop-blur-sm bg-[#282828] text-white rounded-xl p-0 shadow-2xl w-[480px] max-w-[90vw] border border-white/10 focus:outline-none"
      @click="clickDialog"
    >
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-6 pb-4">
        <h3 class="text-xl font-bold leading-6 text-white">
          {{ props.title }}
        </h3>
        <button 
          class="rounded-full p-1 hover:bg-white/10 transition-colors cursor-pointer"
          @click.stop="close"
        >
          <div class="i-mingcute:close-line w-6 h-6 text-gray-400 hover:text-white" />
        </button>
      </div>

      <!-- 内容区域 -->
      <div :class="cn('px-6 overflow-y-auto custom-scrollbar', hasFooter ? 'pb-4' : 'pb-6')">
        <slot />
      </div>

      <!-- 底部区域 -->
      <div v-if="hasFooter" class="px-6 pb-6 pt-2 flex justify-end gap-3">
        <slot name="footer" />
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  animation: zoomIn 0.2s ease-out;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.7);
  animation: fadeIn 0.2s ease-out;
}

/* 隐藏默认的 dialog 样式 */
dialog:not([open]) {
  display: none;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
