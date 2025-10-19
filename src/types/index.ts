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
    finished: boolean;
    closure: string | null;
    image: string;
    packages: Package[];
    blocked: number[];
    rewards: Reward[];
    soldOut: boolean;
}

// Interfaces antigas (manter por compatibilidade se necessário)
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

    // Configurações de cotas
    numberTickets: number;
    cotasVendidas: number;
    cotasReservadas: number;

    // Números bloqueados
    numerosBloqueados?: number[];

    // Prêmios
    premios: Premio[];

    // Promoções
    promocoes: Promocao[];

    // Redes sociais
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
