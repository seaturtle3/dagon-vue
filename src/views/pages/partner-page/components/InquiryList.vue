<template>
  <div class="inquiry-list">
    <h1 class="page-title">문의 목록</h1>
    
    <div class="filter-section">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="제목를 검색해주세요">
        <button class="search-button" @click="searchInquiries">검색</button>
      </div>
      
      <div class="filter-options">
        <select v-model="statusFilter" @change="filterInquiries">
          <option value="all">전체</option>
          <option value="pending">답변대기</option>
          <option value="completed">답변완료</option>
        </select>
        

      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>문의번호</th>
            <th>문의유형</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inquiry in filteredInquiries" :key="inquiry.id">
            <td>{{ inquiry.id }}</td>
            <td>{{ inquiry.inquiryType }}</td>
            <td>{{ inquiry.title }}</td>
            <td>{{ inquiry.writer }}</td>
            <td>{{ formatDate(inquiry.createdAt) }}</td>
            <td>
              <span :class="['status-badge', inquiry.answerContent ? 'completed' : 'pending']">
                {{ inquiry.answerContent ? '답변완료' : '답변대기' }}
              </span>
            </td>
            <td>
              <button class="view-button" @click="viewInquiry(inquiry)">상세보기</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedInquiry" class="inquiry-detail-modal">
      <div class="modal-content">
        <h2>문의 상세</h2>
        <div class="inquiry-info">
          <p><strong>제목:</strong> {{ selectedInquiry.title }}</p>
          <p><strong>내용:</strong> {{ selectedInquiry.content }}</p>
          <p><strong>유형:</strong> {{ selectedInquiry.inquiryType }}</p>
          <p><strong>작성자:</strong> {{ selectedInquiry.writer }}</p>
          <p><strong>연락처:</strong> {{ selectedInquiry.contact }}</p>
          <p><strong>작성일:</strong> {{ formatDate(selectedInquiry.createdAt) }}</p>
        </div>
        
        <div class="answer-section">
          <h3>답변</h3>
          <textarea 
            v-model="answerContent" 
            rows="4" 
            placeholder="답변을 입력하세요"
          ></textarea>
          <div class="button-group">
            <button @click="submitAnswer" class="submit-button">답변 저장</button>
            <button @click="closeModal" class="close-button">닫기</button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button class="page-button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button class="page-button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InquiryList',
  data() {
    return {
      searchQuery: '',
      statusFilter: 'all',
      dateFilter: '',
      currentPage: 1,
      totalPages: 1,
      inquiries: [],
      selectedInquiry: null,
      answerContent: '',
      partnerUno: null
    }
  },
  computed: {
    filteredInquiries() {
      return this.inquiries.filter(inquiry => {
        const matchesSearch = inquiry.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            inquiry.content.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus = this.statusFilter === 'all' || 
                            (this.statusFilter === 'completed' && inquiry.answerContent) ||
                            (this.statusFilter === 'pending' && !inquiry.answerContent);
        return matchesSearch && matchesStatus;
      });
    }
  },
  methods: {
    parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error("JWT 파싱 실패", e);
        return null;
      }
    },
    async loadInquiries() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const decoded = this.parseJwt(token);
      this.partnerUno = decoded?.uno;

      if (!this.partnerUno) {
        alert("유효하지 않은 토큰입니다. 다시 로그인해주세요.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8095/api/inquiries/partner-inquiries?partnerUno=${this.partnerUno}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          this.inquiries = data;
          this.totalPages = Math.ceil(data.length / 10);
        } else {
          alert("문의 목록을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("문의 목록 로딩 실패:", error);
        alert("문의 목록을 불러오는데 실패했습니다.");
      }
    },
    viewInquiry(inquiry) {
      this.selectedInquiry = inquiry;
      this.answerContent = inquiry.answerContent || '';
    },
    async submitAnswer() {
      if (!this.selectedInquiry) return;

      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:8095/api/inquiries/${this.selectedInquiry.id}/answer`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ answerContent: this.answerContent })
        });

        if (response.ok) {
          alert("답변이 저장되었습니다.");
          await this.loadInquiries();
          this.closeModal();
        } else {
          alert("답변 저장에 실패했습니다.");
        }
      } catch (error) {
        console.error("답변 저장 실패:", error);
        alert("답변 저장에 실패했습니다.");
      }
    },
    closeModal() {
      this.selectedInquiry = null;
      this.answerContent = '';
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    searchInquiries() {
      this.currentPage = 1;
    },
    filterInquiries() {
      this.currentPage = 1;
    },
    changePage(page) {
      this.currentPage = page;
    }
  },
  mounted() {
    this.loadInquiries();
  }
}
</script>

<style scoped>
.inquiry-list {
  padding: 20px;
}

.page-title {
  margin-bottom: 30px;
  color: #333;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
}

.search-button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-options {
  display: flex;
  gap: 10px;
}

.filter-options select,
.filter-options input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status-badge.pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.view-button {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

.inquiry-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.inquiry-info {
  margin-bottom: 1.5rem;
}

.inquiry-info p {
  margin: 0.5rem 0;
}

.answer-section {
  margin-top: 1.5rem;
}

.answer-section textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style> 