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
        <p>
          <b>프로필 이미지:</b><br>
          <img :src="getProfileImgUrl(member.profileImg)" alt="프로필 이미지" style="max-width:120px;max-height:120px;border-radius:50%;border:1px solid #eee;">
        </p>
        <p><b>포인트:</b> {{ member.points }}</p>
        <p><b>레벨:</b> {{ getLevelByPoints(member.points) }}</p>
        <p><b>가입일:</b> {{ formattedCreatedAt }}</p>
        <p><b>권한:</b> {{ member.role }}</p>
        <p><b>상태:</b> {{ member.isActive ? '활성' : '비활성' }}</p>
        <button @click="isEdit = true">수정</button>
        <button @click="$router.back()">목록으로</button>
      </div>
      <div v-else>
        <form @submit.prevent="submitEdit" enctype="multipart/form-data">
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
            <input :value="calculatedLevel" type="text" disabled />
          </div>
          <div class="form-group">
            <label>가입일</label>
            <input :value="formatDate(editMember.createdAt)" type="text" disabled />
          </div>
          <div class="form-group">
            <label>권한</label>
            <select v-model="editMember.role">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PARTNER">PARTNER</option>
            </select>
          </div>
          <div class="form-group">
            <label>상태</label>
            <select v-model="editMember.isActive">
              <option :value="true">활성</option>
              <option :value="false">비활성</option>
            </select>
          </div>
          <div class="form-group">
            <label>프로필 이미지</label>
            <input type="file" @change="onProfileImgChange" />
            <div v-if="profileImgPreview" style="margin-top:10px;">
              <img :src="profileImgPreview" alt="미리보기" style="max-width:120px;max-height:120px;border-radius:50%;border:1px solid #eee;">
            </div>
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
import { BASE_URL } from '@/constants/baseUrl.js';

export default {
  name: 'MemberDetail',
  data() {
    return {
      member: null,
      editMember: null,
      isEdit: false,
      loading: false,
      error: '',
      profileImgFile: null,
      profileImgPreview: null
    }
  },
  async created() {
    this.loading = true;
    this.error = '';
    try {
      const uid = this.$route.params.uid;
      const res = await memberApi.getMemberDetail(uid);
      let member = res.data;
      member.profileImg = member.profile_image;
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
  computed: {
    calculatedLevel() {
      const points = Number(this.editMember?.points) || 0;
      if (points >= 3000) return 'DIAMOND';
      else if (points >= 2000) return 'PLATINUM';
      else if (points >= 1000) return 'GOLD';
      else return 'SILVER';
    },
    formattedCreatedAt() {
      return this.formatDate(this.member?.createdAt);
    }
  },
  methods: {
    getProfileImgUrl(img) {
      if (!img) return '/images/default-profile.png';
      if (img.startsWith('http')) return img;
      return `${BASE_URL}/uploads/${img}`;
    },
    getLevelByPoints(points) {
      points = Number(points) || 0;
      if (points >= 3000) return 'DIAMOND';
      else if (points >= 2000) return 'PLATINUM';
      else if (points >= 1000) return 'GOLD';
      else return 'SILVER';
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    },
    getLevelNumber(levelStr) {
      switch (levelStr) {
        case 'DIAMOND': return 3;
        case 'PLATINUM': return 2;
        case 'GOLD': return 1;
        default: return 0; // SILVER
      }
    },
    onProfileImgChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.profileImgFile = file;
        this.profileImgPreview = URL.createObjectURL(file);
      }
    },
    submitEdit() {
      this.loading = true;
      this.error = '';

      const formData = new FormData();
      formData.append('uname', this.editMember.uname || '');
      formData.append('nickname', this.editMember.nickname || '');
      formData.append('email', this.editMember.email || '');
      formData.append('phone1', this.editMember.phone1 || '');
      formData.append('phone2', this.editMember.phone2 || '');
      formData.append('phone3', this.editMember.phone3 || '');
      formData.append('points', String(this.editMember.points || 0));
      formData.append('level', String(this.getLevelNumber(this.calculatedLevel)));
      formData.append('levelPoint', String(this.editMember.levelPoint || 0));
      formData.append('loginType', this.editMember.loginType || 'LOCAL');
      formData.append('role', this.editMember.role || 'USER');
      formData.append('isActive', String(this.editMember.isActive));
      if (this.profileImgFile) {
        formData.append('profileImage', this.profileImgFile);
      }

      // FormData 내용 콘솔 출력
      for (let pair of formData.entries()) {
        console.log(pair[0]+':', pair[1]);
      }

      memberApi.updateMember(this.member.uno, formData)
        .then(() => {
          this.member = { ...this.editMember, level: this.calculatedLevel };
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
        this.editMember = { ...this.member };
        this.profileImgFile = null;
        this.profileImgPreview = this.getProfileImgUrl(this.member.profileImg);
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