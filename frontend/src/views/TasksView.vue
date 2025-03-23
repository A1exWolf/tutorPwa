<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        {{ isTeacher ? "Управление заданиями" : "Ваши задания" }}
      </h1>
      <router-link
        v-if="isTeacher"
        to="/tasks/create"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Добавить задание
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ error }}
    </div>

    <div v-else-if="!taskStore.tasks.length" class="text-center py-8">
      <p class="text-lg text-gray-500">
        {{
          isTeacher
            ? "Вы еще не создали ни одного задания"
            : "У вас пока нет заданий"
        }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="task in taskStore.tasks"
        :key="task.id"
        class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between">
          <h2 class="text-xl font-semibold mb-2">{{ task.title }}</h2>
          <button
            v-if="isTeacher"
            @click="confirmDelete(task.id)"
            class="text-red-500 hover:text-red-700"
          >
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
        <p class="text-gray-600 mb-4">{{ task.description }}</p>
        <div class="flex justify-between text-sm text-gray-500">
          <span>Студентов: {{ task.students?.length || 0 }}</span>
          <span>Решений: {{ task.submissions?.length || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useTaskStore } from "../stores/tasks";
import { useAuthStore } from "../stores/auth";

const taskStore = useTaskStore();
const authStore = useAuthStore();

const loading = computed(() => taskStore.loading);
const error = computed(() => taskStore.error);
const isTeacher = computed(() => authStore.user?.role === "TEACHER");

onMounted(async () => {
  try {
    await taskStore.fetchTasks();
  } catch (err) {
    console.error("Failed to load tasks:", err);
  }
});

const confirmDelete = async (taskId) => {
  if (confirm("Вы уверены, что хотите удалить это задание?")) {
    try {
      await taskStore.deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }
};
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
