"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { ScratchCardModal } from "./ScratchCardModal";
import { TermsModal } from "./TermsModal";

export const Header = () => {
    const [isScratchCardOpen, setIsScratchCardOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
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
                </motion.div>
            </motion.header>

            <ScratchCardModal isOpen={isScratchCardOpen} onClose={() => setIsScratchCardOpen(false)} saleId={null} />
            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </>
    );
};