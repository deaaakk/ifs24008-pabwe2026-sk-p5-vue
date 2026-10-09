<script setup>
import { ref, watch } from "vue";
import ModalShell from "../components/ModalShell.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { formatRupiah, highestBid } from "../../../helpers/toolsHelper";

const props = defineProps({ show: Boolean, aucation: Object });
const emit = defineEmits(["close", "bidded"]);
const store = useAucationsStore();
const nominal = ref("");
const error = ref("");

watch(() => props.show, (s) => { if (s) { nominal.value = ""; error.value = ""; } });

async function submit() {
  const current = highestBid(props.aucation);
  if (!(Number(nominal.value) > current)) {
    error.value = `Penawaran harus lebih tinggi dari ${formatRupiah(current)}`;
    return;
  }
  error.value = "";
  if (await store.asyncAddBid(props.aucation.id, Number(nominal.value))) { emit("bidded"); emit("close"); }
}
</script>

<template>
  <ModalShell :show="show" title="Ajukan Penawaran" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <p v-if="aucation" class="text-sm text-slate-500">Penawaran tertinggi saat ini: <b>{{ formatRupiah(highestBid(aucation)) }}</b></p>
      <div><label class="label" for="bid">Nominal (Rp)</label><input id="bid" v-model="nominal" type="number" class="input" /></div>
      <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button class="btn-primary" :disabled="store.isBidAdd">Ajukan Bid</button>
      </div>
    </form>
  </ModalShell>
</template>
