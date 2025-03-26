<template>
  <div class="admin-page">
    <h1>Admin Page</h1>
    <h4>View 'isOnline' status of student</h4>

    <div class="status-wrapper">
      <div 
        class="indicator" 
        :class="{
          online: isOnline === true, 
          offline: isOnline === false, 
          'ping-animation': showPingAnimation
        }"
      ></div>
      <h4 v-if="isOnline">Online</h4>
      <h4 v-else>Offline</h4>
    </div>

    <h4>Seconds until JWT cleanup: {{ secondsToCleanup }}</h4>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const HOST = window.location.hostname;
const PORT = 3000;
const API_URL = `http://${HOST}:${PORT}`;

const isOnline = ref(false);
const showPingAnimation = ref(false);

const secondsToCleanup = ref(60);
let countdownInterval: number | null = null;

async function ping() {
  try {
    showPingAnimation.value = true;
    setTimeout(() => {
      showPingAnimation.value = false;
    }, 300);
    
    const response = await axios.get(`${API_URL}/api/ping`);
    isOnline.value = response.data;
  } catch (err: any) {
    console.error(err);
  }
}


function updateSecondsToCleanup() {
  const date = new Date();
  const currentSecond = date.getSeconds();
  secondsToCleanup.value = 60 - currentSecond === 60 ? 0 : 60 - currentSecond;
}

onMounted(() => {
  ping();

  setInterval(() => {
    ping();
  }, 1000);

  updateSecondsToCleanup();
  countdownInterval = window.setInterval(() => {
    updateSecondsToCleanup();
  }, 1000);
});

onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style scoped>
.admin-page {
  padding: 20px;
  color: white;
  font-family: Arial, sans-serif;
  background: #222;
  border-radius: 8px;
  width: 300px;
  margin: 50px auto;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.status-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.indicator {
  background: gray;
  border-radius: 100px;
  width: 25px;
  height: 25px;
  transition: background-color 0.3s;
}
.indicator.offline {
  background: rgb(244, 0, 0);
}
.indicator.online {
  background: rgb(0, 244, 0);
}

.ping-animation {
  animation: pingBlink 0.3s ease-in-out;
}

@keyframes pingBlink {
  0%   { filter: brightness(1); }
  50%  { filter: brightness(3); }
  100% { filter: brightness(1); }
}
</style>