"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaMoneyBillWave,
    FaChartLine,
    FaShoppingCart,
    FaWallet,
    FaDownload,
    FaFilter,
    FaSpinner,
    FaTimes,
    FaTicketAlt,
    FaUser,
    FaInstagram,
    FaIdCard
} from "react-icons/fa";
import { StatCard } from "@/components/admin/StatCard";
import type { SalesData, Rifa } from "@/types";
import type { DashboardStats } from "@/services/dashboard.service";
import { vendasService } from "@/services/vendas.service";
import { rifasService } from "@/services/rifas.service";

export default function FinanceiroPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingPage, setLoadingPage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [rifas, setRifas] = useState<Rifa[]>([]);
    const [selectedRifaId, setSelectedRifaId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalSales, setTotalSales] = useState(0);
    const [limit, setLimit] = useState(10);
    const [selectedSale, setSelectedSale] = useState<SalesData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        carregarRifas();
    }, []);

    useEffect(() => {
        if (selectedRifaId) {
            const isPageChange = !isInitialLoad;
            carregarVendas(selectedRifaId, currentPage, isPageChange);
            // Carregar estatísticas gerais apenas quando trocar de rifa, não a cada mudança de página
            if (!isPageChange) {
                carregarEstatisticasGerais(selectedRifaId);
            }
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRifaId, currentPage]);

    const carregarRifas = async () => {
        const result = await rifasService.listarTodasAdmin();
        if (result.data) {
            setRifas(result.data);
            if (result.data.length > 0) {
                setSelectedRifaId(result.data[0].id);
            }
        }
    };

    const calcularEstatisticas = (salesData: SalesData[]): DashboardStats => {
        const faturamentoTotalCentavos = salesData.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const totalVendas = salesData.reduce((acc, sale) => acc + sale.totalPurchases, 0);
        const totalCotasVendidas = salesData.reduce((acc, sale) => acc + sale.totalTickets, 0);

        // Converter de centavos para reais
        const faturamentoTotal = faturamentoTotalCentavos / 100;

        // Calcular faturamento do mês atual
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();

        const faturamentoMesCentavos = salesData.reduce((acc, sale) => {
            const vendasDoMes = sale.purchases.filter(purchase => {
                const dataPurchase = new Date(purchase.createdAt);
                return dataPurchase.getMonth() === mesAtual && dataPurchase.getFullYear() === anoAtual;
            });

            const totalMes = vendasDoMes.reduce((sum, p) => sum + p.amount, 0);
            return acc + totalMes;
        }, 0);

        const faturamentoMes = faturamentoMesCentavos / 100;

        // Calcular faturamento de hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const faturamentoHojeCentavos = salesData.reduce((acc, sale) => {
            const vendasHoje = sale.purchases.filter(purchase => {
                const dataPurchase = new Date(purchase.createdAt);
                dataPurchase.setHours(0, 0, 0, 0);
                return dataPurchase.getTime() === hoje.getTime();
            });

            const totalHoje = vendasHoje.reduce((sum, p) => sum + p.amount, 0);
            return acc + totalHoje;
        }, 0);

        const faturamentoHoje = faturamentoHojeCentavos / 100;

        // Calcular ticket médio
        const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;

        return {
            faturamentoTotal,
            faturamentoMes,
            faturamentoHoje,
            totalVendas,
            totalCotasVendidas,
            ticketMedio,
            // Valores não calculados aqui
            totalRifas: 0,
            rifasAtivas: 0,
            vendasHoje: 0
        };
    };

    const carregarEstatisticasGerais = async (actionId: number) => {
        // Buscar todas as vendas sem paginação (limite alto) para calcular estatísticas gerais
        const allSalesResult = await vendasService.obterVendas(actionId, 1, 10000);

        if (allSalesResult.error || !allSalesResult.data) {
            setStats(null);
        } else {
            // Calcular estatísticas baseado em TODAS as vendas
            const calculatedStats = calcularEstatisticas(allSalesResult.data.data);
            setStats(calculatedStats);
        }
    };

    const carregarVendas = async (actionId: number, page: number, isPageChange = false) => {
        if (isPageChange) {
            setLoadingPage(true);
        } else {
            setLoading(true);
        }
        setError(null);

        const salesResult = await vendasService.obterVendas(actionId, page, limit);

        if (salesResult.error || !salesResult.data) {
            setError(salesResult.error || "Erro ao carregar vendas");
            setSalesData([]);
            setTotalSales(0);
        } else {
            setSalesData(salesResult.data.data);
            setTotalSales(salesResult.data.meta.total);
        }

        setLoading(false);
        setLoadingPage(false);
    };

    const handlePageChange = (newPage: number) => {
        const maxPages = Math.ceil(totalSales / limit);
        if (newPage >= 1 && newPage <= maxPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleOpenModal = (sale: SalesData) => {
        setSelectedSale(sale);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSale(null);
    };

    // Cálculo correto dos índices baseado na página atual da API
    const totalPages = Math.max(1, Math.ceil(totalSales / limit));
    const startIndex = totalSales === 0 ? 0 : (currentPage - 1) * limit + 1;
    const endIndex = Math.min(startIndex + salesData.length - 1, totalSales);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen bg-[#1c1d1f]">
                <div className="text-center">
                    <FaSpinner className="text-5xl text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Carregando dados financeiros...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-8 min-h-screen bg-[#1c1d1f]">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Erro ao carregar dados</h2>
                    <p className="text-red-400 mb-4">{error || "Dados não disponíveis"}</p>
                    <motion.button
                        onClick={() => selectedRifaId && carregarVendas(selectedRifaId, currentPage)}
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

    const selectedRifa = rifas.find(r => r.id === selectedRifaId);

    return (
        <div className="p-8 min-h-screen bg-[#1c1d1f]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">FINANCEIRO</h1>
                        <p className="text-gray-400">Acompanhe as vendas e faturamento</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-orange-500/20"
                        >
                            <FaDownload />
                            Exportar
                        </motion.button>
                    </div>
                </div>

                {/* Rifa Selector */}
                {rifas.length > 0 && (
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-400">Selecione a Rifa:</label>
                        <select
                            value={selectedRifaId || ""}
                            onChange={(e) => {
                                setSelectedRifaId(Number(e.target.value));
                                setCurrentPage(1); // Reset para página 1 ao trocar de rifa
                                setIsInitialLoad(false); // Não é mais carga inicial
                            }}
                            className="px-4 py-2 bg-[#25282c] border border-[#313238] rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        >
                            {rifas.map((rifa) => (
                                <option key={rifa.id} value={rifa.id} className="bg-[#25282c] text-white">
                                    {rifa.title} - {rifa.soldTicketsCount}/{rifa.numberTickets} cotas vendidas
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Faturamento Total"
                    value={`R$ ${stats.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subtitle="Todas as vendas"
                    icon={<FaMoneyBillWave className="text-2xl text-white" />}
                    color="from-green-500 to-green-600"
                    trend={{ value: "28%", isPositive: true }}
                />

                <StatCard
                    title="Faturamento do Mês"
                    value={`R$ ${stats.faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subtitle={new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                    icon={<FaWallet className="text-2xl text-white" />}
                    color="from-blue-500 to-blue-600"
                    trend={{ value: "15%", isPositive: true }}
                />

                <StatCard
                    title="Total de Vendas"
                    value={stats.totalVendas.toLocaleString('pt-BR')}
                    subtitle={`${stats.totalCotasVendidas} cotas`}
                    icon={<FaShoppingCart className="text-2xl text-white" />}
                    color="from-purple-500 to-purple-600"
                    trend={{ value: "12%", isPositive: true }}
                />

                <StatCard
                    title="Ticket Médio"
                    value={`R$ ${stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subtitle="Por venda"
                    icon={<FaChartLine className="text-2xl text-white" />}
                    color="from-orange-500 to-orange-600"
                    trend={{ value: "3%", isPositive: false }}
                />
            </div>

            {/* Tabela de Vendas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#25282c] rounded-2xl shadow-xl overflow-hidden border border-[#313238]"
            >
                <div className="p-6 border-b border-[#313238]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Vendas Recentes</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-orange-500 hover:text-orange-400 font-semibold text-sm transition-colors"
                        >
                            <FaFilter />
                            Filtros
                        </motion.button>
                    </div>
                </div>

                <div className="overflow-x-auto relative">
                    {loadingPage && (
                        <div className="absolute inset-0 bg-[#25282c]/80 flex items-center justify-center z-10 backdrop-blur-sm">
                            <FaSpinner className="text-3xl text-orange-500 animate-spin" />
                        </div>
                    )}
                    <table className="w-full">
                        <thead className="bg-[#1c1d1f]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Rifa
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Total de Compras
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Total Tickets
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Valor Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Última Compra
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#313238]">
                            {salesData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma venda encontrada para esta rifa
                                    </td>
                                </tr>
                            ) : (
                                salesData.map((sale, index) => (
                                    <motion.tr
                                        key={sale.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ backgroundColor: "#313238" }}
                                        onClick={() => handleOpenModal(sale)}
                                        className="transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-white group-hover:text-orange-500 transition-colors">{sale.user.name}</p>
                                                <p className="text-sm text-gray-400">{sale.user.instagram}</p>
                                                <p className="text-xs text-gray-500">CPF: {sale.user.cpf}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300">{selectedRifa?.title || "-"}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">{sale.totalPurchases}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">{sale.totalTickets}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-green-400">
                                                R$ {(sale.totalAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300">
                                                {new Date(sale.purchases[0]?.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(sale.purchases[0]?.createdAt).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-[#313238] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 order-2 sm:order-1">
                        Mostrando <span className="font-bold text-white">{startIndex}</span> a <span className="font-bold text-white">{endIndex}</span> de{" "}
                        <span className="font-bold text-white">{totalSales}</span> vendas
                    </p>

                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loadingPage}
                            className="px-4 py-2 border border-[#313238] rounded-xl text-gray-400 font-semibold hover:bg-[#313238] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

                        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none px-2 no-scrollbar">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={loadingPage}
                                        className={`min-w-[2.5rem] h-10 rounded-xl font-semibold transition-colors flex items-center justify-center ${currentPage === pageNum
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                            : "border border-[#313238] text-gray-400 hover:bg-[#313238] hover:text-white"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || loadingPage}
                            className="px-4 py-2 border border-[#313238] rounded-xl text-gray-400 font-semibold hover:bg-[#313238] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Modal de Detalhes da Venda */}
            {isModalOpen && selectedSale && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#25282c] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-[#313238]"
                    >
                        {/* Header do Modal */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Detalhes da Venda</h2>
                                    <p className="text-orange-100">Informações completas do cliente e compras</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-orange-600 rounded-lg transition-colors"
                                >
                                    <FaTimes className="text-2xl" />
                                </button>
                            </div>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Informações do Cliente */}
                            <div className="bg-[#1c1d1f] rounded-xl p-6 mb-6 border border-[#313238]">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaUser className="text-orange-500" />
                                    Informações do Cliente
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Nome</p>
                                        <p className="font-bold text-white">{selectedSale.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                            <FaInstagram className="text-pink-500" />
                                            Instagram
                                        </p>
                                        <p className="font-bold text-white">{selectedSale.user.instagram}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                            <FaIdCard className="text-blue-500" />
                                            CPF
                                        </p>
                                        <p className="font-bold text-white">{selectedSale.user.cpf}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">User ID</p>
                                        <p className="font-mono text-xs text-gray-500">{selectedSale.userId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Resumo Total */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-white">
                                    <p className="text-sm font-medium mb-1 text-blue-400">Total de Compras</p>
                                    <p className="text-3xl font-bold">{selectedSale.totalPurchases}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-white">
                                    <p className="text-sm font-medium mb-1 text-purple-400">Total de Tickets</p>
                                    <p className="text-3xl font-bold">{selectedSale.totalTickets}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 text-white">
                                    <p className="text-sm font-medium mb-1 text-green-400">Valor Total</p>
                                    <p className="text-3xl font-bold">
                                        R$ {(selectedSale.totalAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Lista de Compras */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaTicketAlt className="text-orange-500" />
                                    Compras Realizadas
                                </h3>
                                <div className="space-y-4">
                                    {selectedSale.purchases.map((purchase, index) => (
                                        <motion.div
                                            key={purchase.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-[#1c1d1f] border border-[#313238] rounded-xl p-4 hover:border-orange-500/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm text-gray-400">Compra #{purchase.id}</p>
                                                    <p className="font-bold text-white">TX ID: {purchase.txId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-400">Valor</p>
                                                    <p className="text-xl font-bold text-green-400">
                                                        R$ {(purchase.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-sm text-gray-400 mb-2">
                                                    Data da Compra: {new Date(purchase.createdAt).toLocaleString('pt-BR')}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-gray-300 mb-2">
                                                    Tickets ({purchase.tickets.length}):
                                                </p>
                                                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-40 overflow-y-auto">
                                                    {purchase.tickets.map((ticket, ticketIndex) => (
                                                        <div
                                                            key={ticketIndex}
                                                            className="bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg p-2 text-center font-bold text-xs"
                                                        >
                                                            {ticket.toString().padStart(6, '0')}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1c1d1f] p-4 flex justify-end border-t border-[#313238]">
                            <motion.button
                                onClick={handleCloseModal}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-bold"
                            >
                                Fechar
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
