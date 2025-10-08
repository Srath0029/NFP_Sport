import { createRouter, createWebHistory } from "vue-router";

// existing views
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import AboutView from "../views/AboutView.vue";
import ContactView from "../views/ContactView.vue";
import AdminView from "../views/AdminView.vue";
import ProfileView from "../views/ProfileView.vue";

// 🔹 NEW (D.2 and D.3 pages)
import AdminEmailView from "../views/AdminEmailView.vue";     // create this view
import AdminTablesView from "../views/AdminTablesView.vue";   // create this view

import { useAuth } from "../composables/auth";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  { path: "/about", name: "About", component: AboutView },
  { path: "/contact", name: "Contact", component: ContactView },

  { path: "/profile", name: "Profile", component: ProfileView, meta: { requiresAuth: true } },

  // existing admin
  { path: "/admin", name: "Admin", component: AdminView, meta: { requiresAuth: true, roles: ["admin"] } },

  // 🔹 NEW routes for rubric items
  { path: "/admin/email", name: "AdminEmail", component: AdminEmailView, meta: { requiresAuth: true, roles: ["admin"] } },    // D.2
  { path: "/admin/tables", name: "AdminTables", component: AdminTablesView, meta: { requiresAuth: true, roles: ["admin"] } }, // D.3
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
  const { currentUser } = useAuth();
  const user = currentUser.value; // expect shape like { uid, email, role?, ... }

  // require auth
  if (to.meta?.requiresAuth && !user) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }

  // role check (only if a role is actually present)
  if (to.meta?.roles && user) {
    const userRole = user.role; // your app sets this from Firestore users/{uid}.role
    if (!userRole || !to.meta.roles.includes(userRole)) {
      return next({ name: "Home" });
    }
  }

  next();
});

export default router;
