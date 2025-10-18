import { apiRequest } from "@/lib/api";

interface DashboardStats {
    totalRifas: number;
    rifasAtivas: number;
    totalVendas: number;
    vendasHoje: number;
    totalCotasVendidas: number;
    faturamentoTotal: number;
    faturamentoMes: number;
    faturamentoHoje: number;
    ticketMedio: number;
}

interface VendaRecente {
    id: string;
    cliente: string;
    rifa: string;
    cotas: number;
    valor: number;
    status: string;
}

interface RifaRecente {
    id: string;
    titulo: string;
    cotasVendidas: number;
    totalCotas: number;
    status: "ativa" | "pausada" | "finalizada";
}

interface ActionResponse {
    id: number;
    title?: string;
    description?: string;
    finished?: boolean;
    ticketsPrice?: number;
    blocked?: number[];
    numberTickets?: number;
}

// Este serviço pode precisar ser ajustado conforme a API real retorna os dados
export const dashboardService = {
    // Buscar estatísticas do dashboard
    async buscarEstatisticas(): Promise<{ data: DashboardStats | null; error?: string }> {
        try {
            // Como não há endpoint específico, vamos buscar das rifas e calcular
            const rifasResponse = await apiRequest<ActionResponse[]>("/actions", {
                method: "GET",
            });

            if (rifasResponse.error || !rifasResponse.data) {
                return {
                    data: null,
                    error: rifasResponse.error || "Erro ao buscar estatísticas"
                };
            }

            const rifas = rifasResponse.data;

            // Calcular estatísticas baseado nas rifas
            const stats: DashboardStats = {
                totalRifas: rifas.length,
                rifasAtivas: rifas.filter((r) => !r.finished).length,
                totalVendas: rifas.reduce((acc, r) => acc + (r.blocked?.length || 0), 0),
                vendasHoje: 0, // Não disponível na API atual
                totalCotasVendidas: rifas.reduce((acc, r) => acc + (r.blocked?.length || 0), 0),
                faturamentoTotal: rifas.reduce((acc, r) =>
                    acc + ((r.blocked?.length || 0) * (r.ticketsPrice || 0)), 0
                ),
                faturamentoMes: 0, // Precisaria de mais informações da API
                faturamentoHoje: 0, // Precisaria de mais informações da API
                ticketMedio: 0, // Será calculado abaixo
            };

            // Calcular ticket médio
            if (stats.totalVendas > 0) {
                stats.ticketMedio = stats.faturamentoTotal / stats.totalVendas;
            }

            return { data: stats };
        } catch (error) {
            console.error("Erro ao buscar estatísticas:", error);
            return {
                data: null,
                error: error instanceof Error ? error.message : "Erro desconhecido"
            };
        }
    },

    // Buscar rifas recentes
    async buscarRifasRecentes(): Promise<{ data: RifaRecente[]; error?: string }> {
        const response = await apiRequest<ActionResponse[]>("/actions", {
            method: "GET",
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao buscar rifas recentes", data: [] };
        }

        const rifasRecentes: RifaRecente[] = response.data.slice(0, 4).map((rifa) => ({
            id: rifa.id.toString(),
            titulo: rifa.title || "",
            cotasVendidas: rifa.blocked?.length || 0,
            totalCotas: rifa.numberTickets || 0,
            status: rifa.finished ? "finalizada" : "ativa",
        }));

        return { data: rifasRecentes };
    },

    // Buscar vendas recentes
    async buscarVendasRecentes(): Promise<{ data: VendaRecente[]; error?: string }> {
        // Como não há endpoint específico de vendas, retornamos array vazio
        // Este endpoint precisaria ser implementado no backend
        return {
            data: [],
            error: "Endpoint de vendas não disponível na API atual"
        };
    },
};

export type { DashboardStats, VendaRecente, RifaRecente };

