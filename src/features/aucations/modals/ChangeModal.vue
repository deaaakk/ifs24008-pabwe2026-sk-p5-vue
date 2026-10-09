<script setup>
import { ref, watch } from "vue";
import ModalShell from "../components/ModalShell.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, toApiDate, toInputDate } from "../../../helpers/toolsHelper";

const props = defineProps({ show: Boolean, aucation: Object });
const emit = defineEmits(["close", "changed"]);
const store = useAucationsStore();
const [title, onTitle] = useInput("");
const [startBid, onStartBid] = useInput("");
const [closedAt, onClosedAt] = useInput("");
const description = ref("");

watch(() => props.show, (s) => {
  if (s && props.aucation) {
    onTitle(props.aucation.title); onStartBid(props.aucation.start_bid);
    onClosedAt(toInputDate(props.aucation.closed_at)); description.value = props.aucation.description || "";
  }
});

async function submit() {
  if (!title.value || !startBid.value || !closedAt.value) return showErrorDialog("Judul, harga awal, dan batas waktu wajib diisi");
  const ok = await store.asyncChangeAucation(props.aucation.id, {
    title: title.value, description: description.value, start_bid: Number(startBid.value), closed_at: toApiDate(closedAt.value),
  });
  if (ok) { emit("changed"); emit("close"); }
}
</script>

<template>
  <ModalShell :show="show" title="Ubah Lelang" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div><label class="label" for="c-title">Judul</label><input id="c-title" class="input" :value="title" @input="onTitle" /></div>
      <div><label class="label">Deskripsi (Markdown)</label><MarkdownEditor v-if="show" v-model="description" /></div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div><label class="label" for="c-bid">Harga Awal (Rp)</label><input id="c-bid" type="number" min="0" class="input" :value="startBid" @input="onStartBid" /></div>
        <div><label class="label" for="c-close">Batas Waktu</label><input id="c-close" type="datetime-local" class="input" :value="closedAt" @input="onClosedAt" /></div>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button class="btn-primary" :disabled="store.isAucationChange">Simpan</button>
      </div>
    </form>
  </ModalShell>
</template>
