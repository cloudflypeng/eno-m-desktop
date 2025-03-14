<script setup>
import cn from 'classnames'

const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
  open: Boolean,
  class: String,
})
const emit = defineEmits(['click'])
const { tab } = props

const tabClass = computed(() => {
  // const isCurrentMode = store.mode === tab.mode
  const isCurrentMode = false
  const baseClass = 'tab-item flex w-full gap-2 text-2xl items-center h-10 cursor-pointer rounded-2 pl-3 duration-150'
  return `${cn(baseClass, {
    // 'justify-center': !props.open,
    'bg-$eno-fill-4': isCurrentMode,
    'hover:bg-$eno-fill-2 ': !isCurrentMode,
  })} ${props.class}`
})

</script>

<template>
  <router-link :to="`/${tab.mode}`">
    <div :class="tabClass">
      <div :class="tab.icon" class="text-[20px]" />
      <span v-if="open && tab.title" class="text-[14px]">{{ tab.title }}</span>
      <slot />
    </div>
  </router-link>
</template>
