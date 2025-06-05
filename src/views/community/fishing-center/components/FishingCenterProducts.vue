<script setup>
defineProps({
  products: Array
})

const emit = defineEmits(['select'])

function onClick(product) {
  emit('select', product)
}
</script>

<template>
  <div class="row row-cols-1 row-cols-md-5 g-3">
    <div
        v-for="product in products"
        :key="product.prodId"
        class="col"
        @click="onClick(product)"
    >
      <div class="card h-100" style="cursor: pointer;">
        <img
            :src="`/uploads/${product.prodThumbnail}`"
            class="card-img-top"
            alt="썸네일"
            style="height: 60%; object-fit: cover;"
        />
        <div class="card-body p-2 mt-2">
          <h6 class="card-title mb-1">
            {{ product.prodName }}</h6>
          <p class="card-text text-muted" style="font-size: 0.8rem;">
            {{ product.prodRegion }}
          </p>
          <small class="text-muted">
            {{ product.createdAt }}</small>
        </div>
      </div>
    </div>
  </div>
</template>
