<script setup>
import {defineProps, defineEmits, onMounted, watch} from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  showTopOption: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const updateField = (field, value) => {
  emit('update:modelValue', {...props.modelValue, [field]: value})
}

onMounted(() => {
  $('#editor').summernote({
    placeholder: '내용을 입력하세요',
    height: 300,
    callbacks: {
      onChange: (contents) => {
        updateField('content', contents)
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
            const imagePath = await res.text()
            const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL
            const imageUrl = `${baseUrl}/${imagePath}`
            console.log('📸 최종 이미지 URL:', imageUrl)
            $('#editor').summernote('insertImage', imageUrl)
          } catch (e) {
            console.error('이미지 업로드 실패', e)
          }
        }
      }
    }
  })

  // 수정모드 초기값 반영
  if (props.modelValue.content) {
    $('#editor').summernote('code', props.modelValue.content)
  }
})

// 외부에서 내용 변경되었을 때 동기화
watch(
    () => props.modelValue.content,
    (newVal) => {
      if ($('#editor').summernote('isEmpty')) {
        $('#editor').summernote('code', newVal || '')
      }
    }
)

</script>

<template>
  <form @submit.prevent="emit('submit')">
    <div>
      <label>제목</label>
      <input
          type="text"
          :value="modelValue.title"
          @input="updateField('title', $event.target.value)"
          required
      />
    </div>

    <div>
      <label>내용</label>
      <div id="editor"></div> <!-- Summernote -->
    </div>

    <div v-if="showTopOption">
      <label>
        <input
            type="checkbox"
            :checked="modelValue.isTop"
            @change="updateField('isTop', $event.target.checked)"
        />상단 고정
      </label>
    </div>

    <button type="submit">저장</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
}

button {
  padding: 8px 16px;
  background: #333;
  color: white;
  border: none;
  cursor: pointer;
}
</style>