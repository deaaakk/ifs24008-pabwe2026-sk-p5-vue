<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({ value: { type: String, default: "" } });
const el = ref(null);
let viewer;
let unmounted = false;

onMounted(async () => {
  const [{ default: Editor }] = await Promise.all([
    import("@toast-ui/editor"),
    import("@toast-ui/editor/dist/toastui-editor.css"),
  ]);
  if (unmounted) return;
  viewer = Editor.factory({ el: el.value, viewer: true, initialValue: props.value });
});
onBeforeUnmount(() => {
  unmounted = true;
});
watch(() => props.value, (v) => viewer?.setMarkdown(v));
</script>

<template>
  <div ref="el"></div>
</template>