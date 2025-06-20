<script setup>
import {ref} from 'vue'
import ReportFormView from "@/views/community/fishing-report/components/ReportFormView.vue";
import {useFishingReportStore} from "@/store/fishing-center/useFishingReportStore.js";

const fishingReportStore = useFishingReportStore()

const dto = ref({
  title: '',
  content: '',
  location: '',
  // 필요한 필드들 추가
})

const images = ref([]) // File[]

const loading = ref(false)
const error = ref(null)
const thumbnail = ref(null)

async function onSubmit() {
  loading.value = true
  error.value = null

  try {
    const createdReport = await fishingReportStore.createFishingReport(dto.value, images.value)
    alert('조황정보가 생성되었습니다!')
    // 필요하면 라우팅 이동 또는 초기화
  } catch (e) {
    error.value = '조황정보 생성 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

function onThumbnailChange(file) {
  thumbnail.value = file
}

function onFileChange(event) {
  images.value = Array.from(event.target.files)
}

const formData = new FormData()
formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))

if (thumbnail.value) {
  formData.append('thumbnail', thumbnail.value)
}

images.value.forEach((file, idx) => {
  formData.append('images', file)
})
</script>

<template>
  <div class="center">
    <ReportFormView
        :dto="dto"
        :thumbnail="thumbnail"
        :images="images"
        :loading="loading"
        :error="error"
        @thumbnail-change="onThumbnailChange"
        @file-change="onFileChange"
        @submit="onSubmit"
    />
  </div>
</template>

<style>
.center {
  width: 80%;
  margin: 4% auto;
}
</style>