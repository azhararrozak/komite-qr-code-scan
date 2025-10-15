import {create} from 'zustand';
import { getAllWaliKelas } from '../services/userService';

const useUserStore = create((set) => ({
  waliKelas: [],
  fetchWaliKelas: async () => {
    const data = await getAllWaliKelas();
    set({ waliKelas: data });
  },
}));

export default useUserStore;
