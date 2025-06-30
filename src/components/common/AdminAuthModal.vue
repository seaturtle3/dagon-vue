  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h3>관리자로 로그인 하려면 기존 로그인을 로그아웃하고 로그인을 진행합니다.</h3>
      <p>동의 하십니까?</p>
      <div class="modal-actions">
        <button @click="onConfirm">예</button>
        <button @click="onCancel">아니오</button>
      </div>
    </div>
  </div> 