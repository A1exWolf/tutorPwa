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

        <!-- Teacher information -->
        <div v-if="task.creator" class="mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span class="text-gray-700">
            Преподаватель:
            <span class="font-medium"
              >{{ task.creator.firstName }} {{ task.creator.lastName }}</span
            >
          </span>
        </div>

        <!-- Task status badges -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-if="isTeacher"
            class="px-2 py-1 text-xs rounded-full"
            :class="
              task.public
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            "
          >
            {{ task.public ? "Публичное" : "Приватное" }}
          </span>

          <span
            v-if="isTeacher"
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
          >
            Назначено: {{ task.students?.length || 0 }} студентам
          </span>

          <span
            class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
          >
            Решений: {{ task.submissions?.length || 0 }}
          </span>
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
              class="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
          <p class="whitespace-pre-line">{{ userSubmission.answer }}</p>
        </div>

        <div
          class="flex flex-col sm:flex-row sm:justify-between sm:items-center"
        >
          <div class="mb-3 sm:mb-0">
            <span class="text-sm text-gray-500">Статус:</span>
            <span
              class="ml-1 px-2 py-1 rounded-full text-xs"
              :class="
                userSubmission.score !== null
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              "
            >
              {{ userSubmission.score !== null ? "Оценено" : "На проверке" }}
            </span>
          </div>

          <div
            v-if="userSubmission.score !== null"
            class="flex flex-col sm:items-end"
          >
            <div class="flex items-center">
              <span class="text-sm text-gray-500">Оценка:</span>
              <span
                class="ml-2 px-3 py-1 rounded-full text-sm font-medium"
                :class="
                  userSubmission.score >= 80
                    ? 'bg-green-100 text-green-800'
                    : userSubmission.score >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{ userSubmission.score }}/100
              </span>
            </div>
            <p
              v-if="userSubmission.feedback"
              class="text-sm text-gray-600 mt-2"
            >
              <span class="font-medium">Комментарий:</span>
              {{ userSubmission.feedback }}
            </p>
          </div>
        </div>
      </div>

      <!-- Edit or assign options for teacher -->
      <div
        v-if="isTeacher && isTaskCreator"
        class="bg-white shadow-md rounded-lg p-6 mb-6"
      >
        <h3 class="text-lg font-semibold mb-4">Управление заданием</h3>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="openEditModal"
            class="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
              />
            </svg>
            Изменить задание
          </button>

          <button
            @click="openAssignModal"
            class="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"
              />
            </svg>
            Назначить студентам
          </button>

          <button
            @click="togglePublishStatus"
            class="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md"
            :class="
              task.public
                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                : 'text-green-700 bg-green-100 hover:bg-green-200'
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                v-if="task.public"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              />
              <path
                v-else
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
            {{ task.public ? "Скрыть задание" : "Опубликовать задание" }}
          </button>
        </div>
      </div>

      <!-- Submissions list for task creator -->
      <div
        v-if="isTeacher && isTaskCreator && task.submissions?.length > 0"
        class="bg-white shadow-md rounded-lg p-6 mb-6"
      >
        <h3 class="text-lg font-semibold mb-4">Ответы студентов</h3>

        <div class="space-y-4">
          <div
            v-for="sub in task.submissions"
            :key="sub.id"
            class="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3"
            >
              <div class="mb-2 sm:mb-0">
                <p class="font-medium text-gray-800">
                  {{ sub.student.firstName }} {{ sub.student.lastName }}
                </p>
                <p class="text-xs text-gray-500">
                  Отправлено: {{ formatDate(sub.createdAt) }}
                </p>
              </div>
              <div>
                <span
                  v-if="sub.score !== null"
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    sub.score >= 80
                      ? 'bg-green-100 text-green-800'
                      : sub.score >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  Оценка: {{ sub.score }}/100
                </span>
                <span
                  v-else
                  class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  Не оценено
                </span>
              </div>
            </div>

            <div class="bg-white p-3 rounded border border-gray-200 mb-3">
              <p class="whitespace-pre-line">{{ sub.answer }}</p>
            </div>

            <div v-if="sub.score === null" class="mt-3">
              <form @submit.prevent="gradeSubmission(sub)">
                <div class="flex flex-col gap-3">
                  <div class="w-full">
                    <label
                      for="feedback"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Комментарий
                    </label>
                    <textarea
                      :id="`feedback-${sub.id}`"
                      v-model="sub.feedbackDraft"
                      rows="2"
                      class="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Напишите комментарий к работе..."
                    ></textarea>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-3">
                    <div class="w-full sm:w-32">
                      <label
                        for="score"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Оценка (0-100)
                      </label>
                      <input
                        :id="`score-${sub.id}`"
                        v-model.number="sub.scoreDraft"
                        type="number"
                        min="0"
                        max="100"
                        class="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div class="flex items-end">
                      <button
                        type="submit"
                        class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        :disabled="sub.grading"
                      >
                        <span v-if="sub.grading">Сохранение...</span>
                        <span v-else>Оценить</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div v-else-if="sub.feedback" class="mt-3 text-sm text-gray-600">
              <p class="font-medium">Комментарий:</p>
              <p>{{ sub.feedback }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Редактирование задания</h3>
            <button
              @click="showEditModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form @submit.prevent="updateTask">
            <div class="mb-4">
              <label
                for="title"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                Название задания
              </label>
              <input
                id="title"
                v-model="editForm.title"
                type="text"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Введите название задания"
                required
              />
            </div>

            <div class="mb-4">
              <label
                for="description"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                Описание задания
              </label>
              <textarea
                id="description"
                v-model="editForm.description"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="6"
                placeholder="Введите подробное описание задания"
                required
              ></textarea>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                :disabled="updating"
              >
                <span v-if="updating">Обновление...</span>
                <span v-else>Сохранить изменения</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Assign Task Modal -->
    <div
      v-if="showAssignModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Назначить задание студентам</h3>
            <button
              @click="showAssignModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div v-if="loadingStudents" class="text-center py-4">
            <div class="spinner"></div>
            <p>Загрузка списка студентов...</p>
          </div>

          <div
            v-else-if="availableStudents.length === 0"
            class="py-4 text-center"
          >
            <p class="text-gray-500">Нет доступных студентов для назначения</p>
          </div>

          <form v-else @submit.prevent="assignTask">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Выберите студентов
              </label>

              <div
                class="bg-gray-50 p-3 rounded border border-gray-200 max-h-60 overflow-y-auto"
              >
                <div
                  v-for="student in availableStudents"
                  :key="student.id"
                  class="flex items-center mb-2 last:mb-0"
                >
                  <input
                    :id="`student-${student.id}`"
                    v-model="selectedStudents"
                    :value="student.id"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    :for="`student-${student.id}`"
                    class="ml-2 block text-sm text-gray-700"
                  >
                    {{ student.firstName }} {{ student.lastName }}
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="showAssignModal = false"
                class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                :disabled="assigning"
              >
                <span v-if="assigning">Назначение...</span>
                <span v-else>Назначить</span>
              </button>
            </div>
          </form>
        </div>
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

    // Log data to check student info
    console.log("Task data:", task.value);
    if (task.value.submissions) {
      console.log("Submissions:", task.value.submissions);
    }

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
