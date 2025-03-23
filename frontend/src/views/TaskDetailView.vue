<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center mb-6">
      <router-link to="/tasks" class="mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
      </router-link>
      <h1 class="text-2xl font-bold">Детали задания</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="spinner"></div>
      <p>Загрузка задания...</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ error }}
    </div>

    <div v-else-if="!task" class="text-center py-8">
      <p class="text-lg text-gray-500">Задание не найдено</p>
    </div>

    <div v-else>
      <!-- Task details -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">{{ task.title }}</h2>
        <div class="mb-6">
          <p class="text-gray-700 whitespace-pre-wrap">
            {{ task.description }}
          </p>
        </div>

        <div class="text-sm text-gray-500 mb-2">
          <span>Создано: {{ formatDate(task.createdAt) }}</span>
        </div>
      </div>

      <!-- Submission form for students -->
      <div
        v-if="isStudent && !hasSubmitted"
        class="bg-white shadow-md rounded-lg p-6 mb-6"
      >
        <h3 class="text-lg font-semibold mb-4">Ваше решение</h3>

        <form @submit.prevent="submitAnswer">
          <div class="mb-4">
            <label
              for="answer"
              class="block text-gray-700 text-sm font-bold mb-2"
            >
              Решение задания
            </label>
            <textarea
              id="answer"
              v-model="submission.answer"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              placeholder="Введите ваше решение"
              required
            ></textarea>
            <p v-if="validationError" class="text-red-500 text-xs mt-1">
              {{ validationError }}
            </p>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              :disabled="submissionStore.loading"
            >
              <span v-if="submissionStore.loading">Отправка...</span>
              <span v-else>Отправить решение</span>
            </button>
          </div>
        </form>
      </div>

      <!-- If student has already submitted an answer -->
      <div
        v-else-if="isStudent && hasSubmitted"
        class="bg-white shadow-md rounded-lg p-6 mb-6"
      >
        <h3 class="text-lg font-semibold mb-4">Ваше решение</h3>
        <div class="bg-gray-50 p-4 rounded mb-4">
          <p class="whitespace-pre-wrap">{{ userSubmission.answer }}</p>
        </div>

        <div v-if="userSubmission.score !== null" class="mb-4">
          <p class="font-semibold">Оценка: {{ userSubmission.score }}</p>
          <p v-if="userSubmission.feedback" class="mt-2">
            <span class="font-semibold">Комментарий преподавателя:</span>
            <span class="whitespace-pre-wrap">{{
              userSubmission.feedback
            }}</span>
          </p>
        </div>
        <div v-else class="text-yellow-600">
          Ваше решение еще не проверено преподавателем.
        </div>
      </div>

      <!-- Teacher view of student submissions -->
      <div
        v-if="isTeacher && task.submissions && task.submissions.length > 0"
        class="mb-6"
      >
        <h3 class="text-lg font-semibold mb-4">
          Решения студентов ({{ task.submissions.length }})
        </h3>

        <div class="grid gap-4">
          <div
            v-for="sub in task.submissions"
            :key="sub.id"
            class="bg-white shadow-md rounded-lg p-4"
          >
            <div class="flex justify-between mb-2">
              <div>
                <span class="font-semibold"
                  >{{ sub.student?.firstName }}
                  {{ sub.student?.lastName }}</span
                >
                <span class="text-gray-500 text-sm ml-2">{{
                  formatDate(sub.createdAt)
                }}</span>
              </div>
              <div>
                <span
                  v-if="sub.score !== null"
                  class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  Оценка: {{ sub.score }}
                </span>
                <span
                  v-else
                  class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                >
                  Не проверено
                </span>
              </div>
            </div>

            <div class="bg-gray-50 p-3 rounded mb-3">
              <p class="whitespace-pre-wrap">{{ sub.answer }}</p>
            </div>

            <form
              v-if="sub.score === null"
              @submit.prevent="gradeSubmission(sub.id)"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Оценка
                  </label>
                  <input
                    type="number"
                    v-model="sub.newScore"
                    min="0"
                    max="100"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="0-100"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Комментарий
                  </label>
                  <input
                    type="text"
                    v-model="sub.newFeedback"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Необязательно"
                  />
                </div>
                <div class="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Сохранить оценку
                  </button>
                </div>
              </div>
            </form>

            <div v-else-if="sub.feedback" class="mt-2">
              <p class="text-sm">
                <span class="font-semibold">Комментарий:</span>
                <span class="whitespace-pre-wrap">{{ sub.feedback }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="
          isTeacher && (!task.submissions || task.submissions.length === 0)
        "
        class="text-center py-4"
      >
        <p class="text-gray-500">
          У этого задания пока нет решений от студентов.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTaskStore } from "../stores/tasks";
import { useAuthStore } from "../stores/auth";
import { useSubmissionStore } from "../stores/submissions";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const submissionStore = useSubmissionStore();

const task = ref(null);
const loading = ref(true);
const error = ref(null);
const validationError = ref(null);

const submission = ref({
  answer: "",
  taskId: route.params.id,
});

const isStudent = computed(() => authStore.user?.role === "STUDENT");
const isTeacher = computed(() => authStore.user?.role === "TEACHER");

// Check if current student has already submitted an answer
const hasSubmitted = computed(() => {
  if (!isStudent.value || !task.value || !task.value.submissions) return false;
  return task.value.submissions.some(
    (sub) => sub.studentId === authStore.user.id
  );
});

// Get current user's submission
const userSubmission = computed(() => {
  if (!isStudent.value || !task.value || !task.value.submissions) return null;
  return task.value.submissions.find(
    (sub) => sub.studentId === authStore.user.id
  );
});

const fetchTask = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get(
      `http://localhost:3000/api/tasks/${route.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    task.value = response.data;

    // Initialize grading data for teacher
    if (isTeacher.value && task.value.submissions) {
      task.value.submissions.forEach((sub) => {
        sub.newScore = sub.score;
        sub.newFeedback = sub.feedback || "";
      });
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load task";
    console.error("Failed to load task:", err);
  } finally {
    loading.value = false;
  }
};

const submitAnswer = async () => {
  if (!submission.value.answer.trim()) {
    validationError.value = "Пожалуйста, введите ваше решение";
    return;
  }

  try {
    validationError.value = null;
    await submissionStore.createSubmission(submission.value);
    // Refresh task data to show the submission
    await fetchTask();
  } catch (err) {
    console.error("Failed to submit answer:", err);
  }
};

const gradeSubmission = async (submissionId) => {
  const sub = task.value.submissions.find((s) => s.id === submissionId);
  if (!sub || sub.newScore === undefined) return;

  try {
    const score = parseInt(sub.newScore);
    if (isNaN(score) || score < 0 || score > 100) {
      alert("Оценка должна быть числом от 0 до 100");
      return;
    }

    await axios.post(
      `http://localhost:3000/api/tasks/submission/${submissionId}/grade`,
      { score, feedback: sub.newFeedback || "" },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Update local state
    sub.score = score;
    sub.feedback = sub.newFeedback;
  } catch (err) {
    console.error("Failed to grade submission:", err);
    alert("Не удалось сохранить оценку. Пожалуйста, попробуйте еще раз.");
  }
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};

onMounted(fetchTask);
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
</style>
