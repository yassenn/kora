import create from 'zustand';

const useStore = create(set => ({
  user: null,
  matches: [],
  setUser: (user) => set({ user }),
  setMatches: (matches) => set({ matches }),
}));

export default useStore;
