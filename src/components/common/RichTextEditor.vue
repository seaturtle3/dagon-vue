<script setup>
import api from '@/lib/axios'; // 또는 설정된 axios 인스턴스 사용
import {BASE_URL} from "@/constants/baseUrl.js";

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
          try {
            // fetch를 사용하여 멀티파트로 전송, Content-Type은 브라우저가 자동 설정
            const res = await fetch('http://localhost:8095/api/fishing-report/images/temp-upload', {
              method: 'POST',
              body: formData
            })
            let imageUrl = ''
            try {
              const data = await res.json()
              imageUrl = data.url || data.imageUrl || data.path
            } catch (jsonErr) {
              // JSON 파싱 실패 시 텍스트로 처리
              imageUrl = await res.text()
            }
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