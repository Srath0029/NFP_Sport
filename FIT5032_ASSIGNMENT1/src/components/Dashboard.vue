<template>
  <div class="card p-4 shadow-sm">
    <h3>Registered Users</h3>

    <table class="table table-striped table-hover mt-3" v-if="users.length > 0">
      <thead class="table-dark">
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Email</th>
          <th>Age</th>
          <th>Location</th>
          <th>Gender</th>
          <th>Reason</th>
          <th style="width: 90px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.age }}</td>
          <td>{{ user.location }}</td>
          <td>{{ user.gender }}</td>
          <td class="text-truncate" style="max-width: 220px;">{{ user.reason }}</td>
          <td>
            <button class="btn btn-sm btn-danger" @click="$emit('deleteUser', index)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No users registered yet.</p>
  </div>
</template>

<script setup>
defineProps({
  users: {
    type: Array,
    required: true,
  },
});
</script>
