# NFP Community Sport – Vue 3 (Version 1)

A basic web application for a Melbourne not-for-profit (NFP) promoting health through community sport.  
This **Version 1** submission implements **Business Requirements C: Vue 3 stack, responsiveness, form validations, and Firebase 

---
# !!!!!!!!!!!!!! You may have to CD to FIT5032_ASSIGNMENT1 as the file is inside the same file  !!!!!!!!!!!!!!!

### What to test (BR C)
- Admin Login is Email: Boss@example.com
- Password is: Admin123!
- **C.1 Auth**: Register → redirected to **/profile** (protected). Login/Logout.  
- **C.2 Roles**: Admin link visible only for admin. `/admin` blocked for members.  
- **C.3 Ratings + Reviews**: On Home, leave a star rating + comment. Average and count update.  
- **C.4 Security**: Firestore rules enforce least privilege; no `v-html`; input validation on all forms.


- Firestore Rules
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ---- Helpers ----
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Look up caller's user doc to check role
    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // ---- USERS COLLECTION ----
    // Each user manages their own profile doc at /users/{uid}
    match /users/{userId} {
      // READ: owner can read; admin can also read (for admin directory)
      allow read: if isOwner(userId) || isAdmin();

      // WRITE: only the owner can create/update their own profile
      // (Admins do NOT edit user profiles here — safer for Part C)
      allow create, update, delete: if isOwner(userId);

      // Optional: basic schema checks on create/update
      allow create, update: if
        // Ensure only expected types (all optional except email on create)
        (
          !("email" in request.resource.data) || request.resource.data.email is string
        ) &&
        (
          !("username" in request.resource.data) || request.resource.data.username is string
        ) &&
        (
          !("firstName" in request.resource.data) || request.resource.data.firstName is string
        ) &&
        (
          !("lastName" in request.resource.data) || request.resource.data.lastName is string
        ) &&
        (
          !("age" in request.resource.data) || request.resource.data.age is int
        ) &&
        (
          !("location" in request.resource.data) || request.resource.data.location is string
        ) &&
        (
          !("gender" in request.resource.data) || request.resource.data.gender is string
        ) &&
        (
          !("reason" in request.resource.data) || request.resource.data.reason is string
        );
    }

    // ---- RATINGS: SCORES (one per user) ----
    // Path: /ratings/{itemKey}/scores/{userId}
    match /ratings/{itemKey}/scores/{userId} {
      // Anyone can read aggregated data client-side
      allow read: if true;

      // Only the authenticated owner can write their score doc
      allow create, update, delete: if isOwner(userId) && isValidScore();

      function isValidScore() {
        return request.resource.data.keys().hasOnly(["score", "at"]) &&
               request.resource.data.score is int &&
               request.resource.data.score >= 1 &&
               request.resource.data.score <= 5 &&
               request.resource.data.at is string; // ISO string from client
      }
    }

    // ---- RATINGS: REVIEWS (score + comment) ----
    // Path: /ratings/{itemKey}/reviews/{userId}
    match /ratings/{itemKey}/reviews/{userId} {
      // Publicly readable
      allow read: if true;

      // Only the authenticated owner can write/update their review
      allow create, update, delete: if isOwner(userId) && isValidReview();

      function isValidReview() {
        // Only allow these fields
        return request.resource.data.keys().hasOnly(["score", "comment", "at"]) &&
               // score 1..5
               request.resource.data.score is int &&
               request.resource.data.score >= 1 &&
               request.resource.data.score <= 5 &&
               // comment length 5..500
               request.resource.data.comment is string &&
               request.resource.data.comment.size() >= 5 &&
               request.resource.data.comment.size() <= 500 &&
               // timestamp string
               request.resource.data.at is string;
      }
    }
  }
}