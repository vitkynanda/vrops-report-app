import { create } from "zustand";

interface ModalData {
  identifier?: string;
  title?: string;
  content?: string;
}

interface VmStatsStore {
  data: ModalData | {};
  setData: (data?: any) => void;
}

export const useVmStats = create<VmStatsStore>((set) => ({
  data: {},
  setData: (data) => set({ data }),
}));
