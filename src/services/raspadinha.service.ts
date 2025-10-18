import { apiRequest } from "@/lib/api";
import type {
    Prize,
    Raspadinha,
    CreatePrizePayload,
    CreateRaspadinhaPayload,
    PlayRaspadinhaPayload,
    PlayRaspadinhaResult,
} from "@/types";

interface ServiceResponse<T> {
    data: T;
    error: string | null;
}

export const raspadinhaService = {
    // Prêmios
    async listarPremios(): Promise<ServiceResponse<Prize[]>> {
        try {
            const response = await apiRequest<{ prizes: Prize[] }>("/prizes", {
                method: "GET",
            });

            console.log("Response listarPremios:", response);

            // A API retorna { prizes: [...] }, então precisamos acessar a propriedade prizes
            const data = response.data?.prizes;
            const premiosArray = Array.isArray(data) ? data : [];

            console.log("Premios extraídos:", premiosArray);

            return {
                data: premiosArray,
                error: response.error || null,
            };
        } catch (error: unknown) {
            console.error("Erro ao listar prêmios:", error);
            return {
                data: [],
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao listar prêmios",
            };
        }
    },

    async criarPremio(payload: CreatePrizePayload): Promise<ServiceResponse<Prize>> {
        try {
            const response = await apiRequest("/admin/prizes", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return {
                data: response.data as Prize,
                error: null,
            };
        } catch (error: unknown) {
            console.error("Erro ao criar prêmio:", error);
            return {
                data: {} as Prize,
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao criar prêmio",
            };
        }
    },

    async deletarPremio(prizeId: string): Promise<ServiceResponse<boolean>> {
        try {
            await apiRequest(`/prizes/${prizeId}`, {
                method: "DELETE",
            });
            return {
                data: true,
                error: null,
            };
        } catch (error: unknown) {
            console.error("Erro ao deletar prêmio:", error);
            return {
                data: false,
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao deletar prêmio",
            };
        }
    },

    async atualizarPremio(prizeId: string, payload: Partial<CreatePrizePayload>): Promise<ServiceResponse<Prize>> {
        try {
            const response = await apiRequest(`/admin/prizes/${prizeId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            return {
                data: response.data as Prize,
                error: null,
            };
        } catch (error: unknown) {
            console.error("Erro ao atualizar prêmio:", error);
            return {
                data: {} as Prize,
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao atualizar prêmio",
            };
        }
    },

    // Raspadinhas
    async listarRaspadinhas(): Promise<ServiceResponse<Raspadinha[]>> {
        try {
            const response = await apiRequest<{ raspadinhas?: Raspadinha[] }>("/raspadinhas", {
                method: "GET",
            });

            console.log("Response listarRaspadinhas:", response);

            // Tentar extrair o array de raspadinhas
            // A API pode retornar { raspadinhas: [...] } ou diretamente um array
            let raspadinhasArray: Raspadinha[] = [];

            if (response.data) {
                if (Array.isArray(response.data)) {
                    raspadinhasArray = response.data;
                } else if (response.data.raspadinhas && Array.isArray(response.data.raspadinhas)) {
                    raspadinhasArray = response.data.raspadinhas;
                }
            }

            return {
                data: raspadinhasArray,
                error: response.error || null,
            };
        } catch (error: unknown) {
            console.error("Erro ao listar raspadinhas:", error);
            return {
                data: [],
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao listar raspadinhas",
            };
        }
    },

    async criarRaspadinha(payload: CreateRaspadinhaPayload): Promise<ServiceResponse<Raspadinha>> {
        try {
            const response = await apiRequest("/admin/raspadinha", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return {
                data: response.data as Raspadinha,
                error: null,
            };
        } catch (error: unknown) {
            console.error("Erro ao criar raspadinha:", error);
            return {
                data: {} as Raspadinha,
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao criar raspadinha",
            };
        }
    },

    async deletarRaspadinha(raspadinhaId: string): Promise<ServiceResponse<boolean>> {
        try {
            await apiRequest(`/admin/raspadinha/${raspadinhaId}`, {
                method: "DELETE",
            });
            return {
                data: true,
                error: null,
            };
        } catch (error: unknown) {
            console.error("Erro ao deletar raspadinha:", error);
            return {
                data: false,
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao deletar raspadinha",
            };
        }
    },

    // Jogar raspadinha (teste)
    async jogarRaspadinha(payload: PlayRaspadinhaPayload): Promise<ServiceResponse<PlayRaspadinhaResult>> {
        try {
            const response = await apiRequest("/admin/raspadinha/play", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return {
                data: response.data as PlayRaspadinhaResult,
                error: response.error || null,
            };
        } catch (error: unknown) {
            console.error("Erro ao jogar raspadinha:", error);
            return {
                data: {} as PlayRaspadinhaResult,
                error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao jogar raspadinha",
            };
        }
    },
};

