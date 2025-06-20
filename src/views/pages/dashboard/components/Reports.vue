<template>
  <div class="reports">
    <h1>신고 목록</h1>
    
    <!-- 에러 메시지 표시 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="신고자 또는 신고대상으로 검색">
      <select v-model="searchType">
        <option value="uname">신고자</option>
        <option value="reportedName">신고대상</option>
      </select>
      <button @click="searchReports">검색</button>
    </div>
    
    <table class="reports-table">
      <thead>
        <tr>
          <th>신고번호</th>
          <th>신고자</th>
          <th>신고대상</th>
          <th>신고당한 ID</th>
          <th>신고 타입</th>
          <th>신고일</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="report in reports" :key="report.id">
          <td>{{ report.id }}</td>
          <td>{{ report.reporterUname || '-' }}</td>
          <td>{{ report.reportedUserUname }}</td>
          <td>{{ report.targetId || '-' }}</td>
          <td>{{ getTargetTypeText(report.targetType) }}</td>
          <td>{{ formatDate(report.createdAt) }}</td>
          <td>
            <button @click="viewReportDetails(report.id)">상세</button>
            <button 
              v-if="!report.reportedUserActive" 
              @click="reactivateUser(report.reportedUserId)"
              class="activate-btn"
            >
              활성화
            </button>
            <button 
              v-if="report.reportedUserActive" 
              @click="deactivateUser(report.reportedUserId)"
              class="deactivate-btn"
            >
              비활성화
            </button>
            <button @click="deleteReport(report.id)" class="delete-btn">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination">
      <button :disabled="currentPage === 0" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages - 1" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 신고 상세 모달 -->
    <div v-if="showDetailModal" class="modal">
      <div class="modal-content">
        <h2>신고 상세 정보</h2>
        <div class="report-details">
          <div class="detail-item">
            <label>신고자:</label>
            <span>{{ selectedReport.reporterUname || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>신고대상:</label>
            <span>{{ selectedReport.reportedUserUname }}</span>
          </div>
          <div class="detail-item">
            <label>신고당한 ID:</label>
            <span>{{ selectedReport.targetId || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>신고 타입:</label>
            <span>{{ getTargetTypeText(selectedReport.targetType) }}</span>
          </div>
          <div class="detail-item">
            <label>신고사유:</label>
            <p>{{ selectedReport.reason }}</p>
          </div>
          <div class="detail-item">
            <label>신고일:</label>
            <span>{{ formatDate(selectedReport.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <label>상태:</label>
            <span>{{ selectedReport.reportedUserActive ? '활성' : '비활성' }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showDetailModal = false">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/lib/axios'

export default {
  name: 'Reports',
  data() {
    return {
      searchQuery: '',
      searchType: 'uname',
      reports: [],
      currentPage: 0,
      totalPages: 1,
      itemsPerPage: 10,
      showDetailModal: false,
      selectedReport: null,
      error: null
    }
  },
  methods: {
    async searchReports() {
      this.error = null
      try {
        const params = {
          page: this.currentPage,
          size: this.itemsPerPage
        }
        
        if (this.searchQuery.trim()) {
          params[this.searchType] = this.searchQuery.trim()
        }

        const response = await axios.get('/api/reports', { params })
        this.reports = response.data.content
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error('신고 목록 조회 실패:', error)
        this.error = '신고 목록을 불러오는데 실패했습니다.'
      }
    },
    async viewReportDetails(id) {
      this.error = null
      try {
        const response = await axios.get(`/api/reports/${id}`)
        this.selectedReport = response.data
        this.showDetailModal = true
      } catch (error) {
        console.error('신고 상세 조회 실패:', error)
        this.error = '신고 상세 정보를 불러오는데 실패했습니다.'
      }
    },
    async deactivateUser(userId) {
      if (!confirm('해당 유저를 비활성화하시겠습니까?')) return
      
      this.error = null
      try {
        await axios.put(`/api/users/${userId}/deactivate`)
        alert('유저가 비활성화되었습니다.')
        await this.searchReports()
      } catch (error) {
        console.error('유저 비활성화 실패:', error)
        this.error = '유저 비활성화에 실패했습니다.'
      }
    },
    async reactivateUser(userId) {
      if (!confirm('해당 유저를 다시 활성화하시겠습니까?')) return
      
      this.error = null
      try {
        await axios.put(`/api/users/${userId}/reactivate`)
        alert('유저가 다시 활성화되었습니다.')
        await this.searchReports()
      } catch (error) {
        console.error('유저 활성화 실패:', error)
        this.error = '유저 활성화에 실패했습니다.'
      }
    },
    async deleteReport(id) {
      if (!confirm('해당 신고 내역을 삭제하시겠습니까?')) return
      
      this.error = null
      try {
        await axios.delete(`/api/reports/${id}`)
        alert('신고가 삭제되었습니다.')
        await this.searchReports()
      } catch (error) {
        console.error('신고 삭제 실패:', error)
        this.error = '신고 삭제에 실패했습니다.'
      }
    },
    changePage(page) {
      this.currentPage = page
      this.searchReports()
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getTargetTypeText(targetType) {
      const typeMap = {
        'FISHING_POST': '조행기',
        'FISHING_REPORT': '조황정보',
        'PRODUCT': '낚시배 상품',
        'COMMENT_FISHING_POST': '조행기 댓글',
        'COMMENT_FISHING_REPORT': '조황정보 댓글'
      };
      return typeMap[targetType] || targetType || '미지정';
    }
  },
  created() {
    this.searchReports()
  }
}
</script>

<style scoped>
.reports {
  padding: 1rem;
}

.search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.reports-table th,
.reports-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.reports-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.reports-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.activate-btn {
  background-color: #2ecc71 !important;
  color: white;
}

.deactivate-btn {
  background-color: #e74c3c !important;
  color: white;
}

.delete-btn {
  background-color: #95a5a6 !important;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.modal {
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
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.report-details {
  margin: 1rem 0;
}

.detail-item {
  margin-bottom: 1rem;
}

.detail-item label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #95a5a6;
  color: white;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #ef9a9a;
}
</style> 