<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { UserPlus } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";

const auth = useAuthStore();
const router = useRouter();
const [name, onName] = useInput("");
const [email, onEmail] = useInput("");
const [password, onPassword] = useInput("");
const [confirm, onConfirm] = useInput("");
const error = ref("");

async function submit() {
  error.value = "";
  if (!name.value || !email.value || !password.value) error.value = "Semua kolom wajib diisi";
  else if (password.value.length < 6) error.value = "Kata sandi minimal 6 karakter";
  else if (password.value !== confirm.value) error.value = "Konfirmasi kata sandi tidak cocok";
  if (error.value) return;
  if (await auth.asyncRegister({ name: name.value, email: email.value, password: password.value })) router.push("/auth/login");
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div><label class="label" for="register-name-input">Nama</label><input id="register-name-input" class="input" :value="name" @input="onName" /></div>
    <div><label class="label" for="register-email-input">Alamat Email</label><input id="register-email-input" type="email" class="input" :value="email" @input="onEmail" /></div>
    <div><label class="label" for="register-password-input">Kata Sandi</label><input id="register-password-input" type="password" class="input" :value="password" @input="onPassword" /></div>
    <div><label class="label" for="register-confirm-input">Konfirmasi Kata Sandi</label><input id="register-confirm-input" type="password" class="input" :value="confirm" @input="onConfirm" /></div>
    <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
    <button id="register-submit-button" type="submit" class="btn-primary w-full" :disabled="auth.isLoading"><UserPlus class="h-4 w-4" /> Daftar</button>
  </form>
</template>