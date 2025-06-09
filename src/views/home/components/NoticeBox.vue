<script>
import { getNotices } from '@/api/notice.js';

export default {
  name: 'NoticeBox',
  data() {
    return {
      notices: [],
      search: {
        keyword: '',
        type: '',
        isActive: true
      }
    };
  },

  mounted() {
    this.fetchNotices();
  },
  methods: {
    async fetchNotices() {
      try {
        const res = await getNotices(0, 5, this.search);
        this.notices = res.data.content;
        console.log('--->', res.data);
      } catch (error) {
        console.error('공지사항 조회 실패:', error);
      }
    }
  }
};
</script>

<template>
  <div class="border p-4 rounded">
    <h2 class="card-title mb-3">공지사항</h2>
    <hr>
    <!-- 검색 조건 입력 -->
    <div class="row mb-3">
      <div class="col-md-4">
        <input v-model="search.keyword" type="text" class="form-control" placeholder="검색어 입력" />
      </div>
      <div class="col-md-3">
        <select v-model="search.type" class="form-select">
          <option value="">전체</option>
          <option value="제목">제목</option>
          <option value="내용">내용</option>
        </select>
      </div>
      <div class="col-md-2">
        <button class="btn btn-primary w-100" @click="fetchNotices">검색</button>
      </div>
    </div>

    <!-- 공지사항 목록 -->
    <ul class="list-group list-group-flush">
      <li v-for="notice in notices" :key="notice.id" class="list-group-item px-0 py-2">
        {{ notice.title }}
      </li>
    </ul>
  </div>
</template>