<template>
  <div class="card p-3 shadow-sm">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0">{{ title }}</h5>
      <div>
        <strong>{{ avg.toFixed(1) }}</strong> / 5
        <small class="text-muted">({{ count }} reviews)</small>
      </div>
    </div>

    <!-- Rate + review form -->
    <div class="mb-3">
      <div class="mb-2">
        <button v-for="n in 5" :key="n"
          class="btn btn-sm me-1"
          :class="n <= score ? 'btn-warning' : 'btn-outline-secondary'"
          :disabled="!user"
          @click="score = n">★</button>
        <small v-if="!user" class="text-muted ms-2">Login to rate & review</small>
        <small v-else class="text-muted ms-2">Your rating: {{ score || '—' }}</small>
      </div>

      <textarea
        class="form-control"
        rows="3"
        v-model.trim="comment"
        :disabled="!user"
        placeholder="Share a short review (5–500 chars)…"
        maxlength="500"
      ></textarea>
      <div class="d-flex justify-content-between">
        <small class="text-muted">Min 5 chars</small>
        <small class="text-muted">{{ comment.length }}/500</small>
      </div>

      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-primary btn-sm" @click="submit" :disabled="!canSubmit || saving">
          {{ saving ? 'Saving…' : 'Submit Review' }}
        </button>
        <button class="btn btn-outline-secondary btn-sm" @click="resetForm" :disabled="saving">Clear</button>
        <span class="text-success ms-2" v-if="saved">Saved.</span>
        <span class="text-danger ms-2" v-if="error">{{ error }}</span>
      </div>
    </div>

    <!-- Reviews list -->
    <hr class="my-3" />
    <h6 class="mb-2">Recent reviews</h6>
    <div v-if="reviews.length === 0" class="text-muted">No reviews yet.</div>
    <ul class="list-unstyled mb-0">
      <li v-for="r in reviews" :key="r.uid" class="mb-3">
        <div class="d-flex align-items-center">
          <span class="me-2">
            <span v-for="n in 5" :key="n" class="me-1" :style="{opacity: n <= r.score ? 1 : 0.3}">★</span>
          </span>
          <small class="text-muted">{{ formatWhen(r.at) }}</small>
          <small class="badge bg-secondary ms-2" v-if="r.uid === user?.uid">you</small>
        </div>
        <div class="mt-1">{{ r.comment }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { db } from "../firebase";
import { useAuth } from "../composables/auth";
import { doc, setDoc, collection, getDocs, orderBy, query, limit } from "firebase/firestore";

const props = defineProps({
  itemKey: { type: String, required: true },
  title:   { type: String, default: "Rate & review" }
});

const { currentUser } = useAuth();
const user = computed(() => currentUser.value);

const score = ref(0);
const comment = ref("");
const saving = ref(false);
const saved = ref(false);
const error = ref("");

const reviews = ref([]); // [{uid, score, comment, at}]
const count = computed(() => reviews.value.length);
const avg = computed(() => {
  if (!count.value) return 0;
  return reviews.value.reduce((a, r) => a + (r.score || 0), 0) / count.value;
});

const canSubmit = computed(() => user.value && score.value >= 1 && comment.value.length >= 5);

function formatWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

async function loadReviews() {
  const qRef = query(collection(db, "ratings", props.itemKey, "reviews"), orderBy("at", "desc"), limit(10));
  const snap = await getDocs(qRef);
  reviews.value = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  // preload your own rating & comment if present
  const mine = reviews.value.find(r => r.uid === user.value?.uid);
  if (mine) { score.value = mine.score; comment.value = mine.comment; }
}

async function submit() {
  if (!canSubmit.value) return;
  try {
    saving.value = true; saved.value = false; error.value = "";
    await setDoc(
      doc(db, "ratings", props.itemKey, "reviews", user.value.uid),
      { score: score.value, comment: comment.value, at: new Date().toISOString() },
      { merge: true }
    );
    saved.value = true;
    await loadReviews();
    setTimeout(() => { saved.value = false; }, 1200);
  } catch (e) {
    error.value = e.message || "Failed to save review.";
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  score.value = 0;
  comment.value = "";
  error.value = "";
  saved.value = false;
}

onMounted(loadReviews);
</script>
