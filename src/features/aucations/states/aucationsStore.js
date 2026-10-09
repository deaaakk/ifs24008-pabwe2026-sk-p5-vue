import { ref } from "vue";
import { defineStore } from "pinia";
import * as api from "../api/aucationApi";
import { runAction } from "../../../helpers/storeHelper";

export const useAucationsStore = defineStore("aucations", () => {
  const aucations = ref([]);
  const aucation = ref(null);
  const isAucation = ref(false);

  const isAucationAdd = ref(false), isAucationAdded = ref(false);
  const isAucationChange = ref(false), isAucationChanged = ref(false);
  const isAucationChangeCover = ref(false), isAucationChangedCover = ref(false);
  const isAucationDelete = ref(false), isAucationDeleted = ref(false);
  const isBidAdd = ref(false), isBidAdded = ref(false);
  const isBidDelete = ref(false), isBidDeleted = ref(false);
  const isAucationDeleteAll = ref(false), isAucationDeletedAll = ref(false);

  async function asyncGetAucations(params = {}) {
    const res = await runAction(isAucation, () => api.getAucations(params));
    if (res) aucations.value = res.data.aucations;
  }

  async function asyncGetAucation(id) {
    aucation.value = null;
    const res = await runAction(isAucation, () => api.getAucation(id));
    if (res) aucation.value = res.data.aucation;
    return !!res;
  }

  // Menjalankan mutasi: set flag busy, flag done, lalu muat ulang jika perlu.
  async function mutate(busy, done, fn) {
    done.value = false;
    const res = await runAction(busy, fn, { success: true });
    done.value = !!res;
    return !!res;
  }

  const asyncAddAucation = (payload) => mutate(isAucationAdd, isAucationAdded, () => api.postAucation(payload));
  const asyncChangeAucation = (id, payload) => mutate(isAucationChange, isAucationChanged, () => api.putAucation(id, payload));
  const asyncChangeCover = (id, file) => mutate(isAucationChangeCover, isAucationChangedCover, () => api.postCover(id, file));
  const asyncDeleteAucation = (id) => mutate(isAucationDelete, isAucationDeleted, () => api.deleteAucation(id));
  const asyncAddBid = (id, bid) => mutate(isBidAdd, isBidAdded, () => api.postBid(id, bid));
  const asyncDeleteBid = (id) => mutate(isBidDelete, isBidDeleted, () => api.deleteBid(id));
  const asyncDeleteAllAucations = () => mutate(isAucationDeleteAll, isAucationDeletedAll, () => api.deleteAllAucations());

  return {
    aucations, aucation, isAucation,
    isAucationAdd, isAucationAdded, isAucationChange, isAucationChanged,
    isAucationChangeCover, isAucationChangedCover, isAucationDelete, isAucationDeleted,
    isBidAdd, isBidAdded, isBidDelete, isBidDeleted, isAucationDeleteAll, isAucationDeletedAll,
    asyncGetAucations, asyncGetAucation, asyncAddAucation, asyncChangeAucation, asyncChangeCover,
    asyncDeleteAucation, asyncAddBid, asyncDeleteBid, asyncDeleteAllAucations,
  };
});
