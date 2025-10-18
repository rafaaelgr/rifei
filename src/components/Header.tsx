"use client";

import React, { useState } from "react";
import { FaBook, FaUser, FaGift } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "./LoginModal";
import { UserProfileModal } from "./UserProfileModal";
import { ScratchCardModal } from "./ScratchCardModal";

export const Header = () => {
    const { user, isAuthenticated } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isScratchCardOpen, setIsScratchCardOpen] = useState(false);

    const handleAvatarClick = () => {
        if (isAuthenticated) {
            setIsProfileModalOpen(true);
        } else {
            setIsLoginModalOpen(true);
        }
    };

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 py-5"
            >
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-xl font-bold text-black">Joias Raras</span>
                    </motion.div>

                    <motion.nav
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="hidden md:flex items-center gap-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                            aria-label="My offers"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Meus números</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                            aria-label="Bonus"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            <span>Ganhadores</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                            aria-label="Withdraw"
                        >
                            <FaBook />
                            <span>Termos e condições</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsScratchCardOpen(true)}
                            className="flex items-center gap-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                            aria-label="Resgatar prêmio"
                        >
                            <FaGift />
                            <span>Resgatar</span>
                        </motion.button>
                    </motion.nav>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex items-center gap-3"
                    >
                        {isAuthenticated && user ? (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 bg-red-600/20 border text-sm border-red-500/30 rounded-full px-3 py-2"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-4 h-4 bg-red-500 rounded-full"
                                ></motion.div>
                                <span className="text-black font-semibold uppercase">
                                    {user.totalTickets} cotas
                                </span>
                            </motion.div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsLoginModalOpen(true)}
                                className="flex items-center gap-2 bg-red-600/20 border text-sm border-red-500/30 rounded-full px-4 py-2 hover:bg-red-600/30 transition-colors"
                            >
                                <FaUser className="text-red-600" />
                                <span className="text-black font-semibold">Entrar</span>
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAvatarClick}
                            className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center border-2 border-red-800/40 cursor-pointer"
                            aria-label={isAuthenticated ? "Abrir perfil" : "Fazer login"}
                        >
                            {isAuthenticated && user ? (
                                user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                )
                            ) : (
                                <FaUser className="text-white text-sm" />
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </motion.header>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <ScratchCardModal isOpen={isScratchCardOpen} onClose={() => setIsScratchCardOpen(false)} />
        </>
    );
};


