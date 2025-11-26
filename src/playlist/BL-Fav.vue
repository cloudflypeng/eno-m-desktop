<script lang="ts" setup>
import type { song } from '~/playlist/store'
import SongItem from '~/components/SongItem.vue'
// @ts-ignore
import { invokeBiliApi, BLBL } from '~/api/bili'

import { useBlblStore } from '~/blbl/store'
import { usePlaylistStore } from '~/playlist/store'
import { inject } from 'vue'

const props = defineProps<{
  fav: fav
}>()

const store = useBlblStore()
const PLStore = usePlaylistStore()
const userInfo = inject('userInfo') as any

const pn = ref(1)
const mediaSong = ref<song[]>([])
const status = reactive({
  loading: false,
  error: false,
  open: false,
})

interface fav {
  attr: number
  fav_state: number
  fid: number
  id: number
  mid: number
  title: string
  media_count: number
}

async function handleClick() {
  if (status.open) {
    status.open = false
    return
  }
  if (mediaSong.value.length > 0) {
    status.open = !status.open
    return
  }
  status.loading = true
  status.open = true
  pn.value = 1
  mediaSong.value = []
  getFavDataLoop()
}

async function getFavDataLoop() {
  try {
    const res = await invokeBiliApi(BLBL.GET_FAV_INFO, {
      media_id: props.fav.id,
      pn: pn.value,
    })

    const { info, medias } = res.data

    if (Array.isArray(medias)) {
      medias.forEach((element: any) => {
        // 防止重复添加
        if (!mediaSong.value.some(s => s.id === (element.bvid || element.bv_id))) {
            mediaSong.value.push({
            title: element.title,
            description: element.intro,
            eno_song_type: 'bvid',
            cover: element.cover,
            author: element.upper.name,
            duration: element.duration,
            id: element.bvid || element.bv_id,
            bvid: element.bvid || element.bv_id,
            aid: element.id, // avid
          })
        }
      })
    }

    if (mediaSong.value.length < info.media_count && medias && medias.length > 0) {
      pn.value++
      getFavDataLoop()
    }
  } catch (error) {
    console.error('Failed to load fav list:', error)
  }
}

function handleReplacePlaylist() {
  store.play = mediaSong.value[0]
  store.playList = [...mediaSong.value]
}

function handleRemoveSong(song: song) {
    PLStore.removeSongFromFav(props.fav.id, song).then(() => {
        // 本地移除
        const idx = mediaSong.value.findIndex(s => s.id === song.id)
        if (idx > -1) mediaSong.value.splice(idx, 1)
    })
}

// 判断是否是当前用户的收藏夹
const isOwner = computed(() => {
    return userInfo.value && userInfo.value.mid && String(userInfo.value.mid) === String(props.fav.mid)
})
</script>

<template>
  <div
    class="mb-2 has-border rounded-lg transition-all duration-200 bg-[#282828] hover:bg-[#333]"
  >
    <div
      class="w-full flex justify-between items-center cursor-pointer p-3"
      @click="handleClick"
    >
      <div class="flex items-center gap-3 text-lg text-gray-200">
        <div :class="`w-5 h-5 ${status.open ? 'i-mingcute:folder-open-2-fill' : 'i-mingcute:folder-fill'}`" />
        <h2 class="max-w-[50vw] truncate font-bold" v-html="props.fav.title" />
        <span class="text-sm text-gray-500">({{ props.fav.media_count }})</span>
      </div>
      <div class="flex gap-3 text-xl text-gray-400">
        <div
          class="i-mingcute:play-circle-line hover:text-[#1db954] transition-colors"
          @click.stop="handleReplacePlaylist"
        />
      </div>
    </div>
    <div v-if="status.open" class="flex flex-col gap-1 max-h-[500px] overflow-y-auto scrollbar-styled px-2 pb-2">
      <SongItem 
        v-for="song in mediaSong" 
        :key="song.id" 
        :song="song" 
        size="mini" 
        :del="isOwner"
        class="hover:bg-[#ffffff1a] rounded"
        @delete-song="handleRemoveSong"
      />
      <div v-if="mediaSong.length === 0" class="text-center text-gray-500 py-4 text-sm">
        暂无内容
      </div>
    </div>
  </div>
</template>
