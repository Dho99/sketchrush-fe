import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { socketService } from "../../lib/socket";
import { useGameStore } from "../../store/game-store";
import { useAuthStore } from "../../store/auth-store";
import { AVATAR_COLORS } from "../../lib/mock-data";
import { cn } from "../../lib/utils";

type Mode = "create" | "join";

export function JoinPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user: authUser } = useAuthStore();
    const { setCurrentUser, setRoom, setPlayers, updateSettings } =
        useGameStore();

    const [mode, setMode] = useState<Mode>(
        searchParams.get("code") ? "join" : "create",
    );
    const [nickname, setNickname] = useState(authUser?.name || "");
    const [roomCode, setRoomCode] = useState(searchParams.get("code") || "");
    const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (authUser?.name) setNickname(authUser.name);
    }, [authUser]);

    const nicknameValid = nickname.trim().length >= 2;
    const roomCodeValid = roomCode.trim().length >= 4;
    const canCreate = nicknameValid && !isLoading;
    const canJoin = nicknameValid && roomCodeValid && !isLoading;

    useEffect(() => {
        // Connect socket on mount
        socketService.connect();

        // Listen for room creation success
        socketService.on("room:state", (data: any) => {
            // If it's a new room state after join/create
            if (data.code || data.roomCode) {
                const code = data.code || data.roomCode;

                // If we are currently joining or creating, handle redirect
                if (isLoading) {
                    if (data.player) {
                        setCurrentUser({
                            id: data.player.id,
                            name: data.player.nickname,
                            avatarColor: data.player.avatar || "#F59E0B",
                            score: data.player.score,
                            status: data.player.status.toLowerCase(),
                            isHost: data.player.isHost,
                            isReady: data.player.status === "READY",
                            role: data.player.role.toLowerCase(),
                        });
                    }

                    setRoom({ code, hostId: data.hostPlayerId || "unknown" });
                    toast.success(`Joined room ${code}! 🎉`);
                    navigate(`/lobby/${code}`);
                    setIsLoading(false);
                }
            }
        });

        socketService.on("room:error", (error: any) => {
            if (isLoading) {
                toast.error(error.message || "Action failed");
                setIsLoading(false);
            }
        });

        return () => {
            socketService.off("room:state");
            socketService.off("room:error");
        };
    }, [isLoading, navigate, setCurrentUser, setRoom]);

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canCreate) return;
        setIsLoading(true);

        socketService.emit("room:create", {
            name: `${nickname}'s Room`,
            nickname: nickname.trim(),
            maxRounds: 5,
            visibility: "PUBLIC", // Default to public for now
            settings: {
                enableAiClue: true,
                clueTriggerSeconds: 10,
                maxCluesPerRound: 3,
            },
        });
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canJoin) return;
        setIsLoading(true);

        socketService.emit("room:join", {
            roomCode: roomCode.trim().toUpperCase(),
            nickname: nickname.trim(),
            avatar: avatarColor,
        });
    };

    const handleJoinAsSpectator = () => {
        if (!canJoin) return;
        setIsLoading(true);
        socketService.emit("room:join", {
            roomCode: roomCode.trim().toUpperCase(),
            nickname: nickname.trim(),
            avatar: avatarColor,
            isSpectator: true,
        });
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-1">
                    <h1
                        className="text-4xl text-stone-900 dark:text-stone-100"
                        style={{ fontFamily: "'Fredoka One', sans-serif" }}
                    >
                        Let's Play! 🎮
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400">
                        Pick a nickname, choose your color, and jump in.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl p-6 shadow-[5px_5px_0px_#1C1917] dark:shadow-[5px_5px_0px_rgba(255,255,255,0.1)] space-y-5">
                    {/* Mode tabs */}
                    <div className="flex rounded-xl border-2 border-stone-200 dark:border-stone-700 overflow-hidden p-1 gap-1">
                        {(["create", "join"] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-bold transition-colors",
                                    mode === m
                                        ? "bg-amber-400 text-stone-900 border-2 border-stone-800 dark:border-stone-600 shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)]"
                                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800",
                                )}
                            >
                                {m === "create"
                                    ? "✏️ Create Room"
                                    : "🚪 Join Room"}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={
                            mode === "create"
                                ? handleCreateRoom
                                : handleJoinRoom
                        }
                        className="space-y-4"
                    >
                        {/* Nickname */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="nickname"
                                className="text-sm font-bold text-stone-800 dark:text-stone-200"
                            >
                                Your Nickname
                            </label>
                            <input
                                id="nickname"
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g. Raka, Sinta, GambarMaster…"
                                aria-describedby="nickname-hint"
                                maxLength={20}
                                autoFocus
                                className={cn(
                                    "w-full px-3 py-2.5 rounded-xl border-2 bg-stone-50 dark:bg-stone-800",
                                    "text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500",
                                    "focus:outline-none transition-colors",
                                    nickname && !nicknameValid
                                        ? "border-rose-400 focus:border-rose-500"
                                        : "border-stone-300 dark:border-stone-600 focus:border-amber-400 dark:focus:border-amber-500",
                                )}
                            />
                            <p
                                id="nickname-hint"
                                className="text-xs text-stone-400 dark:text-stone-500"
                            >
                                {nickname.length > 0 && !nicknameValid
                                    ? "⚠️ Nickname must be at least 2 characters"
                                    : `${20 - nickname.length} characters remaining`}
                            </p>
                        </div>

                        {/* Room code (join mode only) */}
                        {mode === "join" && (
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="roomCode"
                                    className="text-sm font-bold text-stone-800 dark:text-stone-200"
                                >
                                    Room Code
                                </label>
                                <input
                                    id="roomCode"
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) =>
                                        setRoomCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="e.g. HANEP7"
                                    maxLength={10}
                                    className={cn(
                                        "w-full px-3 py-2.5 rounded-xl border-2 bg-stone-50 dark:bg-stone-800",
                                        "text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 tracking-widest",
                                        "focus:outline-none transition-colors",
                                        "border-stone-300 dark:border-stone-600 focus:border-amber-400 dark:focus:border-amber-500",
                                    )}
                                    style={{
                                        fontFamily: "'Fredoka One', sans-serif",
                                    }}
                                />
                                <p className="text-xs text-stone-400 dark:text-stone-500">
                                    Ask the host for the room code
                                </p>
                            </div>
                        )}

                        {/* Avatar color */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-stone-800 dark:text-stone-200">
                                Pick Your Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {AVATAR_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setAvatarColor(c)}
                                        aria-label={`Select color ${c}`}
                                        aria-pressed={avatarColor === c}
                                        className={cn(
                                            "w-9 h-9 rounded-xl border-2 transition-all",
                                            avatarColor === c
                                                ? "border-stone-900 dark:border-stone-200 scale-110 shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.2)]"
                                                : "border-stone-300 dark:border-stone-600 hover:scale-105",
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        {nickname && (
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800">
                                <PlayerAvatar
                                    name={nickname}
                                    color={avatarColor}
                                    size="md"
                                />
                                <div>
                                    <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                                        {nickname || "..."}
                                    </p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                        {mode === "create"
                                            ? "Host 👑"
                                            : "Player"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex flex-col gap-2">
                            <button
                                type="submit"
                                disabled={
                                    mode === "create" ? !canCreate : !canJoin
                                }
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-stone-800 dark:border-stone-400",
                                    "bg-amber-400 hover:bg-amber-500 text-stone-900",
                                    "shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)]",
                                    "active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]",
                                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0",
                                    "transition-all font-bold",
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {mode === "create"
                                            ? "Creating room..."
                                            : "Joining room..."}
                                    </>
                                ) : (
                                    <>
                                        {mode === "create"
                                            ? "✏️ Create Room"
                                            : "🚪 Join Room"}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {mode === "join" && (
                                <button
                                    type="button"
                                    onClick={handleJoinAsSpectator}
                                    disabled={!canJoin}
                                    className="w-full py-2 text-sm font-bold text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
                                >
                                    Join as Spectator 👀
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footnote */}
                <p className="text-center text-xs text-stone-400 dark:text-stone-500">
                    No account needed. Just pick a nickname and play! 🎨
                </p>
            </div>
        </div>
    );
}
