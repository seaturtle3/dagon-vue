<script setup>
defineProps({
  filteredProducts: Array
})
</script>

<template>
  <ul>
    <li v-for="product in filteredProducts" :key="product.prodId">
      {{ product.prodName }}
    </li>
  </ul>
</template>

<style scoped>
</style>
