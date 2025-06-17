<template>
  <div class="inquiry-container">
    <h2 class="page-title">1:1 문의(회원전용)</h2>

    <!-- 항상 보이는 문의하기 작성 폼 -->
    <div class="inquiry-form">
      <h3>문의하기 작성</h3>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>아이디</label>
          <input type="text" :value="loginUser.uid" readonly class="readonly-input">
        </div>
        <div class="form-group">
          <label>작성자 유형</label>
          <input type="text" :value="loginUser.role === 'PARTNER' ? '파트너' : '일반회원'" readonly class="readonly-input">
        </div>
        <div class="form-group">
          <label>문의 유형</label>
          <select v-model="form.inquiryType" required>
            <option value="">문의 유형을 선택하세요.</option>
            <option v-for="type in availableInquiryTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>제목</label>
          <input type="text" v-model="form.title" required>
        </div>
        <div class="form-group">
          <label>내용</label>
          <textarea v-model="form.content" required></textarea>
        </div>
        <div class="form-actions">
          <button type="submit">등록</button>
          <button type="button" @click="resetForm">초기화</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInquiryStore } from '@/store/inquiries/inquiryStore';

const route = useRoute();
const router = useRouter();
const store = useInquiryStore();

const inquiry = ref(null);
const answerContent = ref('');

onMounted(async () => {
  const id = route.params.id;
  await store.fetchInquiryById(id);
  inquiry.value = store.selectedInquiry;
  answerContent.value = inquiry.value?.answer || '';
});

const submitAnswer = async () => {
  await store.submitAnswer(inquiry.value.id, answerContent.value);
  alert('답변이 저장되었습니다.');
  router.push('/admin/inquiries');
};
</script>

<script>
import { inquiryApi } from '@/api/inquiry.js';

export default {
  name: 'Inquiry',
  data() {
    return {
      // 실제 로그인된 사용자 정보 예시 (DB 컬럼 기반으로 구성)
      loginUser: {
        uno: 123, // => uno
        uid: 'angler001', // => uid
        nickname: '낚시꾼', // => nickname
        role: 'PARTNER' // => role: USER or PARTNER
      },
      form: {
        uid: '',
        title: '',
        content: '',
        writerType: '',
        inquiryType: '',
        receiverId: null
      },
      inquiryTypes: {
        USER: [
          { value: 'PRODUCT', label: '상품 문의' },
          { value: 'PARTNERSHIP', label: '제휴 문의' },
          { value: 'SYSTEM', label: '시스템 문의' },
          { value: 'RESERVATION', label: '예약 문의' },
          { value: 'RESERVATION_CANCEL', label: '예약 취소 문의' }
        ],
        PARTNER: [
          { value: 'PRODUCT', label: '상품 문의' },
          { value: 'SYSTEM', label: '시스템 문의' },
          { value: 'RESERVATION', label: '예약 문의' },
          { value: 'RESERVATION_CANCEL', label: '예약 취소 문의' }
        ]
      }
    };
  },
  computed: {
    availableInquiryTypes() {
      return this.inquiryTypes[this.form.writerType] || [];
    }
  },
  mounted() {
    // 로그인된 사용자 역할을 작성자 유형으로 자동 설정
    this.form.writerType = this.loginUser.role;
  },
  methods: {
    async submitForm() {
      if (!this.form.writerType || !this.form.inquiryType || !this.form.title || !this.form.content) {
        alert('모든 항목을 입력해주세요.');
        return;
      }

      // 관리자 ID (예: 1)로 receiver 설정
      this.form.receiverId = 1;

      try {
        await inquiryApi.createInquiry({
          ...this.form,
          writerId: this.loginUser.id
        });
        alert('문의가 정상 등록되었습니다.');
        this.resetForm();
      } catch (error) {
        console.error('문의 저장 실패:', error);
        alert('저장에 실패했습니다.');
      }
    },
    resetForm() {
      this.form = {
        title: '',
        content: '',
        writerType: this.loginUser.role,
        inquiryType: '',
        receiverId: null
      };
    }
  }
};
</script>

<style scoped>
.inquiry-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
}

.inquiry-table th,
.inquiry-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.inquiry-table th {
  background-color: #f5f5f5;
}

.inquiry-table tbody tr:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}

.readonly-input {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
}

.form-group select option[value=""] {
  color: #aaa;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.pagination button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.inquiry-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 200px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
}

button[type="button"] {
  background-color: #666;
}

button:hover {
  opacity: 0.9;
}

.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-group select option[value=""] {
  color: #999;
}

.form-group select option:not([value=""]) {
  color: #333;
}
</style> 