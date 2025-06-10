<template>
  <div class="member-detail">
    <h1>회원 상세 정보</h1>
    <div v-if="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="member">
      <div v-if="!isEdit">
        <p><b>회원번호:</b> {{ member.uno }}</p>
        <p><b>아이디:</b> {{ member.uid }}</p>
        <p><b>이름:</b> {{ member.uname }}</p>
        <p><b>이메일:</b> {{ member.email }}</p>
        <p><b>전화번호:</b>
          <template v-if="member.phone1 && member.phone2 && member.phone3">
            {{ member.phone1 }}-{{ member.phone2 }}-{{ member.phone3 }}
          </template>
          <template v-else>
            {{ member.phone }}
          </template>
        </p>
        <p><b>포인트:</b> {{ member.points }}</p>
        <p><b>레벨:</b> {{ member.level }}</p>
        <p><b>가입일:</b> {{ member.createdAt }}</p>
        <p><b>권한:</b> {{ member.role }}</p>
        <p><b>상태:</b> {{ member.isActive ? '활성' : '비활성' }}</p>
        <button @click="isEdit = true">수정</button>
        <button @click="$router.back()">목록으로</button>
      </div>
      <div v-else>
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
            <label>포인트</label>
            <input v-model="editMember.points" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>레벨</label>
            <input v-model="editMember.level" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>가입일</label>
            <input v-model="editMember.createdAt" type="text" disabled />
          </div>
          <div class="form-group">
            <label>권한</label>
            <input v-model="editMember.role" type="text" />
          </div>
          <div class="form-group">
            <label>상태</label>
            <select v-model="editMember.isActive">
              <option :value="true">활성</option>
              <option :value="false">비활성</option>
            </select>
          </div>
          <button type="submit">저장</button>
          <button type="button" @click="isEdit = false">취소</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { memberApi } from '@/api/admin.js';

export default {
  name: 'MemberDetail',
  data() {
    return {
      member: null,
      editMember: null,
      isEdit: false,
      loading: false,
      error: ''
    }
  },
  async created() {
    this.loading = true;
    this.error = '';
    try {
      const uid = this.$route.params.uid;
      const res = await memberApi.getMemberDetail(uid);
      let member = res.data;
      if ((!member.phone1 || !member.phone2 || !member.phone3) && member.phone) {
        const parts = member.phone.split('-');
        member.phone1 = parts[0] || '';
        member.phone2 = parts[1] || '';
        member.phone3 = parts[2] || '';
      }
      this.member = member;
    } catch (e) {
      this.error = '회원 정보를 불러오지 못했습니다.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    submitEdit() {
      this.loading = true;
      this.error = '';
      memberApi.updateMember(this.member.uno, this.editMember)
        .then(() => {
          this.member = { ...this.editMember };
          this.isEdit = false;
        })
        .catch(() => {
          this.error = '회원 정보 수정에 실패했습니다.';
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
  watch: {
    isEdit(val) {
      if (val && this.member) {
        // 수정 시작 시 현재 member 정보 복사
        this.editMember = { ...this.member };
      }
    }
  }
}
</script>

<style scoped>
.member-detail {
  max-width: 500px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
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
button {
  margin-right: 0.7rem;
  margin-top: 0.5rem;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 5px;
  background: #1976ed;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
button[type="button"] {
  background: #aaa;
}
.error {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
}
</style> 