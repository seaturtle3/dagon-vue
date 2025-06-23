<script setup>
import { onMounted, watch } from 'vue'
import $ from 'jquery'
import 'summernote/dist/summernote-lite.min.css'
import 'summernote/dist/summernote-lite.min.js'

const props = defineProps({
  modelValue: String,
  editorId: {
    type: String,
    default: 'editor'
  }
})
const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  $(`#${props.editorId}`).summernote({
    height: 500,
    placeholder: '내용을 입력하세요',
    callbacks: {
      onChange: (contents) => {
        emit('update:modelValue', contents)
      },
      onImageUpload: async (files) => {
        for (const file of files) {
          const formData = new FormData()
          formData.append('image', file)
          try {
            const res = await fetch('/api/images/upload', {
              method: 'POST',
              body: formData
            })
            const path = await res.text()
            const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL
            $(`#${props.editorId}`).summernote('insertImage', `${baseUrl}/${path}`)
          } catch (e) {
            console.error('이미지 업로드 실패', e)
          }
        }
      }
    }
  })

  if (props.modelValue) {
    $(`#${props.editorId}`).summernote('code', props.modelValue)
  }
})

watch(() => props.modelValue, (newVal) => {
  const $editor = $(`#${props.editorId}`)
  if ($editor.length && $editor.summernote('isEmpty') && newVal) {
    $editor.summernote('code', newVal)
  }
})
</script>

<template>
  <div :id="editorId"></div>
</template>

<style scoped>

</style>