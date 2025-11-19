"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    FaTicketAlt,
    FaUsers,
    FaSpinner,
    FaTrophy,
    FaMedal,
    FaStar,
    FaInstagram,
    FaWhatsapp,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaUnlock,
    FaClock
} from "react-icons/fa";
import { dashboardService } from "@/services/dashboard.service";
import type { RifaRecente } from "@/services/dashboard.service";
import type { TopClient, MinorTicketResponse, ScratchCardReward } from "@/types";
import { SearchNumberModal } from "@/components/admin/SearchNumberModal";
import { UnlockNumberModal } from "@/components/admin/UnlockNumberModal";

export default function AdminDashboard() {
    const [recentRifas, setRecentRifas] = useState<RifaRecente[]>([]);
    const [topClients, setTopClients] = useState<TopClient[]>([]);
    const [minorTicket, setMinorTicket] = useState<MinorTicketResponse | null>(null);
    const [majorTicket, setMajorTicket] = useState<MinorTicketResponse | null>(null);
    const [scratchCardRewards, setScratchCardRewards] = useState<ScratchCardReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para filtro e paginação dos top compradores
    const [searchFilter, setSearchFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Estados para paginação das premiações
    const [rewardsCurrentPage, setRewardsCurrentPage] = useState(1);
    const rewardsPerPage = 3;

    // Estado para filtro de tempo dos top compradores
    type TimeFilter = '1h' | '1d' | '1w' | '1m' | 'all';
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

    // Estado para o modal de busca de número
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Estado para o modal de desbloquear número
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

    // Estado para o filtro de quantidade de menores cotas
    const [minorTicketLimit, setMinorTicketLimit] = useState<number>(5);

    // Estado para o filtro de quantidade de maiores cotas
    const [majorTicketLimit, setMajorTicketLimit] = useState<number>(5);

    // Conversão de filtros de tempo para segundos
    const timeFilterToSeconds = (filter: TimeFilter): number | undefined => {
        switch (filter) {
            case '1h': return 3600;
            case '1d': return 86400;
            case '1w': return 604800;
            case '1m': return 2592000;
            case 'all': return undefined;
            default: return undefined;
        }
    };

    // Função para gerar paginação com "..."
    const generatePagination = (current: number, total: number) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        if (current <= 4) {
            return [1, 2, 3, 4, 5, "...", total];
        }

        if (current >= total - 3) {
            return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
        }

        return [1, "...", current - 1, current, current + 1, "...", total];
    };

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        carregarTopClientes();
    }, [timeFilter]);

    useEffect(() => {
        carregarMenoresCotas();
    }, [minorTicketLimit]);

    useEffect(() => {
        carregarMaioresCotas();
    }, [majorTicketLimit]);

    const carregarMenoresCotas = async () => {
        const minorTicketResult = await dashboardService.buscarMenorCota(12, minorTicketLimit);

        if (!minorTicketResult.error && minorTicketResult.data) {
            setMinorTicket(minorTicketResult.data);
        }
    };

    const carregarMaioresCotas = async () => {
        const majorTicketResult = await dashboardService.buscarMaiorCota(12, majorTicketLimit);

        if (!majorTicketResult.error && majorTicketResult.data) {
            setMajorTicket(majorTicketResult.data);
        }
    };

    const carregarDados = async () => {
        setLoading(true);
        setError(null);

        const timeInSeconds = timeFilterToSeconds(timeFilter);

        const [rifasResult, topClientsResult, minorTicketResult, majorTicketResult, rewardsResult] = await Promise.all([
            dashboardService.buscarRifasRecentes(),
            dashboardService.buscarTopClientes(12, timeInSeconds),
            dashboardService.buscarMenorCota(12, minorTicketLimit),
            dashboardService.buscarMaiorCota(12, majorTicketLimit),
            dashboardService.buscarPremiacoesRaspadinha(12),
        ]);

        if (!rifasResult.error) {
            setRecentRifas(rifasResult.data);
        }

        if (!topClientsResult.error) {
            setTopClients(topClientsResult.data);
        }

        if (!minorTicketResult.error && minorTicketResult.data) {
            setMinorTicket(minorTicketResult.data);
        }

        if (!majorTicketResult.error && majorTicketResult.data) {
            setMajorTicket(majorTicketResult.data);
        }

        if (!rewardsResult.error) {
            setScratchCardRewards(rewardsResult.data);
        }

        setLoading(false);
    };

    const carregarTopClientes = async () => {
        const timeInSeconds = timeFilterToSeconds(timeFilter);
        const topClientsResult = await dashboardService.buscarTopClientes(12, timeInSeconds);

        if (!topClientsResult.error) {
            setTopClients(topClientsResult.data);
        }
    };

    // Filtrar compradores
    const filteredClients = topClients.filter((client) => {
        const searchTerm = searchFilter.toLowerCase();
        const instagram = client.instagram?.toLowerCase() || '';
        const cpf = client.cpf?.toLowerCase() || '';

        return (
            instagram.includes(searchTerm) ||
            cpf.includes(searchTerm)
        );
    });

    // Paginação
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    // Resetar para primeira página quando filtro muda
    const handleSearchChange = (value: string) => {
        setSearchFilter(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleTimeFilterChange = (filter: TimeFilter) => {
        setTimeFilter(filter);
        setCurrentPage(1);
    };

    const getTimeFilterLabel = (filter: TimeFilter): string => {
        switch (filter) {
            case '1h': return '1 Hora';
            case '1d': return '1 Dia';
            case '1w': return '1 Semana';
            case '1m': return '1 Mês';
            case 'all': return 'Todos';
            default: return 'Todos';
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen bg-[#1c1d1f]">
                <div className="text-center">
                    <FaSpinner className="text-5xl text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 min-h-screen bg-[#1c1d1f]">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Erro ao carregar dashboard</h2>
                    <p className="text-red-400 mb-4">{error || "Dados não disponíveis"}</p>
                    <motion.button
                        onClick={carregarDados}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                    >
                        Tentar novamente
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-[#1c1d1f]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">DASHBOARD</h1>
                        <p className="text-gray-400">Bem-vindo ao painel administrativo</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={() => setIsSearchModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
                            aria-label="Encontrar número"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setIsSearchModalOpen(true)}
                        >
                            <FaSearch />
                            Encontrar Número
                        </motion.button>
                        <motion.button
                            onClick={() => setIsUnlockModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#25282c] border border-[#313238] text-white hover:bg-[#313238] rounded-xl font-bold transition-all"
                            aria-label="Desbloquear número"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setIsUnlockModalOpen(true)}
                        >
                            <FaUnlock className="text-green-500" />
                            Desbloquear Número
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Menores Cotas Card */}
            {minorTicket && minorTicket.return.numbers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <div className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]">
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#313238] rounded-xl flex items-center justify-center">
                                    <FaStar className="text-xl text-orange-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Menores Cotas</h2>
                                    <p className="text-sm text-gray-400">Compradores com menores números</p>
                                </div>
                            </div>

                            {/* Filtro de quantidade */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-400">Exibir:</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 5, 10].map((limit) => (
                                        <motion.button
                                            key={limit}
                                            onClick={() => setMinorTicketLimit(limit)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${minorTicketLimit === limit
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'bg-[#313238] text-gray-400 hover:bg-[#3a3c45] hover:text-white'
                                                }`}
                                            aria-label={`Exibir ${limit} ${limit === 1 ? 'cota' : 'cotas'}`}
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setMinorTicketLimit(limit)}
                                        >
                                            {limit}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {minorTicket.return.numbers.map((ticketNumber, index) => {
                                const owner = minorTicket.return.owners.find(
                                    (o) => o.id === ticketNumber.ownerId
                                );

                                if (!owner) return null;

                                return (
                                    <motion.div
                                        key={`${ticketNumber.id}-${index}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-[#1c1d1f] rounded-xl p-4 border border-[#313238] hover:border-orange-500/50 transition-all group"
                                    >
                                        {/* Número da Cota - Destaque */}
                                        <div className="bg-[#25282c] rounded-lg p-3 border border-[#313238] flex flex-col items-center justify-center mb-3 group-hover:border-orange-500/30 transition-colors">
                                            <span className="text-xs text-gray-500 mb-1">Número</span>
                                            <span className="text-4xl font-bold text-white">
                                                {ticketNumber.number.toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Informações do Cliente */}
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide block">Cliente</span>
                                                <p className="font-semibold text-gray-200 text-sm mt-1 truncate" title={owner.name}>
                                                    {owner.name}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide block">Rifa</span>
                                                <p className="font-semibold text-gray-200 text-sm mt-1">
                                                    #{ticketNumber.raffleId}
                                                </p>
                                            </div>
                                            {owner.instagram && (
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide block">Instagram</span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <FaInstagram className="text-gray-400 text-xs flex-shrink-0" />
                                                        <p className="text-xs text-gray-400 truncate" title={`@${owner.instagram}`}>
                                                            @{owner.instagram}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide block">WhatsApp</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FaWhatsapp className="text-gray-400 text-xs flex-shrink-0" />
                                                    <p className="text-xs text-gray-400 truncate">{owner.whatsapp}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Maiores Cotas Card */}
            {majorTicket && majorTicket.return.numbers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                >
                    <div className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]">
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-yellow-500/20">
                                    <FaTrophy className="text-xl text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Maiores Cotas</h2>
                                    <p className="text-sm text-gray-400">Compradores com maiores números</p>
                                </div>
                            </div>

                            {/* Filtro de quantidade */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-400">Exibir:</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 5, 10].map((limit) => (
                                        <motion.button
                                            key={limit}
                                            onClick={() => setMajorTicketLimit(limit)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${majorTicketLimit === limit
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'bg-[#313238] text-gray-400 hover:bg-[#3a3c45] hover:text-white'
                                                }`}
                                            aria-label={`Exibir ${limit} ${limit === 1 ? 'cota' : 'cotas'}`}
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setMajorTicketLimit(limit)}
                                        >
                                            {limit}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {majorTicket.return.numbers.map((ticketNumber, index) => {
                                const owner = majorTicket.return.owners.find(
                                    (o) => o.id === ticketNumber.ownerId
                                );

                                if (!owner) return null;

                                return (
                                    <motion.div
                                        key={`${ticketNumber.id}-${index}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-xl p-4 border border-yellow-500/20 hover:border-orange-500/40 transition-all hover:shadow-lg hover:shadow-orange-500/5 group"
                                    >
                                        {/* Número da Cota - Destaque */}
                                        <div className="bg-[#1c1d1f] rounded-lg p-3 border border-yellow-500/20 flex flex-col items-center justify-center mb-3 group-hover:border-orange-500/30">
                                            <span className="text-xs text-gray-500 mb-1">Número</span>
                                            <span className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                                {ticketNumber.number.toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Informações do Cliente */}
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide block">Cliente</span>
                                                <p className="font-semibold text-gray-200 text-sm mt-1 truncate" title={owner.name}>
                                                    {owner.name}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide block">Rifa</span>
                                                <p className="font-semibold text-gray-200 text-sm mt-1">
                                                    #{ticketNumber.raffleId}
                                                </p>
                                            </div>
                                            {owner.instagram && (
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide block">Instagram</span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <FaInstagram className="text-gray-400 text-xs flex-shrink-0" />
                                                        <p className="text-xs text-gray-400 truncate" title={`@${owner.instagram}`}>
                                                            @{owner.instagram}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide block">WhatsApp</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FaWhatsapp className="text-gray-400 text-xs flex-shrink-0" />
                                                    <p className="text-xs text-gray-400 truncate">{owner.whatsapp}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Premiações Recentes */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FaTrophy className="text-2xl text-yellow-500" />
                            <h2 className="text-xl font-bold text-white">Premiações Recentes</h2>
                        </div>
                        <span className="text-sm text-gray-500">
                            {scratchCardRewards.length} {scratchCardRewards.length === 1 ? 'prêmio' : 'prêmios'}
                        </span>
                    </div>

                    <div className="space-y-3 min-h-[400px]">
                        {scratchCardRewards.length > 0 ? (
                            <>
                                {scratchCardRewards
                                    .slice((rewardsCurrentPage - 1) * rewardsPerPage, rewardsCurrentPage * rewardsPerPage)
                                    .map((reward, index) => {
                                        const getRewardColor = (rewardName: string): string => {
                                            if (rewardName.includes("500")) return "from-purple-500 to-purple-600";
                                            if (rewardName.includes("200")) return "from-blue-500 to-blue-600";
                                            if (rewardName.includes("100")) return "from-green-500 to-green-600";
                                            if (rewardName.includes("50")) return "from-orange-500 to-orange-600";
                                            if (rewardName.includes("20")) return "from-yellow-500 to-yellow-600";
                                            return "from-red-500 to-red-600";
                                        };

                                        const getRewardBorder = (rewardName: string): string => {
                                            if (rewardName.includes("500")) return "border-purple-500/30";
                                            if (rewardName.includes("200")) return "border-blue-500/30";
                                            if (rewardName.includes("100")) return "border-green-500/30";
                                            if (rewardName.includes("50")) return "border-orange-500/30";
                                            if (rewardName.includes("20")) return "border-yellow-500/30";
                                            return "border-red-500/30";
                                        };

                                        return (
                                            <motion.div
                                                key={reward.rewardId}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ x: 5 }}
                                                className={`p-4 bg-[#1c1d1f] rounded-xl border ${getRewardBorder(reward.name)} hover:border-white/20 transition-all`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRewardColor(reward.name)} text-white text-xs font-bold shadow-lg`}>
                                                            {reward.name}
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-bold ${reward.isPaid
                                                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                                                                }`}
                                                        >
                                                            {reward.isPaid ? "Pago" : "Pendente"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide block">Ganhador</span>
                                                        <p className="font-semibold text-gray-200 text-sm mt-1 truncate" title={reward.winner.name}>
                                                            {reward.winner.name}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide block">WhatsApp</span>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <FaWhatsapp className="text-green-500 text-xs flex-shrink-0" />
                                                                <p className="text-xs text-gray-400 truncate">{reward.winner.whatsapp}</p>
                                                            </div>
                                                        </div>

                                                        {reward.winner.instagram && (
                                                            <div>
                                                                <span className="text-xs text-gray-500 uppercase tracking-wide block">Instagram</span>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <FaInstagram className="text-pink-500 text-xs flex-shrink-0" />
                                                                    <p className="text-xs text-gray-400 truncate" title={`@${reward.winner.instagram}`}>
                                                                        @{reward.winner.instagram}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                            </>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <FaTrophy className="text-4xl mx-auto mb-3 text-gray-600" />
                                <p className="text-sm">Nenhuma premiação encontrada</p>
                                <p className="text-xs mt-2 text-gray-600">As premiações recentes aparecerão aqui</p>
                            </div>
                        )}
                    </div>

                    {/* Controles de Paginação */}
                    {Math.ceil(scratchCardRewards.length / rewardsPerPage) > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-[#313238] pt-4">
                            <div className="text-sm text-gray-500">
                                Mostrando {((rewardsCurrentPage - 1) * rewardsPerPage) + 1} a {Math.min(rewardsCurrentPage * rewardsPerPage, scratchCardRewards.length)} de {scratchCardRewards.length}
                            </div>

                            <div className="flex items-center gap-2">
                                <motion.button
                                    onClick={() => setRewardsCurrentPage(rewardsCurrentPage - 1)}
                                    disabled={rewardsCurrentPage === 1}
                                    whileHover={{ scale: rewardsCurrentPage === 1 ? 1 : 1.05 }}
                                    whileTap={{ scale: rewardsCurrentPage === 1 ? 1 : 0.95 }}
                                    className={`p-2 rounded-lg transition-all ${rewardsCurrentPage === 1
                                        ? 'text-gray-600 cursor-not-allowed'
                                        : 'text-gray-400 hover:bg-[#313238] hover:text-white'
                                        }`}
                                    aria-label="Página anterior"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && rewardsCurrentPage > 1 && setRewardsCurrentPage(rewardsCurrentPage - 1)}
                                >
                                    <FaChevronLeft />
                                </motion.button>

                                <div className="flex items-center gap-1">
                                    {generatePagination(rewardsCurrentPage, Math.ceil(scratchCardRewards.length / rewardsPerPage)).map((page, index) => (
                                        <React.Fragment key={index}>
                                            {page === "..." ? (
                                                <span className="text-gray-500 px-2">...</span>
                                            ) : (
                                                <motion.button
                                                    onClick={() => setRewardsCurrentPage(Number(page))}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`w-8 h-8 rounded-lg font-semibold text-sm transition-all ${rewardsCurrentPage === page
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-400 hover:bg-[#313238] hover:text-white'
                                                        }`}
                                                    aria-label={`Página ${page}`}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === 'Enter' && setRewardsCurrentPage(Number(page))}
                                                >
                                                    {page}
                                                </motion.button>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <motion.button
                                    onClick={() => setRewardsCurrentPage(rewardsCurrentPage + 1)}
                                    disabled={rewardsCurrentPage === Math.ceil(scratchCardRewards.length / rewardsPerPage)}
                                    whileHover={{ scale: rewardsCurrentPage === Math.ceil(scratchCardRewards.length / rewardsPerPage) ? 1 : 1.05 }}
                                    whileTap={{ scale: rewardsCurrentPage === Math.ceil(scratchCardRewards.length / rewardsPerPage) ? 1 : 0.95 }}
                                    className={`p-2 rounded-lg transition-all ${rewardsCurrentPage === Math.ceil(scratchCardRewards.length / rewardsPerPage)
                                        ? 'text-gray-600 cursor-not-allowed'
                                        : 'text-gray-400 hover:bg-[#313238] hover:text-white'
                                        }`}
                                    aria-label="Próxima página"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && rewardsCurrentPage < Math.ceil(scratchCardRewards.length / rewardsPerPage) && setRewardsCurrentPage(rewardsCurrentPage + 1)}
                                >
                                    <FaChevronRight />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Top Compradores */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FaTrophy className="text-2xl text-yellow-500" />
                            <h2 className="text-xl font-bold text-white">Top Compradores</h2>
                        </div>
                        <span className="text-sm text-gray-500">
                            {filteredClients.length} {filteredClients.length === 1 ? 'comprador' : 'compradores'}
                        </span>
                    </div>

                    {/* Filtros de Tempo */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2 text-gray-400">
                                <FaClock className="text-gray-500" />
                                <span className="text-sm font-medium">Período:</span>
                            </div>
                            {(['1h', '1d', '1w', '1m', 'all'] as TimeFilter[]).map((filter) => (
                                <motion.button
                                    key={filter}
                                    onClick={() => handleTimeFilterChange(filter)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${timeFilter === filter
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'bg-[#313238] text-gray-400 hover:bg-[#3a3c45] hover:text-white'
                                        }`}
                                    aria-label={`Filtrar por ${getTimeFilterLabel(filter)}`}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTimeFilterChange(filter)}
                                >
                                    {getTimeFilterLabel(filter)}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Campo de Busca */}
                    <div className="mb-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou CPF..."
                                value={searchFilter}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 min-h-[400px]">
                        {paginatedClients.length > 0 ? (
                            paginatedClients.map((client, index) => {
                                const globalIndex = startIndex + index;

                                const getMedalColor = (position: number): string => {
                                    if (position === 0) return "text-yellow-500";
                                    if (position === 1) return "text-gray-400";
                                    if (position === 2) return "text-amber-600";
                                    return "text-gray-600";
                                };

                                const getBgColor = (position: number): string => {
                                    if (position === 0) return "bg-yellow-500/10 border-yellow-500/20";
                                    if (position === 1) return "bg-gray-500/10 border-gray-500/20";
                                    if (position === 2) return "bg-amber-500/10 border-amber-500/20";
                                    return "bg-[#1c1d1f] border-[#313238]";
                                };

                                return (
                                    <motion.div
                                        key={`${client.cpf}-${globalIndex}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 5 }}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:border-orange-500/30 ${getBgColor(globalIndex)}`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex items-center justify-center w-8 h-8">
                                                {globalIndex < 3 ? (
                                                    <FaMedal className={`text-2xl ${getMedalColor(globalIndex)}`} />
                                                ) : (
                                                    <span className="font-bold text-gray-500 text-sm">#{globalIndex + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-sm truncate">
                                                    {client.name || 'Sem nome'}
                                                </h3>
                                                <p className="text-xs text-gray-500">{client.cpf || 'CPF não informado'}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <FaTicketAlt className="text-orange-500" />
                                                <span className="font-bold text-white text-lg">
                                                    {client.ticketCount}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">cotas</p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <FaUsers className="text-4xl mx-auto mb-3 text-gray-600" />
                                <p className="text-sm">
                                    {searchFilter ? 'Nenhum comprador encontrado' : 'Nenhum comprador cadastrado'}
                                </p>
                                <p className="text-xs mt-2 text-gray-600">
                                    {searchFilter ? 'Tente outro termo de busca' : 'Os top compradores aparecerão aqui'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Controles de Paginação */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#313238] pt-4">
                            <div className="text-sm text-gray-500 order-2 sm:order-1">
                                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClients.length)} de {filteredClients.length}
                            </div>

                            <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
                                <motion.button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                                    className={`p-2 rounded-lg transition-all ${currentPage === 1
                                        ? 'text-gray-600 cursor-not-allowed'
                                        : 'text-gray-400 hover:bg-[#313238] hover:text-white'
                                        }`}
                                >
                                    <FaChevronLeft />
                                </motion.button>

                                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none px-2 no-scrollbar">
                                    {generatePagination(currentPage, totalPages).map((page, index) => (
                                        <React.Fragment key={index}>
                                            {page === "..." ? (
                                                <span className="text-gray-500 px-2">...</span>
                                            ) : (
                                                <motion.button
                                                    onClick={() => handlePageChange(Number(page))}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`min-w-[2rem] h-8 rounded-lg font-semibold text-sm transition-all flex items-center justify-center ${currentPage === page
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-gray-400 hover:bg-[#313238] hover:text-white'
                                                        }`}
                                                >
                                                    {page}
                                                </motion.button>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <motion.button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                                    className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                                        ? 'text-gray-600 cursor-not-allowed'
                                        : 'text-gray-400 hover:bg-[#313238] hover:text-white'
                                        }`}
                                >
                                    <FaChevronRight />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Search Number Modal */}
            <SearchNumberModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
            />

            {/* Unlock Number Modal */}
            <UnlockNumberModal
                isOpen={isUnlockModalOpen}
                onClose={() => setIsUnlockModalOpen(false)}
            />
        </div>
    );
}
