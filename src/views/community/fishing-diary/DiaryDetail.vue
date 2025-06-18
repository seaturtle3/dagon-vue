<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DiaryDetailItem from "@/views/community/fishing-diary/components/DiaryDetailItem.vue";
import {useFishingDiaryStore} from "@/store/fishing-center/useFishingDiaryStore.js";

const store = useFishingDiaryStore()
const route = useRoute()
const id = route.params.fdId

onMounted(async () => {
  await store.fetchDiaryById(id)
})

</script>

<template>
  <div class="center" >
    <DiaryDetailItem :diary="store.currentDiary" v-if="store.currentDiary"/>
    <p v-else>조행기를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>