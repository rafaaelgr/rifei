import { apiRequest } from "@/lib/api";

interface BuyTicketPayload {
    action_id: number;
    cpf: string;
    amount: number;
}

interface BuyTicketResponse {
    qrCode: string;
    saleId: number;
}

interface SaleStatusResponse {
    id: number;
    status: string;
    action_id: number;
    cpf: string;
    amount: number;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

interface WebhookPixPayload {
    PixId: string;
    AccountId: string;
    TransactionId: string;
    Value: string;
    Type: string;
    InitiationType: string;
    Status: string;
    ParentPixId: string | null;
    TxId: string;
    txid: string;
}

export const vendasService = {
    // POST /buy-ticket - Comprar ticket
    async comprarTicket(payload: BuyTicketPayload) {
        const response = await apiRequest<BuyTicketResponse>("/buy-ticket", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao comprar ticket", data: null };
        }

        return { data: response.data };
    },

    // GET /sale/:id - Obter status da venda
    async obterStatusVenda(id: string) {
        const response = await apiRequest<SaleStatusResponse>(`/sale/${id}`, {
            method: "GET",
        });

        if (response.error || !response.data) {
            return { error: response.error || "Erro ao obter status da venda", data: null };
        }

        return { data: response.data };
    },

    // POST /webhook/pix - Webhook PIX (para uso interno/backend)
    async processarWebhookPix(payload: WebhookPixPayload) {
        const response = await apiRequest("/webhook/pix", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (response.error) {
            return { error: response.error || "Erro ao processar webhook PIX", success: false };
        }

        return { success: true, data: response.data };
    },
};

export type { BuyTicketPayload, BuyTicketResponse, SaleStatusResponse, WebhookPixPayload };

