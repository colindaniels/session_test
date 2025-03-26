<template>
  <div class="admin-page">
    <h1>Admin Page</h1>
    <h4>View 'isOnline' status of student</h4>
    <br>
    <br>
    <div style="display: flex; gap: 10px;">
      <div class="indicator" :class="{ online: isOnline === true, offline: isOnline === false }"></div>
      <h4 v-if="isOnline">Online</h4>
      <h4 v-else="isOnline">Offline</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
const HOST = window.location.hostname;
const PORT = 3000;
const API_URL = `http://${HOST}:${PORT}`;

const isOnline = ref(false);

async function ping(): Promise<void> {
  try {
    const response = await axios.get(`${API_URL}/api/ping`);
    isOnline.value = response.data;

  } catch (err: any) {
    console.error(err)
  }
}

setInterval(() => {
  ping()
}, 1000);

</script>

<style scoped>
.admin-page {
  padding: 20px;
  color: white;
}

.indicator {
  background: gray;
  border-radius: 100px;
  width: 25px;
  height: 25px;
}

.indicator.offline {
  background: rgb(244, 0, 0);
}
.indicator.online {
  background: rgb(0, 244, 0);
}

</style>