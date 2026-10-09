<script setup>
import { Gavel } from "lucide-vue-next";
</script>

<template>
  <main class="grid min-h-screen lg:grid-cols-2">
    <div class="hidden flex-col justify-center bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white lg:flex">
      <Gavel class="mb-6 h-12 w-12" />
      <h1 class="text-4xl font-extrabold">Delcom Auction</h1>
      <p class="mt-3 max-w-md text-indigo-100">Pasang lelang barangmu dan ajukan penawaran terbaik secara real-time.</p>
    </div>
    <div class="flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <h1 class="mb-6 text-center text-2xl font-extrabold text-indigo-600 lg:hidden">Delcom Auction</h1>
        <div class="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-center text-sm font-semibold">
          <RouterLink to="/auth/login" class="rounded-lg py-2" active-class="bg-white text-indigo-600 shadow">Masuk Akun</RouterLink>
          <RouterLink to="/auth/register" class="rounded-lg py-2" active-class="bg-white text-indigo-600 shadow">Daftar Baru</RouterLink>
        </div>
        <div class="card"><RouterView /></div>
      </div>
    </div>
  </main>
</template>