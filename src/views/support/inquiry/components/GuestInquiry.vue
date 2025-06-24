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

    <!-- 항상 보이는 문의하기 작성 폼 -->
    <div class="inquiry-form">
      <h3>문의하기 작성</h3>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>작성자</label>
          <input type="text" value="비회원" disabled>
        </div>
        <div class="form-group">
          <label>작성자 유형</label>
          <input type="text" value="비회원 문의" disabled>

        </div>
        <div class="form-group">
          <label>문의 유형</label>
          <select v-model="form.inquiryType" required>
            <option value="">유형을 선택하세요.</option>
            <option v-for="type in inquiryTypes" :key="type.value" :value="type.value">
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
          <textarea v-model="form.content" required placeholder="문의 내용을 입력해주세요."></textarea>
        </div>
        <div class="form-actions">
          <button type="submit">등록</button>
          <button type="button" @click="resetForm">초기화</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { inquiryApi } from '@/api/inquiry.js';
import { useRoute } from 'vue-router';

export default {
  name: 'NonMemberInquiry',
  data() {
    return {
      form: {
        title: '',
        content: '',
        writerType: 'NON_MEMBER',
        inquiryType: ''
      },
      inquiryTypes: [
        { value: 'PRODUCT', label: '상품 문의' },
        { value: 'PARTNERSHIP', label: '제휴 문의' },
        { value: 'SYSTEM', label: '시스템 문의' },
        { value: 'RESERVATION', label: '예약 문의' },
        { value: 'RESERVATION_CANCEL', label: '예약 취소 문의' }
      ],
      productInfo: null
    };
  },
  mounted() {
    this.initializeProductInfo();
  },
  methods: {
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
        
        // 상품 문의인 경우 자동으로 문의 유형 설정
        if (this.productInfo.productType === 'product') {
          this.form.inquiryType = 'PRODUCT';
          
          // 제목에 상품명 자동 추가
          this.form.title = `[${this.productInfo.productName}] 상품 문의`;
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
      } catch (error) {
        console.error('문의 저장 실패:', error);
        alert('문의 등록에 실패했습니다. 다시 시도해주세요.');
      }
    },
    
    resetForm() {
      this.form = {
        title: this.productInfo ? `[${this.productInfo.productName}] 상품 문의` : '',
        content: '',
        writerType: 'NON_MEMBER',
        inquiryType: this.productInfo ? 'PRODUCT' : ''
      };
    },
    
    cancelForm() {
      if (confirm('작성을 취소하시겠습니까?')) {
        this.resetForm();
      }
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