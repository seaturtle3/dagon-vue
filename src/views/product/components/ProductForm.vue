<script setup>
import {reactive, watch, toRefs, onMounted} from 'vue'

const props = defineProps({
  form: Object,
  regions: Array,
  mainTypes: Array,
  subTypes: Array
})

const emit = defineEmits(['submit'])

const localForm = reactive({...props.form})

// props.form이 바뀌면 localForm도 반영
watch(
    () => props.form,
    (newForm) => {
      Object.assign(localForm, newForm)
    },
    {deep: true}
)

function submit() {
  emit('submit', {...localForm}) // 데이터 복사해서 emit
}

</script>

<template>

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

      <div class="d-flex justify-content-center mt-4">
        <button type="submit" class="btn btn-primary px-5">등록</button>
      </div>
    </form>
</template>