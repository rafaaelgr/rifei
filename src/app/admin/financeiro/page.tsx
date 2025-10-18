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
    FaSpinner
} from "react-icons/fa";
import { StatCard } from "@/components/admin/StatCard";
import type { Venda } from "@/types";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/services/dashboard.service";

export default function FinanceiroPage() {
    const [periodo, setPeriodo] = useState("mes");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        setError(null);
        const result = await dashboardService.buscarEstatisticas();

        if (result.error || !result.data) {
            setError(result.error || "Erro ao carregar dados");
        } else {
            setStats(result.data);
        }

        setLoading(false);
    };

    const vendas: Venda[] = [
        {
            id: "1",
            rifaId: "1",
            rifaTitulo: "iPhone 17 Pro Max",
            clienteNome: "João Silva",
            clienteEmail: "joao@email.com",
            clienteTelefone: "(11) 99999-9999",
            quantidadeCotas: 50,
            valorTotal: 250.00,
            metodoPagamento: "pix",
            status: "aprovado",
            numerosEscolhidos: ["0001", "0002", "0003"],
            dataCompra: "2025-10-07T10:30:00",
            dataAprovacao: "2025-10-07T10:31:00",
        },
        {
            id: "2",
            rifaId: "2",
            rifaTitulo: "Notebook Gamer",
            clienteNome: "Maria Santos",
            clienteTelefone: "(21) 98888-8888",
            quantidadeCotas: 100,
            valorTotal: 500.00,
            metodoPagamento: "credito",
            status: "pendente",
            numerosEscolhidos: ["1250", "1251", "1252"],
            dataCompra: "2025-10-07T09:15:00",
        },
        {
            id: "3",
            rifaId: "1",
            rifaTitulo: "iPhone 17 Pro Max",
            clienteNome: "Carlos Souza",
            clienteEmail: "carlos@email.com",
            clienteTelefone: "(31) 97777-7777",
            quantidadeCotas: 25,
            valorTotal: 125.00,
            metodoPagamento: "pix",
            status: "aprovado",
            numerosEscolhidos: ["0450", "0451"],
            dataCompra: "2025-10-07T08:45:00",
            dataAprovacao: "2025-10-07T08:46:00",
        },
        {
            id: "4",
            rifaId: "3",
            rifaTitulo: "PlayStation 5",
            clienteNome: "Ana Paula",
            clienteTelefone: "(41) 96666-6666",
            quantidadeCotas: 75,
            valorTotal: 375.00,
            metodoPagamento: "debito",
            status: "aprovado",
            numerosEscolhidos: ["2100", "2101", "2102"],
            dataCompra: "2025-10-06T18:20:00",
            dataAprovacao: "2025-10-06T18:22:00",
        },
        {
            id: "5",
            rifaId: "1",
            rifaTitulo: "iPhone 17 Pro Max",
            clienteNome: "Pedro Lima",
            clienteEmail: "pedro@email.com",
            clienteTelefone: "(51) 95555-5555",
            quantidadeCotas: 150,
            valorTotal: 750.00,
            metodoPagamento: "pix",
            status: "cancelado",
            numerosEscolhidos: ["3500", "3501", "3502"],
            dataCompra: "2025-10-06T15:10:00",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "aprovado":
                return "bg-green-100 text-green-700";
            case "pendente":
                return "bg-yellow-100 text-yellow-700";
            case "cancelado":
                return "bg-red-100 text-red-700";
            case "reembolsado":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "aprovado":
                return "Aprovado";
            case "pendente":
                return "Pendente";
            case "cancelado":
                return "Cancelado";
            case "reembolsado":
                return "Reembolsado";
            default:
                return status;
        }
    };

    const getMetodoPagamentoLabel = (metodo: string) => {
        switch (metodo) {
            case "pix":
                return "PIX";
            case "credito":
                return "Crédito";
            case "debito":
                return "Débito";
            case "boleto":
                return "Boleto";
            default:
                return metodo;
        }
    };

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
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Financeiro</h1>
                    <p className="text-gray-600">Acompanhe as vendas e faturamento</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    >
                        <option value="hoje">Hoje</option>
                        <option value="semana">Esta Semana</option>
                        <option value="mes">Este Mês</option>
                        <option value="ano">Este Ano</option>
                        <option value="total">Total</option>
                    </select>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg"
                    >
                        <FaDownload />
                        Exportar
                    </motion.button>
                </div>
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

            {/* Resumo por Método de Pagamento */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Vendas por Método de Pagamento</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { metodo: "PIX", valor: 65430.00, percentual: 52, color: "from-teal-500 to-teal-600" },
                        { metodo: "Crédito", valor: 38290.00, percentual: 31, color: "from-blue-500 to-blue-600" },
                        { metodo: "Débito", valor: 18710.00, percentual: 15, color: "from-purple-500 to-purple-600" },
                        { metodo: "Boleto", valor: 3000.00, percentual: 2, color: "from-gray-500 to-gray-600" },
                    ].map((item, index) => (
                        <motion.div
                            key={item.metodo}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-white`}
                        >
                            <p className="text-sm font-medium mb-2">{item.metodo}</p>
                            <p className="text-2xl font-bold mb-1">
                                R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs opacity-90">{item.percentual}% do total</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

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

                <div className="overflow-x-auto">
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
                                    Cotas
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Pagamento
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Data
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {vendas.map((venda, index) => (
                                <motion.tr
                                    key={venda.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ backgroundColor: "#f9fafb" }}
                                    className="transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{venda.clienteNome}</p>
                                            <p className="text-sm text-gray-500">{venda.clienteTelefone}</p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{venda.rifaTitulo}</p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{venda.quantidadeCotas}</p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">
                                            R$ {venda.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                            {getMetodoPagamentoLabel(venda.metodoPagamento)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                                venda.status
                                            )}`}
                                        >
                                            {getStatusLabel(venda.status)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">
                                            {new Date(venda.dataCompra).toLocaleDateString('pt-BR')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(venda.dataCompra).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Mostrando <span className="font-bold">1</span> a <span className="font-bold">5</span> de{" "}
                        <span className="font-bold">{stats.totalVendas}</span> vendas
                    </p>

                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                            Anterior
                        </button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold">
                            1
                        </button>
                        <button className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                            2
                        </button>
                        <button className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                            3
                        </button>
                        <button className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                            Próximo
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
