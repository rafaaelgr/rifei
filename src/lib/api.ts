// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://projeto-app-hist-rico-production.up.railway.app";

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Generic API request handler
const apiRequest = async <T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            credentials: "include", // Para enviar cookies (token)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
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

