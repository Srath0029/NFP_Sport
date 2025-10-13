<template>
  <div class="card p-3 shadow-sm">
    <!-- Header with average -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0">{{ title }}</h5>
      <div aria-live="polite">
        <strong>{{ avg.toFixed(1) }}</strong> / 5
        <small class="text-muted">({{ count }} reviews)</small>
      </div>
    </div>

    <!-- Rate + review form -->
    <div class="mb-3">
      <!-- Stars as a real radio group -->
      <fieldset class="mb-2" :aria-describedby="!user ? `${baseId}-loginHint` : `${baseId}-ratingHint`">
        <legend class="visually-hidden">Rating</legend>
        <div
          class="d-inline-flex align-items-center"
          role="radiogroup"
          :aria-labelledby="`${baseId}-ratingLbl`"
        >
          <span :id="`${baseId}-ratingLbl`" class="visually-hidden">Choose a rating from 1 to 5 stars</span>

          <div v-for="n in 5" :key="n" class="me-1">
            <input
              class="visually-hidden"
              type="radio"
              :id="`${baseId}-star-${n}`"
              :name="`${baseId}-stars`"
              :value="n"
              :checked="score === n"
              :disabled="!user"
              @change="setScore(n)"
            />
            <label
              :for="`${baseId}-star-${n}`"
              class="btn btn-sm"
              :class="n <= score ? 'btn-warning' : 'btn-outline-secondary'"
              :aria-checked="score === n ? 'true' : 'false'"
              role="radio"
            >★<span class="visually-hidden"> {{ n }} star{{ n>1 ? 's' : '' }}</span></label>
          </div>
        </div>

        <small
          v-if="!user"
          :id="`${baseId}-loginHint`"
          class="text-muted ms-2 d-inline-block"
        >Login to rate &amp; review</small>
        <small
          v-else
          :id="`${baseId}-ratingHint`"
          class="text-muted ms-2 d-inline-block"
        >Your rating: {{ score || '—' }}</small>
      </fieldset>

      <div class="mb-1">
        <label class="form-label" :for="`${baseId}-comment`">Your review</label>
        <textarea
          :id="`${baseId}-comment`"
          class="form-control"
          rows="3"
          v-model.trim="comment"
          :disabled="!user"
          placeholder="Share a short review (5–500 chars)…"
          maxlength="500"
          aria-describedby="reviewHelp reviewCount"
        ></textarea>
      </div>
      <div class="d-flex justify-content-between">
        <small id="reviewHelp" class="text-muted">Min 5 chars</small>
        <small id="reviewCount" class="text-muted">{{ comment.length }}/500</small>
      </div>

      <div class="mt-2 d-flex flex-wrap gap-2 align-items-center">
        <button class="btn btn-primary btn-sm" @click="submit" :disabled="!canSubmit || saving">
          {{ saving ? 'Saving…' : 'Submit Review' }}
        </button>
        <button class="btn btn-outline-secondary btn-sm" @click="resetForm" :disabled="saving">Clear</button>

        <!-- Live region for status -->
        <span class="text-success ms-2" v-if="saved" role="status" aria-live="polite">Saved.</span>
        <span class="text-danger ms-2" v-if="error" role="status" aria-live="polite">{{ error }}</span>
      </div>
    </div>

    <!-- Reviews list -->
    <hr class="my-3" />
    <h6 class="mb-2">Recent reviews</h6>
    <div v-if="reviews.length === 0" class="text-muted">No reviews yet.</div>
    <ul class="list-unstyled mb-0">
      <li v-for="r in reviews" :key="r.uid" class="mb-3">
        <div class="d-flex align-items-center">
          <span class="me-2" aria-label="Rating" role="img">
            <span v-for="n in 5" :key="n" class="me-1" :style="{opacity: n <= r.score ? 1 : 0.3}">★</span>
            <span class="visually-hidden"> {{ r.score }} out of 5</span>
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

const baseId = `rw_${props.itemKey.replace(/[^a-z0-9_-]/gi, "_")}`;

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
  return reviews.value.reduce((a, r) => a + (Number(r.score) || 0), 0) / count.value;
});

const canSubmit = computed(() => user.value && score.value >= 1 && comment.value.length >= 5);

function setScore(n) {
  score.value = n;
}

function formatWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

async function loadReviews() {
  const qRef = query(
    collection(db, "ratings", props.itemKey, "reviews"),
    orderBy("at", "desc"),
    limit(10)
  );
  const snap = await getDocs(qRef);
  reviews.value = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  // preload your own rating & comment if present
  const mine = user.value ? reviews.value.find(r => r.uid === user.value.uid) : null;
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
    error.value = e?.message || "Failed to save review.";
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

<style scoped>
/* Hide only the native radio control; keep the label (button) visible */
.visually-hidden {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border: 0;
}
</style>
