<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import ModalShell from "../components/ModalShell.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const props = defineProps({ show: Boolean, aucation: Object });
const emit = defineEmits(["close", "changed"]);
const store = useAucationsStore();
const file = ref(null);
const preview = ref("");

function revoke() { if (preview.value) URL.revokeObjectURL(preview.value); }
function pick(e) {
  revoke();
  file.value = e.target.files[0] || null;
  preview.value = file.value ? URL.createObjectURL(file.value) : "";
}
watch(() => props.show, (s) => { if (!s) { revoke(); file.value = null; preview.value = ""; } });
onBeforeUnmount(revoke);

async function submit() {
  if (!file.value) return showErrorDialog("Pilih gambar terlebih dahulu");
  if (await store.asyncChangeCover(props.aucation.id, file.value)) { emit("changed"); emit("close"); }
}
</script>

<template>
  <ModalShell :show="show" title="Ganti Cover" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <img v-if="preview" :src="preview" alt="Pratinjau cover" class="max-h-64 w-full rounded-xl object-cover" />
      <input type="file" accept="image/*" aria-label="Berkas cover" class="input" @change="pick" />
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button class="btn-primary" :disabled="store.isAucationChangeCover">Unggah</button>
      </div>
    </form>
  </ModalShell>
</template>
