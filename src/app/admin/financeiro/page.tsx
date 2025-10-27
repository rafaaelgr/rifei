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
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/services/dashboard.service";
import { vendasService } from "@/services/vendas.service";
import { rifasService } from "@/services/rifas.service";

export default function FinanceiroPage() {
    const [periodo, setPeriodo] = useState("mes");
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

    const carregarVendas = async (actionId: number, page: number, isPageChange = false) => {
        if (isPageChange) {
            setLoadingPage(true);
        } else {
            setLoading(true);
        }
        setError(null);

        const [statsResult, salesResult] = await Promise.all([
            dashboardService.buscarEstatisticas(),
            vendasService.obterVendas(actionId, page, limit)
        ]);

        if (statsResult.error || !statsResult.data) {
            setError(statsResult.error || "Erro ao carregar estatísticas");
        } else {
            setStats(statsResult.data);
        }

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
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FaSpinner className="text-5xl text-red-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando dados financeiros...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                    <h2 className="text-xl font-bold text-red-700 mb-2">Erro ao carregar dados</h2>
                    <p className="text-red-600 mb-4">{error || "Dados não disponíveis"}</p>
                    <motion.button
                        onClick={() => selectedRifaId && carregarVendas(selectedRifaId, currentPage)}
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

    const selectedRifa = rifas.find(r => r.id === selectedRifaId);

    return (
        <div className="p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financeiro</h1>
                        <p className="text-gray-600">Acompanhe as vendas e faturamento</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg"
                        >
                            <FaDownload />
                            Exportar
                        </motion.button>
                    </div>
                </div>

                {/* Rifa Selector */}
                {rifas.length > 0 && (
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700">Selecione a Rifa:</label>
                        <select
                            value={selectedRifaId || ""}
                            onChange={(e) => {
                                setSelectedRifaId(Number(e.target.value));
                                setCurrentPage(1); // Reset para página 1 ao trocar de rifa
                                setIsInitialLoad(false); // Não é mais carga inicial
                            }}
                            className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors font-medium"
                        >
                            {rifas.map((rifa) => (
                                <option key={rifa.id} value={rifa.id}>
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
                    subtitle="Outubro 2025"
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
                    color="from-red-500 to-red-600"
                    trend={{ value: "3%", isPositive: false }}
                />
            </div>

            {/* Tabela de Vendas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Vendas Recentes</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold text-sm"
                        >
                            <FaFilter />
                            Filtros
                        </motion.button>
                    </div>
                </div>

                <div className="overflow-x-auto relative">
                    {loadingPage && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <FaSpinner className="text-3xl text-red-500 animate-spin" />
                        </div>
                    )}
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Rifa
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Total de Compras
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Total Tickets
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Valor Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Última Compra
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
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
                                        whileHover={{ backgroundColor: "#f9fafb" }}
                                        onClick={() => handleOpenModal(sale)}
                                        className="transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{sale.user.name}</p>
                                                <p className="text-sm text-gray-500">{sale.user.instagram}</p>
                                                <p className="text-xs text-gray-400">CPF: {sale.user.cpf}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{selectedRifa?.title || "-"}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{sale.totalPurchases}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{sale.totalTickets}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">
                                                R$ {sale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
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
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Mostrando <span className="font-bold">{startIndex}</span> a <span className="font-bold">{endIndex}</span> de{" "}
                        <span className="font-bold">{totalSales}</span> vendas
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loadingPage}
                            className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

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
                                    className={`px-4 py-2 rounded-xl font-semibold transition-colors ${currentPage === pageNum
                                        ? "bg-red-500 text-white"
                                        : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || loadingPage}
                            className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Modal de Detalhes da Venda */}
            {isModalOpen && selectedSale && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Header do Modal */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Detalhes da Venda</h2>
                                    <p className="text-red-100">Informações completas do cliente e compras</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                                >
                                    <FaTimes className="text-2xl" />
                                </button>
                            </div>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Informações do Cliente */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaUser className="text-red-500" />
                                    Informações do Cliente
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Nome</p>
                                        <p className="font-bold text-gray-900">{selectedSale.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                            <FaInstagram className="text-pink-500" />
                                            Instagram
                                        </p>
                                        <p className="font-bold text-gray-900">{selectedSale.user.instagram}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                            <FaIdCard className="text-blue-500" />
                                            CPF
                                        </p>
                                        <p className="font-bold text-gray-900">{selectedSale.user.cpf}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">User ID</p>
                                        <p className="font-mono text-xs text-gray-700">{selectedSale.userId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Resumo Total */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                                    <p className="text-sm font-medium mb-1 opacity-90">Total de Compras</p>
                                    <p className="text-3xl font-bold">{selectedSale.totalPurchases}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                                    <p className="text-sm font-medium mb-1 opacity-90">Total de Tickets</p>
                                    <p className="text-3xl font-bold">{selectedSale.totalTickets}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                                    <p className="text-sm font-medium mb-1 opacity-90">Valor Total</p>
                                    <p className="text-3xl font-bold">
                                        R$ {selectedSale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Lista de Compras */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaTicketAlt className="text-red-500" />
                                    Compras Realizadas
                                </h3>
                                <div className="space-y-4">
                                    {selectedSale.purchases.map((purchase, index) => (
                                        <motion.div
                                            key={purchase.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm text-gray-600">Compra #{purchase.id}</p>
                                                    <p className="font-bold text-gray-900">TX ID: {purchase.txId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Valor</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        R$ {purchase.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Data da Compra: {new Date(purchase.createdAt).toLocaleString('pt-BR')}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                                    Tickets ({purchase.tickets.length}):
                                                </p>
                                                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-40 overflow-y-auto">
                                                    {purchase.tickets.map((ticket, ticketIndex) => (
                                                        <div
                                                            key={ticketIndex}
                                                            className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-2 text-center font-bold text-xs"
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

                        {/* Footer do Modal */}
                        <div className="bg-gray-50 p-4 flex justify-end">
                            <motion.button
                                onClick={handleCloseModal}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-bold"
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
