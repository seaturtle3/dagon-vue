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
    <SideButtons />
    <PopularList />
    <RecommendationList />

    <div class="row mb-5 mt-5">
      <div>
        <NoticeBox />
      </div>
    </div>

  </div>
</template>

<style>
.home {
  width: 80%;
  margin: 0 auto;
}
</style>
