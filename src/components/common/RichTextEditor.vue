<script setup>
import {onMounted, watch} from 'vue'
import $ from 'jquery'
import 'summernote/dist/summernote-lite.min.css'
import 'summernote/dist/summernote-lite.min.js'
import api from '@/lib/axios.js'

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
      onInit: () => {
        // 에디터 초기화 후 텍스트 색상 강제 설정
        const $editor = $(`#${props.editorId}`)
        const $editable = $editor.find('.note-editable')
        $editable.css({
          'color': '#333 !important',
          'background-color': '#fff !important'
        })

        // 에디터 내부 모든 텍스트 요소에 색상 적용
        $editable.find('*').css('color', '#333')
      },
      onImageUpload: async (files) => {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          try {
            console.log('이미지 업로드 시작...');
            const response = await api.post('/api/images/event/uploadImage', formData);
            console.log('업로드 응답:', response);
            
            if (response.data && response.data.dbUrl) {
              console.log('이미지 URL:', response.data.dbUrl);
              $(`#${props.editorId}`).summernote('insertImage', response.data.dbUrl);
            } else {
              throw new Error('이미지 URL을 받지 못했습니다.');
            }
          } catch (e) {
            console.error('이미지 업로드 실패 상세:', e);
            console.error('에러 타입:', e.constructor.name);
            console.error('에러 메시지:', e.message);
            console.error('에러 스택:', e.stack);
            alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
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
/* RichTextEditor 텍스트 색상 강제 설정 */
:deep(.note-editor) {
  color: #333 !important;
}

:deep(.note-editor .note-editing-area) {
  color: #333 !important;
}

:deep(.note-editor .note-editable) {
  color: #333 !important;
  background-color: #fff !important;
}

:deep(.note-editor .note-editable:focus) {
  color: #333 !important;
}

:deep(.note-editor .note-placeholder) {
  color: #999 !important;
}

/* Summernote 에디터 내부 모든 텍스트 요소 강제 설정 */
:deep(.note-editor *) {
  color: inherit !important;
}

:deep(.note-editor .note-editable *) {
  color: #333 !important;
}

:deep(.note-editor .note-editable p) {
  color: #333 !important;
}

:deep(.note-editor .note-editable div) {
  color: #333 !important;
}

:deep(.note-editor .note-editable span) {
  color: #333 !important;
}

/* Summernote 에디터 초기화 시 텍스트 색상 설정 */
:deep(.note-editor .note-editable:empty:before) {
  color: #999 !important;
}
</style>