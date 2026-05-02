const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(
        message: string,
        status: number,
        errors?: Record<string, string[]>,
    ) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new ApiError(
            data?.message || "Request failed",
            response.status,
            data?.errors,
        );
    }

    return data as T;
}

export function getApiBaseUrl() {
    return API_BASE_URL;
}
