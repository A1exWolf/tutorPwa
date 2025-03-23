import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || null);
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));

  const isAuthenticated = computed(() => !!token.value);

  const setAuth = (authData) => {
    token.value = authData.token;
    user.value = authData.user;
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      setAuth(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      setAuth(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const checkAuth = async () => {
    if (!token.value) return;

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      user.value = response.data;
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      logout();
      throw error;
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
});
