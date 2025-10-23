"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaLock, FaIdCard, FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Utilitário para formatar CPF
const formatCpf = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

// Utilitário para remover formatação
const unformatCpf = (value: string): string => {
    return value.replace(/\D/g, "");
};

// Validação de CPF
const validateCpf = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, "");

    if (numbers.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;

    return true;
};

interface ValidationErrors {
    cpf?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    // Campos de Login
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");

    // Erros de validação
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const { login, isLoading: authLoading, error: authError, clearError } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setValidationErrors({});

        // Validação básica para login
        const cpfNumbers = unformatCpf(cpf);
        if (!validateCpf(cpf)) {
            setValidationErrors({ cpf: "CPF inválido" });
            return;
        }

        try {
            await login(cpfNumbers, password);
            handleClearFields();
            onClose();
        } catch (err) {
            // Erro já está sendo tratado no AuthContext
            console.error("Erro ao processar:", err);
        }
    };

    const handleClearFields = () => {
        setCpf("");
        setPassword("");
        setValidationErrors({});
    };

    const handleClose = () => {
        handleClearFields();
        clearError();
        onClose();
    };

    // Handler com formatação e validação
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpf(e.target.value);
        setCpf(formatted);
        if (validationErrors.cpf) {
            setValidationErrors({ ...validationErrors, cpf: undefined });
        }
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
                            <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-6 text-white">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                    aria-label="Fechar modal"
                                >
                                    <FaTimes size={20} />
                                </button>
                                <h2 className="text-2xl font-bold">Bem-vindo de volta!</h2>
                                <p className="text-red-100 text-sm mt-1">Entre para acessar suas rifas</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CPF
                                    </label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={cpf}
                                            onChange={handleCpfChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${validationErrors.cpf ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                            required
                                        />
                                    </div>
                                    {validationErrors.cpf && (
                                        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                            <FaExclamationCircle className="flex-shrink-0" />
                                            <span>{validationErrors.cpf}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {authError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm"
                                    >
                                        {authError}
                                    </motion.div>
                                )}

                                <motion.button
                                    whileHover={{ scale: authLoading ? 1 : 1.02 }}
                                    whileTap={{ scale: authLoading ? 1 : 0.98 }}
                                    type="submit"
                                    disabled={authLoading}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {authLoading ? "Processando..." : "Entrar"}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

