<template>
  <div class="partners">
    <h1>파트너 관리</h1>
    
    <!-- 에러 메시지 표시 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="파트너명 또는 사업자번호로 검색">
      <select v-model="searchType">
        <option value="pname">파트너명</option>
        <option value="ceoName">대표자명</option>
        <option value="pAddress">주소</option>
      </select>
      <button @click="searchPartners">검색</button>
    </div>
    
    <table class="partners-table">
      <thead>
        <tr>
          <th>파트너번호</th>
          <th>파트너명</th>
          <th>대표자명</th>
          <th>주소</th>
          <th>사업자번호</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="partner in partners" :key="partner.uno">
          <td>{{ partner.uno }}</td>
          <td>{{ partner.pname }}</td>
          <td>{{ partner.ceoName }}</td>
          <td>{{ partner.paddress }}</td>
          <td>{{ partner.license }}</td>

          <td>
            <button @click="viewPartnerDetails(partner.uno)" class="detail-btn">상세</button>
            <button @click="goToPartnerDashboard(partner.uno)" class="update-btn">파트너 페이지</button>
            <button @click="deletePartner(partner.uno)" class="delete-btn">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination">
      <button :disabled="currentPage === 0" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages - 1" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 파트너 상세 모달 -->
    <div v-if="showDetailModal" class="modal">
      <div class="modal-content">
        <h2>파트너 상세 정보</h2>
        <div class="partner-details">
          <div class="detail-item">
            <label>파트너명:</label>
            <input v-model="selectedPartner.pname" type="text">
          </div>
          <div class="detail-item">
            <label>대표자명:</label>
            <input v-model="selectedPartner.ceoName" type="text">
          </div>
          <div class="detail-item">
            <label>주소:</label>
            <input v-model="selectedPartner.paddress" type="text">
          </div>
          <div class="detail-item">
            <label>사업자번호:</label>
            <input v-model="selectedPartner.license" type="text">
          </div>
          <div class="detail-item">
            <label>사업자등록증:</label>
            <img v-if="selectedPartner.licenseImg" :src="getLicenseImgUrl(selectedPartner.licenseImg)" class="license-img">
          </div>
          <div class="detail-item">
            <label>파트너 정보:</label>
            <textarea v-model="selectedPartner.pinfo" rows="4"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="updatePartner" class="update-btn">수정</button>
          <button @click="showDetailModal = false" class="close-btn">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { partnerApi } from '@/api/admin'
import api from '@/lib/axios'

