"use client";

import { LoginModal } from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { UserProfileModal } from "./UserProfileModal";
import { ScratchCardModal } from "./ScratchCardModal";
import { FaUser, FaTrophy, FaTicketAlt, FaFileContract } from "react-icons/fa";

export const Header = () => {
    const { user, isAuthenticated } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isScratchCardOpen, setIsScratchCardOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const controls = useAnimation();

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;

            if (scrollPosition > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isScrolled) {
            controls.start({
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                transition: { duration: 0.3, ease: "easeInOut" }
            });
        } else {
            controls.start({
                paddingTop: "1.25rem",
                paddingBottom: "1.25rem",
                transition: { duration: 0.3, ease: "easeInOut" }
            });
        }
    }, [isScrolled, controls]);

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
                animate={{
                    y: 0,
                    opacity: 1,
                    background: isScrolled
                        ? "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 249, 249, 0.95) 100%)"
                        : "linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(254, 249, 249, 0) 100%)",
                    backdropFilter: isScrolled ? "blur(16px) saturate(180%)" : "blur(0px)",
                    boxShadow: isScrolled
                        ? "0 8px 32px 0 rgba(220, 38, 38, 0.1), 0 2px 8px 0 rgba(0, 0, 0, 0.05)"
                        : "0 0 0 0 rgba(0, 0, 0, 0)",
                    borderBottom: isScrolled ? "1px solid rgba(220, 38, 38, 0.1)" : "1px solid transparent"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-50"
            >
                <motion.div
                    animate={controls}
                    className="max-w-[1400px] mx-auto px-6 flex items-center justify-between"
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center gap-3"
                    >
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 bg-cover"
                            style={{ backgroundImage: "url('/pipa.png')" }}
                        >
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent leading-tight">
                                Joias Raras
                            </span>
                            <span className="text-[10px] font-medium text-red-600/70 -mt-1 tracking-wide">
                                Sorteios Premium
                            </span>
                        </div>
                    </motion.div>

                    <motion.nav
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="hidden md:flex items-center gap-2"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-red-600 cursor-pointer transition-all duration-300"
                            aria-label="Meus números"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FaTicketAlt className="relative z-10 text-lg" />
                            <span className="relative z-10 font-medium text-sm">Meus números</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-red-600 cursor-pointer transition-all duration-300"
                            aria-label="Ganhadores"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-amber-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FaTrophy className="relative z-10 text-lg" />
                            <span className="relative z-10 font-medium text-sm">Ganhadores</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-red-600 cursor-pointer transition-all duration-300"
                            aria-label="Termos e condições"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FaFileContract className="relative z-10 text-lg" />
                            <span className="relative z-10 font-medium text-sm">Termos</span>
                        </motion.button>
                    </motion.nav>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex items-center gap-3"
                    >
                        {!isAuthenticated && (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsLoginModalOpen(true)}
                                className="relative flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 border border-red-400/30 rounded-xl px-5 py-2.5 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                            >
                                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                <FaUser className="text-white relative z-10" />
                                <span className="text-white font-semibold text-sm relative z-10">Entrar</span>
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAvatarClick}
                            className="relative w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center border-3 border-white cursor-pointer shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300"
                            aria-label={isAuthenticated ? "Abrir perfil" : "Fazer login"}
                        >
                            {isAuthenticated && user ? (
                                <>
                                    <motion.div
                                        className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-75 blur-sm"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="relative z-10 w-full h-full rounded-full object-cover border-2 border-white"
                                        />
                                    ) : (
                                        <span className="relative z-10 text-white text-lg font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                    <motion.div
                                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-20"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </>
                            ) : (
                                <FaUser className="text-white text-lg relative z-10" />
                            )}
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.header>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <ScratchCardModal isOpen={isScratchCardOpen} onClose={() => setIsScratchCardOpen(false)} />
        </>
    );
};