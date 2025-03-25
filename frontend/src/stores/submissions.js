import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "./auth";

const API_URL = "/api";

export const useSubmissionStore = defineStore("submissions", () => {
  const submissions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const createSubmission = async (submissionData) => {
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(
        `${API_URL}/tasks/submission`,
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      submissions.value.push(response.data);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to submit answer";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchSubmissions = async () => {
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;

    try {
      // We don't have a dedicated endpoint for submissions yet,
      // but we can get them from the tasks API since it includes submissions
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      // Extract submissions from tasks
      const allSubmissions = [];
      response.data.forEach((task) => {
        if (task.submissions && task.submissions.length > 0) {
          task.submissions.forEach((submission) => {
            allSubmissions.push({
              ...submission,
              taskTitle: task.title,
              taskDescription: task.description,
            });
          });
        }
      });

      submissions.value = allSubmissions;
      return allSubmissions;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load submissions";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    submissions,
    loading,
    error,
    createSubmission,
    fetchSubmissions,
  };
});
