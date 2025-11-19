"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import type { Rifa } from "@/types";
import { rifasService } from "@/services/rifas.service";

export default function RifasPage() {
    const [rifas, setRifas] = useState<Rifa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalDeletar, setModalDeletar] = useState(false);
    const [rifaParaDeletar, setRifaParaDeletar] = useState<Rifa | null>(null);
    const [deletando, setDeletando] = useState(false);

    useEffect(() => {
        carregarRifas();
    }, []);

    const carregarRifas = async () => {
        setLoading(true);
        setError(null);
        const result = await rifasService.listarTodasAdmin();

        if (result.error) {
            setError(result.error);
        } else {
            setRifas(result.data);
        }

        setLoading(false);
    };

    const handleDeletar = (rifa: Rifa) => {
        setRifaParaDeletar(rifa);
        setModalDeletar(true);
    };

    const confirmarDelecao = async () => {
        if (!rifaParaDeletar) return;

        setDeletando(true);
        const result = await rifasService.deletar(Number(rifaParaDeletar.id));

        if (result.error) {
            alert(`Erro ao deletar: ${result.error}`);
        } else {
            carregarRifas();
        }

        setDeletando(false);
        setModalDeletar(false);
        setRifaParaDeletar(null);
    };

    const cancelarDelecao = () => {
        setModalDeletar(false);
        setRifaParaDeletar(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ativa":
                return "bg-green-500/10 text-green-500 border border-green-500/20";
            case "pausada":
                return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
            case "finalizada":
                return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
            default:
                return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "ativa":
                return "Ativa";
            case "pausada":
                return "Pausada";
            case "finalizada":
                return "Finalizada";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen bg-[#1c1d1f]">
                <div className="text-center">
                    <FaSpinner className="text-5xl text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Carregando rifas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 min-h-screen bg-[#1c1d1f]">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Erro ao carregar rifas</h2>
                    <p className="text-red-400 mb-4">{error}</p>
                    <motion.button
                        onClick={carregarRifas}
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
            {/* Modal de Confirmação */}
            {modalDeletar && rifaParaDeletar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={cancelarDelecao}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-[#25282c] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#313238]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FaExclamationTriangle className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Confirmar Exclusão</h3>
                                    <p className="text-red-100 text-sm">Esta ação não pode ser desfeita</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-300 mb-4">
                                    Tem certeza que deseja deletar esta rifa?
                                </p>
                                <div className="bg-[#1c1d1f] rounded-xl p-4 border border-[#313238]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-[#25282c] rounded-xl flex-shrink-0 overflow-hidden border border-[#313238]">
                                            <img
                                                src={rifaParaDeletar.image}
                                                alt={rifaParaDeletar.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{rifaParaDeletar.title}</h4>
                                            <p className="text-sm text-gray-500">
                                                {rifaParaDeletar.blocked?.length ?? 0} números bloqueados
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <motion.button
                                    onClick={cancelarDelecao}
                                    disabled={deletando}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-6 py-3 bg-[#313238] text-gray-300 rounded-xl font-bold hover:bg-[#3a3c45] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    onClick={confirmarDelecao}
                                    disabled={deletando}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {deletando ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Deletando...
                                        </>
                                    ) : (
                                        <>
                                            <FaTrash />
                                            Deletar
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">GERENCIAR RIFAS</h1>
                    <p className="text-gray-400">Crie, edite e gerencie suas rifas</p>
                </div>

                <Link href="/admin/rifas/nova">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
                    >
                        <FaPlus />
                        Nova Rifa
                    </motion.button>
                </Link>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#25282c] rounded-xl p-4 border border-[#313238]"
                >
                    <p className="text-sm text-gray-400 mb-1">Total de Rifas</p>
                    <p className="text-2xl font-bold text-white">{rifas.length}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#25282c] rounded-xl p-4 border border-green-500/20"
                >
                    <p className="text-sm text-gray-400 mb-1">Rifas Ativas</p>
                    <p className="text-2xl font-bold text-green-500">
                        {rifas.filter((r) => !r.finished).length}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#25282c] rounded-xl p-4 border border-yellow-500/20"
                >
                    <p className="text-sm text-gray-400 mb-1">Esgotadas</p>
                    <p className="text-2xl font-bold text-yellow-500">
                        {rifas.filter((r) => r.soldOut).length}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#25282c] rounded-xl p-4 border border-[#313238]"
                >
                    <p className="text-sm text-gray-400 mb-1">Finalizadas</p>
                    <p className="text-2xl font-bold text-gray-400">
                        {rifas.filter((r) => r.finished).length}
                    </p>
                </motion.div>
            </div>

            {/* Rifas List */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#25282c] rounded-2xl shadow-xl overflow-hidden border border-[#313238]"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c1d1f] border-b border-[#313238]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Rifa
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Cotas
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Data Fim
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#313238]">
                            {rifas.map((rifa, index) => {
                                const cotasVendidas = rifa.blocked?.length ?? 0; // Cotas bloqueadas como vendidas
                                const totalCotas = 0; // Total não mais disponível na nova API
                                const percentual = 0; // Não pode calcular sem o total

                                return (
                                    <motion.tr
                                        key={rifa.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ backgroundColor: "#313238" }}
                                        className="transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-[#1c1d1f] rounded-xl flex-shrink-0 overflow-hidden border border-[#313238]">
                                                    <img
                                                        src={rifa.image}
                                                        alt={rifa.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{rifa.title}</h3>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{rifa.description}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-300">
                                                    {cotasVendidas.toLocaleString()} / {totalCotas.toLocaleString()}
                                                </p>
                                                <div className="w-full h-2 bg-[#1c1d1f] rounded-full mt-2 overflow-hidden border border-[#313238]">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                                                        style={{ width: `${percentual}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{percentual.toFixed(1)}%</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">
                                                R$ {(rifa.ticketsPrice ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs text-gray-500">por cota</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                                    rifa.finished ? "finalizada" : "ativa"
                                                )}`}
                                            >
                                                {getStatusLabel(rifa.finished ? "finalizada" : "ativa")}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300">
                                                {rifa.closure ? new Date(rifa.closure).toLocaleDateString('pt-BR') : "N/A"}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/12${rifa.id}`} target="_blank">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Visualizar"
                                                    >
                                                        <FaEye />
                                                    </motion.button>
                                                </Link>

                                                <Link href={`/admin/rifas/${rifa.id}/editar`}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <FaEdit />
                                                    </motion.button>
                                                </Link>

                                                <motion.button
                                                    onClick={() => handleDeletar(rifa)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Deletar"
                                                >
                                                    <FaTrash />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
