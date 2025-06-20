<template>
  <div class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>문의 내용 확인</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <p><strong>아이디:</strong> {{ inquiry.userName }}</p>
        <p><strong>작성자 유형:</strong> {{ inquiry.writerType }}</p>
        <p><strong>문의 유형:</strong> {{ inquiry.inquiryType }}</p>
        <p><strong>제목:</strong> {{ inquiry.title }}</p>
        <p><strong>내용:</strong></p>
        <div class="content-box">{{ inquiry.content }}</div>
      </div>
      <div class="modal-footer">
        <button @click="submit('close')">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inquiryApi } from '@/api/inquiry';

const props = defineProps({
  inquiry: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'reset-form']);

const submit = async () => {
  try {
    await inquiryApi.createInquiry({
      ...props.inquiry,
      status: '대기중',
      createdAt: new Date().toISOString()
    });

    alert('문의가 정상 등록되었습니다.');

    emit('reset-form'); // ✅ 부모에게 입력폼 초기화 요청
    emit('close');      // ✅ 부모에게 모달 닫기 요청

  } catch (error) {
    console.error('문의 저장 실패:', error);
    alert('저장에 실패했습니다.');
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-window {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-body {
  font-size: 14px;
  color: #333;
}

.content-box {
  background: #f9f9f9;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  white-space: pre-wrap;
}

.close-button {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.modal-footer {
  margin-top: 20px;
  text-align: right;
}

.modal-footer button {
  background-color: #4CAF50;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>