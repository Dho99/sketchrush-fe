import { io, Socket } from "socket.io-client";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

class SocketService {
    private static instance: SocketService;
    public socket: Socket | null = null;

    private constructor() {}

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(): Socket {
        if (this.socket?.connected) return this.socket;

        this.socket = io(API_BASE_URL, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on("connect", () => {
            console.log("Connected to socket server");
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Disconnected from socket server:", reason);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public emit(event: string, data: any) {
        if (!this.socket) {
            this.connect();
        }
        this.socket?.emit(event, data);
    }

    public on(event: string, callback: (data: any) => void) {
        if (!this.socket) {
            this.connect();
        }
        this.socket?.on(event, callback);
    }

    public off(event: string, callback?: (data: any) => void) {
        this.socket?.off(event, callback);
    }
}

export const socketService = SocketService.getInstance();
export default socketService;
