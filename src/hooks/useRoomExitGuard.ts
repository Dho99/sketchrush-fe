import { useEffect, useState, useCallback } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import { socketService } from '../lib/socket';
import { useGameStore } from '../store/game-store';

interface UseRoomExitGuardProps {
  roomCode?: string;
  isHost: boolean;
  isInRoom: boolean;
}

/**
 * Helper to check if navigation is still within the same room scope.
 * This allows transitioning from Lobby to Game (and vice versa) without
 * triggering the "Leave Room" confirmation modal.
 */
function isSameRoomScope(nextPath: string, currentRoomCode?: string): boolean {
    if (!currentRoomCode) return false;
    const code = currentRoomCode.toLowerCase();
    const path = nextPath.toLowerCase();
    
    // Whitelisted routes that belong to the same room session
    const lobbyRegex = new RegExp(`^/lobby/${code}(/|$)`);
    const gameRegex = new RegExp(`^/game/${code}(/|$)`);
    
    return lobbyRegex.test(path) || gameRegex.test(path);
}

export function useRoomExitGuard({
  roomCode,
  isHost,
  isInRoom,
}: UseRoomExitGuardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessingExit, setIsProcessingExit] = useState(false);
  const navigate = useNavigate();

  // 0. Handle Post-Reload Redirect
  useEffect(() => {
    const reloadedFromRoom = sessionStorage.getItem('reloaded_from_room');
    if (reloadedFromRoom) {
      sessionStorage.removeItem('reloaded_from_room');
      navigate('/public-lobby', { replace: true });
    }
  }, [navigate]);

  // 1. Browser BeforeUnload Guard
  useEffect(() => {
    if (!isInRoom) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      sessionStorage.setItem('reloaded_from_room', 'true');

      e.preventDefault();
      e.returnValue = ''; 
    };

    const clearReloadFlagOnFocus = () => {
        setTimeout(() => {
            sessionStorage.removeItem('reloaded_from_room');
        }, 1000);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', clearReloadFlagOnFocus);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', clearReloadFlagOnFocus);
    };
  }, [isInRoom, roomCode, isHost]);

  // 2. Page Visibility / Focus detection (Placeholder for future idle logic)
  useEffect(() => {
    if (!isInRoom) return;
    const handleVisibilityChange = () => {};
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInRoom]);

  // 3. React Router Navigation Blocker
  const blocker = useBlocker(({ nextLocation }) => {
      // 1. Don't block if we're not in a room session
      if (!isInRoom) return false;

      const isLeavingGame = useGameStore.getState().isLeavingGame;
      const gameStatus = useGameStore.getState().gameStatus;
      if (isLeavingGame || gameStatus === 'game-end') return false;
      if (nextLocation.pathname === '/public-lobby') return false;
      
      // 2. Don't block if we've already confirmed the exit
      if (isProcessingExit) return false;
      
      // 3. ALLOW internal navigation between lobby and game for the SAME roomCode
      if (isSameRoomScope(nextLocation.pathname, roomCode)) {
          return false;
      }
      
      // Block all other navigations (Home, Public Lobby, logout, etc.)
      return true;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowConfirmModal(true);
    }
  }, [blocker.state]);

  const confirmExit = useCallback(async () => {
    setIsProcessingExit(true);
    if (roomCode) {
        socketService.emit('room:leave', { roomCode });
    }
    
    // Grace period for socket emission before proceeding with navigation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    setShowConfirmModal(false);
  }, [blocker, roomCode]);

  const cancelExit = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setShowConfirmModal(false);
  }, [blocker]);

  const requestExit = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  return {
    showConfirmModal,
    requestExit,
    confirmExit,
    cancelExit,
    isProcessingExit,
  };
}
