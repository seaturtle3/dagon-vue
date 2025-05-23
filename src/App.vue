<template>
  <div class="container py-4">
    <HeaderNav />
    <div class="row mb-4">
      <div class="col-md-4">
        <ReservationBox />
      </div>
      <div class="col-md-8">
        <NoticeBox />
      </div>
    </div>
    <SideButtons />
    <RecommendationList />
    <PopularList />
  </div>
</template>

<script>
import HeaderNav from './components/HeaderNav.vue';
import ReservationBox from './components/ReservationBox.vue';
import NoticeBox from './components/NoticeBox.vue';
import SideButtons from './components/SideButtons.vue';
import RecommendationList from './components/RecommendationList.vue';
import PopularList from './components/PopularList.vue';

export default {
  name: 'FishingReservationPage',
  components: {
    HeaderNav,
    ReservationBox,
    NoticeBox,
    SideButtons,
    RecommendationList,
    PopularList
  }
};
</script>

<style scoped>
/* 추가적인 커스텀 스타일 필요 시 여기에 작성 */
</style>
