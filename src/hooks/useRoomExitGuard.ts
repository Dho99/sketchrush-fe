import { useEffect, useState, useCallback } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import { socketService } from '../lib/socket';
import { getApiBaseUrl } from '../services/api-client';

interface UseRoomExitGuardProps {
  roomCode?: string;
  isHost: boolean;
  isInRoom: boolean;
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
  // If the user confirmed a reload, they will end up back at this URL.
  // We check if we set the reload flag before the refresh happened.
  useEffect(() => {
    const reloadedFromRoom = sessionStorage.getItem('reloaded_from_room');
    if (reloadedFromRoom) {
      sessionStorage.removeItem('reloaded_from_room');
      // Redirect to a safe place (Public Lobby) to avoid refetch errors
      navigate('/public-lobby', { replace: true });
    }
  }, [navigate]);

  // 1. Browser BeforeUnload Guard
  useEffect(() => {
    if (!isInRoom) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Set a flag so we know we reloaded from a room state
      sessionStorage.setItem('reloaded_from_room', 'true');

      // Send beacon for best-effort cleanup
      if (roomCode) {
        const endpoint = isHost ? 'delete-on-exit' : 'leave-on-exit';
        const url = `${getApiBaseUrl()}/api/rooms/${roomCode}/${endpoint}`;
        navigator.sendBeacon(url);
      }

      e.preventDefault();
      e.returnValue = ''; // Standard way to show browser confirmation
    };

    // If the user clicks "Cancel" on the reload dialog, the page doesn't unload.
    // We should clear the flag if they continue interacting with the page.
    const clearReloadFlagOnFocus = () => {
        // Use a small timeout to ensure we don't clear it before the reload actually starts
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

  // 2. Page Visibility / Focus detection
  useEffect(() => {
    if (!isInRoom) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optional: emit player:inactive
      } else {
        // Optional: emit player:active
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInRoom]);

  // 3. React Router Navigation Blocker
  const blocker = useBlocker(({ nextLocation }) => {
      // Don't block if we're not in a room or if we're explicitly leaving
      if (!isInRoom || isProcessingExit) return false;
      
      // Allow internal navigation to the same room or if we are already leaving
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
        if (isHost) {
            socketService.emit('room:delete', { roomCode });
        } else {
            socketService.emit('room:leave', { roomCode });
        }
    }
    
    // Small delay to allow emit to reach server if possible
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    setShowConfirmModal(false);
  }, [blocker, isHost, roomCode]);

  const cancelExit = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setShowConfirmModal(false);
  }, [blocker]);

  return {
    showConfirmModal,
    confirmExit,
    cancelExit,
    isProcessingExit,
  };
}
