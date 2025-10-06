import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import AboutView from "../views/AboutView.vue";
import ContactView from "../views/ContactView.vue";
import AdminView from "../views/AdminView.vue";
import ProfileView from "../views/ProfileView.vue";
import { useAuth } from "../composables/auth";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  { path: "/about", name: "About", component: AboutView },
  { path: "/contact", name: "Contact", component: ContactView },
  { path: "/profile", name: "Profile", component: ProfileView, meta: { requiresAuth: true } },
  { path: "/admin", name: "Admin", component: AdminView, meta: { requiresAuth: true, roles: ["admin"] } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
  const { currentUser } = useAuth();
  const user = currentUser.value;

  if (to.meta?.requiresAuth && !user) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }
  if (to.meta?.roles && user && !to.meta.roles.includes(user.role)) {
    return next({ name: "Home" });
  }
  next();
});

export default router;
