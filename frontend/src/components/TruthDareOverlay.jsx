import React, { useEffect } from 'react';
import Modal from './ui/Modal';
import TruthDareCard from './TruthDareCard';
import socket from '../socket';
import { useGameStore } from '../store/gameStore';

export default function TruthDareOverlay() {
  const boardState = useGameStore((s) => s.boardState);
  const mySlot = useGameStore((s) => s.mySlot);
  const activeCard = useGameStore((s) => s.activeCard);
  const drawnBy = useGameStore((s) => s.drawnBy);
  const showTruthDareModal = useGameStore((s) => s.showTruthDareModal);
  const showTruthDare = useGameStore((s) => s.showTruthDare);
  const closeTruthDare = useGameStore((s) => s.closeTruthDare);

  const pendingTruthDare = boardState?.pendingTruthDare;

  useEffect(() => {
    function onTrigger({ drawnBy: drawer }) {
      showTruthDare(null, drawer);
    }
    function onCard({ card, drawnBy: drawer }) {
      showTruthDare(card, drawer);
    }
    function onResolved() {
      closeTruthDare();
    }

    socket.on('TRIGGER_TRUTH_DARE', onTrigger);
    socket.on('truth_dare_card', onCard);
    socket.on('truth_dare_resolved', onResolved);

    return () => {
      socket.off('TRIGGER_TRUTH_DARE', onTrigger);
      socket.off('truth_dare_card', onCard);
      socket.off('truth_dare_resolved', onResolved);
    };
  }, [showTruthDare, closeTruthDare]);

  if (!pendingTruthDare && !showTruthDareModal) return null;

  const isDrawer = drawnBy === mySlot;

  return (
    <Modal isOpen closeOnBackdrop={false}>
      <TruthDareCard
        card={activeCard}
        isDrawer={isDrawer}
        onChooseType={(type) => socket.emit('draw_card', { cardType: type })}
        onDone={() => socket.emit('truth_dare_done')}
      />
      {!isDrawer && !activeCard && (
        <p className="text-center text-white/50 text-sm mt-4">
          Your partner is choosing Truth or Dare...
        </p>
      )}
    </Modal>
  );
}
