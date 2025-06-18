<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  dto: Object,
  images: Array,
  loading: Boolean,
  error: String,
})

const emit = defineEmits(['thumbnail-change', 'file-change', 'submit'])

function onThumbnailChange(event) {
  const file = event.target.files[0]
  emit('thumbnail-change', file)
}
</script>

<template>
  <div class="detail-container editor-wrapper">
    <h2 class="text-center mb-4 fw-bold">조황 등록</h2>
    <hr class="my-4"/>

    <form @submit.prevent="emit('submit')">
      <!-- 제목 -->
      <div class="mb-3">
        <label class="form-label">제목</label>
        <input v-model="dto.title" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">대표 썸네일 사진</label>
        <input type="file" accept="image/*" class="form-control" @change="onThumbnailChange" />
      </div>

      <!-- 내용 (Quill 에디터) -->
      <div class="mb-3">
        <label class="form-label">내용</label>
        <QuillEditor v-model="dto.content" class="quill-editor" />
      </div>

      <!-- 사진 -->
      <div class="mb-3">
        <label class="form-label">추가 사진</label>
        <input type="file" multiple class="form-control" @change="emit('file-change', $event)" />
      </div>

      <!-- 에러 -->
      <p v-if="error" class="text-danger">{{ error }}</p>

      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? '등록 중...' : '등록하기' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.editor-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.quill-editor {
  height: 300px;
}

/* scoped 스타일 안에서 quill 내부 요소 스타일 주기 위해 deep selector 사용 */
::v-deep(.ql-container) {
  height: 100% !important;
}

::v-deep(.ql-editor) {
  min-height: 500px !important;
  white-space: normal !important;
}
</style>


