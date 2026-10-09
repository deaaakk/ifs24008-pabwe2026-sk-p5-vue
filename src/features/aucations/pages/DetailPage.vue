<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Gavel, ImagePlus, Pencil, Trash2 } from "lucide-vue-next";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import BidModal from "../modals/BidModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { formatDate, formatRupiah, highestBid, isClosed, showConfirmDialog } from "../../../helpers/toolsHelper";

const store = useAucationsStore();
const users = useUsersStore();
const route = useRoute();
const router = useRouter();
const modal = ref("");

const a = computed(() => store.aucation);
const isOwner = computed(() => a.value && users.profile && a.value.user_id === users.profile.id);
const closed = computed(() => a.value && isClosed(a.value));
const bids = computed(() => [...(a.value?.bids || [])].sort((x, y) => y.bid - x.bid));
const load = () => store.asyncGetAucation(route.params.aucationId);
onMounted(load);

async function remove() {
  if (await showConfirmDialog("Lelang ini akan dihapus permanen.") && (await store.asyncDeleteAucation(a.value.id))) router.push("/");
}
async function cancelBid() {
  if (await showConfirmDialog("Batalkan penawaranmu?") && (await store.asyncDeleteBid(a.value.id))) load();
}
</script>

<template>
  <section v-if="a" class="space-y-5">
    <RouterLink to="/" class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"><ArrowLeft class="h-4 w-4" /> Kembali</RouterLink>
    <div class="grid gap-6 lg:grid-cols-5">
      <div class="space-y-4 lg:col-span-3">
        <div class="h-72 overflow-hidden rounded-2xl bg-slate-200">
          <img v-if="a.cover" :src="a.cover" :alt="a.title" class="h-full w-full object-cover" />
        </div>
        <div class="card">
          <h1 class="mb-2 text-2xl font-extrabold">{{ a.title }}</h1>
          <MarkdownViewer :value="a.description || ''" />
        </div>
      </div>
      <div class="space-y-4 lg:col-span-2">
        <div class="card space-y-2 text-sm">
          <p>Penjual: <b>{{ a.author?.name }}</b></p>
          <p>Harga awal: <b>{{ formatRupiah(a.start_bid) }}</b></p>
          <p>Tertinggi: <b class="text-indigo-600">{{ formatRupiah(highestBid(a)) }}</b></p>
          <p>Ditutup: {{ formatDate(a.closed_at) }} <span class="font-bold">({{ closed ? "Ditutup" : "Berlangsung" }})</span></p>
          <p v-if="a.my_bid">Tawaranmu: <b>{{ formatRupiah(a.my_bid.bid) }}</b></p>

          <div v-if="isOwner" class="flex flex-wrap gap-2 pt-2">
            <button class="btn-ghost" @click="modal = 'change'"><Pencil class="h-4 w-4" /> Ubah</button>
            <button class="btn-ghost" @click="modal = 'cover'"><ImagePlus class="h-4 w-4" /> Ganti Cover</button>
            <button class="btn-danger" @click="remove"><Trash2 class="h-4 w-4" /> Hapus</button>
          </div>
          <div v-else class="flex flex-wrap gap-2 pt-2">
            <button class="btn-primary" :disabled="closed" @click="modal = 'bid'"><Gavel class="h-4 w-4" /> Ajukan Bid</button>
            <button v-if="a.my_bid" class="btn-ghost" @click="cancelBid">Batalkan Bid</button>
          </div>
        </div>
        <div class="card">
          <h2 class="mb-3 font-bold">Riwayat Penawaran</h2>
          <p v-if="!bids.length" class="text-sm text-slate-500">Belum ada penawaran.</p>
          <ul class="divide-y divide-slate-100 text-sm">
            <li v-for="b in bids" :key="b.id" class="flex justify-between py-2">
              <span class="font-semibold">{{ formatRupiah(b.bid) }}</span><span class="text-slate-500">{{ formatDate(b.created_at) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <ChangeModal :show="modal === 'change'" :aucation="a" @close="modal = ''" @changed="load" />
    <ChangeCoverModal :show="modal === 'cover'" :aucation="a" @close="modal = ''" @changed="load" />
    <BidModal :show="modal === 'bid'" :aucation="a" @close="modal = ''" @bidded="load" />
  </section>
  <p v-else-if="store.isAucation" class="text-slate-500">Memuat...</p>
  <p v-else class="card text-center text-slate-500">Lelang tidak ditemukan.</p>
</template>
