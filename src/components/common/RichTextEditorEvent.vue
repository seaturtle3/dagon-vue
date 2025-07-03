<script setup>
import { onMounted, watch, ref } from 'vue'
import $ from 'jquery'
import 'summernote/dist/summernote-lite.min.css'
import 'summernote/dist/summernote-lite.min.js'
import { BASE_URL } from '@/constants/baseUrl.js'

const props = defineProps({
  modelValue: String,
  editorId: {
    type: String,
    default: 'editor'
  },
  // 이벤트 ID (수정 모드에서 필요)
  eventId: {
    type: [String, Number],
    default: null
  },
  // 기존 이미지 데이터 (수정 모드에서 필요)
  existingImages: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:modelValue', 'imageData', 'imageChanges'])

// 이미지 변경 추적
const deletedImages = ref([])
const newImages = ref([])
const existingImageUrls = ref(new Set())

// 기존 이미지 URL 추출 함수
const extractImageUrls = (content) => {
  const imgRegex = /<img[^>]+src="([^"]+)"/g
  const urls = []
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    urls.push(match[1])
  }
  return urls
}

// 기존 이미지 URL들을 Set으로 저장
const initializeExistingImages = () => {
  if (props.existingImages && props.existingImages.length > 0) {
    props.existingImages.forEach(img => {
      if (img.url) existingImageUrls.value.add(img.url)
    })
  }
}

onMounted(() => {
  // 기존 이미지 초기화
  initializeExistingImages()

  $(`#${props.editorId}`).summernote({
    height: 500,
    placeholder: '내용을 입력하세요',
    callbacks: {
      onChange: (contents) => {
        emit('update:modelValue', contents)

        // 이미지 변경 추적
        trackImageChanges(contents)
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

        // 초기 콘텐츠에서 이미지 변경 추적
        if (props.modelValue) {
          trackImageChanges(props.modelValue)
        }
      },
      onImageUpload: async (files) => {
        for (const file of files) {
          try {
            // 파일 크기 체크 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
              alert(`${file.name} 파일이 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.`)
              continue
            }

            // 파일 타입 체크
            if (!file.type.startsWith('image/')) {
              alert(`${file.name}은 이미지 파일이 아닙니다.`)
              continue
            }

            // FormData 생성
            const formData = new FormData()
            formData.append('file', file)

            let uploadUrl = ''
            if (props.eventId || props.eventId === 0) {
              formData.append('eventId', props.eventId)
              uploadUrl = '/api/images/event/uploadImage'
            } else {
              // 임시 업로드는 eventId 없이
              uploadUrl = '/api/images/event/temp-upload'
            }

            formData.append('isThumbnail', false)
            formData.append('imageType', 'editor')

            // 토큰 가져오기
            const token = localStorage.getItem('token')
            if (!token) {
              alert('인증이 필요합니다. 다시 로그인해주세요.')
              continue
            }

            // 서버에 이미지 업로드
            const response = await fetch(uploadUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            })
            console.log("--------------response>",response)

            if (response.ok) {
              // 서버가 JSON 반환 시
              const dbUrl = await response.json();
              console.log('dbUrl:', dbUrl);

              // 서버가 문자열 반환 시
              // const dbUrl = await response.text();
              // console.log('dbUrl:', dbUrl);

           // BASE_URL을 붙여서 절대경로로 만듦
           const fullUrl = BASE_URL.replace(/\/$/, '') + dbUrl.dbUrl
            console.log("--------------fullUrl>",props.eventId, fullUrl)

            // 에디터에 이미지 삽입 (DB URL 사용)
            $(`#${props.editorId}`).summernote('insertImage', fullUrl)

            // 새 이미지로 등록
            newImages.value.push({
              url: fullUrl,
              file: file,
              imageType: 'editor',
              isThumbnail: false,
              uploadedAt: new Date()
            })

            // 부모 컴포넌트에 이미지 업로드 완료 알림
            emit('imageData', { success: true, url: fullUrl })

            // 이미지 변경사항 전달
            emitImageChanges()

            console.log('에디터 이미지 업로드 성공:', {
              url: fullUrl,
              fileName: file.name,
              fileSize: file.size,
              imageType: 'editor',
              isThumbnail: false
            })


            } else {
              // 에러 처리
              const errorText = await response.text();
              console.error('업로드 실패:', errorText);
            }


          } catch (e) {
            console.error('이미지 업로드 실패', e)
            alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
            emit('imageData', { success: false, error: e.message })
          }
        }
      }
    }
  })

  if (props.modelValue) {
    $(`#${props.editorId}`).summernote('code', props.modelValue)
  }
})

// 이미지 변경 추적 함수
const trackImageChanges = (content) => {
  const currentImageUrls = extractImageUrls(content)
  const currentUrlSet = new Set(currentImageUrls)

  // 삭제된 이미지 찾기
  const deleted = []
  existingImageUrls.value.forEach(url => {
    if (!currentUrlSet.has(url)) {
      deleted.push(url)
    }
  })

  // 새로 추가된 이미지 찾기 (기존에 없던 URL)
  const newlyAdded = currentImageUrls.filter(url => {
    return !existingImageUrls.value.has(url) &&
           !newImages.value.some(img => img.url === url)
  })

  // 삭제된 이미지 업데이트
  deletedImages.value = deleted

  // 새로 추가된 이미지들을 newImages에 추가
  newlyAdded.forEach(url => {
    if (!newImages.value.some(img => img.url === url)) {
      newImages.value.push({
        url: url,
        uploadedAt: new Date()
      })
    }
  })

  // 부모 컴포넌트에 변경사항 전달
  emitImageChanges()
}

// 이미지 변경사항을 부모 컴포넌트에 전달
const emitImageChanges = () => {
  emit('imageChanges', {
    deletedImages: deletedImages.value,
    newImages: newImages.value,
    existingImages: Array.from(existingImageUrls.value)
  })
}

watch(() => props.modelValue, (newVal) => {
  const $editor = $(`#${props.editorId}`)
  if ($editor.length && $editor.summernote('isEmpty') && newVal) {
    $editor.summernote('code', newVal)
  }

  // 콘텐츠 변경 시 이미지 추적
  if (newVal) {
    trackImageChanges(newVal)
  }
})

// 외부에서 접근 가능한 메서드들
defineExpose({
  getImageChanges: () => ({
    deletedImages: deletedImages.value,
    newImages: newImages.value,
    existingImages: Array.from(existingImageUrls.value)
  }),
  resetImageTracking: () => {
    deletedImages.value = []
    newImages.value = []
    existingImageUrls.value.clear()
    initializeExistingImages()
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