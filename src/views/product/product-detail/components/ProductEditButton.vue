<script setup>
import { useRouter } from 'vue-router';
import {useProductFormStore} from "@/store/product/all-products/useProductFormStore.js";

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();

// 상품 수정 페이지로 이동
function editProduct() {
  const store = useProductFormStore();
  store.setForm(props.product); // props에서 직접 꺼내 쓰기
  router.push({
    name: 'ProductEdit',
    params: { id: props.product.prodId } // ← 여기에 ID 포함
  });
}

console.log("넘기는 product 확인:", props.product);
</script>

<template>
  <button @click="editProduct" class="btn btn-primary">
    <i class="fas fa-edit"></i> 수정
  </button>
</template>