export default {
  name: 'Partners',
  data() {
    return {
      searchQuery: '',
      searchType: 'pname',
      partners: [],
      currentPage: 0,
      totalPages: 1,
      itemsPerPage: 10,
      showDetailModal: false,
      selectedPartner: null,
      error: null
    }
  },
  methods: {
    getLicenseImgUrl(path) {
      if (!path) return '/img/default-license.png';
      const fileName = path.split(/[/\\\\]/).pop();
      return `/uploads/${fileName}`;
    },

    async searchPartners() {
      this.error = null
      try {
        const params = {
          page: this.currentPage,
          size: this.itemsPerPage
        };
        if (this.searchQuery.trim()) {
          params.keyword = this.searchQuery.trim();
          params.searchType = this.searchType;
        }
        const response = await partnerApi.getPartners(params);
        this.partners = response.data.content;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        console.error('파트너 목록 조회 실패:', error)
        this.error = '파트너 목록을 불러오는데 실패했습니다.'
      }
    },
    async viewPartnerDetails(id) {
      this.error = null
      try {
        const response = await partnerApi.getPartnerDetail(id)
        this.selectedPartner = response.data
        console.log(this.selectedPartner.licenseImg)
        this.showDetailModal = true

      } catch (error) {
        console.error('파트너 상세 조회 실패:', error)
        this.error = '파트너 상세 정보를 불러오는데 실패했습니다.'
      }
    },
    async updatePartner() {
      if (!this.selectedPartner) return
      
      this.error = null
      try {
        await partnerApi.updatePartner(this.selectedPartner.uno, this.selectedPartner)
        alert('파트너 정보가 수정되었습니다.')

        this.showDetailModal = false
        await this.searchPartners()
      } catch (error) {
        console.error('파트너 정보 수정 실패:', error)
        this.error = '파트너 정보 수정에 실패했습니다.'
      }
    },
    async deletePartner(id) {
      if (!confirm('해당 파트너를 삭제하시겠습니까?')) return
      
      this.error = null
      try {
        await partnerApi.deletePartner(id)
        alert('파트너가 삭제되었습니다.')
        await this.searchPartners()
      } catch (error) {
        console.error('파트너 삭제 실패:', error)
        if (error.response) {
          switch (error.response.status) {
            case 401:
              this.error = '로그인이 필요합니다.'
              break
            case 403:
              this.error = '본인의 파트너 정보만 삭제할 수 있습니다.'
              break
            case 404:
              this.error = '해당 파트너를 찾을 수 없습니다.'
              break
            default:
              this.error = '파트너 삭제에 실패했습니다.'
          }
        } else {
          this.error = '파트너 삭제에 실패했습니다.'
        }
      }
    },
    changePage(page) {
      this.currentPage = page
      this.searchPartners()
    },
    async goToPartnerDashboard(uno) {
      try {
        // 토큰 상태 확인
        const token = localStorage.getItem('token');
        console.log('현재 토큰:', token ? token.substring(0, 20) + '...' : '토큰 없음');
        
        if (!token) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
          this.$router.push('/admin/login');
          return;
        }
        
        // 토큰 페이로드 확인 (권한 정보 디버깅)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('토큰 페이로드:', payload);
          console.log('사용자 권한:', payload.role || payload.authorities || payload.type || '권한 정보 없음');
        } catch (e) {
          console.log('토큰 페이로드 디코딩 실패:', e);
        }
        
        // 1. 백엔드에서 위임 토큰 요청 (인터셉터가 적용된 api 사용)
        const response = await api.post(`/api/admin/impersonate/partner/${uno}`);
        
        if (response.data.impersonatedToken) {
          // 2. 위임 토큰을 localStorage에 저장
          localStorage.setItem('token', response.data.impersonatedToken);
          
          // 3. 새 창에서 파트너 대시보드로 이동
          window.open('/partner/dashboard', '_blank');
          
          console.log(`파트너 ${response.data.partnerName}(${uno}) 페이지로 이동`);
        }
      } catch (error) {
        console.error('파트너 페이지 접근 실패:', error);
        if (error.response) {
          switch (error.response.status) {
            case 401:
              alert('로그인이 필요합니다.');
              this.$router.push('/admin/login');
              break;
            case 403:
              alert('관리자 권한이 필요합니다. 현재 토큰을 확인해주세요.');
              console.error('403 오류 - 토큰 정보:', {
                token: localStorage.getItem('token') ? '존재함' : '없음',
                tokenPreview: localStorage.getItem('token') ? localStorage.getItem('token').substring(0, 50) + '...' : 'N/A'
              });
              break;
            case 404:
              alert('파트너를 찾을 수 없습니다.');
              break;
            default:
              alert('파트너 페이지 접근에 실패했습니다.');
          }
        } else {
          alert('파트너 페이지 접근에 실패했습니다.');
        }
      }
    }
  },
  created() {
    this.searchPartners()
  }
}
</script>

<style scoped>
.partners {
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

.partners-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.partners-table th,
.partners-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.partners-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.partners-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.detail-btn {
  background-color: #3498db !important;
  color: white;
}

.delete-btn {
  background-color: #e74c3c !important;
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

.partner-details {
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

.detail-item input,
.detail-item textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.license-img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-top: 0.5rem;
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

.update-btn {
  background-color: #2ecc71 !important;
  color: white;
}

.close-btn {
  background-color: #95a5a6 !important;
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