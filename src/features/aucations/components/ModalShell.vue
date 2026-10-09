<script setup>
import { X } from "lucide-vue-next";

defineProps({ show: Boolean, title: String });
defineEmits(["close"]);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" @click.self="$emit('close')">
    <div class="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold">{{ title }}</h2>
        <button aria-label="Tutup" @click="$emit('close')"><X class="h-5 w-5" /></button>
      </div>
      <slot />
    </div>
  </div>
</template>
