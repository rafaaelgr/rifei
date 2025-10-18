"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/admin/StatCard";
import {
    FaTicketAlt,
    FaMoneyBillWave,
    FaUsers,
    FaChartLine,
    FaSpinner
} from "react-icons/fa";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats, RifaRecente } from "@/services/dashboard.service";

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRifas, setRecentRifas] = useState<RifaRecente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        setError(null);

        const [statsResult, rifasResult] = await Promise.all([
            dashboardService.buscarEstatisticas(),
            dashboardService.buscarRifasRecentes(),
        ]);

        if (statsResult.error || !statsResult.data) {
            setError(statsResult.error || "Erro ao carregar estatísticas");
        } else {
            setStats(statsResult.data);
        }

        if (!rifasResult.error) {
            setRecentRifas(rifasResult.data);
        }

        setLoading(false);
    };

    // Mock data para vendas recentes (não disponível na API atual)
    const recentSales: Array<{
        id: string;
        cliente: string;
        rifa: string;
        cotas: number;
        valor: number;
        status: "aprovado" | "pendente";
    }> = [];

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Bem-vindo ao painel administrativo da Rifei</p>
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

                {/* Vendas Recentes */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Vendas Recentes</h2>
                        <button className="text-sm text-red-500 hover:text-red-600 font-semibold">
                            Ver todas
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentSales.length > 0 ? (
                            recentSales.map((venda) => (
                                <motion.div
                                    key={venda.id}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-red-300 transition-all"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-sm mb-1">{venda.cliente}</h3>
                                        <p className="text-xs text-gray-500">{venda.rifa} • {venda.cotas} cotas</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-sm mb-1">
                                            R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${venda.status === "aprovado"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {venda.status === "aprovado" ? "Aprovado" : "Pendente"}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <p className="text-sm">Dados de vendas não disponíveis</p>
                                <p className="text-xs mt-2">Endpoint de vendas precisa ser implementado na API</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
