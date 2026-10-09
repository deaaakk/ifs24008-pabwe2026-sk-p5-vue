<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({ modelValue: { type: String, default: "" } });
const emit = defineEmits(["update:modelValue"]);
const el = ref(null);
let editor;
let unmounted = false;

onMounted(async () => {
  const [{ default: Editor }] = await Promise.all([
    import("@toast-ui/editor"),
    import("@toast-ui/editor/dist/toastui-editor.css"),
  ]);
  if (unmounted) return;
  editor = new Editor({
    el: el.value,
    height: "260px",
    initialEditType: "markdown",
    previewStyle: "tab",
    initialValue: props.modelValue,
    events: { change: () => emit("update:modelValue", editor.getMarkdown()) },
  });
});

onBeforeUnmount(() => {
  unmounted = true;
  editor?.destroy();
});
</script>

<template>
  <div ref="el"></div>
</template>