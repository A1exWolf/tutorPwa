import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "./auth";

const API_URL = "/api";

export const useTaskStore = defineStore("tasks", () => {
  const tasks = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchTasks = async () => {
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      tasks.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load tasks";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (taskData) => {
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(
        `${API_URL}/tasks`,
        {
          title: taskData.title,
          description: taskData.description,
          studentIds: taskData.studentIds,
          public: taskData.public || false,
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      // Add the new task to the tasks array
      tasks.value.push(response.data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to create task";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const deleteTask = async (taskId) => {
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      // Remove the task from the tasks array
      tasks.value = tasks.value.filter((task) => task.id !== taskId);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete task";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    deleteTask,
  };
});
