import { create } from 'zustand';

export const useGameStore = create((set) => ({
  // Room / matchmaking state
  roomId: null,
  playerName: '',
  mySlot: null, // 'P1' | 'P2'
  players: [],
  status: 'idle', // idle | waiting | selecting | playing
  connectionError: null,

  // Game state
  selectedGame: null, // snakesLadders | monopoly | ludo | chess
  boardState: null,
  turn: null,

  // Truth or Dare
  activeCard: null,
  drawnBy: null,
  showTruthDareModal: false,

  // UI
  isConnected: false,
  toast: null,

  setRoomId: (roomId) => set({ roomId }),
  setPlayerName: (playerName) => set({ playerName }),
  setMySlot: (mySlot) => set({ mySlot }),
  setStatus: (status) => set({ status }),
  setConnectionError: (connectionError) => set({ connectionError }),
  setConnected: (isConnected) => set({ isConnected }),

  applyRoomUpdate: (room) =>
    set({
      roomId: room.roomId,
      status: room.status,
      players: room.players,
      selectedGame: room.selectedGame,
      turn: room.turn,
    }),

  setSelectedGame: (selectedGame) => set({ selectedGame }),

  applyGameStateSync: ({ boardState, turn }) => set({ boardState, turn }),

  showTruthDare: (card, drawnBy) =>
    set({ activeCard: card, drawnBy, showTruthDareModal: Boolean(card) }),

  closeTruthDare: () => set({ activeCard: null, showTruthDareModal: false }),

  setToast: (toast) => set({ toast }),

  resetGame: () =>
    set({
      selectedGame: null,
      boardState: null,
      activeCard: null,
      showTruthDareModal: false,
    }),

  resetAll: () =>
    set({
      roomId: null,
      mySlot: null,
      players: [],
      status: 'idle',
      selectedGame: null,
      boardState: null,
      turn: null,
      activeCard: null,
      showTruthDareModal: false,
    }),
}));
