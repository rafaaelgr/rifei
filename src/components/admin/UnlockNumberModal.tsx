"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUnlock, FaTimes, FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { apiRequest } from "@/lib/api";

interface UnlockNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UnlockResponse {
    message: string;
    numbers: number[];
}

export const UnlockNumberModal: React.FC<UnlockNumberModalProps> = ({ isOpen, onClose }) => {
    const [number, setNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UnlockResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setNumber("");
        setResult(null);
        setError(null);
        onClose();
    };

    const handleUnlock = async () => {
        if (!number) {
            setError("Por favor, insira um número");
            return;
        }

        const numericValue = parseInt(number);
        if (isNaN(numericValue) || numericValue < 0) {
            setError("Por favor, insira um número válido");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const response = await apiRequest<UnlockResponse>("/unlock-number", {
            method: "POST",
            body: JSON.stringify({
                id: 12,
                number: numericValue,
            }),
        });

        setLoading(false);

        if (response.error) {
            setError(response.error);
        } else if (response.data) {
            setResult(response.data);
            setNumber("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !loading && !result) {
            handleUnlock();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <FaUnlock className="text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Desbloquear Número</h2>
                                        <p className="text-white/80 text-sm">Libere um número específico</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                                    aria-label="Fechar modal"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && handleClose()}
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {!result ? (
                                <>
                                    {/* Input */}
                                    <div className="mb-6">
                                        <label htmlFor="number-input" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Número para desbloquear
                                        </label>
                                        <input
                                            id="number-input"
                                            type="number"
                                            value={number}
                                            onChange={(e) => {
                                                setNumber(e.target.value);
                                                setError(null);
                                            }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Digite o número"
                                            disabled={loading}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl font-bold disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
                                        >
                                            <FaExclamationCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-red-700 mb-1">Erro</h4>
                                                <p className="text-sm text-red-600">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <motion.button
                                            onClick={handleClose}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancelar
                                        </motion.button>
                                        <motion.button
                                            onClick={handleUnlock}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={loading || !number}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    Desbloqueando...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUnlock />
                                                    Desbloquear
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Success Result */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                        >
                                            <FaCheckCircle className="text-4xl text-green-500" />
                                        </motion.div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {result.message}
                                        </h3>

                                        {result.numbers && result.numbers.length > 0 && (
                                            <>
                                                <p className="text-gray-600 mb-4">Números bloqueados:</p>
                                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                                    {result.numbers.map((num) => (
                                                        <motion.div
                                                            key={num}
                                                            initial={{ opacity: 0, scale: 0 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.3 }}
                                                            className="w-16 h-16 bg-gray-100 border-2 border-gray-300 rounded-xl flex items-center justify-center"
                                                        >
                                                            <span className="text-2xl font-bold text-gray-900">
                                                                {num.toString().padStart(2, '0')}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        <motion.button
                                            onClick={handleClose}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                        >
                                            Fechar
                                        </motion.button>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

