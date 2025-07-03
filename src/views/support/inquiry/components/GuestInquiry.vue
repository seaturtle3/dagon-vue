<template>
  <hr>
  <div class="inquiry-container">
    <h2 class="page-title">문의하기(비회원용)</h2>

    <!-- 상품 정보 표시 섹션 -->
    <div v-if="productInfo" class="product-info-section">
      <h3>상품 정보</h3>
      <div class="product-info">
        <p><strong>상품명:</strong> {{ productInfo.productName }}</p>
        <p><strong>상품ID:</strong> {{ productInfo.productId }}</p>
      </div>
    </div>

    <!-- 상품명 상단 추가 입력 필드 -->
    <div class="additional-info-section">
      <h3>문의자 정보</h3>
      <div class="additional-form">
        <div class="form-row" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="form-group">
            <label>작성자</label>
            <input type="text" v-model="form.name" required placeholder="이름을 입력하세요" style="max-width: 420px; width: 100%;">
          </div>
          <div class="form-group">
            <label>이메일</label>
            <div style="display: flex; gap: 8px; align-items: center; max-width: 420px; width: 100%;">
              <input
                v-model="emailId"
                type="text"
                required
                placeholder="이메일 아이디"
                style="flex: 1; min-width: 0;"
              />
              <span>@</span>
              <select v-model="emailDomain" required style="flex: 1; min-width: 0;">
                <option value="">도메인 선택</option>
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="daum.net">daum.net</option>
                <option value="hanmail.net">hanmail.net</option>
                <option value="nate.com">nate.com</option>
                <option value="직접입력">직접입력</option>
              </select>
              <input
                v-if="emailDomain === '직접입력'"
                v-model="customDomain"
                type="text"
                placeholder="직접입력"
                style="flex: 1; min-width: 0;"
              />
            </div>
            <div v-if="fullEmail && !isValidEmail(fullEmail)" style="color:red; font-size:0.9em;">
              올바른 이메일 형식이 아닙니다.
            </div>
          </div>
          <div class="form-group">
            <label>연락처</label>
            <div style="display: flex; gap: 8px; align-items: center; max-width: 420px; width: 100%;">
              <select v-model="phone1" required style="width: 80px; min-width: 0;">
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
                <option value="02">02</option>
                <option value="031">031</option>
                <option value="032">032</option>
                <option value="033">033</option>
                <option value="041">041</option>
                <option value="042">042</option>
                <option value="043">043</option>
                <option value="044">044</option>
                <option value="051">051</option>
                <option value="052">052</option>
                <option value="053">053</option>
                <option value="054">054</option>
                <option value="055">055</option>
                <option value="061">061</option>
                <option value="062">062</option>
                <option value="063">063</option>
                <option value="064">064</option>
              </select>
              <span>-</span>
              <input v-model="phone2" type="text" maxlength="4" required placeholder="직접 입력" style="flex: 1; min-width: 0;" />
              <span>-</span>
              <input v-model="phone3" type="text" maxlength="4" required placeholder="직접 입력" style="flex: 1; min-width: 0;" />
            </div>
            <div v-if="form.phone && !isValidPhone(form.phone)" style="color:red; font-size:0.9em;">올바른 연락처 형식이 아닙니다.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 항상 보이는 문의하기 작성 폼 -->
    <div class="inquiry-form">
      <h3>문의하기 작성</h3>
      <form @submit.prevent="submitForm">
        <slot name="user-info"></slot>
        <slot name="product-info"></slot>
        <div class="form-group">
          <label>문의 유형</label>
          <select v-model="form.inquiryType" required>
            <option value="">문의 유형을 선택하세요</option>
            <option v-for="type in inquiryTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>제목</label>
          <input type="text" v-model="form.title" required placeholder="제목을 입력하세요">
        </div>
        <div class="form-group">
          <label>내용</label>
          <textarea v-model="form.content" required placeholder="내용을 입력하세요"></textarea>
        </div>
        <div class="form-actions">
          <button type="submit">등록</button>
          <button type="button" @click="onReset">초기화</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { inquiryApi } from '@/api/inquiry.js';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

