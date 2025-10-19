"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTicketAlt, FaSignOutAlt, FaEnvelope, FaIdCard, FaInstagram, FaReceipt } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { vendasService } from "@/services/vendas.service";
import { Order } from "@/types";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-6">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                    aria-label="Fechar modal"
                                >
                                    <FaTimes size={20} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 text-2xl font-bold shadow-lg"
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </motion.div>
                                    <h2 className="text-2xl uppercase font-bold text-white">{user.name}</h2>
                                </div>
                            </div>

                            <div className="px-6 mt-4 mb-6">
                                <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <FaEnvelope className="text-gray-400" />
                                        <span className="text-gray-700">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <FaIdCard className="text-gray-400" />
                                        <span className="text-gray-700">{user.cpf}</span>
                                    </div>
                                    {user.instagram && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FaInstagram className="text-gray-400" />
                                            <span className="text-gray-700">{user.instagram}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 pb-6 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Meus Pedidos</h3>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {loadingOrders ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaReceipt className="mx-auto text-4xl mb-2 opacity-50" />
                                            <p>Nenhum pedido encontrado</p>
                                        </div>
                                    ) : (
                                        orders.map((order, index) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
                                                            {order.title}
                                                        </h4>
                                                        <span
                                                            className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                                                            style={{
                                                                backgroundColor: order.statusColor === "green" ? "#dcfce7" : order.statusColor === "#EC7F00" ? "#fff7ed" : "#fee2e2",
                                                                color: order.statusColor === "green" ? "#16a34a" : order.statusColor === "#EC7F00" ? "#ea580c" : "#dc2626",
                                                            }}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <FaTicketAlt className="text-red-500" />
                                                            <span className="font-medium">{order.coupon} cotas</span>
                                                        </div>
                                                        <span className="font-bold text-green-600">
                                                            R$ {order.price.toFixed(2)}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {order.date}
                                                    </div>

                                                    {order.numbers.length > 0 && (
                                                        <div className="pt-2 border-t border-gray-100">
                                                            <p className="text-xs text-gray-600 mb-2 font-medium">
                                                                Números: ({order.numbers.length})
                                                            </p>
                                                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                                                {order.numbers.map((number, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700"
                                                                    >
                                                                        {number}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>

                                <div className="pt-4 space-y-3">
                                    {/* <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                    >
                                        <FaUser />
                                        Editar Perfil
                                    </motion.button> */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                    >
                                        <FaSignOutAlt />
                                        Sair
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

