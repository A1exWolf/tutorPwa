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
      <!-- Task heading for student view, showing assignments at top -->
      <template v-if="!isTeacher && assignedTasks.length > 0">
        <div class="col-span-full mb-2 mt-4">
          <h2 class="text-xl font-semibold text-gray-700">
            Назначенные задания
          </h2>
        </div>
      </template>

      <!-- Display assigned tasks first -->
      <div
        v-for="task in assignedTasks"
        :key="task.id"
        class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
        @click="navigateToTask(task.id)"
      >
        <div class="flex justify-between">
          <h2 class="text-xl font-semibold mb-2">{{ task.title }}</h2>
          <button
            v-if="isTeacher"
            @click.stop="confirmDelete(task.id)"
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
        <p class="text-gray-600 mb-4 line-clamp-2">{{ task.description }}</p>
        <div class="flex justify-between text-sm text-gray-500">
          <span>Студентов: {{ task.students?.length || 0 }}</span>
          <span>Решений: {{ task.submissions?.length || 0 }}</span>
        </div>

        <!-- Task visibility badge -->
        <div v-if="isTeacher" class="mt-2">
          <span
            class="px-2 py-1 text-xs rounded-full mr-2"
            :class="
              task.public
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            "
          >
            {{ task.public ? "Публичное" : "Приватное" }}
          </span>
        </div>

        <!-- Student submission status -->
        <div v-if="!isTeacher" class="mt-3 pt-3 border-t border-gray-100">
          <div v-if="hasSubmitted(task)" class="text-sm">
            <span
              v-if="getSubmissionScore(task) !== null"
              class="px-2 py-1 bg-green-100 text-green-800 rounded-full"
            >
              Проверено: {{ getSubmissionScore(task) }}
            </span>
            <span
              v-else
              class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full"
            >
              Отправлено на проверку
            </span>
          </div>
          <div v-else class="text-sm">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Нужно решить
            </span>
          </div>
        </div>

        <div class="mt-3 flex justify-end">
          <router-link
            :to="`/tasks/${task.id}`"
            class="text-blue-500 hover:text-blue-700 text-sm font-medium"
            @click.stop
          >
            {{ isTeacher ? "Управлять" : "Открыть задание" }} →
          </router-link>
        </div>
      </div>

      <!-- Public tasks heading for student view -->
      <template
        v-if="!isTeacher && publicTasks.length > 0 && assignedTasks.length > 0"
      >
        <div class="col-span-full mb-2 mt-4">
          <h2 class="text-xl font-semibold text-gray-700">
            Другие доступные задания
          </h2>
        </div>
      </template>

      <!-- Display public tasks for students -->
      <div
        v-for="task in publicTasks"
        :key="task.id"
        class="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500"
        @click="navigateToTask(task.id)"
      >
        <div class="flex justify-between">
          <h2 class="text-xl font-semibold mb-2">{{ task.title }}</h2>
        </div>
        <p class="text-gray-600 mb-4 line-clamp-2">{{ task.description }}</p>
        <div class="flex justify-between text-sm text-gray-500">
          <span
            class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
          >
            Публичное задание
          </span>
          <span>Решений: {{ task.submissions?.length || 0 }}</span>
        </div>

        <!-- Student submission status -->
        <div v-if="!isTeacher" class="mt-3 pt-3 border-t border-gray-100">
          <div v-if="hasSubmitted(task)" class="text-sm">
            <span
              v-if="getSubmissionScore(task) !== null"
              class="px-2 py-1 bg-green-100 text-green-800 rounded-full"
            >
              Проверено: {{ getSubmissionScore(task) }}
            </span>
            <span
              v-else
              class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full"
            >
              Отправлено на проверку
            </span>
          </div>
          <div v-else class="text-sm">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Нужно решить
            </span>
          </div>
        </div>

        <div class="mt-3 flex justify-end">
          <router-link
            :to="`/tasks/${task.id}`"
            class="text-blue-500 hover:text-blue-700 text-sm font-medium"
            @click.stop
          >
            Открыть задание →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore } from "../stores/tasks";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();

const loading = computed(() => taskStore.loading);
const error = computed(() => taskStore.error);
const isTeacher = computed(() => authStore.user?.role === "TEACHER");

// For students: split tasks into assigned and public
const assignedTasks = computed(() => {
  if (isTeacher.value) {
    return taskStore.tasks; // Teachers see all their tasks in one list
  } else {
    // For students, find tasks that are directly assigned to them
    return taskStore.tasks.filter((task) =>
      task.students.some((student) => student.id === authStore.user.id)
    );
  }
});

// Public tasks that are not assigned to the student
const publicTasks = computed(() => {
  if (isTeacher.value) {
    return []; // Teachers don't need a separate public tasks section
  } else {
    // Only show public tasks that aren't already in assigned tasks
    const assignedIds = new Set(assignedTasks.value.map((task) => task.id));
    return taskStore.tasks.filter(
      (task) => task.public && !assignedIds.has(task.id)
    );
  }
});

// Check if the current student has submitted a solution for this task
const hasSubmitted = (task) => {
  if (!task.submissions || isTeacher.value) return false;
  return task.submissions.some((sub) => sub.studentId === authStore.user.id);
};

// Get the score for a student's submission
const getSubmissionScore = (task) => {
  if (!task.submissions || isTeacher.value) return null;
  const submission = task.submissions.find(
    (sub) => sub.studentId === authStore.user.id
  );
  return submission ? submission.score : null;
};

const navigateToTask = (taskId) => {
  router.push(`/tasks/${taskId}`);
};

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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
