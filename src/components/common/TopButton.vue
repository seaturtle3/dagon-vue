<template>
  <button 
    v-show="showButton" 
    class="top-button" 
    @click="scrollToTop"
    :class="{ 'show': showButton }"
  >
    <div class="button-content">
      <font-awesome-icon :icon="['fas', 'chevron-up']" class="top-icon" />
      <span class="button-text">TOP</span>
    </div>
  </button>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'TopButton',
  components: { FontAwesomeIcon },
  setup() {
    const showButton = ref(false)
    
    const handleScroll = () => {
      showButton.value = window.scrollY > 300
    }
    
    const scrollToTop = () => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      })
    }
    
    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
    
    return {
      showButton,
      scrollToTop
    }
  }
}
</script>

<style scoped>
.top-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff;
  color: #0369a1;
  border:1px solid #b4d4e9;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(56, 189, 248, 0.08);
  z-index: var(--z-fixed);
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  backdrop-filter: blur(10px);
}

.top-button.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.top-button:hover {
  background: #e0f2fe;
  color: #0369a1;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(56, 189, 248, 0.15);
}

.top-button:active {
  color: #0369a1;
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.10);
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.button-content i {
  font-size: 1.2rem;
  line-height: 1;
}

.button-text {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1;
}

/* 반응형 */
@media (max-width: 768px) {
  .top-button {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
  .button-content i {
    font-size: 1rem;
  }
  .button-text {
    font-size: 0.5rem;
  }
}

.top-icon {
  color: #0369a1;
}
</style> 