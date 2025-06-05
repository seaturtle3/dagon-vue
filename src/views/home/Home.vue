<script>
import Banner from '@/views/home/components/Banner.vue'
import ReservationBox from '@/views/home/components/ReservationBox.vue'
import NoticeBox from '@/views/home/components/NoticeBox.vue'
import SideButtons from '@/views/home/components/SideButtons.vue'
import RecommendationList from '@/views/home/components/RecommendationList.vue'
import PopularList from '@/views/home/components/PopularList.vue'

export default {
  name: 'HomePage',
  components: {
    Banner,
    ReservationBox,
    NoticeBox,
    SideButtons,
    RecommendationList,
    PopularList
  }
}
</script>

<template>
  <Banner />
  <div class="home">
    <div class="row mb-4">
      <div class="col-md-4">
        <ReservationBox />
      </div>
      <div class="col-md-8">
        <NoticeBox />
      </div>
    </div>

    <SideButtons />
    <PopularList />
    <RecommendationList />
  </div>
</template>

<style>
.home {
  width: 80%;
  margin: 0 auto;
}
</style>
