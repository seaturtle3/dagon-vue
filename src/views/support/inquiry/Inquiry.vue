<template>
  <div class="inquiry-container">
    <h2 class="page-title">1:1 문의</h2>

    <!-- 문의하기 목록 -->
    <div class="inquiry-list" v-if="!showDetail">
      <div class="inquiry-header">
        <button class="write-btn" @click="showWriteForm = true">문의하기 작성</button>
      </div>

      <table class="inquiry-table">
        <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>작성자</th>
          <th>작성자 유형</th>
          <th>문의 유형</th>
          <th>작성일</th>
          <th>상태</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in inquiryList" :key="item.id" @click="viewDetail(item.id)">
          <td>{{ item.id }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.writer }}</td>
          <td>{{ item.writerType === 'MEMBER' ? '일반회원' : '파트너' }}</td>
          <td>{{ getInquiryTypeLabel(item.inquiryType) }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ item.status }}</td>
        </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button
            v-for="page in totalPages"
            :key="page"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- 문의하기 상세 -->
    <div class="inquiry-detail" v-if="showDetail">
      <div class="detail-header">
        <h3>{{ detail.title }}</h3>
        <div class="detail-info">
          <span>작성자: {{ detail.writer }}</span>
          <span>작성자 유형: {{ detail.writerType === 'MEMBER' ? '일반회원' : '파트너' }}</span>
          <span>문의 유형: {{ getInquiryTypeLabel(detail.inquiryType) }}</span>
          <span>작성일: {{ formatDate(detail.createdAt) }}</span>
          <span>상태: {{ detail.status }}</span>
        </div>
      </div>
      <div class="detail-content">
        {{ detail.content }}
      </div>
      <div class="detail-actions">
        <button @click="showDetail = false">목록으로</button>
        <button v-if="isWriter" @click="showEditForm = true">수정</button>
        <button v-if="isWriter" @click="deleteInquiry">삭제</button>
      </div>
    </div>

    <!-- 문의하기 작성/수정 폼 -->
    <div class="inquiry-form" v-if="showWriteForm || showEditForm">
      <h3>{{ showEditForm ? '문의하기 수정' : '문의하기 작성' }}</h3>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>작성자 유형</label>
          <select v-model="form.writerType" required @change="handleWriterTypeChange">
            <option value="">유형을 선택하세요.</option>
            <option value="MEMBER">일반회원</option>
            <option value="PARTNER">파트너</option>
          </select>
        </div>
        <div class="form-group">
          <label>문의 유형</label>
          <select v-model="form.inquiryType" required>
            <option value="">유형을 선택하세요.</option>
            <option v-for="type in availableInquiryTypes"
                    :key="type.value"
                    :value="type.value">
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
          <button type="submit">{{ showEditForm ? '수정' : '등록' }}</button>
          <button type="button" @click="cancelForm">취소</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { inquiryApi } from '@/api/inquiry';

export default {
  name: 'Inquiry',
  data() {
    return {
      inquiryList: [],
      detail: null,
      showDetail: false,
      showWriteForm: false,
      showEditForm: false,
      currentPage: 1,
      totalPages: 1,
      form: {
        title: '',
        content: '',
        writerType: '',
        inquiryType: ''
      },
      inquiryTypes: {
        MEMBER: [
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
    isWriter() {
      // 현재 로그인한 사용자와 작성자가 같은지 확인
      return this.detail?.writer === 'currentUser'; // 실제 구현시 현재 로그인한 사용자 정보와 비교
    },
    availableInquiryTypes() {
      return this.inquiryTypes[this.form.writerType] || [];
    }
  },
  methods: {
    handleWriterTypeChange() {
      // 작성자 유형이 변경되면 문의 유형을 초기화
      this.form.inquiryType = '';
    },
    getInquiryTypeLabel(type) {
      const allTypes = [...this.inquiryTypes.MEMBER, ...this.inquiryTypes.PARTNER];
      const found = allTypes.find(t => t.value === type);
      return found ? found.label : type;
    },
    async fetchInquiryList() {
      try {
        const response = await inquiryApi.getInquiryList({
          page: this.currentPage,
          size: 10
        });
        this.inquiryList = response.data.content;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        console.error('문의 목록 조회 실패:', error);
      }
    },
    async viewDetail(id) {
      try {
        const response = await inquiryApi.getInquiryDetail(id);
        this.detail = response.data;
        this.showDetail = true;
      } catch (error) {
        console.error('문의 상세 조회 실패:', error);
      }
    },
    async submitForm() {
      try {
        if (this.showEditForm) {
          await inquiryApi.updateInquiry(this.detail.id, this.form);
        } else {
          await inquiryApi.createInquiry(this.form);
        }
        this.resetForm();
        this.fetchInquiryList();
      } catch (error) {
        console.error('문의 저장 실패:', error);
      }
    },
    async deleteInquiry() {
      if (!confirm('정말 삭제하시겠습니까?')) return;

      try {
        await inquiryApi.deleteInquiry(this.detail.id);
        this.showDetail = false;
        this.fetchInquiryList();
      } catch (error) {
        console.error('문의 삭제 실패:', error);
      }
    },
    changePage(page) {
      this.currentPage = page;
      this.fetchInquiryList();
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    resetForm() {
      this.form = {
        title: '',
        content: '',
        writerType: '',
        inquiryType: ''
      };
      this.showWriteForm = false;
      this.showEditForm = false;
    },
    cancelForm() {
      this.resetForm();
    }
  },
  created() {
    this.fetchInquiryList();
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