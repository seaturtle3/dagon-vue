<template>
  <div class="register">
    <div style="margin-bottom: 3%">
      <h2>배 등록</h2>
    </div>

    <form
        @submit.prevent="submit"
        enctype="multipart/form-data"
        class="mx-auto"
        style="max-width: 800px; padding: 0 16px;"
    >
      <div class="row">
        <div class="mb-3 col-md-6">
          <label class="form-label">배 이름</label>
          <input v-model="localForm.prodName" type="text" class="form-control" required/>
        </div>

        <div class="mb-3 col-md-6">
          <label class="form-label">지역</label>
          <select v-model="localForm.prodRegion" class="form-select">
            <option v-for="region in regions" :key="region.name" :value="region.name">
              {{ region.korean }}
            </option>
          </select>
        </div>

        <div class="mb-3 col-md-6">
          <label class="form-label">바다/민물 유형</label>
          <select v-model="localForm.mainType" class="form-select">
            <option v-for="type in mainTypes" :key="type.name" :value="type.name">
              {{ type.korean }}
            </option>
          </select>
        </div>

        <div class="mb-3 col-md-6">
          <label class="form-label">서브 유형</label>
          <select v-model="localForm.subType" class="form-select">
            <option v-for="sub in subTypes" :key="sub.name" :value="sub.name">
              {{ sub.korean }}
            </option>
          </select>
        </div>

        <div class="mb-3 col-md-6">
          <label class="form-label">최대 인원</label>
          <input v-model.number="localForm.maxPerson" type="number" class="form-control" required/>
        </div>

        <div class="mb-3 col-md-6">
          <label class="form-label">최소 인원</label>
          <input v-model.number="localForm.minPerson" type="number" class="form-control" required/>
        </div>

        <div class="mb-3 col-md-6">
          <label class="form-label">배 무게</label>
          <input v-model.number="localForm.weight" step="0.01" type="number" class="form-control"/>
        </div>

        <div class="mb-3 col-md-6">
          <label class="form-label">배 주소</label>
          <input v-model="localForm.prodAddress" type="text" class="form-control"/>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">배 설명</label>
        <textarea v-model="localForm.prodDescription" class="form-control"></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">이벤트</label>
        <textarea v-model="localForm.prodEvent" class="form-control"></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">공지 사항</label>
        <textarea v-model="localForm.prodNotice" class="form-control"></textarea>
      </div>

      <div class="mb-2">
        <label class="form-label">대표 이미지</label>
        <input type="file" class="form-control" @change="onFileChange"/>
      </div>

      <div class="d-flex justify-content-center mt-3">
        <button type="submit" class="btn btn-primary px-5">등록</button>
      </div>
    </form>
  </div>
</template>

<script>
import { partnerService } from "@/api/partner";

export default {
  name: 'ProductRegister',
  data() {
    return {
      file: null,
      localForm: {
        prodName: '',
        prodRegion: '',
        mainType: '',
        subType: '',
        maxPerson: null,
        minPerson: null,
        weight: null,
        prodAddress: '',
        prodDescription: '',
        prodEvent: '',
        prodNotice: ''
      },
      regions: [
        { name: 'SEOUL', korean: '서울' },
        { name: 'GYEONGGI', korean: '경기도' },
        { name: 'INCHEON', korean: '인천' },
        { name: 'BUSAN', korean: '부산' },
        { name: 'DAEGU', korean: '대구' },
        { name: 'GWANGJU', korean: '광주' },
        { name: 'DAEJEON', korean: '대전' },
        { name: 'ULSAN', korean: '울산' },
        { name: 'SEJONG', korean: '세종' },
        { name: 'GANGWON', korean: '강원도' },
        { name: 'JEJU', korean: '제주도' },
        { name: 'GYEONGBUK', korean: '경상북도' },
        { name: 'GYEONGNAM', korean: '경상남도' },
        { name: 'JEONBUK', korean: '전라북도' },
        { name: 'JEONNAM', korean: '전라남도' },
        { name: 'CHUNGBUK', korean: '충청북도' },
        { name: 'CHUNGNAM', korean: '충청남도' }
      ],
      mainTypes: [
        { name: 'SEA', korean: '바다낚시' },
        { name: 'FRESHWATER', korean: '민물낚시' }
      ],
      subTypes: [
        { name: 'BREAK_WATER', korean: '방파제' },
        { name: 'ROCKY_SHORE', korean: '갯바위' },
        { name: 'ESTUARY', korean: '하구' },
        { name: 'BOAT', korean: '선상' },
        { name: 'MUD_FLAT', korean: '갯벌' },
        { name: 'ARTIFICIAL', korean: '인공낚시터' },
        { name: 'OPEN_SEA', korean: '해상' },
        { name: 'BEACH', korean: '해변' },
        { name: 'REEF', korean: '암초' },
        { name: 'OTHER_SEA', korean: '기타_바다' },
        { name: 'RIVER', korean: '강' },
        { name: 'RESERVOIR', korean: '저수지' },
        { name: 'DAM', korean: '댐' },
        { name: 'POND', korean: '연못' },
        { name: 'SMALL_LAKE', korean: '소류지' },
        { name: 'CANAL', korean: '수로' },
        { name: 'FLOATING_PLATFORM', korean: '좌대' },
        { name: 'OPEN_AREA', korean: '노지' },
        { name: 'OTHER_FRESHWATER', korean: '기타_민물' }
      ]
    }
  },
  methods: {
    onFileChange(event) {
      const uploadedFile = event.target.files[0]
      if (uploadedFile) {
        this.file = uploadedFile
      }
    },
    async submit() {
      await partnerService.handleProductRegistration(this.localForm, this.file, this.$router);
    }
  },
  mounted() {
    // No need to call checkAuth() as it's handled by the interceptor
  }
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
}

.form-label {
  font-weight: 500;
  color: #333;
}

.form-control, .form-select {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
}

.form-control:focus, .form-select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
}

.btn-primary {
  background-color: #1976d2;
  border-color: #1976d2;
}

.btn-primary:hover {
  background-color: #1565c0;
  border-color: #1565c0;
}
</style> 