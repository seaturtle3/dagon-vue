<template>
  <div class="reports">
    <h1>신고 목록</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="신고자 또는 신고대상으로 검색">
      <select v-model="typeFilter">
        <option value="">전체 유형</option>
        <option value="파트너">파트너</option>
        <option value="회원">회원</option>
        <option value="게시글">게시글</option>
      </select>
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="대기">대기</option>
        <option value="처리중">처리중</option>
        <option value="완료">완료</option>
      </select>
      <button @click="searchReports">검색</button>
    </div>
    
    <table class="reports-table">
      <thead>
        <tr>
          <th>신고번호</th>
          <th>신고자</th>
          <th>신고유형</th>
          <th>신고대상</th>
          <th>신고사유</th>
          <th>신고일</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="report in reports" :key="report.id">
          <td>{{ report.id }}</td>
          <td>{{ report.reporter }}</td>
          <td>{{ report.type }}</td>
          <td>{{ report.target }}</td>
          <td>{{ report.reason }}</td>
          <td>{{ report.reportedAt }}</td>
          <td>{{ report.status }}</td>
          <td>
            <button @click="viewReportDetails(report.id)">상세</button>
            <button v-if="report.status === '대기'" @click="startProcessing(report.id)">처리시작</button>
            <button v-if="report.status === '처리중'" @click="completeReport(report.id)">처리완료</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 신고 상세 모달 -->
    <div v-if="showDetailModal" class="modal">
      <div class="modal-content">
        <h2>신고 상세 정보</h2>
        <div class="report-details">
          <div class="detail-item">
            <label>신고자:</label>
            <span>{{ selectedReport.reporter }}</span>
          </div>
          <div class="detail-item">
            <label>신고유형:</label>
            <span>{{ selectedReport.type }}</span>
          </div>
          <div class="detail-item">
            <label>신고대상:</label>
            <span>{{ selectedReport.target }}</span>
          </div>
          <div class="detail-item">
            <label>신고사유:</label>
            <p>{{ selectedReport.reason }}</p>
          </div>
          <div class="detail-item">
            <label>첨부파일:</label>
            <div class="attachments">
              <img v-for="(image, index) in selectedReport.images" 
                   :key="index" 
                   :src="image" 
                   @click="showImage(image)"
                   class="attachment-image">
            </div>
          </div>
          <div class="detail-item">
            <label>처리내용:</label>
            <textarea v-model="selectedReport.processNote" 
                      placeholder="처리 내용을 입력하세요"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="updateReport">저장</button>
          <button @click="showDetailModal = false">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Reports',
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      statusFilter: '',
      reports: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      showDetailModal: false,
      selectedReport: {
        id: '',
        reporter: '',
        type: '',
        target: '',
        reason: '',
        reportedAt: '',
        status: '',
        images: [],
        processNote: ''
      }
    }
  },
  methods: {
    async searchReports() {
      // TODO: API 호출하여 신고 목록 검색
      this.reports = [
        {
          id: 'R001',
          reporter: '홍길동',
          type: '파트너',
          target: '바다낚시터',
          reason: '서비스 불량',
          reportedAt: '2024-03-20',
          status: '대기'
        },
        // 더 많은 신고 데이터...
      ]
    },
    viewReportDetails(id) {
      // TODO: 신고 상세 정보 가져오기
      this.selectedReport = {
        id: 'R001',
        reporter: '홍길동',
        type: '파트너',
        target: '바다낚시터',
        reason: '서비스 불량',
        reportedAt: '2024-03-20',
        status: '대기',
        images: ['image1.jpg', 'image2.jpg'],
        processNote: ''
      }
      this.showDetailModal = true
    },
    async startProcessing(id) {
      // TODO: 신고 처리 시작 API 호출
    },
    async completeReport(id) {
      // TODO: 신고 처리 완료 API 호출
    },
    async updateReport() {
      // TODO: 신고 처리 내용 업데이트 API 호출
      this.showDetailModal = false
    },
    showImage(image) {
      // TODO: 이미지 크게 보기
    },
    changePage(page) {
      this.currentPage = page
      this.searchReports()
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

.reports-table button:first-child {
  background-color: #3498db;
  color: white;
}

.reports-table button:nth-child(2) {
  background-color: #f1c40f;
  color: white;
}

.reports-table button:last-child {
  background-color: #2ecc71;
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

.attachments {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.attachment-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.detail-item textarea {
  width: 100%;
  height: 100px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
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
}

.modal-actions button:first-child {
  background-color: #2ecc71;
  color: white;
}

.modal-actions button:last-child {
  background-color: #95a5a6;
  color: white;
}
</style> 