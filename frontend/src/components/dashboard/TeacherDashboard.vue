<template>
  <div class="mt-6">
    <h2 class="text-xl font-semibold mb-4">Управление заданиями</h2>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6 overflow-x-auto">
      <nav class="-mb-px flex space-x-6">
        <button
          @click="activeTab = 'tasks'"
          :class="[
            activeTab === 'tasks'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
          ]"
        >
          Ваши задания
        </button>
        <button
          @click="activeTab = 'submissions'"
          :class="[
            activeTab === 'submissions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
          ]"
        >
          Ответы на проверку
          <span
            v-if="pendingCount > 0"
            class="inline-flex items-center justify-center ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white"
          >
            {{ pendingCount }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Create task button -->
    <div v-if="activeTab === 'tasks'" class="mb-6">
      <router-link
        to="/tasks/create"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        Создать новое задание
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-8">
      <div
        class="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"
      ></div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="activeTabItems.length === 0"
      class="bg-gray-50 p-6 rounded-lg text-center"
    >
      <p class="text-gray-500">
        {{
          activeTab === "tasks"
            ? "У вас пока нет созданных заданий."
            : "Нет ответов для проверки."
        }}
      </p>
      <div v-if="activeTab === 'tasks'" class="mt-4">
        <router-link
          to="/tasks/create"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 w-full sm:w-auto"
        >
          Создать первое задание
        </router-link>
      </div>
    </div>

    <!-- Tasks list -->
    <div v-else-if="activeTab === 'tasks'" class="space-y-4">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div
          class="flex flex-col md:flex-row md:justify-between md:items-start"
        >
          <div class="mb-4 md:mb-0">
            <router-link
              :to="`/tasks/${task.id}`"
              class="text-lg font-medium text-blue-600 hover:text-blue-800"
            >
              {{ task.title }}
            </router-link>
            <p class="text-gray-600 mt-1 line-clamp-2">
              {{ task.description }}
            </p>
          </div>

          <div class="md:ml-4">
            <router-link
              :to="`/tasks/${task.id}`"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              Просмотреть задание
            </router-link>
          </div>
        </div>

        <div
          class="flex flex-col md:flex-row md:justify-between md:items-center mt-3 text-sm text-gray-500"
        >
          <span class="mb-1 md:mb-0"
            >Дата создания: {{ formatDate(task.createdAt) }}</span
          >
          <span>
            <span
              :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                task.public
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800',
              ]"
            >
              {{ task.public ? "Публичное" : "Приватное" }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Submissions list -->
    <div v-else-if="activeTab === 'submissions'" class="space-y-4">
      <div
        v-for="submission in pendingSubmissions"
        :key="submission.id"
        class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div
          class="flex flex-col md:flex-row md:justify-between md:items-start"
        >
          <div class="w-full">
            <div class="flex flex-wrap items-center">
              <router-link
                :to="`/tasks/${submission.task.id}`"
                class="text-lg font-medium text-blue-600 hover:text-blue-800 mr-2"
              >
                {{ submission.task.title }}
              </router-link>
              <span
                v-if="!submission.score"
                class="mt-1 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full"
              >
                Не оценено
              </span>
            </div>
            <p class="text-gray-600 mt-1 mb-2">
              <span class="font-medium">Студент:</span>
              {{ submission.student.firstName }}
              {{ submission.student.lastName }}
            </p>
            <div class="bg-white p-3 rounded border border-gray-200 mb-2">
              <p class="text-gray-700 whitespace-pre-line">
                {{ submission.answer }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="!submission.score" class="mt-3">
          <form @submit.prevent="gradeSubmission(submission)">
            <div class="flex flex-col gap-3">
              <div class="w-full">
                <label
                  for="feedback"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Комментарий</label
                >
                <textarea
                  id="feedback"
                  v-model="submission.feedbackDraft"
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
                    >Оценка (0-100)</label
                  >
                  <input
                    id="score"
                    v-model.number="submission.scoreDraft"
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
                    :disabled="submission.grading"
                  >
                    <span v-if="submission.grading">Сохранение...</span>
                    <span v-else>Оценить</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div v-else class="mt-3 bg-gray-100 p-3 rounded border border-gray-200">
          <div class="flex flex-col md:flex-row md:justify-between">
            <div class="mb-2 md:mb-0">
              <p class="text-sm text-gray-500">Оценка:</p>
              <p class="font-medium">{{ submission.score }}/100</p>
            </div>
            <div v-if="submission.feedback" class="md:ml-4">
              <p class="text-sm text-gray-500">Комментарий:</p>
              <p class="text-gray-700">{{ submission.feedback }}</p>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col md:flex-row md:justify-between md:items-center mt-3 text-sm text-gray-500"
        >
          <span class="mb-1 md:mb-0"
            >Задание создано: {{ formatDate(submission.task.createdAt) }}</span
          >
          <span>Ответ отправлен: {{ formatDate(submission.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import axios from "axios";

const API_URL = "/api";
const authStore = useAuthStore();

const activeTab = ref("tasks");
const tasks = ref([]);
const submissions = ref([]);
const loading = ref(true);

const pendingSubmissions = computed(() => {
  return submissions.value.map((sub) => ({
    ...sub,
    scoreDraft: sub.score || null,
    feedbackDraft: sub.feedback || "",
    grading: false,
  }));
});

const pendingCount = computed(() => {
  return submissions.value.filter((s) => s.score === null).length;
});

const activeTabItems = computed(() => {
  return activeTab.value === "tasks" ? tasks.value : pendingSubmissions.value;
});

onMounted(async () => {
  await Promise.all([fetchTasks(), fetchSubmissions()]);
  loading.value = false;
});

async function fetchTasks() {
  try {
    const response = await axios.get(`${API_URL}/tasks?created=true`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    tasks.value = response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

async function fetchSubmissions() {
  try {
    const response = await axios.get(`${API_URL}/tasks/submission/teacher`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    submissions.value = response.data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
  }
}

async function gradeSubmission(submission) {
  try {
    submission.grading = true;

    await axios.post(
      `${API_URL}/tasks/submission/${submission.id}/grade`,
      {
        score: submission.scoreDraft,
        feedback: submission.feedbackDraft,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Update local submission data
    submission.score = submission.scoreDraft;
    submission.feedback = submission.feedbackDraft;

    // Update original submission in array
    const idx = submissions.value.findIndex((s) => s.id === submission.id);
    if (idx !== -1) {
      submissions.value[idx] = {
        ...submissions.value[idx],
        score: submission.score,
        feedback: submission.feedback,
      };
    }
  } catch (error) {
    console.error("Error grading submission:", error);
    alert("Ошибка при сохранении оценки. Пожалуйста, попробуйте снова.");
  } finally {
    submission.grading = false;
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
