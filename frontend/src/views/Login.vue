<template>
    <div class="login" v-if="!validSession">
      <h2>Login Page</h2>
      <input type="text" v-model="id_input" placeholder="USER ID" />
      <input type="password" v-model="password_input" placeholder="PASSWORD" />
      <button @click="login(id_input, password_input)">LOG IN</button>
    </div>
      <div v-else class="login">
        <h4>{{ loginData }}</h4>
        <button @click="logout">Manual logout</button>
      </div>
  
    <transition name="fade-right">
      <div class="error-message" v-if="errorMessage">
        {{ errorMessage }}
      </div>
    </transition>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import axios from 'axios';
  
  const HOST = window.location.hostname;
  const PORT = 3000;
  const API_URL = `http://${HOST}:${PORT}`;
  
  const validSession = ref(false);
  const id_input = ref('');
  const password_input = ref('');
  const loginData = ref('');
  let token = localStorage.getItem('token') || '';
  
  
  const errorMessage = ref('');
  
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
      errorMessage.value = err?.response?.data?.error || 'Session invalid or expired.';
      console.error(errorMessage.value);
    }
  }
  
  async function login(id: string, password: string): Promise<void> {
    try {
      const response = await axios.post(`${API_URL}/api/login`, { id, password });
      token = response.data.token;
      localStorage.setItem('token', token);
  
      await authenticateSession(token);
    } catch (err: any) {
      errorMessage.value = err?.response?.data?.error || 'Login failed. Please try again.';
      console.error(errorMessage.value);
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
  
  
  watch(errorMessage, (newVal) => {
    if (newVal) {
      setTimeout(() => {
        errorMessage.value = '';
      }, 3000);
    }
  });
  
  </script>
  
  <style scoped>
  h2 {
    color: white;
    text-align: center;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  h4 {
    color: white;
    text-align: center;
    font-weight: bold;
  }
  
  .login {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: rgb(29, 29, 31);
    padding: 50px;
    width: 400px;
    border-radius: 10px;
    box-shadow: var(--box-sd);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  input {
    height: 40px;
    background-color: black;
    color: white;
    padding-left: 20px;
    border: none;
    border-radius: 10px;
    box-shadow: var(--box-sd);
  }
  
  input:focus {
    outline: none;
  }
  
  input::placeholder {
    color: rgb(172, 172, 172);
    font-weight: 500;
    font-size: 12px;
  }
  
  button {
    background-color: rgb(38, 144, 237);
    color: white;
    border: none;
    height: 40px;
    border-radius: 10px;
  }
  
  button:hover {
    cursor: pointer;
    background-color: rgb(31, 117, 193);
  }
  
  .login-data {
    color: white;
    font-size: 70px;
    font-weight: bold;
    width: 100%;
  }
  
  .error-message {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgb(247, 172, 172);
    border: 2px solid rgb(145, 0, 0);
    color: rgb(228, 0, 0);
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }
  

  .fade-right-enter-active,
  .fade-right-leave-active {
    transition: transform 0.4s ease, opacity 0.4s ease;
  }
  
  .fade-right-enter-from {
    opacity: 0;
    transform: translateX(100%);
  }
  
  .fade-right-enter-to {
    opacity: 1;
    transform: translateX(0);
  }
  
  /* EXIT (from → to) */
  .fade-right-leave-from {
    opacity: 1;
    transform: translateX(0);
  }
  
  .fade-right-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
  </style>