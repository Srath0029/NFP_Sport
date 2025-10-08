<template>
  <div class="container mt-4">
    <h1>Users Table</h1>
    <table id="usersTable" class="table table-striped table-bordered" style="width:100%">
      <thead>
        <tr>
          <th>Email</th>
          <th>Username</th>
          <th>Role</th>
          <th>First Name</th>
          <th>Last Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.email">
          <td>{{ user.email }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import DataTable from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

const users = ref([]);

onMounted(async () => {
  const snapshot = await getDocs(collection(db, "users"));
  users.value = snapshot.docs.map((doc) => doc.data());

  // wait for DOM
  setTimeout(() => {
    new DataTable("#usersTable", {
      pageLength: 10,
      searching: true,
      ordering: true,
    });
  }, 0);
});
</script>
