import { apiRequest } from "@/lib/api";

interface CreateAccountPayload {
    email: string;
    name: string;
    instagram: string;
    cpf: string;
    whatsapp: string;
    password: string;
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

interface SecurityCodeResponse {
    message: string;
    code?: string; // Em desenvolvimento pode retornar o código
}

interface ValidateCodePayload {
    code: string;
}

interface ChangePasswordPayload {
    password: string;
}

export const authService = {
    // POST /create-account - Criar conta
    async criarConta(payload: CreateAccountPayload) {
        const response = await apiRequest<LoginResponse>("/create-account", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao criar conta", data: null };
        }

        return { data: response.data };
    },

    // POST /login - Login
    async login(payload: LoginPayload) {
        const response = await apiRequest<LoginResponse>("/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao fazer login", data: null };
        }

        return { data: response.data };
    },

    // POST /security-code - Criar código de segurança para trocar senha
    async criarCodigoSeguranca() {
        const response = await apiRequest<SecurityCodeResponse>("/security-code", {
            method: "POST",
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao criar código de segurança", data: null };
        }

        return { data: response.data };
    },

    // POST /validate-code - Validar código
    async validarCodigo(payload: ValidateCodePayload) {
        const response = await apiRequest<{ valid: boolean; message: string }>("/validate-code", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao validar código", data: null };
        }

        return { data: response.data };
    },

    // PUT /change-password - Trocar senha
    async trocarSenha(payload: ChangePasswordPayload) {
        const response = await apiRequest<{ message: string }>("/change-password", {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao trocar senha", data: null };
        }

        return { data: response.data };
    },
};

export type {
    CreateAccountPayload,
    LoginPayload,
    LoginResponse,
    SecurityCodeResponse,
    ValidateCodePayload,
    ChangePasswordPayload,
};

