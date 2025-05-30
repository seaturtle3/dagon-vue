<script>
import ProductList from '@/views/product/components/ProductList.vue'
import ProductForm from '@/views/product/components/ProductForm.vue'

export default {
  name: 'ProductPage',
  components: {
    ProductList,
    ProductForm,
  },
  data() {
    return {
      showForm: false, // 등록 폼 표시 여부
    }
  },
  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
    },
    onFormSubmit() {
      this.showForm = false;
      // 등록 후 로직 (예: 리스트 다시 불러오기)
    }
  }
}
</script>

<template>
  <div>
    <ProductList v-if="!showForm" />
    <ProductForm v-if="showForm" @submitted="onFormSubmit" />

    <button @click="toggleForm">
      {{ showForm ? '뒤로가기' : '배 등록하기' }}
    </button>
  </div>
</template>
