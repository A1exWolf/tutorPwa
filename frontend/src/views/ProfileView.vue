<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- User info section -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-4">Личный кабинет</h1>

        <div class="flex flex-col md:flex-row gap-6">
          <div class="bg-gray-100 rounded-lg p-6 flex-1">
            <h2 class="text-xl font-semibold mb-4">Информация пользователя</h2>
            <div class="space-y-3">
              <div>
                <span class="font-medium">Имя:</span> {{ user.firstName }}
              </div>
              <div>
                <span class="font-medium">Фамилия:</span> {{ user.lastName }}
              </div>
              <div>
                <span class="font-medium">Email:</span> {{ user.email }}
              </div>
              <div>
                <span class="font-medium">Роль:</span> {{ userRoleText }}
              </div>
            </div>
          </div>

          <!-- Statistics container -->
          <div class="bg-gray-100 rounded-lg p-6 flex-1">
            <h2 class="text-xl font-semibold mb-4">Статистика</h2>
            <div v-if="isStudent">
              <div class="mb-3">
                <span class="font-medium">Заданий выполнено:</span>
                {{ completedTasksCount }}
              </div>
              <div>
                <span class="font-medium">Средняя оценка:</span>
                {{ averageScore }}
              </div>
            </div>

            <div v-else>
              <div class="mb-3">
                <span class="font-medium">Создано заданий:</span>
                {{ createdTasksCount }}
              </div>
              <div>
                <span class="font-medium">Проверено работ:</span>
                {{ gradedSubmissionsCount }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role-specific content -->
      <student-dashboard v-if="isStudent" />
      <teacher-dashboard v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import StudentDashboard from "../components/dashboard/StudentDashboard.vue";
import TeacherDashboard from "../components/dashboard/TeacherDashboard.vue";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const completedTasksCount = ref(0);
const averageScore = ref("0.0");
const createdTasksCount = ref(0);
const gradedSubmissionsCount = ref(0);

const isStudent = computed(() => user.value?.role === "STUDENT");
const userRoleText = computed(() =>
  isStudent.value ? "Студент" : "Преподаватель"
);

onMounted(async () => {
  if (isStudent.value) {
    await fetchStudentStats();
  } else {
    await fetchTeacherStats();
  }
});

async function fetchStudentStats() {
  try {
    const response = await axios.get(`${API_URL}/users/me/stats`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    const stats = response.data;
    completedTasksCount.value = stats.completedTasksCount;
    averageScore.value = stats.averageScore.toFixed(1);
  } catch (error) {
    console.error("Error fetching student stats:", error);
  }
}

async function fetchTeacherStats() {
  try {
    const response = await axios.get(`${API_URL}/users/me/stats`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    const stats = response.data;
    createdTasksCount.value = stats.createdTasksCount;
    gradedSubmissionsCount.value = stats.gradedSubmissionsCount;
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
  }
}
</script>
