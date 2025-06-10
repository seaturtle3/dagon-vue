<script setup>
import {ref, watch, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {useFishingCenterStore} from '@/store/fishing-center/fishingCenterStore.js'

const route = useRoute()
const store = useFishingCenterStore()
const productId = route.params.id

const product = ref(null)

watch(
    () => store.products,
    (products) => {
      if (products.length > 0) {
        product.value = products.find(p => String(p.prodId) === productId)
        console.log('found product:', product.value)
      }
    },
    {immediate: true}
)

</script>

<template>
  <div class="center">
    <ProductInfo/>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  max-width: 800px;
}
</style>

