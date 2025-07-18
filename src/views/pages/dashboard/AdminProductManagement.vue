<template>
  <div class="admin-product-management">
    <div class="header">
      <h1 class="page-title">제품 관리</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="showCreateModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" />
          새 제품 등록
        </button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <font-awesome-icon :icon="['fas', 'ship']" />
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalProducts || 0 }}</h3>
          <p>전체 제품</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <font-awesome-icon :icon="['fas', 'check-circle']" />
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeProducts || 0 }}</h3>
          <p>활성 제품</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sea">
          <font-awesome-icon :icon="['fas', 'water']" />
        </div>
        <div class="stat-content">
          <h3>{{ stats.seaProducts || 0 }}</h3>
          <p>바다낚시</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon freshwater">
          <font-awesome-icon :icon="['fas', 'fish']" />
        </div>
        <div class="stat-content">
          <h3>{{ stats.freshwaterProducts || 0 }}</h3>
          <p>민물낚시</p>
        </div>
      </div>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="제품명, 설명, 주소로 검색..."
          @input="debounceSearch"
        >
        <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
      </div>
      
      <div class="filter-options">
        <select v-model="filters.mainType" @change="updateFilters">
          <option value="">전체 타입</option>
          <option value="SEA">바다낚시</option>
          <option value="FRESHWATER">민물낚시</option>
        </select>
        
        <select v-model="filters.region" @change="updateFilters">
          <option value="">전체 지역</option>
          <option value="BUSAN">부산</option>
          <option value="ULSAN">울산</option>
          <option value="GYEONGNAM">경남</option>
          <option value="JEONNAM">전남</option>
          <option value="JEJU">제주</option>
          <option value="GANGWON">강원</option>
          <option value="CHUNGBUK">충북</option>
          <option value="CHUNGNAM">충남</option>
          <option value="JEONBUK">전북</option>
          <option value="GYEONGBUK">경북</option>
          <option value="GYEONGGI">경기</option>
          <option value="SEOUL">서울</option>
          <option value="INCHEON">인천</option>
        </select>
        
        <select v-model="filters.deleted" @change="updateFilters">
          <option value="">전체 상태</option>
          <option value="false">활성</option>
          <option value="true">삭제됨</option>
        </select>
      </div>
    </div>

    <!-- 제품 목록 -->
    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>썸네일</th>
            <th>제품명</th>
            <th>타입</th>
            <th>지역</th>
            <th>파트너</th>
            <th>상태</th>
            <th>등록일</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.prodId">
            <td>{{ product.prodId }}</td>
            <td>
              <div class="product-image-container">
                <img 
                  v-if="getProductImageUrl(product)" 
                  :src="getProductImageUrl(product)" 
                  :alt="product.prodName"
                  class="product-thumbnail"
                  style="cursor:pointer"
                  @click="goToDetail(product.prodId)"
                >
                <div v-else class="no-image">
                  <i class="fas fa-ship"></i>
                  <span>이미지 없음</span>
                </div>
              </div>
            </td>
            <td>
              <div class="product-name" style="cursor:pointer" @click="goToDetail(product.prodId)">{{ product.prodName }}</div>
              <div class="product-address">{{ product.prodAddress }}</div>
            </td>
            <td>
              <span :class="['type-badge', product.mainType.toLowerCase()]">
                {{ getMainTypeLabel(product.mainType) }}
              </span>
            </td>
            <td>{{ getRegionLabel(product.prodRegion) }}</td>
            <td>{{ product.partner?.pname || 'N/A' }}</td>
            <td>
              <span :class="['status-badge', product.deleted ? 'deleted' : 'active']">
                {{ product.deleted ? '삭제됨' : '활성' }}
              </span>
            </td>
            <td>{{ formatDate(product.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" @click="editProduct(product)">
                  <font-awesome-icon :icon="['fas', 'edit']" />
                </button>
                <button 
                  v-if="product.deleted" 
                  class="btn-restore" 
                  @click="restoreProduct(product.prodId)"
                >
                  <font-awesome-icon :icon="['fas', 'undo']" />
                </button>
                <button 
                  v-else 
                  class="btn-delete" 
                  @click="deleteProduct(product.prodId)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination-section">
      <div class="pagination-info">
        총 {{ totalElements }}개 중 {{ (currentPage * pageSize) + 1 }}-{{ Math.min((currentPage + 1) * pageSize, totalElements) }}개
      </div>
      <div class="pagination-controls">
        <button 
          :disabled="currentPage === 0" 
          @click="changePage(currentPage - 1)"
          class="btn-page"
        >
          이전
        </button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage >= totalPages - 1" 
          @click="changePage(currentPage + 1)"
          class="btn-page"
        >
          다음
        </button>
      </div>
    </div>

    <!-- 제품 등록/수정 모달 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? '제품 수정' : '새 제품 등록' }}</h2>
          <button class="btn-close" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <form @submit.prevent="submitForm" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label>제품명 *</label>
              <input v-model="form.prodName" type="text" required>
            </div>
            <div class="form-group">
              <label>지역 *</label>
              <select v-model="form.prodRegion" required>
                <option value="">지역 선택</option>
                <option v-for="region in regions" :key="region.name" :value="region.name">
                  {{ region.korean }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>타입 *</label>
              <select v-model="form.mainType" required>
                <option value="">타입 선택</option>
                <option v-for="type in mainTypes" :key="type.name" :value="type.name">
                  {{ type.korean }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>세부 타입 *</label>
              <select v-model="form.subType" required>
                <option value="">세부 타입 선택</option>
                <option v-for="sub in subTypes.filter(st => st.mainType === form.mainType)" :key="sub.name" :value="sub.name">
                  {{ sub.korean }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>지역 *</label>
              <select v-model="form.prodRegion" required>
                <option value="">지역 선택</option>
                <option v-for="region in regions" :key="region.name" :value="region.name">
                  {{ region.korean }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>최소 인원</label>
              <input v-model.number="form.minPerson" type="number" min="1">
            </div>
            <div class="form-group">
              <label>최대 인원</label>
              <input v-model.number="form.maxPerson" type="number" min="1">
            </div>
          </div>
          <div class="form-group">
            <label>주소</label>
            <input v-model="form.prodAddress" type="text">
          </div>
          <div class="form-group">
            <label>파트너 *</label>
            <select v-model="form.uno" required>
              <option value="">파트너 선택</option>
              <option v-for="partner in partners" :key="partner.uno" :value="partner.uno">
                {{ partner.pname }} ({{ partner.ceoName }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>설명 *</label>
            <textarea v-model="form.prodDescription" required rows="4"></textarea>
          </div>
          <!-- 이미지 업로드/삭제 UI -->
          <div class="form-group">
            <label>제품 이미지</label>
            <div class="image-preview-list">
              <div v-for="(img, idx) in existingImages" :key="img.id" class="image-preview-item">
                <img :src="img.url" :alt="img.name" class="preview-img" />
                <button type="button" class="btn-delete-image" @click="removeExistingImage(img, idx)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div v-for="(img, idx) in newImagePreviews" :key="'new-'+idx" class="image-preview-item">
                <img :src="img.url" :alt="img.name" class="preview-img" />
                <button type="button" class="btn-delete-image" @click="removeNewImage(idx)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <input ref="imageInput" type="file" multiple accept="image/*" @change="onFileChange" style="display:none" />
            <button type="button" class="btn-upload" @click="$refs.imageInput.click()">
              <i class="fas fa-plus"></i> 이미지 추가
            </button>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">취소</button>
            <button type="submit" class="btn-primary">
              {{ showEditModal ? '수정' : '등록' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useAdminProductStore } from '@/store/admin/useAdminProductStore.js'
import { BASE_URL } from '@/constants/baseUrl.js'
import api from '@/lib/axios'
import { useRouter } from 'vue-router'

const partners = ref([])

// ENUM 옵션 상태
const mainTypes = ref([])
const subTypes = ref([])
const regions = ref([])

const fetchEnumOptions = async () => {
  mainTypes.value = (await api.get('/api/enums/main-types')).data
  subTypes.value = (await api.get('/api/enums/sub-types')).data
  regions.value = (await api.get('/api/enums/prod-regions')).data
}

const fetchPartners = async () => {
  try {
    const res = await api.get('/api/partner/all', { params: { size: 1000 } })
    partners.value = res.data.content || res.data || []
  } catch (e) {
    partners.value = []
  }
}

// 이미지 업로드/삭제 관련 상태
const existingImages = ref([]) // 기존 이미지(수정 시)
const newImages = ref([]) // 새로 추가된 파일 객체
const newImagePreviews = ref([]) // 새로 추가된 미리보기
const deletedImageNames = ref([])

function onFileChange(event) {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        newImagePreviews.value.push({ url: e.target.result, name: file.name })
      }
      reader.readAsDataURL(file)
      newImages.value.push(file)
    }
  })
}
function removeNewImage(idx) {
  newImages.value.splice(idx, 1)
  newImagePreviews.value.splice(idx, 1)
}
function removeExistingImage(img, idx) {
  deletedImageNames.value.push(img.name)
  existingImages.value.splice(idx, 1)
}

// 폼 진입 시 기존 이미지 세팅
function setEditImages(product) {
  existingImages.value = []
  if (product.prodImageDataList && product.prodImageDataList.length > 0) {
    existingImages.value = product.prodImageDataList.map((img, idx) => ({
      id: 'existing-' + idx,
      url: img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`,
      name: product.prodImageNames?.[idx] || `image_data_${idx}`
    }))
  } else if (product.prodImageNames) {
    existingImages.value = product.prodImageNames.map((img, idx) => ({
      id: 'existing-' + idx,
      url: BASE_URL + img,
      name: img
    }))
  }
}

// 스토어 사용
const adminProductStore = useAdminProductStore()

// 상태 관리
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingProduct = ref(null)

// 스토어에서 상태 가져오기
const products = computed(() => adminProductStore.products)
const stats = computed(() => adminProductStore.stats)
const currentPage = computed(() => adminProductStore.currentPage)
const totalPages = computed(() => adminProductStore.totalPages)
const totalElements = computed(() => adminProductStore.totalElements)
const pageSize = computed(() => adminProductStore.pageSize)
const filters = computed(() => adminProductStore.filters)



const form = reactive({
  prodName: '',
  prodRegion: '',
  mainType: '',
  subType: '',
  minPerson: null,
  maxPerson: null,
  prodAddress: '',
  prodDescription: '',
  uno: ''
})

// 메서드들
const loadProducts = async () => {
  try {
    await adminProductStore.fetchProducts()
  } catch (error) {
    alert('제품 목록을 불러오는데 실패했습니다.')
  }
}

const loadStats = async () => {
  try {
    await adminProductStore.fetchStats()
  } catch (error) {
    console.error('통계 로드 실패:', error)
  }
}



const changePage = (page) => {
  adminProductStore.setPage(page)
  loadProducts()
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    adminProductStore.setPage(0)
    loadProducts()
  }, 300)
}

const updateFilters = () => {
  adminProductStore.setFilters({
    search: filters.value.search,
    mainType: filters.value.mainType,
    region: filters.value.region,
    deleted: filters.value.deleted
  })
  loadProducts()
}



let searchTimeout = null

const editProduct = (product) => {
  editingProduct.value = product
  Object.assign(form, {
    prodName: product.prodName,
    prodRegion: product.prodRegion,
    mainType: product.mainType,
    subType: product.subType,
    minPerson: product.minPerson,
    maxPerson: product.maxPerson,
    prodAddress: product.prodAddress,
    prodDescription: product.prodDescription,
    uno: product.partner?.uno || ''
  })
  setEditImages(product)
  newImages.value = []
  newImagePreviews.value = []
  deletedImageNames.value = []
  showEditModal.value = true
}

const deleteProduct = async (productId) => {
  if (!confirm('정말로 이 제품을 삭제하시겠습니까?')) return
  
  try {
    await adminProductStore.deleteProduct(productId)
    alert('제품이 삭제되었습니다.')
    loadProducts()
    loadStats()
  } catch (error) {
    alert('제품 삭제에 실패했습니다.')
  }
}

const restoreProduct = async (productId) => {
  try {
    await adminProductStore.restoreProduct(productId)
    alert('제품이 복구되었습니다.')
    loadProducts()
    loadStats()
  } catch (error) {
    alert('제품 복구에 실패했습니다.')
  }
}

const submitForm = async () => {
  try {
    const formData = new FormData()
    // dto로 form 데이터 append
    formData.append('dto', new Blob([JSON.stringify(form)], { type: 'application/json' }));
    
    // 새 이미지
    newImages.value.forEach(file => {
      formData.append('images', file)
    })
    // 삭제 이미지 
    deletedImageNames.value.forEach(name => {
      formData.append('deleteImageNames', name)
    })
    
    if (showEditModal.value) {
      await adminProductStore.updateProduct(editingProduct.value.prodId, formData)
      alert('제품이 수정되었습니다.')
    } else {
      await adminProductStore.createProduct(formData)
      alert('제품이 등록되었습니다.')
    }
    
    // 모달 닫기
    closeModal()
    
    // 목록 및 통계 갱신
    await loadProducts()
    await loadStats()
    
    // 성공 메시지 표시 (선택사항)
    console.log('제품 목록이 갱신되었습니다.')
    
  } catch (error) {
    console.error('제품 저장 실패:', error)
    alert('제품 저장에 실패했습니다.')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingProduct.value = null
  Object.assign(form, {
    prodName: '',
    prodRegion: '',
    mainType: '',
    subType: '',
    minPerson: null,
    maxPerson: null,
    prodAddress: '',
    prodDescription: '',
    uno: ''
  })
  existingImages.value = []
  newImages.value = []
  newImagePreviews.value = []
  deletedImageNames.value = []
}

const getMainTypeLabel = (mainType) => {
  return mainType === 'SEA' ? '바다낚시' : '민물낚시'
}

const getRegionLabel = (region) => {
  const regionLabels = {
    'BUSAN': '부산',
    'ULSAN': '울산',
    'GYEONGNAM': '경남',
    'JEONNAM': '전남',
    'JEJU': '제주',
    'GANGWON': '강원',
    'CHUNGBUK': '충북',
    'CHUNGNAM': '충남',
    'JEONBUK': '전북',
    'GYEONGBUK': '경북',
    'GYEONGGI': '경기',
    'SEOUL': '서울',
    'INCHEON': '인천'
  }
  return regionLabels[region] || region
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const getProductImageUrl = (product) => {
  console.log(`🔍 [AdminProductManagement] 상품 ID ${product.prodId} 이미지 디버깅:`, {
    prodName: product.prodName,
    imagesCount: product.images?.length || 0,
    prodImageDataListCount: product.prodImageDataList?.length || 0,
    prodImageNamesCount: product.prodImageNames?.length || 0
  })

  // images 배열에서 썸네일 우선 (목록보기에서는 thumbnailData 우선)
  if (product.images && product.images.length > 0) {
    // 썸네일 이미지 찾기
    const thumbnailImage = product.images.find(img => img.thumbnail)
    if (thumbnailImage) {
      // 목록보기에서는 thumbnailData 우선 (빠른 로딩)
      if (thumbnailImage.thumbnailData) {
        console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: images[thumbnail].thumbnailData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.thumbnailData}`
      }
      if (thumbnailImage.imageData) {
        console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: images[thumbnail].imageData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.imageData}`
      }
      if (thumbnailImage.imageUrl) {
        console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: images[thumbnail].imageUrl 사용`)
        return thumbnailImage.imageUrl.startsWith('/') ? `${BASE_URL}${thumbnailImage.imageUrl}` : thumbnailImage.imageUrl
      }
    }
    
    // 썸네일이 없으면 첫 번째 이미지 사용
    const firstImage = product.images[0]
    if (firstImage.thumbnailData) {
      console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: images[0].thumbnailData 사용`)
      return `data:image/jpeg;base64,${firstImage.thumbnailData}`
    }
    if (firstImage.imageData) {
      console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: images[0].imageData 사용`)
      return `data:image/jpeg;base64,${firstImage.imageData}`
    }
    if (firstImage.imageUrl) {
      console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: images[0].imageUrl 사용`)
      return firstImage.imageUrl.startsWith('/') ? `${BASE_URL}${firstImage.imageUrl}` : firstImage.imageUrl
    }
  }
  
  // 기존 방식 (fallback)
  if (product.prodImageDataList && product.prodImageDataList.length > 0) {
    console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: prodImageDataList 사용 (fallback)`)
    const firstImageData = product.prodImageDataList[0]
    if (firstImageData && firstImageData.startsWith('data:image')) {
      return firstImageData
    } else if (firstImageData) {
      return `data:image/jpeg;base64,${firstImageData}`
    }
  }
  
  if (product.prodImageNames && product.prodImageNames.length > 0) {
    console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: prodImageNames 사용 (fallback)`)
    const firstImageName = product.prodImageNames[0]
    if (firstImageName.startsWith('/')) {
      return `${BASE_URL}${firstImageName}`
    } else {
      return `${BASE_URL}/uploads/products/${firstImageName}`
    }
  }
  
  if (product.prodThumbnail) {
    console.log(`✅ [AdminProductManagement] 상품 ID ${product.prodId}: prodThumbnail 사용 (fallback)`)
    if (product.prodThumbnail.startsWith('/')) {
      return `${BASE_URL}${product.prodThumbnail}`
    } else {
      return `${BASE_URL}/uploads/products/${product.prodThumbnail}`
    }
  }
  
  // 기본 이미지
  console.log(`⚠️ [AdminProductManagement] 상품 ID ${product.prodId}: 기본 이미지 사용 (null)`)
  return null
}

const router = useRouter()
const goToDetail = (prodId) => {
  // 상세보기 페이지로 이동하는 대신 수정 모달 열기
  const product = products.value.find(p => p.prodId === prodId)
  if (product) {
    editProduct(product)
  }
}

// 라이프사이클
onMounted(() => {
  loadProducts()
  loadStats()
  fetchPartners()
  fetchEnumOptions()
})
</script>

<style scoped>
.admin-product-management {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #2980b9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: #95a5a6;
}

.stat-icon.active {
  background: #27ae60;
}

.stat-icon.sea {
  background: #3498db;
}

.stat-icon.freshwater {
  background: #e67e22;
}

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.filter-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-options select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 120px;
}

.products-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.product-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.product-thumbnail:hover {
  transform: scale(1.05);
}

.no-image {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border: 1px dashed #1976d2;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1976d2;
}

.no-image i {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  opacity: 0.7;
}

.no-image span {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.8;
}

.product-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.product-address {
  font-size: 0.9rem;
  color: #7f8c8d;
}



.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-badge.sea {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.freshwater {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.deleted {
  background: #ffebee;
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete, .btn-restore {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-restore {
  background: #27ae60;
  color: white;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #7f8c8d;
}

.product-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-delete-image {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  color: #e74c3c;
  z-index: 10;
}

.btn-upload {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;
}

.btn-upload:hover {
  background: #2980b9;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .admin-product-management {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-options {
    flex-direction: column;
  }
  
  .products-table {
    overflow-x: auto;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style> 