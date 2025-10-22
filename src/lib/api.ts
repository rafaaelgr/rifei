// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://projeto-app-hist-rico-production.up.railway.app";

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Cookie management functions
const TOKEN_KEY = "auth_token";

const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }

    return null;
};

const setCookie = (name: string, value: string, days: number = 7): void => {
    if (typeof document === "undefined") return;

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
};

const removeCookie = (name: string): void => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Auth token management
export const authToken = {
    get: (): string | null => getCookie(TOKEN_KEY),
    set: (token: string): void => setCookie(TOKEN_KEY, token, 7),
    remove: (): void => removeCookie(TOKEN_KEY),
};

// Generic API request handler
const apiRequest = async <T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> => {
    try {
        const token = authToken.get();
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options?.headers as Record<string, string>),
        };

        // Adiciona o token no header Authorization se existir
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: "include", // Para enviar cookies
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Se token inválido/expirado (401 Unauthorized), desloga e redireciona
            if (response.status === 401 || errorData.statusCode === 401) {
                authToken.remove();

                // Redireciona para a página de login apenas no client-side
                if (typeof window !== "undefined") {
                    window.location.href = "/";
                }
            }

            return {
                error: errorData.message || `Erro: ${response.statusText}`,
            };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error("API Error:", error);
        return {
            error: error instanceof Error ? error.message : "Erro ao conectar com a API",
        };
    }
};

export { API_BASE_URL, apiRequest };
export type { ApiResponse };

