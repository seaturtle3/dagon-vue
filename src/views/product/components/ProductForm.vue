<script setup>
import { onMounted } from 'vue'
import { useProductStore } from '@/store/product/productStore'

const store = useProductStore()

const form = store.form
const regions = store.enums.regions
const mainTypes = store.enums.mainTypes
const subTypes = store.enums.subTypes

onMounted(() => {
  store.loadEnums()
})

function submit() {
  store.submitForm()
}
</script>

<template>
  <form @submit.prevent="submitForm" enctype="multipart/form-data" class="container mt-5">
    <div class="mb-3">
      <label for="prodName" class="form-label">배 이름</label>
      <input v-model="form.prodName" type="text" class="form-control" id="prodName" required />
    </div>

    <div class="mb-3">
      <label for="prodRegion" class="form-label">지역</label>
      <select v-model="form.prodRegion" class="form-select" id="prodRegion">
        <option v-for="region in regions" :key="region.name" :value="region.name">
          {{ region.korean }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <label for="mainType" class="form-label">바다/민물 유형</label>
      <select v-model="form.mainType" class="form-select" id="mainType">
        <option v-for="type in mainTypes" :key="type.name" :value="type.name">
          {{ type.korean }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <label for="subType" class="form-label">서브 유형</label>
      <select v-model="form.subType" class="form-select" id="subType">
        <option v-for="sub in subTypes" :key="sub.name" :value="sub.name">
          {{ sub.korean }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <label for="maxPerson" class="form-label">최대 인원</label>
      <input v-model.number="form.maxPerson" type="number" class="form-control" id="maxPerson" required />
    </div>

    <div class="mb-3">
      <label for="minPerson" class="form-label">최소 인원</label>
      <input v-model.number="form.minPerson" type="number" class="form-control" id="minPerson" required />
    </div>

    <div class="mb-3">
      <label for="weight" class="form-label">배 무게</label>
      <input v-model.number="form.weight" step="0.01" type="number" class="form-control" id="weight" />
    </div>

    <div class="mb-3">
      <label for="prodAddress" class="form-label">배 주소</label>
      <input v-model="form.prodAddress" type="text" class="form-control" id="prodAddress" />
    </div>

    <div class="mb-3">
      <label for="prodDescription" class="form-label">배 설명</label>
      <textarea v-model="form.prodDescription" class="form-control" id="prodDescription"></textarea>
    </div>

    <div class="mb-3">
      <label for="prodEvent" class="form-label">이벤트</label>
      <textarea v-model="form.prodEvent" class="form-control" id="prodEvent"></textarea>
    </div>

    <div class="mb-3">
      <label for="prodNotice" class="form-label">공지 사항</label>
      <textarea v-model="form.prodNotice" class="form-control" id="prodNotice"></textarea>
    </div>

    <button type="submit" class="btn btn-primary">등록</button>
  </form>
</template>

<style scoped>
</style>
