import { apiRequest } from "@/lib/api";
import type { Rifa, Reward } from "@/types";

// Tipos da API
interface ActionResponse {
    id: number;
    title?: string;
    description?: string;
    finished?: boolean;
    ticketsPrice?: number;
    minPrice?: number;
    mainAction?: boolean;
    numberTickets?: number;
    image?: string;
    blocked?: number[];
    packages?: Array<{
        id?: number;
        quantidade?: number;
        preco?: number;
        desconto?: number;
    }>;
    rewards?: Reward[];
    soldTicketsCount?: number;
    reserved?: number;
    closure?: string | null;
    soldOut?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface CreateActionPayload {
    title: string;
    description: string;
    finished: boolean;
    ticketsPrice: number;
    minPrice: number;
    mainAction: boolean;
    numberTickets: number;
    image: string;
    blocked?: number[];
    packages?: Array<{
        id: number;
        quantity: number;
    }>;
}

interface AddRewardPayload {
    raffleId: number;
    number: number;
    rewardType: "NUMBER" | "RASPADINHA";
    name: string;
    description: string;
    image?: string;
}

// Converter ActionResponse para Rifa (formato do frontend)
const convertActionToRifa = (action: ActionResponse): Rifa => {
    console.log('🔍 Debug API - Dados recebidos:', {
        ticketsPrice: action.ticketsPrice,
        packages: action.packages
    });

    return {
        id: action.id || 0,
        title: action.title || "",
        description: action.description || "",
        ticketsPrice: action.ticketsPrice !== undefined && action.ticketsPrice !== null ? action.ticketsPrice : 0,
        finished: action.finished || false,
        closure: action.closure || null,
        image: action.image || "",
        packages: action.packages?.map((pkg) => ({
            quantidade: pkg.quantidade || 0,
            preco: pkg.preco || 0,
            desconto: pkg.desconto,
        })) || [],
        blocked: action.blocked || [],
        rewards: action.rewards || [],
        soldOut: action.soldOut || false,
    };
};

// Serviços de Rifas/Actions
export const rifasService = {
    // GET /actions - Listar todas as rifas
    async listarTodas() {
        const response = await apiRequest<ActionResponse[]>("/actions", {
            method: "GET",
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao buscar rifas", data: [] };
        }

        const rifas = response.data.map(convertActionToRifa);
        return { data: rifas };
    },

    // GET /admin/get-actions - Listar todas as rifas (admin)
    async listarTodasAdmin() {
        const response = await apiRequest<ActionResponse[]>("/admin/get-actions", {
            method: "GET",
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao buscar rifas", data: [] };
        }

        const rifas = response.data.map(convertActionToRifa);
        return { data: rifas };
    },

    // GET /fetch-action/:id - Buscar rifa por ID
    async buscarPorId(id: string) {
        const response = await apiRequest<ActionResponse>(`/fetch-action/${id}`, {
            method: "GET",
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao buscar rifa", data: null };
        }

        const rifa = convertActionToRifa(response.data);
        return { data: rifa };
    },

    // GET /action/:id - Obter informações detalhadas da rifa
    async obterInfo(id: string) {
        const response = await apiRequest<ActionResponse>(`/action/${id}`, {
            method: "GET",
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao obter informações da rifa", data: null };
        }

        const rifa = convertActionToRifa(response.data);
        return { data: rifa };
    },

    // POST /create-action - Criar nova rifa
    async criar(payload: CreateActionPayload) {
        const response = await apiRequest<ActionResponse>("/create-action", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao criar rifa", data: null };
        }

        const rifa = convertActionToRifa(response.data);
        return { data: rifa };
    },

    // PUT /update-action/:id - Atualizar rifa (endpoint a ser implementado no backend)
    async atualizar(id: string, payload: Partial<CreateActionPayload>) {
        const response = await apiRequest<ActionResponse>(`/update-action/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao atualizar rifa", data: null };
        }

        const rifa = convertActionToRifa(response.data);
        return { data: rifa };
    },

    // DELETE /delete-action - Deletar rifa
    async deletar(id: number) {
        const response = await apiRequest<{ message: string }>("/delete-action", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        });

        if (response.error) {
            return { error: response.error || "Erro ao deletar rifa", success: false };
        }

        return { success: true };
    },

    // POST /unlock-number - Desbloquear número
    async desbloquearNumero(id: number, number: number) {
        const response = await apiRequest("/unlock-number", {
            method: "POST",
            body: JSON.stringify({ id, number }),
        });

        if (response.error) {
            return { error: response.error || "Erro ao desbloquear número", success: false };
        }

        return { success: true };
    },

    // POST /add-reward-action - Adicionar prêmio
    async adicionarPremio(payload: AddRewardPayload) {
        const response = await apiRequest("/add-reward-action", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error) {
            return { error: response.error || "Erro ao adicionar prêmio", success: false };
        }

        return { success: true, data: response.data };
    },

    // GET /rewards/:id - Obter prêmios
    async obterPremios(id: string) {
        const response = await apiRequest(`/rewards/${id}`, {
            method: "GET",
        });

        if (response.error) {
            return { error: response.error || "Erro ao obter prêmios", data: [] };
        }

        return { data: response.data };
    },

    // DELETE /rewards/:id - Deletar prêmio
    async deletarPremio(id: string) {
        const response = await apiRequest(`/rewards/${id}`, {
            method: "DELETE",
        });

        if (response.error) {
            return { error: response.error || "Erro ao deletar prêmio", success: false };
        }

        return { success: true };
    },

    // GET /get-top-client/:id - Top clientes
    async obterTopClientes(id: string) {
        const response = await apiRequest(`/get-top-client/${id}`, {
            method: "GET",
        });

        if (response.error) {
            return { error: response.error || "Erro ao obter top clientes", data: [] };
        }

        return { data: response.data };
    },
};

export type { CreateActionPayload, AddRewardPayload };

