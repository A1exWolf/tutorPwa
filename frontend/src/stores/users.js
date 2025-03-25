import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "./auth";

const API_URL = "/api";

export const useUsersStore = defineStore("users", () => {
  const students = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchStudents = async () => {
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_URL}/users/students`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      students.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load students";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    students,
    loading,
    error,
    fetchStudents,
  };
});
