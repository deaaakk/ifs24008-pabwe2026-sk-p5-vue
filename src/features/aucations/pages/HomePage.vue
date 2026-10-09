<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Search, Trash2, Clock } from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { countdownText, formatRupiah, highestBid, isClosed, showConfirmDialog } from "../../../helpers/toolsHelper";

const store = useAucationsStore();
const route = useRoute();
const router = useRouter();
const tabs = [
  { key: "all", label: "Semua Lelang" },
  { key: "mine", label: "Lelang Saya" },
  { key: "open", label: "Lelang Berlangsung" },
  { key: "closed", label: "Lelang Ditutup" },
];
const tab = computed(() => route.query.tab || "all");
const search = ref("");
const showAdd = ref(false);
const now = ref(Date.now());
const timer = setInterval(() => (now.value = Date.now()), 1000);
onBeforeUnmount(() => clearInterval(timer));

const load = () => store.asyncGetAucations(tab.value === "mine" ? { is_me: 1 } : {});
watch(tab, load, { immediate: true });

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return store.aucations.filter((a) => {
    const matches = !q || a.title.toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q);
    const closed = isClosed(a, now.value);
    const byTab = tab.value === "open" ? !closed : tab.value === "closed" ? closed : true;
    return matches && byTab;
  });
});

const setTab = (key) => router.push({ path: "/", query: key === "all" ? {} : { tab: key } });

async function deleteAll() {
  if (await showConfirmDialog("Seluruh lelang milikmu akan dihapus permanen.")) {
    if (await store.asyncDeleteAllAucations()) load();
  }
}
</script>

<template>
  <section class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-extrabold">Dashboard Lelang</h1>
      <div class="flex gap-2">
        <button v-if="tab === 'mine'" class="btn-danger" @click="deleteAll"><Trash2 class="h-4 w-4" /> Hapus Semua</button>
        <button class="btn-primary" @click="showAdd = true"><Plus class="h-4 w-4" /> Tambah Lelang</button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in tabs" :key="t.key" class="rounded-full px-4 py-1.5 text-sm font-semibold"
        :class="tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'"
        @click="setTab(t.key)"
      >{{ t.label }}</button>
    </div>

    <div class="relative">
      <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input v-model="search" class="input pl-9" placeholder="Cari judul atau deskripsi..." aria-label="Cari lelang" />
    </div>

    <p v-if="store.isAucation" class="text-slate-500">Memuat...</p>
    <p v-else-if="!filtered.length" class="card text-center text-slate-500">Belum ada lelang.</p>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="a in filtered" :key="a.id" class="card flex flex-col overflow-hidden !p-0">
        <div class="h-40 bg-slate-200">
          <img v-if="a.cover" :src="a.cover" :alt="a.title" class="h-full w-full object-cover" />
        </div>
        <div class="flex flex-1 flex-col gap-2 p-4">
          <div class="flex items-start justify-between gap-2">
            <h2 class="font-bold leading-tight">{{ a.title }}</h2>
            <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
              :class="isClosed(a, now) ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'">
              {{ isClosed(a, now) ? "Ditutup" : "Berlangsung" }}
            </span>
          </div>
          <p class="text-xs text-slate-500">Oleh {{ a.author?.name }}</p>
          <dl class="text-sm">
            <div class="flex justify-between"><dt class="text-slate-500">Harga awal</dt><dd>{{ formatRupiah(a.start_bid) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Tertinggi</dt><dd class="font-bold text-indigo-600">{{ formatRupiah(highestBid(a)) }}</dd></div>
          </dl>
          <p class="flex items-center gap-1 text-xs text-slate-500"><Clock class="h-3 w-3" /> {{ countdownText(a.closed_at, now) }}</p>
          <RouterLink :to="`/aucations/${a.id}`" class="btn-ghost mt-auto">Lihat Detail</RouterLink>
        </div>
      </article>
    </div>

    <AddModal :show="showAdd" @close="showAdd = false" @added="load" />
  </section>
</template>
