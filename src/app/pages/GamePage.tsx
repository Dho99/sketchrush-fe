import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { GameStatusBar } from "../components/GameStatusBar";
import { Scoreboard } from "../components/Scoreboard";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { ChatPanel } from "../components/ChatPanel";
import { ClueDisplay } from "../components/ClueDisplay";
import { RoundResultModal } from "../components/RoundResultModal";
import { GameEndModal } from "../components/GameEndModal";
import { ReplayModal } from "../components/ReplayModal";
import { WordSelectionModal } from "../components/WordSelectionModal";
import { RulesModal } from "../components/RulesModal";
import { LeaveRoomModal } from "../components/LeaveRoomModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useGameStore } from "../../store/game-store";
import { useSocketGame } from "../../hooks/useSocketGame";
import { useRoomExitGuard } from "../../hooks/useRoomExitGuard";
import { socketService } from "../../lib/socket";
import type { Stroke } from "../../lib/types";
import { cn } from "../../lib/utils";
import { Ban, LogOut } from "lucide-react";

// Mobile tab type
type MobileTab = "players" | "canvas" | "chat";

export function GamePage() {
    const { roomCode } = useParams<{ roomCode: string }>();
    const navigate = useNavigate();
    const [mobileTab, setMobileTab] = useState<MobileTab>("canvas");
    const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);

    // Real socket integration
    useSocketGame(roomCode);

    const {
        currentUser,
        room,
        players,
        round,
        messages,
        strokes,
        connectionStatus,
        showRoundResult,
        showGameEnd,
        showRules,
        showReplay,
        roundResult,
        wordOptions,
        wordOptionsRoundId,
        isWordSelectionOpen,
        isSelectingWord,
        emotes,
        setShowGameEnd,
        setShowRules,
        setShowReplay,
        setIsSelectingWord,
        setIsLeavingGame,
    } = useGameStore();

    const isHost = currentUser?.isHost ?? false;
    const isDrawer = currentUser?.id === round?.currentDrawerId;
    const isSpectator = currentUser?.role === "spectator";
    const currentDisplayRoom = room ?? {
        code: roomCode ?? "------",
        hostId: "unknown",
    };

    const {
        showConfirmModal,
        requestExit,
        confirmExit,
        cancelExit,
        isProcessingExit,
    } = useRoomExitGuard({
        roomCode: roomCode,
        isHost,
        isInRoom: !!room,
    });

    const handleSendMessage = (text: string) => {
        if (!currentUser || !roomCode) return;

        if (isSpectator) return;

        if (isDrawer) {
            socketService.emit("chat:send", { roomCode, message: text });
        } else {
            socketService.emit("guess:submit", {
                roomCode,
                roundId: round?.roundId,
                guess: text,
            });
        }
    };

    const handleStrokeComplete = (stroke: Stroke) => {
        if (!roomCode || !round) return;
        socketService.emit("draw:stroke", {
            roomCode,
            roundId: round.roundId,
            tool: stroke.tool.toUpperCase(),
            color: stroke.color,
            brushSize: stroke.size,
            points: stroke.points,
        });
    };

    const handleClear = () => {
        if (!roomCode) return;
        socketService.emit("draw:clear", { roomCode });
    };

    const handleUndo = () => {
        if (!roomCode) return;
        socketService.emit("draw:undo", { roomCode });
    };

    const handleNextRound = () => {
        if (!roomCode || !roundResult?.roundId || roundResult.isLastRound) return;
        socketService.emit("round:wordOptions:request", {
            roomCode,
            roundId: roundResult.roundId,
        });
    };

    const handleSelectWord = (optionId: string) => {
        if (!roomCode || !wordOptionsRoundId) return;
        setIsSelectingWord(true);
        socketService.emit("round:wordOptions:select", {
            roomCode,
            roundId: wordOptionsRoundId,
            optionId,
        });
    };

    const handleEndGame = () => {
        if (!roomCode || !isHost) return;
        socketService.emit("game:end", { roomCode });
        setShowEndGameConfirm(false);
    };

    const handleBackToLobby = () => {
        setShowGameEnd(false);
        setShowReplay(false);
        useGameStore.getState().setRound(null);
        useGameStore.getState().setRoundResult(null);
        useGameStore.getState().setGameStatus("lobby");
        navigate(`/lobby/${roomCode}`, { replace: true });
    };

    const handleSendEmote = (emote: string) => {
        if (!roomCode) return;
        socketService.emit("emote:send", { roomCode, emote });
    };

    if (!round) {
        if (useGameStore.getState().isLeavingGame) {
            return null;
        }
        return (
            <div className="flex items-center justify-center h-screen bg-amber-50 dark:bg-[#0F0F1A]">
                <div className="text-center space-y-2">
                    <div className="text-4xl" aria-hidden>
                        ⏳
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 font-bold animate-pulse">
                        Checking active game...
                    </p>
                    <p className="text-xs text-stone-400">
                        If this takes too long, the game may have ended.
                    </p>
                </div>
            </div>
        );
    }

    const mobileTabs: { id: MobileTab; label: string; icon: string }[] = [
        { id: "players", label: "Players", icon: "👥" },
        { id: "canvas", label: "Canvas", icon: "🎨" },
        { id: "chat", label: "Chat", icon: "💬" },
    ];

    return (
        <div className="flex flex-col h-screen bg-amber-50 dark:bg-[#0F0F1A] overflow-hidden relative">
            {/* Floating Emotes Layer */}
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                {emotes.map((e) => (
                    <div
                        key={e.id}
                        className="absolute animate-bounce-up text-4xl"
                        style={{
                            left: `${20 + (parseInt(e.id.slice(-2), 16) % 60)}%`,
                            bottom: "20px",
                        }}
                    >
                        {e.emote}
                    </div>
                ))}
            </div>

            {/* Status bar */}
            <GameStatusBar
                round={round}
                players={players}
                room={currentDisplayRoom}
                connectionStatus={connectionStatus}
                isDrawer={isDrawer}
                onShowRules={() => setShowRules(true)}
            />

            {/* ── Desktop layout: 3 columns ─── */}
            <div className="hidden md:flex flex-1 min-h-0 gap-0 overflow-hidden">
                {/* Left: Scoreboard */}
                <aside className="w-56 lg:w-64 shrink-0 border-r-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden flex flex-col">
                    <Scoreboard
                        players={players}
                        currentUserId={currentUser?.id}
                        currentDrawerId={round.currentDrawerId}
                    />
                    {isHost ? (
                        <div className="p-3 border-t-2 border-stone-100 dark:border-stone-800">
                            <button
                                onClick={() => setShowEndGameConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                            >
                                <Ban className="w-3.5 h-3.5" />
                                End Game
                            </button>
                        </div>
                    ) : (
                        <div className="p-3 border-t-2 border-stone-100 dark:border-stone-800">
                            <button
                                onClick={requestExit}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Leave Room
                            </button>
                        </div>
                    )}
                </aside>

                {/* Center: Canvas */}
                <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <DrawingCanvas
                        isDrawer={isDrawer}
                        initialStrokes={strokes}
                        onStrokeComplete={handleStrokeComplete}
                        onClear={handleClear}
                        onUndo={handleUndo}
                    />
                    {/* Emote Bar */}
                    <div className="flex justify-center gap-4 py-2 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border-t border-stone-200 dark:border-stone-700">
                        {["😂", "🔥", "👏", "😱", "🤔", "❤️"].map((e) => (
                            <button
                                key={e}
                                onClick={() => handleSendEmote(e)}
                                className="text-2xl hover:scale-125 transition-transform"
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </main>

                {/* Right: Chat */}
                <aside className="w-64 lg:w-72 shrink-0 border-l-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden flex flex-col p-2 gap-2">
                    <ClueDisplay
                        clues={round?.clues || []}
                        isDrawer={isDrawer}
                    />
                    <div className="flex-1 flex flex-col min-h-0">
                        <ChatPanel
                            messages={messages}
                            isDrawer={isDrawer}
                            onSendMessage={handleSendMessage}
                            placeholder={
                                isSpectator ? "Spectator Chat..." : undefined
                            }
                        />
                    </div>
                </aside>
            </div>

            {/* ── Mobile layout: tabbed ─── */}
            <div className="flex md:hidden flex-col flex-1 min-h-0 overflow-hidden">
                {/* Tab content */}
                <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-stone-900 relative">
                    {mobileTab === "canvas" &&
                        !isDrawer &&
                        round?.clues &&
                        round.clues.length > 0 && (
                            <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
                                <div className="pointer-events-auto max-w-[280px]">
                                    <ClueDisplay
                                        clues={round.clues}
                                        isDrawer={isDrawer}
                                    />
                                </div>
                            </div>
                        )}
                    {mobileTab === "players" && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto">
                                <Scoreboard
                                    players={players}
                                    currentUserId={currentUser?.id}
                                    currentDrawerId={round.currentDrawerId}
                                />
                            </div>
                            {isHost ? (
                                <div className="p-3 border-t-2 border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
                                    <button
                                        onClick={() =>
                                            setShowEndGameConfirm(true)
                                        }
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                                    >
                                        <Ban className="w-4 h-4" />
                                        End Game
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 border-t-2 border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
                                    <button
                                        onClick={requestExit}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Leave Room
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {mobileTab === "canvas" && (
                        <div className="h-full bg-stone-100 dark:bg-stone-800 flex flex-col">
                            <DrawingCanvas
                                isDrawer={isDrawer}
                                initialStrokes={strokes}
                                onStrokeComplete={handleStrokeComplete}
                                onClear={handleClear}
                                onUndo={handleUndo}
                            />
                            <div className="flex justify-center gap-4 py-2 border-t border-stone-200 dark:border-stone-700">
                                {["😂", "🔥", "👏", "😱", "🤔", "❤️"].map(
                                    (e) => (
                                        <button
                                            key={e}
                                            onClick={() => handleSendEmote(e)}
                                            className="text-xl"
                                        >
                                            {e}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                    {mobileTab === "chat" && (
                        <div className="h-full flex flex-col">
                            <ChatPanel
                                messages={messages}
                                isDrawer={isDrawer}
                                onSendMessage={handleSendMessage}
                                placeholder={
                                    isSpectator
                                        ? "Spectator Chat..."
                                        : undefined
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Tab bar */}
                <nav className="flex border-t-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                    {mobileTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setMobileTab(tab.id)}
                            aria-label={tab.label}
                            className={cn(
                                "flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors text-xs",
                                mobileTab === tab.id
                                    ? "text-amber-600 dark:text-amber-400 border-t-2 border-amber-500 -mt-0.5"
                                    : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800",
                            )}
                        >
                            <span className="text-lg" aria-hidden>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ── Modals ─── */}
            {showRoundResult && roundResult && (
                <RoundResultModal
                    result={roundResult}
                    players={players}
                    isHost={currentUser?.isHost ?? false}
                    onNextRound={handleNextRound}
                    onWatchReplay={() => setShowReplay(true)}
                />
            )}

            {showGameEnd && (
                <GameEndModal
                    players={players}
                    onBackToLobby={handleBackToLobby}
                />
            )}

            {isWordSelectionOpen && !showGameEnd && wordOptions.length > 0 && (
                <WordSelectionModal
                    options={wordOptions}
                    isSelecting={isSelectingWord}
                    onSelect={handleSelectWord}
                />
            )}

            {showReplay && (
                <ReplayModal
                    strokes={strokes}
                    word={round.secretWord}
                    onClose={() => setShowReplay(false)}
                />
            )}

            {showRules && <RulesModal onClose={() => setShowRules(false)} />}

            <LeaveRoomModal
                isOpen={showConfirmModal}
                isHost={isHost}
                onConfirm={confirmExit}
                onCancel={cancelExit}
                isLeaving={isProcessingExit}
            />

            <AlertDialog
                open={showEndGameConfirm}
                onOpenChange={setShowEndGameConfirm}
            >
                <AlertDialogContent className="border-2 border-stone-800 dark:border-stone-400 rounded-2xl shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-rose-600">
                            End Game?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-stone-600 dark:text-stone-400">
                            This will end the current game and return all
                            players to the lobby.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-2 border-stone-200">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEndGame}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 shadow-[2px_2px_0px_#1C1917]"
                        >
                            End Game
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
