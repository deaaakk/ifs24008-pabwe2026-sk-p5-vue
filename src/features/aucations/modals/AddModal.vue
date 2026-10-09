<script setup>
import { ref, watch } from "vue";
import ModalShell from "../components/ModalShell.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, toApiDate } from "../../../helpers/toolsHelper";

const props = defineProps({ show: Boolean });
const emit = defineEmits(["close", "added"]);
const store = useAucationsStore();
const [title, onTitle] = useInput("");
const [startBid, onStartBid] = useInput("");
const [closedAt, onClosedAt] = useInput("");
const description = ref("");

watch(() => props.show, (s) => { if (s) { onTitle(""); onStartBid(""); onClosedAt(""); description.value = ""; } });

async function submit() {
  if (!title.value || !startBid.value || !closedAt.value) return showErrorDialog("Judul, harga awal, dan batas waktu wajib diisi");
  const ok = await store.asyncAddAucation({
    title: title.value, description: description.value, start_bid: Number(startBid.value), closed_at: toApiDate(closedAt.value),
  });
  if (ok) { emit("added"); emit("close"); }
}
</script>

<template>
  <ModalShell :show="show" title="Tambah Lelang" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div><label class="label" for="a-title">Judul</label><input id="a-title" class="input" :value="title" @input="onTitle" /></div>
      <div><label class="label">Deskripsi (Markdown)</label><MarkdownEditor v-if="show" v-model="description" /></div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div><label class="label" for="a-bid">Harga Awal (Rp)</label><input id="a-bid" type="number" min="0" class="input" :value="startBid" @input="onStartBid" /></div>
        <div><label class="label" for="a-close">Batas Waktu</label><input id="a-close" type="datetime-local" class="input" :value="closedAt" @input="onClosedAt" /></div>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button class="btn-primary" :disabled="store.isAucationAdd">Simpan</button>
      </div>
    </form>
  </ModalShell>
</template>
