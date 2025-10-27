export interface Reward {
    id: number;
    raffleId: number;
    number: number;
    rewardId: string;
    rewardType: string;
    name: string;
    description: string;
    image: string;
    isSold: boolean;
    winnerId: number | null;
}

export interface Package {
    quantidade: number;
    preco: number;
    desconto?: number;
}

export interface Rifa {
    id: number;
    title: string;
    description: string;
    ticketsPrice: number;
    numberTickets: number;
    soldTicketsCount: number;
    finished: boolean;
    closure: string | null;
    image: string;
    packages: Package[];
    blocked: number[];
    rewards: Reward[];
    soldOut: boolean;
}

export interface RifaOld {
    id: string;
    titulo: string;
    descricao: string;
    imagemPrincipal: string;
    icone?: string;
    preco: number;
    status: "ativa" | "pausada" | "finalizada";
    dataInicio: string;
    dataFim: string;
    createdAt: string;
    updatedAt: string;
    numberTickets: number;
    cotasVendidas: number;
    cotasReservadas: number;
    numerosBloqueados?: number[];
    premios: Premio[];
    promocoes: Promocao[];
    redesSociais: {
        facebook?: string;
        instagram?: string;
        whatsapp?: string;
        telegram?: string;
    };
}

export interface Premio {
    id: string;
    numero: string;
    valor: number;
    descricao: string;
    status: "disponivel" | "sorteado";
    vencedor?: {
        nome: string;
        telefone?: string;
        email?: string;
    };
}

export interface Promocao {
    id: string;
    quantidade: number;
    preco: number;
    desconto?: number;
}

export interface Venda {
    id: string;
    rifaId: string;
    rifaTitulo: string;
    clienteNome: string;
    clienteEmail?: string;
    clienteTelefone: string;
    quantidadeCotas: number;
    valorTotal: number;
    metodoPagamento: "pix" | "credito" | "debito" | "boleto";
    status: "pendente" | "aprovado" | "cancelado" | "reembolsado";
    numerosEscolhidos: string[];
    dataCompra: string;
    dataAprovacao?: string;
}

export interface DashboardStats {
    totalRifas: number;
    rifasAtivas: number;
    totalVendas: number;
    vendasHoje: number;
    totalCotasVendidas: number;
    faturamentoTotal: number;
    faturamentoMes: number;
    ticketMedio: number;
    taxaConversao: number;
}

export interface Order {
    id: number;
    title: string;
    coupon: string;
    status: string;
    statusColor: string;
    price: number;
    date: string;
    numbers: string[];
    raspadinhaValue: number;
    hasRaspadinha: boolean;
    raspadinhaUsed: boolean;
}

export interface Purchase {
    id: number;
    txId: string;
    tickets: number[];
    amount: number;
    createdAt: string;
}

export interface SalesUser {
    name: string;
    instagram: string;
    cpf: string;
}

export interface SalesData {
    userId: string;
    user: SalesUser;
    totalPurchases: number;
    totalTickets: number;
    totalAmount: number;
    purchases: Purchase[];
}

export interface SalesResponse {
    data: SalesData[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface TopClient {
    instagram: string;
    cpf: string;
    ticketCount: number;
}

export interface MinorTicketNumber {
    id: number;
    number: number;
    ownerId: string;
    raffleId: number;
    isSold: boolean;
}

export interface MinorTicketOwner {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    instagram: string;
}

export interface MinorTicketResponse {
    message: string;
    number: MinorTicketNumber[];
    return: {
        message: string;
        numbers: MinorTicketNumber[];
        owners: MinorTicketOwner[];
    };
}
