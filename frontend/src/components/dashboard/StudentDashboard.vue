<template>
  <div class="mt-6">
    <h2 class="text-xl font-semibold mb-4">Ваши выполненные задания</h2>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-8">
      <div
        class="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"
      ></div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="completedSubmissions.length === 0"
      class="bg-gray-50 p-6 rounded-lg text-center"
    >
      <p class="text-gray-500">Вы еще не выполнили ни одного задания.</p>
    </div>

    <!-- Tasks list -->
    <div v-else class="space-y-4">
      <div
        v-for="submission in completedSubmissions"
        :key="submission.id"
        class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div
          class="flex flex-col md:flex-row md:justify-between md:items-start"
        >
          <div class="mb-4 md:mb-0 md:mr-4 w-full md:w-auto">
            <router-link
              :to="`/tasks/${submission.task.id}`"
              class="text-lg font-medium text-blue-600 hover:text-blue-800 block"
            >
              {{ submission.task.title }}
            </router-link>
            <p class="text-gray-600 mt-1 line-clamp-2">
              {{ submission.task.description }}
            </p>
          </div>

          <div
            class="md:ml-4 flex flex-row md:flex-col items-center md:items-end md:flex-shrink-0"
          >
            <div class="flex items-center">
              <span class="text-sm text-gray-500 mr-2">Оценка:</span>
              <span
                :class="[
                  'font-medium px-3 py-1 rounded-full text-sm',
                  submission.score !== null
                    ? submission.score >= 80
                      ? 'bg-green-100 text-green-800'
                      : submission.score >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{
                  submission.score !== null ? submission.score : "Не оценено"
                }}
              </span>
            </div>
            <p
              v-if="submission.feedback"
              class="text-sm text-gray-600 mt-2 md:max-w-xs md:text-right w-full"
            >
              {{ submission.feedback }}
            </p>
          </div>
        </div>

        <div
          class="flex flex-col md:flex-row md:justify-between md:items-center mt-3 text-sm text-gray-500"
        >
          <span class="mb-1 md:mb-0"
            >Дата создания: {{ formatDate(submission.task.createdAt) }}</span
          >
          <span>Отправлено: {{ formatDate(submission.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import axios from "axios";

const API_URL = "http://localhost:3000/api";
const authStore = useAuthStore();

const completedSubmissions = ref([]);
const loading = ref(true);

onMounted(async () => {
  await fetchCompletedSubmissions();
  loading.value = false;
});

async function fetchCompletedSubmissions() {
  try {
    const response = await axios.get(`${API_URL}/tasks/submission/student`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    completedSubmissions.value = response.data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>
