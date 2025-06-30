<template>
  <div class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>문의 등록 완료</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="success-message">
          <p class="success-text">문의가 정상 등록되었습니다.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="goToMyInquiries">나의 문의내역</button>
        <button class="btn btn-primary" @click="goToHome">홈으로</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  inquiry: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'reset-form']);

const goToMyInquiries = () => {
  emit('close');
  router.push('/mypage/inquiries');
};

const goToHome = () => {
  emit('close');
  router.push('/');
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
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.modal-body {
  text-align: center;
  margin-bottom: 20px;
}

.success-message {
  padding: 20px 0;
}

.success-text {
  font-size: 16px;
  color: #28a745;
  font-weight: 600;
  margin: 0;
}

.close-button {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>