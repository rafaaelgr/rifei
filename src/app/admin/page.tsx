"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/admin/StatCard";
import {
    FaTicketAlt,
    FaMoneyBillWave,
    FaUsers,
    FaChartLine,
    FaSpinner,
    FaTrophy,
    FaMedal,
    FaStar,
    FaInstagram,
    FaWhatsapp,
    FaSearch,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats, RifaRecente } from "@/services/dashboard.service";
import type { TopClient, MinorTicketResponse } from "@/types";
import { SearchNumberModal } from "@/components/admin/SearchNumberModal";

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRifas, setRecentRifas] = useState<RifaRecente[]>([]);
    const [topClients, setTopClients] = useState<TopClient[]>([]);
    const [minorTicket, setMinorTicket] = useState<MinorTicketResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para filtro e paginação dos top compradores
    const [searchFilter, setSearchFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Estado para o modal de busca de número
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        setError(null);

        const [statsResult, rifasResult, topClientsResult, minorTicketResult] = await Promise.all([
            dashboardService.buscarEstatisticas(),
            dashboardService.buscarRifasRecentes(),
            dashboardService.buscarTopClientes(12),
            dashboardService.buscarMenorCota(12),
        ]);

        if (statsResult.error || !statsResult.data) {
            setError(statsResult.error || "Erro ao carregar estatísticas");
        } else {
            setStats(statsResult.data);
        }

        if (!rifasResult.error) {
            setRecentRifas(rifasResult.data);
        }

        if (!topClientsResult.error) {
            setTopClients(topClientsResult.data);
        }

        if (!minorTicketResult.error && minorTicketResult.data) {
            setMinorTicket(minorTicketResult.data);
        }

        setLoading(false);
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

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FaSpinner className="text-5xl text-red-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                    <h2 className="text-xl font-bold text-red-700 mb-2">Erro ao carregar dashboard</h2>
                    <p className="text-red-600 mb-4">{error || "Dados não disponíveis"}</p>
                    <motion.button
                        onClick={carregarDados}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Tentar novamente
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">Bem-vindo ao painel administrativo</p>
                    </div>
                    <motion.button
                        onClick={() => setIsSearchModalOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                        aria-label="Encontrar número"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setIsSearchModalOpen(true)}
                    >
                        <FaSearch />
                        Encontrar Número
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Rifas Ativas"
                    value={stats.rifasAtivas ?? 0}
                    subtitle={`${stats.totalRifas ?? 0} total`}
                    icon={<FaTicketAlt className="text-2xl text-white" />}
                    color="from-blue-500 to-blue-600"
                    trend={{ value: "12%", isPositive: true }}
                />

                <StatCard
                    title="Faturamento Total"
                    value={`R$ 0,00`}
                    subtitle="Todas as vendas"
                    icon={<FaMoneyBillWave className="text-2xl text-white" />}
                    color="from-green-500 to-green-600"
                    trend={{ value: "28%", isPositive: true }}
                />

                <StatCard
                    title="Cotas Vendidas"
                    value={(stats.totalCotasVendidas ?? 0).toLocaleString('pt-BR')}
                    subtitle={`${stats.totalVendas ?? 0} vendas`}
                    icon={<FaUsers className="text-2xl text-white" />}
                    color="from-purple-500 to-purple-600"
                    trend={{ value: "8%", isPositive: true }}
                />

                <StatCard
                    title="Ticket Médio"
                    value={`R$ ${(stats.ticketMedio ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subtitle="Por venda"
                    icon={<FaChartLine className="text-2xl text-white" />}
                    color="from-red-500 to-red-600"
                    trend={{ value: "3%", isPositive: false }}
                />
            </div>

            {/* Menor Cota Card */}
            {minorTicket && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <FaStar className="text-xl text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Menor Cota</h2>
                                    <p className="text-sm text-gray-500">Comprador com menor número</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Número da Cota - Destaque */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center">
                                <span className="text-sm text-gray-500 mb-2">Número</span>
                                <span className="text-6xl font-bold text-gray-900">
                                    {minorTicket.return.numbers[0].number.toString().padStart(2, '0')}
                                </span>
                            </div>

                            {/* Informações do Cliente */}
                            <div className="md:col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Cliente</span>
                                        <p className="font-semibold text-gray-900 mt-1">{minorTicket.return.owners[0].name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Rifa</span>
                                        <p className="font-semibold text-gray-900 mt-1">#{minorTicket.return.numbers[0].raffleId}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Instagram</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FaInstagram className="text-gray-400 text-sm" />
                                            <p className="text-sm text-gray-700">@{minorTicket.return.owners[0].instagram}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">WhatsApp</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FaWhatsapp className="text-gray-400 text-sm" />
                                            <p className="text-sm text-gray-700">{minorTicket.return.owners[0].whatsapp}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rifas Recentes */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Rifas Recentes</h2>
                        <button className="text-sm text-red-500 hover:text-red-600 font-semibold">
                            Ver todas
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recentRifas.map((rifa) => {
                            const cotasVendidas = rifa.cotasVendidas ?? 0;
                            const totalCotas = rifa.totalCotas ?? 0;
                            const percentual = totalCotas > 0 ? (cotasVendidas / totalCotas) * 100 : 0;

                            return (
                                <motion.div
                                    key={rifa.id}
                                    whileHover={{ x: 5 }}
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-red-300 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-gray-900">{rifa.titulo}</h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${rifa.status === "ativa"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-200 text-gray-700"
                                                }`}
                                        >
                                            {rifa.status === "ativa" ? "Ativa" : "Finalizada"}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                {cotasVendidas.toLocaleString()} / {totalCotas.toLocaleString()} cotas
                                            </span>
                                            <span className="font-bold text-red-500">{percentual.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentual}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-red-500 to-red-600"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Top Compradores */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FaTrophy className="text-2xl text-yellow-500" />
                            <h2 className="text-xl font-bold text-gray-900">Top Compradores</h2>
                        </div>
                        <span className="text-sm text-gray-500">
                            {filteredClients.length} {filteredClients.length === 1 ? 'comprador' : 'compradores'}
                        </span>
                    </div>

                    {/* Campo de Busca */}
                    <div className="mb-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por instagram ou CPF..."
                                value={searchFilter}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                                    return "text-gray-300";
                                };

                                const getBgColor = (position: number): string => {
                                    if (position === 0) return "bg-yellow-50 border-yellow-200";
                                    if (position === 1) return "bg-gray-50 border-gray-200";
                                    if (position === 2) return "bg-amber-50 border-amber-200";
                                    return "bg-gray-50 border-gray-200";
                                };

                                return (
                                    <motion.div
                                        key={`${client.cpf}-${globalIndex}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 5 }}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:border-red-300 ${getBgColor(globalIndex)}`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex items-center justify-center w-8 h-8">
                                                {globalIndex < 3 ? (
                                                    <FaMedal className={`text-2xl ${getMedalColor(globalIndex)}`} />
                                                ) : (
                                                    <span className="font-bold text-gray-400 text-sm">#{globalIndex + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm truncate">
                                                    {client.instagram || 'Sem instagram'}
                                                </h3>
                                                <p className="text-xs text-gray-500">{client.cpf || 'CPF não informado'}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <FaTicketAlt className="text-red-500" />
                                                <span className="font-bold text-gray-900 text-lg">
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
                                <FaUsers className="text-4xl mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">
                                    {searchFilter ? 'Nenhum comprador encontrado' : 'Nenhum comprador cadastrado'}
                                </p>
                                <p className="text-xs mt-2">
                                    {searchFilter ? 'Tente outro termo de busca' : 'Os top compradores aparecerão aqui'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Controles de Paginação */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                            <div className="text-sm text-gray-600">
                                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClients.length)} de {filteredClients.length}
                            </div>

                            <div className="flex items-center gap-2">
                                <motion.button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                                    className={`p-2 rounded-lg transition-all ${currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <FaChevronLeft />
                                </motion.button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <motion.button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-8 h-8 rounded-lg font-semibold text-sm transition-all ${currentPage === page
                                                ? 'bg-red-500 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                                    className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
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
        </div>
    );
}
