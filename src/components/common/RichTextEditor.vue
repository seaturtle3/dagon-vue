<script setup>
import { onMounted, watch, onUnmounted } from 'vue'
import $ from 'jquery'
import 'summernote/dist/summernote-lite.min.css'
import 'summernote/dist/summernote-lite.min.js'
import 'popper.js'

const props = defineProps({
  modelValue: String,
  editorId: {
    type: String,
    default: 'editor'
  },
  reportId: {
    type: [String, Number],
    required: false
  }
})
const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  $(`#${props.editorId}`).summernote({
    height: 500,
    placeholder: '내용을 입력하세요',
    toolbar: [
      ['style', ['style']],
      ['font', ['bold', 'underline', 'clear']],
      ['fontname', ['fontname']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link', 'picture', 'video']],
      ['view', ['fullscreen', 'codeview', 'help']]
    ],
    callbacks: {
      onChange: (contents) => {
        emit('update:modelValue', contents)
      },
      onImageUpload: async (files) => {
        console.log('이미지 업로드 이벤트 발생! files:', files);
        for (const file of files) {
          const formData = new FormData()
          formData.append('image', file)
          if (props.reportId) {
            formData.append('reportId', props.reportId)
          }
          try {
            console.log('업로드 시도:', file, 'reportId:', props.reportId);
            const res = await fetch('/api/images/upload', {
              method: 'POST',
              body: formData
            })
            const imageUrl = await res.text()
            console.log('서버 응답 imageUrl:', imageUrl);
            $(`#${props.editorId}`).summernote('insertImage', imageUrl)
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

onUnmounted(() => {
  $(`#${props.editorId}`).summernote('destroy');
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