"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTicketAlt, FaTrophy, FaSignOutAlt, FaUser, FaEnvelope, FaPhone, FaIdCard, FaInstagram } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        onClose();
    };

    if (!user) return null;

    const stats = [
        {
            icon: FaTicketAlt,
            label: "Total de Cotas",
            value: user.totalTickets,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            icon: FaTicketAlt,
            label: "Cotas Ativas",
            value: user.activeTickets,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
        },
        {
            icon: FaTrophy,
            label: "Prêmios Ganhos",
            value: user.wonPrizes,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
    ];

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
                                <h3 className="text-lg font-semibold text-gray-800">Estatísticas</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {stats.map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`${stat.bgColor} rounded-xl p-4 flex items-center justify-between`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                                                    <stat.icon className="text-white" />
                                                </div>
                                                <span className="text-gray-700 font-medium">{stat.label}</span>
                                            </div>
                                            <span className={`text-2xl font-bold ${stat.textColor}`}>
                                                {stat.value}
                                            </span>
                                        </motion.div>
                                    ))}
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

