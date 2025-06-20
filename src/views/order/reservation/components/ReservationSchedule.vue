<script setup>
import { ref, watch } from 'vue'

// 부모 컴포넌트로부터 전달받는 props
const props = defineProps({
  show: Boolean,
  selectedFilters: Object, // { date, region, subType, species }
  scheduleInfo: Object     // { price, partnerName, contact, location, note }
})

const emit = defineEmits(['close'])

// 모달 닫기
const closeModal = () => emit('close')
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>출조 상세 정보</h2>

      <div class="info-section">
        <h3>🔎 선택한 조건</h3>
        <p><strong>날짜:</strong> {{ selectedFilters.date }}</p>
        <p><strong>지역:</strong> {{ selectedFilters.region }}</p>
        <p><strong>세부 장소:</strong> {{ selectedFilters.subType }}</p>
        <p><strong>어종:</strong> {{ selectedFilters.species }}</p>
      </div>

      <div class="info-section">
        <h3>📄 예약 정보</h3>
        <p><strong>요금:</strong> {{ scheduleInfo.price.toLocaleString() }}원</p>
        <p><strong>파트너명:</strong> {{ scheduleInfo.partnerName }}</p>
        <p><strong>연락처:</strong> {{ scheduleInfo.contact }}</p>
        <p><strong>주소:</strong> {{ scheduleInfo.location }}</p>
        <p><strong>안내사항:</strong> {{ scheduleInfo.note }}</p>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="closeModal">닫기</button>
        <button class="btn-confirm">예약 진행</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  animation: fadeIn 0.3s ease;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h3 {
  color: #3366cc;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel, .btn-confirm {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-cancel {
  background-color: #ccc;
  color: #333;
}

.btn-confirm {
  background-color: #3366cc;
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>