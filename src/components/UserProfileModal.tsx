"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTicketAlt, FaSignOutAlt, FaEnvelope, FaIdCard, FaInstagram, FaReceipt, FaUser, FaGift } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { vendasService } from "@/services/vendas.service";
import { Order } from "@/types";
import { ScratchCardModal } from "./ScratchCardModal";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = "profile" | "orders";

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("orders");
    const [showScratchCard, setShowScratchCard] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isOpen) return;

            setLoadingOrders(true);
            try {
                const result = await vendasService.obterPedidos();
                if (result.data) {
                    setOrders(result.data);
                }
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        onClose();
    };

    const getStatusBadgeStyles = (statusColor: string) => {
        if (statusColor === "green") {
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        }
        if (statusColor === "#EC7F00") {
            return "bg-orange-50 text-orange-700 border border-orange-200";
        }
        return "bg-red-50 text-red-700 border border-red-200";
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header minimalista */}
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-6 pt-6 pb-20">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 transition-all shadow-sm hover:shadow"
                                    aria-label="Fechar modal"
                                >
                                    <FaTimes size={14} />
                                </button>

                                <div className="flex flex-col items-center text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1, type: "spring" }}
                                        className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3"
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                                    <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="relative -mt-12 px-6 mb-6">
                                <div className="bg-white rounded-2xl shadow-lg p-1.5 flex gap-1">
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${activeTab === "profile"
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                    >
                                        <FaUser size={14} />
                                        Perfil
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("orders")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${activeTab === "orders"
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                    >
                                        <FaReceipt size={14} />
                                        Pedidos
                                        {orders.length > 0 && (
                                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === "orders" ? "bg-white text-slate-900" : "bg-slate-200 text-slate-700"
                                                }`}>
                                                {orders.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="px-6 pb-6">
                                <AnimatePresence mode="wait">
                                    {activeTab === "profile" ? (
                                        <motion.div
                                            key="profile"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            {/* Informações do perfil */}
                                            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                                                <div className="flex items-center gap-3 group">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-300 transition-colors">
                                                        <FaEnvelope size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-500 font-medium">Email</p>
                                                        <p className="text-sm text-slate-900 truncate">{user.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 group">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-300 transition-colors">
                                                        <FaIdCard size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-500 font-medium">CPF</p>
                                                        <p className="text-sm text-slate-900">{user.cpf}</p>
                                                    </div>
                                                </div>

                                                {user.instagram && (
                                                    <div className="flex items-center gap-3 group">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-300 transition-colors">
                                                            <FaInstagram size={16} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-slate-500 font-medium">Instagram</p>
                                                            <p className="text-sm text-slate-900">{user.instagram}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botão de logout */}
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3.5 px-4 rounded-xl font-semibold hover:bg-red-100 transition-colors border border-red-100"
                                            >
                                                <FaSignOutAlt size={16} />
                                                Sair da conta
                                            </motion.button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="orders"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-3"
                                        >
                                            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                {loadingOrders ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <div className="relative">
                                                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-red-600"></div>
                                                        </div>
                                                    </div>
                                                ) : orders.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                                            <FaReceipt className="text-slate-400 text-2xl" />
                                                        </div>
                                                        <p className="text-slate-600 font-medium mb-1">Nenhum pedido ainda</p>
                                                        <p className="text-sm text-slate-400">Seus pedidos aparecerão aqui</p>
                                                    </div>
                                                ) : (
                                                    orders.map((order, index) => (
                                                        <motion.div
                                                            key={order.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="bg-slate-50 rounded-2xl p-4 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                                                        >
                                                            <div className="space-y-3">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 flex-1">
                                                                        {order.title}
                                                                    </h4>
                                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${getStatusBadgeStyles(order.statusColor)}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2 text-slate-600">
                                                                        <FaTicketAlt className="text-red-500" size={14} />
                                                                        <span className="text-sm font-medium">{order.coupon} {order.coupon === "1" ? "cota" : "cotas"}</span>
                                                                    </div>
                                                                    <span className="font-bold text-emerald-600 text-sm">
                                                                        R$ {order.price.toFixed(2)}
                                                                    </span>
                                                                </div>

                                                                <div className="text-xs text-slate-500">
                                                                    {order.date}
                                                                </div>

                                                                {order.numbers.length > 0 && (
                                                                    <div className="pt-3 border-t border-slate-200">
                                                                        <p className="text-xs text-slate-600 mb-2 font-medium">
                                                                            Números sorteados ({order.numbers.length})
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                                                            {order.numbers.map((number, idx) => (
                                                                                <span
                                                                                    key={idx}
                                                                                    className="px-2.5 py-1 bg-white rounded-lg text-xs font-mono font-semibold text-slate-700 border border-slate-200"
                                                                                >
                                                                                    {number}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {order.raspadinhaValue > 0 && order.hasRaspadinha && !order.raspadinhaUsed && (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => {
                                                                            setSelectedSaleId(order.id);
                                                                            setShowScratchCard(true);
                                                                        }}
                                                                        className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                                                                        aria-label="Usar raspadinha"
                                                                    >
                                                                        <FaGift size={14} />
                                                                        Usar Raspadinha
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Modal de Raspadinha */}
                    <ScratchCardModal
                        isOpen={showScratchCard}
                        onClose={() => {
                            setShowScratchCard(false);
                            setSelectedSaleId(null);
                        }}
                        saleId={selectedSaleId}
                    />

                    <style jsx global>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 3px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}</style>
                </>
            )}
        </AnimatePresence>
    );
};

