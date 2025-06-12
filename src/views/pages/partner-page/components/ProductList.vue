<template>
  <div class="product-list">
    <div class="header">
      <h1 class="page-title">상품 관리</h1>
      <button class="register-button" @click="$router.push('/partner/product/register')">
        상품 등록
      </button>
    </div>

    <div class="filter-section">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="상품명을 입력하세요">
        <button class="search-button" @click="searchProducts">검색</button>
      </div>
      
      <div class="filter-options">
        <select v-model="typeFilter" @change="filterProducts">
          <option value="all">전체</option>
          <option value="SEA">바다낚시</option>
          <option value="FRESHWATER">민물낚시</option>
        </select>
      </div>
    </div>

    <div class="product-grid">
      <div v-for="product in filteredProducts" :key="product.prodId" class="product-card" @click="$router.push(`/products/${product.prodId}`)">
        <div class="product-image">
          <img :src="getThumbnailUrl(product.prodThumbnail)" :alt="product.prodName">
          <span :class="['type-badge', product.mainType?.toLowerCase()]">
            {{ getTypeText(product.mainType) }}
          </span>
        </div>
        
        <div class="product-info">
          <h3 class="product-name">{{ product.prodName }}</h3>
          <p class="product-region">{{ product.prodRegion || '지역 미지정' }}</p>
          <p class="product-subtype">{{ getSubTypeText(product.subType) }}</p>
        </div>
      </div>
    </div>

    <div v-if="products.length === 0" class="no-products">
      등록된 상품이 없습니다.
    </div>
  </div>
</template>

<script>
import { partnerService } from '@/api/partner';

export default {
  name: 'ProductList',
  data() {
    return {
      searchQuery: '',
      typeFilter: 'all',
      products: [],
      defaultImage: '/src/assets/images/default-product.jpg'
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const matchesSearch = product.prodName.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesType = this.typeFilter === 'all' || product.mainType === this.typeFilter;
        return matchesSearch && matchesType;
      });
    }
  },
  methods: {
    async loadProducts() {
      try {
        const response = await partnerService.getPartnerProducts();
        this.products = response.data;
      } catch (error) {
        console.error("상품 목록 로딩 실패:", error);
        alert("상품 목록을 불러오는데 실패했습니다.");
      }
    },
    getThumbnailUrl(filename) {
      return partnerService.getThumbnailUrl(filename);
    },
    getTypeText(type) {
      return type === 'SEA' ? '바다낚시' : type === 'FRESHWATER' ? '민물낚시' : '미지정';
    },
    getSubTypeText(subType) {
      const subTypeMap = {
        'BREAK_WATER': '방파제',
        'ROCKY_SHORE': '갯바위',
        'ESTUARY': '하구',
        'BOAT': '선상',
        'MUD_FLAT': '갯벌',
        'ARTIFICIAL': '인공낚시터',
        'OPEN_SEA': '해상',
        'BEACH': '해변',
        'REEF': '암초',
        'OTHER_SEA': '기타_바다',
        'RIVER': '강',
        'RESERVOIR': '저수지',
        'DAM': '댐',
        'POND': '연못',
        'SMALL_LAKE': '소류지',
        'CANAL': '수로',
        'FLOATING_PLATFORM': '좌대',
        'OPEN_AREA': '노지',
        'OTHER_FRESHWATER': '기타_민물'
      };
      return subTypeMap[subType] || '미지정';
    },
    searchProducts() {
      // 검색 로직은 computed 속성에서 처리됨
    },
    filterProducts() {
      // 필터링 로직은 computed 속성에서 처리됨
    }
  },
  mounted() {
    this.loadProducts();
  }
}
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  margin: 0;
  color: #333;
}

.register-button {
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
}

.search-button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-options {
  display: flex;
  gap: 10px;
}

.filter-options select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  position: relative;
  height: 200px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f5f5f5;
}

.type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: white;
}

.type-badge.sea {
  background-color: #1976d2;
}

.type-badge.freshwater {
  background-color: #2e7d32;
}

.product-info {
  padding: 15px;
}

.product-name {
  margin: 0 0 5px;
  color: #333;
  font-size: 1.1rem;
}

.product-region {
  margin: 0 0 5px;
  color: #666;
  font-size: 0.9rem;
}

.product-subtype {
  margin: 0;
  color: #1976d2;
  font-size: 0.9rem;
}

.no-products {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}
</style> 