export default {
  name: 'NonMemberInquiry',
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        title: '',
        content: '',
        writerType: 'NON_MEMBER',
        inquiryType: ''
      },
      inquiryTypes: [
        { value: 'BUSINESS', label: '제휴 문의' },
        { value: 'SYSTEM', label: '시스템 문의' },
      ],
      productInfo: null,
      emailId: '',
      emailDomain: '',
      customDomain: '',
      fullEmail: '',
      phone1: '010',
      phone2: '',
      phone3: ''
    }
  },
  mounted() {
    this.checkLoginStatus();
    this.initializeProductInfo();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');

      if (token && userInfo) {
        console.log('로그인된 사용자가 GuestInquiry에 접근 - 문의 페이지로 리다이렉트');
        this.$router.push('/inquiry');
      }
    },

    initializeProductInfo() {
      const route = useRoute();

      // URL 쿼리 파라미터에서 상품 정보 가져오기
      if (route.query.productId && route.query.productName) {
        this.productInfo = {
          productId: route.query.productId,
          productName: route.query.productName,
          productType: route.query.productType || 'product'
        };

        console.log('상품 정보 받음:', this.productInfo);

        // 상품 문의인 경우 자동으로 문의 유형만 설정
        if (this.productInfo.productType === 'product') {
          this.form.inquiryType = 'PRODUCT';
          // 제목은 자동 설정하지 않고 비회원이 직접 입력하도록 함
        }
      }
    },

    async submitForm() {
      try {
        // 상품 정보가 있으면 문의 내용에 추가
        let content = this.form.content;
        if (this.productInfo) {
          content = `상품 정보:\n- 상품명: ${this.productInfo.productName}\n- 상품ID: ${this.productInfo.productId}\n\n문의 내용:\n${content}`;
        }

        const inquiryData = {
          ...this.form,
          content: content
        };

        await inquiryApi.createInquiry(inquiryData);
        alert('문의가 등록되었습니다.');
        this.resetForm();
        this.$router.push('/admin/inquiries');
      } catch (error) {
        console.error('문의 저장 실패:', error);
        alert('문의 등록에 실패했습니다. 다시 시도해주세요.');
      }
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        phone: '',
        title: '',
        content: '',
        writerType: 'NON_MEMBER',
        inquiryType: this.productInfo ? 'PRODUCT' : ''
      };
      this.emailId = '';
      this.emailDomain = '';
      this.customDomain = '';
      this.fullEmail = '';
      this.phone1 = '010';
      this.phone2 = '';
      this.phone3 = '';
    },

    cancelForm() {
      if (confirm('작성을 취소하시겠습니까?')) {
        this.resetForm();
      }
    },

    isValidEmail(email) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(email);
    },

    isValidPhone(phone) {
      const phonePattern = /^\d{3}-\d{4}-\d{4}$/;
      return phonePattern.test(phone);
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

.inquiry-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.write-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.inquiry-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
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

.inquiry-detail {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.detail-header {
  margin-bottom: 20px;
}

.detail-info {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.detail-content {
  padding: 20px 0;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.detail-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.inquiry-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-info-section {
  background: #e8f4fd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #007BFF;
}

.product-info-section h3 {
  margin: 0 0 15px 0;
  color: #007BFF;
  font-size: 18px;
  font-weight: 600;
}

.product-info p {
  margin: 8px 0;
  color: #333;
  font-size: 14px;
}

.product-info strong {
  color: #007BFF;
  font-weight: 600;
}

.additional-info-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #28a745;
}

.additional-info-section h3 {
  margin: 0 0 15px 0;
  color: #28a745;
  font-size: 18px;
  font-weight: 600;
}

.additional-form {
  margin-top: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
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

.form-group input[disabled] {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}
</style>