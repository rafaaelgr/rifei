import { apiRequest, authToken } from "@/lib/api";

/**
 * Serviço de autenticação para administradores
 * Este serviço gerencia apenas login/logout de admins
 */

interface CreateAccountPayload {
    email: string;
    name: string;
    cpf: string;
    whatsapp: string;
}


interface LoginPayload {
    cpf: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        cpf: string;
        whatsapp: string;
        instagram: string;
    };
}

export const authService = {
    /**
     * Faz login de administrador
     */
    async login(payload: LoginPayload) {
        const response = await apiRequest<LoginResponse>("/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao fazer login", data: null };
        }

        authToken.set(response.data.token);

        return { data: response.data };
    },

    async criarConta(payload: any) {
        const response = await apiRequest<any>("/create-account", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao criar conta", data: null };
        }

        // Salva o token nos cookies
        authToken.set(response.data.token);

        return { data: response.data };
    },

    /**
     * Faz logout do administrador
     * Remove o token dos cookies
     */
    async logout() {
        authToken.remove();
    },
};

export type {
    LoginPayload,
    LoginResponse,
    CreateAccountPayload,
};

