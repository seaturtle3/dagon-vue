<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeOnOverlay">
    <div class="modal-dialog" tabindex="-1" ref="dialog">
      <button class="modal-close" @click="$emit('close')">&times;</button>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  mounted() {
    document.addEventListener('keydown', this.handleEsc);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEsc);
  },
  methods: {
    handleEsc(e) {
      if (this.visible && e.key === 'Escape') {
        this.$emit('close');
      }
    },
    closeOnOverlay() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-dialog {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  max-width: 90vw;
  min-height: 100px;
  position: relative;
  outline: none;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #e74c3c;
}
</style> 