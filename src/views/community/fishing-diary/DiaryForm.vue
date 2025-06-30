<template>
  <div class="center">
    <DiaryFormView :editMode="editMode" :diaryId="diaryId" />
  </div>
</template>

<script setup>
import DiaryFormView from "@/views/community/fishing-diary/components/DiaryFormView.vue";
const props = defineProps({
  editMode: Boolean,
  diaryId: [String, Number]
});
</script>

<style>
.center {
  width: 80%;
  margin: 4% auto;
}
</style> 