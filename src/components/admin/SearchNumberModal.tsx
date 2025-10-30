"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaTimes,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaTicketAlt,
    FaMoneyBillWave,
    FaCheckCircle,
    FaClock,
    FaCalendarAlt,
    FaGift,
    FaSpinner,
} from "react-icons/fa";
import { apiRequest } from "@/lib/api";

interface Owner {
    id: string;
    name: string;
    email: string;
    phone: string;
}

interface Sale {
    id: number;
    txId: string;
    userId: string;
    tickets: number[];
    amount: number;
    payment: string;
    paymentValue: string;
    hasRaspadinha: boolean;
    raspadinhaUsed: boolean;
    raspadinhaValue: number;
    raffleId: number;
    raffleName: string;
    rafflePrice: number;
    createdAt: string;
    updatedAt: string;
}

interface SearchNumberResponse {
    owner: Owner;
    sale: (Sale | null)[];
}

interface SearchNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchNumberModal: React.FC<SearchNumberModalProps> = ({ isOpen, onClose }) => {
    const [numberInput, setNumberInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SearchNumberResponse | null>(null);

    const handleSearch = async () => {
        if (!numberInput.trim()) {
            setError("Por favor, digite um número");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const response = await apiRequest<SearchNumberResponse>("/search-number-action", {
            method: "POST",
            body: JSON.stringify({
                raffleId: 12,
                number: parseInt(numberInput, 10),
            }),
        });

        setLoading(false);

        if (response.error) {
            setError(response.error);
        } else if (response.data) {
            setResult(response.data);
        }
    };

    const handleClose = () => {
        setNumberInput("");
        setError(null);
        setResult(null);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
    };

    const getPaymentStatus = (payment: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
            paid: { text: "Pago", color: "bg-green-100 text-green-700 border-green-200" },
            pending: { text: "Pendente", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
            cancelled: { text: "Cancelado", color: "bg-red-100 text-red-700 border-red-200" },
        };
        return statusMap[payment] || { text: payment, color: "bg-gray-100 text-gray-700 border-gray-200" };
    };

    // Encontra a venda que contém o número pesquisado
    const sale = result?.sale.find((s) => s !== null) as Sale | undefined;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <FaSearch className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Encontrar Número</h2>
                                        <p className="text-red-100 text-sm">Busque informações sobre um número específico</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center backdrop-blur-sm"
                                    aria-label="Fechar modal"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && handleClose()}
                                >
                                    <FaTimes className="text-white text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Search Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Número da Cota
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <FaTicketAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={numberInput}
                                            onChange={(e) => setNumberInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Digite o número para buscar..."
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                    <motion.button
                                        onClick={handleSearch}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading}
                                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Buscando...
                                            </>
                                        ) : (
                                            <>
                                                <FaSearch />
                                                Buscar
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                            <FaTimes className="text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-red-700">Erro na busca</h3>
                                            <p className="text-red-600 text-sm">{error}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Results */}
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Owner Information */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                                <FaUser className="text-white text-xl" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Informações do Cliente</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaUser className="text-blue-500" />
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Nome</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{result.owner.name}</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaEnvelope className="text-blue-500" />
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">E-mail</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold break-all">{result.owner.email}</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-blue-200 md:col-span-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaPhone className="text-blue-500" />
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Telefone</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{formatPhone(result.owner.phone)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sale Information */}
                                    {sale && (
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                                    <FaTicketAlt className="text-white text-xl" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">Informações da Compra</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaTicketAlt className="text-green-500" />
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Quantidade de Cotas</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-gray-900">{sale.tickets.length}</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaMoneyBillWave className="text-green-500" />
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Valor Pago</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-gray-900">
                                                        R$ {parseFloat(sale.paymentValue).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaCheckCircle className="text-green-500" />
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Status do Pagamento</span>
                                                    </div>
                                                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getPaymentStatus(sale.payment).color}`}>
                                                        {getPaymentStatus(sale.payment).text}
                                                    </span>
                                                </div>
                                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaClock className="text-green-500" />
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">ID da Transação</span>
                                                    </div>
                                                    <p className="text-gray-900 font-semibold">#{sale.txId}</p>
                                                </div>
                                            </div>

                                            {/* Raspadinha Info */}
                                            {sale.hasRaspadinha && (
                                                <div className="bg-white rounded-xl p-4 border border-green-200 mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <FaGift className="text-green-500" />
                                                            <span className="text-sm font-semibold text-gray-700">Raspadinha</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${sale.raspadinhaUsed ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {sale.raspadinhaUsed ? 'Já Utilizada' : 'Disponível'}
                                                            </span>
                                                            <span className="text-lg font-bold text-green-600">
                                                                R$ {sale.raspadinhaValue.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Dates */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaCalendarAlt className="text-green-500" />
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Data da Compra</span>
                                                    </div>
                                                    <p className="text-gray-900 font-semibold">{formatDate(sale.createdAt)}</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaCalendarAlt className="text-green-500" />
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Última Atualização</span>
                                                    </div>
                                                    <p className="text-gray-900 font-semibold">{formatDate(sale.updatedAt)}</p>
                                                </div>
                                            </div>

                                            {/* Raffle Info */}
                                            <div className="bg-white rounded-xl p-4 border border-green-200 mt-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaTicketAlt className="text-green-500" />
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Rifa</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{sale.raffleName}</p>
                                                <p className="text-sm text-gray-600 mt-1">Preço por cota: R$ {sale.rafflePrice.toFixed(2)}</p>
                                            </div>

                                            {/* Tickets List */}
                                            <div className="bg-white rounded-xl p-4 border border-green-200 mt-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FaTicketAlt className="text-green-500" />
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                                        Números Comprados ({sale.tickets.length})
                                                    </span>
                                                </div>
                                                <div className="max-h-40 overflow-y-auto">
                                                    <div className="flex flex-wrap gap-2">
                                                        {sale.tickets.map((ticket, index) => (
                                                            <span
                                                                key={index}
                                                                className={`px-3 py-1 rounded-lg text-sm font-bold border ${
                                                                    ticket === parseInt(numberInput, 10)
                                                                        ? 'bg-red-500 text-white border-red-600'
                                                                        : 'bg-gray-50 text-gray-700 border-gray-200'
                                                                }`}
                                                            >
                                                                {ticket.toString().padStart(6, '0')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

