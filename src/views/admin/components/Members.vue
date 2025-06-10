<template>
  <div class="members">
    <h1>회원 정보 관리</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="회원명 또는 이메일로 검색">
      <button @click="searchMembers">검색</button>
    </div>
    
    <table class="members-table">
      <thead>
        <tr>
          <th>회원번호</th>
          <th>이름</th>
          <th>아이디</th>
          <th>이메일</th>
          <th>가입일</th>

          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.uno">
          <td>{{ member.uno }}</td>
          <td>{{ member.uname }}</td>
          <td>{{ member.uid}}</td>
          <td>{{ member.email }}</td>
          <td>{{ member.createdAt ? member.createdAt.substring(0, 10) : '' }}</td>
          <td>
            <button @click="$router.push(`/admin/member/${member.uid}`)">상세</button>
            <button @click="deleteMember(member.uno)">삭제</button>
            <button v-if="member.isActive" @click="deactivateMember(member.uno)">비활성화</button>
            <button v-else @click="reactivateMember(member.uno)">활성화</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <h2>회원 정보 수정</h2>
        <form @submit.prevent="submitEdit">
          <div class="form-group">
            <label>이름</label>
            <input v-model="editMember.uname" required />
          </div>
          <div class="form-group">
            <label>이메일</label>
            <input v-model="editMember.email" required />
          </div>
          <div class="form-group">
            <label>전화번호</label>
            <input v-model="editMember.phone1" style="width:60px" maxlength="3" required /> -
            <input v-model="editMember.phone2" style="width:70px" maxlength="4" required /> -
            <input v-model="editMember.phone3" style="width:70px" maxlength="4" required />
          </div>
          <div class="form-group">
            <label>상태</label>
            <select v-model="editMember.isActive">
              <option :value="true">활성</option>
              <option :value="false">비활성</option>
            </select>
          </div>
          <button type="submit">저장</button>
          <button type="button" @click="closeEditModal">취소</button>
        </form>
      </div>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { memberApi } from '@/api/admin';

export default {
  name: 'Members',
  data() {
    return {
      searchQuery: '',
      members: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      loading: false,
      error: '',
      showEditModal: false,
      editMember: null
    }
  },
  methods: {
    async searchMembers() {
      this.loading = true;
      this.error = '';
      try {
        const res = await memberApi.getMembers(
          this.currentPage - 1,
          this.itemsPerPage,
          this.searchQuery
        );
        this.members = res.data.content;
        this.totalPages = res.data.totalPages;
      } catch (e) {
        this.error = '회원 목록을 불러오지 못했습니다.';
      } finally {
        this.loading = false;
      }
    },
    openEditModal(member) {
      let phone1 = member.phone1, phone2 = member.phone2, phone3 = member.phone3;
      if ((!phone1 || !phone2 || !phone3) && member.phone) {
        const parts = member.phone.split('-');
        phone1 = parts[0] || '';
        phone2 = parts[1] || '';
        phone3 = parts[2] || '';
      }
      this.editMember = { ...member, phone1, phone2, phone3 };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editMember = null;
    },
    async submitEdit() {
      this.loading = true;
      this.error = '';
      try {
        await memberApi.updateMember(this.editMember.uno, this.editMember);
        this.showEditModal = false;
        this.searchMembers();
      } catch (e) {
        this.error = '회원 정보 수정에 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    async deleteMember(uno) {
      if (!confirm('정말로 삭제하시겠습니까?')) return;
      this.loading = true;
      this.error = '';
      try {
        await memberApi.deleteMember(uno);
        this.searchMembers();
      } catch (e) {
        this.error = '회원 삭제에 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    async deactivateMember(uno) {
      this.loading = true;
      this.error = '';
      try {
        await memberApi.deactivateMember(uno);
        this.searchMembers();
      } catch (e) {
        this.error = '계정 비활성화에 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    async reactivateMember(uno) {
      this.loading = true;
      this.error = '';
      try {
        await memberApi.reactivateMember(uno);
        this.searchMembers();
      } catch (e) {
        this.error = '계정 활성화에 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      this.currentPage = page;
      this.searchMembers();
    }
  },
  created() {
    this.searchMembers();
  }
}
</script>

<style scoped>
.members {
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

.search-bar button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.members-table th,
.members-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.members-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.members-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.members-table button:first-child {
  background-color: #3498db;
  color: white;
}

.members-table button:nth-child(2) {
  background-color: #f1c40f;
  color: white;
}

.members-table button:last-child {
  background-color: #e74c3c;
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

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: block;
}

.form-group input, .form-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-top: 0.2rem;
}

.loading {
  margin-top: 1rem;
  color: #1976ed;
  text-align: center;
}

.error {
  margin-top: 1rem;
  color: #e74c3c;
  text-align: center;
}
</style> 