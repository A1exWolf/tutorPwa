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
      <h1 class="text-2xl font-bold">Добавить новое задание</h1>
    </div>

    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ error }}
    </div>

    <form
      @submit.prevent="submitForm"
      class="bg-white shadow-md rounded-lg p-6"
    >
      <div class="mb-4">
        <label for="title" class="block text-gray-700 text-sm font-bold mb-2"
          >Заголовок</label
        >
        <input
          type="text"
          id="title"
          v-model="task.title"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Введите название задания"
          required
          minlength="3"
        />
        <p v-if="validationErrors.title" class="text-red-500 text-xs mt-1">
          {{ validationErrors.title }}
        </p>
      </div>

      <div class="mb-4">
        <label
          for="description"
          class="block text-gray-700 text-sm font-bold mb-2"
          >Описание</label
        >
        <textarea
          id="description"
          v-model="task.description"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          placeholder="Подробно опишите задание"
          required
          minlength="10"
        ></textarea>
        <p
          v-if="validationErrors.description"
          class="text-red-500 text-xs mt-1"
        >
          {{ validationErrors.description }}
        </p>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2"
          >Назначить студентам (опционально)</label
        >

        <div v-if="usersStore.loading" class="text-center py-2">
          <p>Загрузка списка студентов...</p>
        </div>
        <div v-else>
          <!-- Список выбранных студентов -->
          <div
            class="flex flex-wrap gap-2 mb-2"
            v-if="task.studentIds.length > 0"
          >
            <div
              v-for="studentId in task.studentIds"
              :key="studentId"
              class="bg-blue-100 px-3 py-1 rounded-full flex items-center"
            >
              <span class="mr-2">
                {{ getStudentName(studentId) }}
              </span>
              <button
                type="button"
                @click="removeStudent(studentId)"
                class="text-blue-500 hover:text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Выпадающий список для выбора студентов -->
          <div class="relative">
            <select
              v-model="selectedStudent"
              @change="addStudent"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Выберите студента для добавления</option>
              <option
                v-for="student in availableStudents"
                :key="student.id"
                :value="student.id"
              >
                {{ student.firstName }} {{ student.lastName }} ({{
                  student.email
                }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          :disabled="loading"
        >
          <span v-if="loading">Сохранение...</span>
          <span v-else>Создать задание</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore } from "../stores/tasks";
import { useUsersStore } from "../stores/users";

const router = useRouter();
const taskStore = useTaskStore();
const usersStore = useUsersStore();

const task = ref({
  title: "",
  description: "",
  studentIds: [],
});

const selectedStudent = ref("");
const validationErrors = ref({});
const error = computed(() => taskStore.error || usersStore.error);
const loading = computed(() => taskStore.loading);

// Получить список доступных студентов (которые еще не выбраны)
const availableStudents = computed(() => {
  return usersStore.students.filter(
    (student) => !task.value.studentIds.includes(student.id)
  );
});

// Загрузить список студентов при монтировании компонента
onMounted(async () => {
  try {
    await usersStore.fetchStudents();
  } catch (err) {
    console.error("Failed to load students:", err);
  }
});

// Получить имя студента по ID
const getStudentName = (studentId) => {
  const student = usersStore.students.find((s) => s.id === studentId);
  if (student) {
    return `${student.firstName} ${student.lastName}`;
  }
  return `ID: ${studentId}`;
};

const addStudent = () => {
  if (
    !selectedStudent.value ||
    task.value.studentIds.includes(selectedStudent.value)
  ) {
    return;
  }

  task.value.studentIds.push(selectedStudent.value);
  selectedStudent.value = ""; // Сбросить выбор
};

const removeStudent = (id) => {
  task.value.studentIds = task.value.studentIds.filter(
    (studentId) => studentId !== id
  );
};

const validateForm = () => {
  validationErrors.value = {};
  let isValid = true;

  if (!task.value.title || task.value.title.length < 3) {
    validationErrors.value.title =
      "Заголовок должен содержать минимум 3 символа";
    isValid = false;
  }

  if (!task.value.description || task.value.description.length < 10) {
    validationErrors.value.description =
      "Описание должно содержать минимум 10 символов";
    isValid = false;
  }

  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await taskStore.createTask(task.value);
    router.push("/tasks");
  } catch (err) {
    console.error("Failed to create task:", err);
  }
};
</script>
