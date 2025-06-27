


<template>
  <div class="inquiry-list">
    <h1 class="page-title">문의 목록</h1>
    
    <div class="filter-section">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="제목를 검색해주세요">
        <button class="search-button" @click="searchInquiries"><i class="fa-solid fa-eye"></i></button>
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
            <td>{{ inquiry.userName }}</td>
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
          <p><strong>작성자:</strong> {{ selectedInquiry.userName }}</p>
          <p><strong>업소명:</strong> {{ selectedInquiry.partnerName }}</p>
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
            <button @click="handleDeleteInquiry(selectedInquiry.id)" class="delete-button">삭제</button>
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
import {BASE_URL} from "@/constants/baseUrl.js";
import { partnerService } from '@/api/partner';

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
        const response = await fetch(`${BASE_URL}/api/inquiry/partner-inquiries?partnerUno=${this.partnerUno}`, {
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
        const response = await fetch(`${BASE_URL}/api/inquiry/${this.selectedInquiry.id}/answer`, {
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
    },
    async handleDeleteInquiry(inquiryId) {
      if (!confirm('이 문의를 정말로 삭제하시겠습니까?')) return;
      try {
        await partnerService.deleteInquiry(inquiryId);
        alert('문의가 삭제되었습니다.');
        this.closeModal();
        await this.loadInquiries();
      } catch (error) {
        alert('문의 삭제에 실패했습니다.');
        console.error('문의 삭제 실패:', error);
      }
    }
  },
  mounted() {
    this.loadInquiries();
  }
}
</script>

<style scoped>
.inquiry-list {
  padding: 30px;
  width: 100%;
  margin: 0;
  background-color: #e3f2fd;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin-bottom: 40px;
  color: #1565c0;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #90caf9;
}

.search-box {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}

.search-box input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.search-button {
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.search-button:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-options select,
.filter-options input[type="date"] {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-options select:focus,
.filter-options input[type="date"]:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.table-container {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

th {
  background-color: #eef2f7;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
}

tr:last-child td {
  border-bottom: none;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #64b5f6;
  color: #fff;
}

.status-badge.completed {
  background-color: #1976d2;
  color: #fff;
}

.view-button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.view-button:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.page-button {
  padding: 10px 18px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
}

.page-button:hover:not(:disabled) {
  background-color: #eef2f7;
  transform: translateY(-2px);
}

.page-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.page-info {
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

.inquiry-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  color: #1a237e;
  font-size: 2rem;
  margin-bottom: 25px;
  text-align: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.inquiry-info p {
  margin: 10px 0;
  color: #444;
  font-size: 1.05rem;
  line-height: 1.6;
}

.inquiry-info strong {
  color: #222;
}

.answer-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #eee;
}

.answer-section h3 {
  color: #1a237e;
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.answer-section textarea {
  width: calc(100% - 20px);
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.answer-section textarea:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.submit-button, .close-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.submit-button {
  background-color: #1976d2;
  color: white;
}

.submit-button:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
}

.close-button {
  background-color: #90caf9;
  color: #1565c0;
}

.close-button:hover {
  background-color: #64b5f6;
  transform: translateY(-2px);
}

.delete-button {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-button:hover {
  background: #d9363e;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .inquiry-list {
    padding: 20px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .search-box {
    max-width: 100%;
  }

  .filter-options {
    width: 100%;
    justify-content: space-between;
  }

  table, thead, tbody, th, td, tr {
    display: block;
  }

  thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  tr {
    border: 1px solid #eee;
    margin-bottom: 15px;
    border-radius: 8px;
  }

  td {
    border-bottom: 1px solid #eee;
    position: relative;
    padding-left: 50%;
    text-align: right;
  }

  td:before {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
    text-align: left;
    font-weight: bold;
    color: #666;
  }

  td:nth-of-type(1):before { content: "문의번호"; }
  td:nth-of-type(2):before { content: "문의유형"; }
  td:nth-of-type(3):before { content: "제목"; }
  td:nth-of-type(4):before { content: "작성자"; }
  td:nth-of-type(5):before { content: "작성일"; }
  td:nth-of-type(6):before { content: "상태"; }
  td:nth-of-type(7):before { content: "관리"; }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-content h2 {
    font-size: 1.8rem;
  }

  .answer-section h3 {
    font-size: 1.3rem;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }

  .submit-button, .close-button {
    width: 100%;
    padding: 10px;
  }
}
</style> 