<script setup>
import {reactive, watch, toRefs, onMounted, ref} from 'vue'
import {createProduct} from "@/api/product.js";

const file = ref(null)  // 파일 업로드 항목 추가

const props = defineProps({
  form: Object,
  regions: Array,
  mainTypes: Array,
  subTypes: Array
})

const localForm = reactive({...props.form})

// props.form이 바뀌면 localForm도 반영
watch(
    () => props.form,
    (newForm) => {
      Object.assign(localForm, newForm)
    },
    {deep: true}
)

onMounted(() => {
  // ✅ enum 배열이 로드된 뒤 가장 첫 값으로 초기화
  if (!localForm.prodRegion && props.regions.length > 0) {
    localForm.prodRegion = props.regions[0].name
  }
  if (!localForm.mainType && props.mainTypes.length > 0) {
    localForm.mainType = props.mainTypes[0].name
  }
  if (!localForm.subType && props.subTypes.length > 0) {
    localForm.subType = props.subTypes[0].name
  }
})

function onFileChange(event) {
  const uploadedFile = event.target.files[0]
  if (uploadedFile) {
    file.value = uploadedFile
  }
}

async function submit() {
  const formData = new FormData()

  // 👉 여기를 JSON 전체로 묶어서 하나의 Blob으로 추가해야 함
  const productJson = {...localForm}
  formData.append(
      "product",
      new Blob([JSON.stringify(productJson)], {type: "application/json"})
  )

  if (file.value) {
    formData.append("thumbnailFile", file.value)
  }

  try {
    const response = await createProduct(formData)
    alert('등록 성공')
  } catch (err) {
    console.error(err)
    alert('등록 실패')
  }
}


</script>

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
          <label class="form-label">상세 장소</label>
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

<style>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column; /* 세로 정렬 */
}
</style>