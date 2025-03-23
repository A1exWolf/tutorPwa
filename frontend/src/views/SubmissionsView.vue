<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Ваши решения</h1>

    <div v-if="loading" class="text-center py-8">
      <div class="spinner"></div>
      <p>Загрузка решений...</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!submissionStore.submissions.length"
      class="text-center py-8"
    >
      <p class="text-lg text-gray-500">У вас пока нет решенных заданий</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="submission in submissionStore.submissions"
        :key="submission.id"
        class="bg-white shadow-md rounded-lg overflow-hidden"
      >
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2">{{ submission.taskTitle }}</h2>
          <div class="mb-4">
            <p class="text-gray-600 line-clamp-2">
              {{ submission.taskDescription }}
            </p>
          </div>

          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">{{
              formatDate(submission.createdAt)
            }}</span>
            <div>
              <span
                v-if="submission.score !== null"
                class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                Оценка: {{ submission.score }}
              </span>
              <span
                v-else
                class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                Не проверено
              </span>
            </div>
          </div>

          <div class="line-clamp-3 text-sm text-gray-700 mb-4">
            <strong>Ваше решение:</strong> {{ submission.answer }}
          </div>

          <div v-if="submission.feedback" class="mt-2 text-sm">
            <strong>Комментарий преподавателя:</strong>
            <p class="text-gray-700">{{ submission.feedback }}</p>
          </div>

          <div class="mt-4">
            <router-link
              :to="`/tasks/${submission.taskId}`"
              class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Подробнее
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSubmissionStore } from "../stores/submissions";

const submissionStore = useSubmissionStore();

const loading = ref(true);
const error = ref(null);

const fetchSubmissions = async () => {
  try {
    loading.value = true;
    error.value = null;
    await submissionStore.fetchSubmissions();
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load submissions";
    console.error("Failed to load submissions:", err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};

onMounted(fetchSubmissions);
</script>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
