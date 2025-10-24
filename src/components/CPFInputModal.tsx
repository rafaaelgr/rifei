"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaIdCard } from "react-icons/fa";

interface CPFInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (cpf: string) => void;
}

export const CPFInputModal: React.FC<CPFInputModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [cpf, setCpf] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const formatCPF = (value: string): string => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return value;
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setCpf(formatted);
        setError("");
    };

    const validateCPF = (cpf: string): boolean => {
        const numbers = cpf.replace(/\D/g, "");
        return numbers.length === 11;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCPF(cpf)) {
            setError("CPF inválido. Digite os 11 dígitos.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const cpfNumbers = cpf.replace(/\D/g, "");
            onSuccess(cpfNumbers);
        } catch (err) {
            setError("Erro ao buscar pedidos. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCpf("");
        setError("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-6 pt-6 pb-8">
                                <button
                                    onClick={handleClose}
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
                                        className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg mb-3"
                                    >
                                        <FaIdCard size={24} />
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-slate-900">Ver Meus Números</h2>
                                    <p className="text-sm text-slate-500 mt-1">Digite seu CPF para consultar</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-2">
                                            CPF
                                        </label>
                                        <input
                                            type="text"
                                            id="cpf"
                                            value={cpf}
                                            onChange={handleCPFChange}
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                            className={`w-full px-4 py-3 rounded-xl border ${error ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                                                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400`}
                                            disabled={loading}
                                            autoFocus
                                        />
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-600 text-xs mt-2 flex items-center gap-1"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </div>

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: loading ? 1 : 1.02 }}
                                        whileTap={{ scale: loading ? 1 : 0.98 }}
                                        disabled={loading}
                                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${loading
                                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg"
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Buscando...
                                            </span>
                                        ) : (
                                            "Consultar Pedidos"
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

