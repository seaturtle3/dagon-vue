<script setup>
import BoardDetailBox from "@/components/common/BoardDetailBox.vue";
import BoardContent from "@/components/common/BoardContent.vue";
import BoardDetailAction from "@/components/common/BoardDetailAction.vue";
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const eventId = route.params.id
const event = ref(null)

onMounted(async () => {
  const res = await axios.get(`/api/event/${eventId}`)
  event.value = res.data
})
</script>

<template>
  <BoardDetailBox v-if="event">
    <template #title>{{ event.title }}</template>
    <template #info>
      {{ event.startAt }} ~ {{ event.endAt }} / 작성자: {{ event.adminName }}
    </template>
    <template #content>
      <div class="text-danger">✅ 이 영역이 보여야 content도 보입니다</div>
      <div v-html="event.content" />
    </template>
    <template #action>
      <BoardDetailAction :editUrl="`/event/edit/${event.eventId}`" />
    </template>
  </BoardDetailBox>
</template>

<style scoped>

</style>