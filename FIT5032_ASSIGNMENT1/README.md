# NFP Community Sport – Vue 3 (Version 1)

A basic web application for a Melbourne not-for-profit (NFP) promoting health through community sport.  
This **Version 1** submission implements **Business Requirements A & B**: Vue 3 stack, responsiveness, form validations, and dynamic data with persistence.

---
# !!!!!!!!!!!!!! You may have to CD to FIT5032_ASSIGNMENT1 as the file is inside the same file (whoops) !!!!!!!!!!!!!!!

## ✅ Features (Mapped to BR A & B)

### A.1 – Development Stack
- **Vue 3 / Vite** with Single File Components and `script setup` syntax
- **Vue Router 4** (Home, Login, About, Contact)
- **Bootstrap 5** for layout/utilities

### A.2 – Responsiveness
- Bootstrap grid (`row`, `col-*`) and utilities across breakpoints:
  - `<576px` (mobile), `576–768px`, `992–1200px`, `>1400px`
- Responsive tables using `.table-responsive`

### B.1 – Validations (Comprehensive)
- Required + min-length checks (first/last name, reason)
- Pattern & uniqueness (username: letters/numbers/._- only; no duplicates)
- Email format validation
- Age range (13–120)
- Password strength meter + confirm password (must match; strength threshold)
- Real-time red error messages on input/blur
- “Clear” button to reset fields and errors

### B.2 – Dynamic Data & Data Structure
- Form emits a user object → **Dashboard** renders immediately (no reload)
- Search/filter users (by name/username/email)
- Delete with confirmation
- **localStorage** persistence (`users_v1`) across reloads

---

## 🗂 Project Structure

src/
components/
NavBar.vue
Form.vue
Dashboard.vue
views/
HomeView.vue
LoginView.vue
AboutView.vue
ContactView.vue
router/
index.js
App.vue
main.js
package.json
vite.config.js
README.md