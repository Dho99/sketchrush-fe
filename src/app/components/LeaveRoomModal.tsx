import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface LeaveRoomModalProps {
  isOpen: boolean;
  isHost: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLeaving?: boolean;
}

export function LeaveRoomModal({
  isOpen,
  isHost,
  onConfirm,
  onCancel,
  isLeaving = false,
}: LeaveRoomModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="border-2 border-stone-800 dark:border-stone-400 rounded-2xl shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            {isHost ? 'Delete Room?' : 'Leave Room?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-stone-600 dark:text-stone-400">
            {isHost
              ? 'You are the host. Leaving will permanently close this room and remove all players. This action cannot be undone.'
              : 'Are you sure you want to leave? You will be removed from the room and your current score will be lost.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isLeaving}
            className="rounded-xl border-2 border-stone-200"
            onClick={onCancel}
          >
            Stay
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLeaving}
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 shadow-[2px_2px_0px_#1C1917]"
          >
            {isLeaving ? 'Leaving...' : isHost ? 'Delete Room' : 'Leave Room'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
