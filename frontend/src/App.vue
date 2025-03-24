<template>
  <div class="login" v-if="!validSession">
    <input type="text" v-model="id_input" placeholder="USER ID" />
    <input type="password" v-model="password_input" placeholder="PASSWORD" />
    <button @click="login(id_input, password_input)">LOG IN</button>
  </div>
  <div class="login-data" v-else>
    {{ loginData }}
    <button @click="logout">Manual logout</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// For testing on mobile localhost
const HOST = window.location.hostname;
const PORT = 3000;
const API_URL = `http://${HOST}:${PORT}`;

// State variables
const validSession = ref(false);
const id_input = ref('');
const password_input = ref('');
const loginData = ref('');
let token = localStorage.getItem('token') || '';


onMounted(() => {
  if (token) {
    authenticateSession(token);
  }
});


async function authenticateSession(currentToken: string) {
  try {
    const response = await axios.post(`${API_URL}/api/authenticate_session`, {
      token: currentToken
    });
    validSession.value = true;
    loginData.value = response.data;
  } catch (err) {
    validSession.value = false;
    console.error(err);
  }
}

async function login(id: string, password: string): Promise<void> {
  try {
    const response = await axios.post(`${API_URL}/api/login`, { id, password });
    token = response.data.token;
    localStorage.setItem('token', token);

    await authenticateSession(token);
  } catch (err: any) {
    console.error(err?.response?.data?.error || 'Login error');
  }
}

async function logout() {
  try {
    await axios.post(`${API_URL}/api/logout`, { token });
    localStorage.removeItem('token');
    token = '';
    validSession.value = false;
    loginData.value = '';
  } catch (err) {
    console.error('Failed to logout user', err);
  }
}


// make sure only 1 cleanup sent at max
let cleanupCalled = false;

function cleanup(eventName: string) {
  if (cleanupCalled) return;
  cleanupCalled = true;
  // keep localstorage, but send notification to server that they are not currently in
  // student can log into the same session and still be able to toggle db login state
  navigator.sendBeacon(
    `${API_URL}/api/softLogout`,
    JSON.stringify({ event: eventName, token })
  );
}

window.addEventListener('unload', () => cleanup('unload'));
window.addEventListener('pagehide', () => cleanup('pagehide'));




</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  height: 30px;
}

.login-data {
  color: white;
  font-size: 70px;
  font-weight: bold;
  width: 100%;
}
</style>