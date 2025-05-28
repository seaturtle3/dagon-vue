<script>
export default {
  props: ['products'],
}
</script>

<template>
  <div class="row row-cols-1 row-cols-md-5 g-3">
    <div v-for="product in products" :key="product.id" class="col">
      <div class="card h-100" @click="$emit('select', product)" style="cursor: pointer;">
        <img
            :src="`/uploads/${product.prodThumbnail}`"
            class="card-img-top"
            alt="썸네일"
            style="height: 120px; object-fit: cover;"
        />
        <div class="card-body p-2">
          <h6 class="card-title mb-1">{{ product.prodName }}</h6>
          <p class="card-text text-muted" style="font-size: 0.8rem;">
            {{ product.prodRegion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>