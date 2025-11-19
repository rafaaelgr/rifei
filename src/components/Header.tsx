"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { ScratchCardModal } from "./ScratchCardModal";
import { TermsModal } from "./TermsModal";
import { FaUser } from "react-icons/fa";

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
                        ? "#151617"
                        : "#151617",
                    backdropFilter: isScrolled ? "blur(16px) saturate(180%)" : "blur(0px)",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="sticky top-0 right-0 z-50 border-b-2 border-[#313238]"
            >
                <motion.div
                    animate={controls}
                    className="max-w-4xl mx-auto px-6 flex items-center justify-between"
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center gap-3"
                    >
                        <h1 className="text-xl tracking-wider">JOIAS RARAS</h1>
                    </motion.div>

                    <div className="flex items-center">
                        <button className="text-sm px-5 text-gray-300 hover:text-white bg-[#313238] border border-[#313238] rounded-md p-2 uppercase">
                            <span>contato</span>
                        </button>
                    </div>
                </motion.div>
            </motion.header>

            <ScratchCardModal isOpen={isScratchCardOpen} onClose={() => setIsScratchCardOpen(false)} saleId={null} />
            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </>
    );
};