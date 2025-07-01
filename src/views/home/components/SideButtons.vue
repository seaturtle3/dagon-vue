<template>
  <div class="side-buttons">
    <button class="side-button sea-button">
      <span class="button-text">바다</span>
    </button>
    <button class="side-button freshwater-button">
      <span class="button-text">민물</span>
    </button>
    <button class="side-button top-button" @click="scrollToTop">
      <font-awesome-icon icon="chevron-up" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'SideButtons',
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>
.side-buttons {
  position: fixed;
  top: 20%;
  right: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  z-index: var(--z-fixed);
}

.side-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1.5px solid var(--gray-600);
  background: white;
  color: var(--gray-600);
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.side-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--light-blue), var(--accent-blue));
}

.side-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.sea-button {
  border-color: var(--gray-600);
  color: var(--gray-600);
  background: white;
}

.sea-button:hover,
.freshwater-button:hover,
.top-button:hover {
  background: white;
  color: var(--gray-700);
  border-color: var(--gray-700);
}

.freshwater-button {
  border-color: var(--gray-600);
  color: var(--gray-600);
  background: white;
}

.top-button {
  border-color: var(--gray-600);
  color: var(--gray-600);
  background: white;
  font-size: 1.2rem;
}

.button-text {
  text-align: center;
  line-height: 1.2;
}

/* 반응형 */
@media (max-width: 768px) {
  .side-buttons {
    right: var(--spacing-sm);
  }
  
  .side-button {
    width: 40px;
    height: 40px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  .top-button {
    font-size: 1rem;
  }
}
</style>