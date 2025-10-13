import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/auth";

// core views
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import AboutView from "../views/AboutView.vue";
import ContactView from "../views/ContactView.vue";
import ProfileView from "../views/ProfileView.vue";
import AdminView from "../views/AdminView.vue";

// admin helpers
import AdminEmailView from "../views/AdminEmailView.vue";
import AdminTablesView from "../views/AdminTablesView.vue";
import AdminUsersView from "../views/AdminUsersView.vue";

// lazy views
const ProgramsMapView   = () => import("../views/ProgramsMapView.vue");
const BookingsView      = () => import("../views/BookingsView.vue");
const MyBookingsView    = () => import("../views/MyBookingsView.vue");
const AdminBookingsView = () => import("../views/AdminBookingsView.vue");

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  { path: "/about", name: "About", component: AboutView },
  { path: "/contact", name: "Contact", component: ContactView },

  { path: "/map", name: "ProgramsMap", component: ProgramsMapView },

  // bookings (members)
  { path: "/bookings", name: "Bookings", component: BookingsView, meta: { requiresAuth: true } },
  { path: "/bookings/mine", name: "MyBookings", component: MyBookingsView, meta: { requiresAuth: true } },

  // admin bookings view
  { path: "/admin/bookings", name: "AdminBookings", component: AdminBookingsView, meta: { requiresAuth: true, roles: ["admin"] } },

  // profile
  { path: "/profile", name: "Profile", component: ProfileView, meta: { requiresAuth: true } },

  // admin dashboard + tools
  { path: "/admin", name: "Admin", component: AdminView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/admin/email", name: "AdminEmail", component: AdminEmailView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/admin/tables", name: "AdminTables", component: AdminTablesView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/admin/users", name: "AdminUsers", component: AdminUsersView, meta: { requiresAuth: true, roles: ["admin"] } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
  const { currentUser } = useAuth();
  const user = currentUser.value;

  // must be signed in?
  if (to.meta?.requiresAuth && !user) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }

  // role-gated?
  if (to.meta?.roles && user) {
    const role = user.role;
    if (!role || !to.meta.roles.includes(role)) {
      return next({ name: "Home" });
    }
  }

  next();
});

export default router;
