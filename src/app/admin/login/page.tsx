"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLock, FaIdCard, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useRouter } from "next/navigation";

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

export default function AdminLoginPage() {
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const { login, isLoading, error, clearError, isAuthenticated } = useAdminAuth();
    const router = useRouter();

    // Redirecionar se já estiver autenticado
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/admin");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setValidationErrors({});

        // Validação básica
        const cpfNumbers = unformatCpf(cpf);
        if (!validateCpf(cpf)) {
            setValidationErrors({ cpf: "CPF inválido" });
            return;
        }

        try {
            await login(cpfNumbers, password);
        } catch (err) {
            console.error("Erro ao processar login:", err);
        }
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpf(e.target.value);
        setCpf(formatted);
        if (validationErrors.cpf) {
            setValidationErrors({ ...validationErrors, cpf: undefined });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 text-white text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                    >
                        <FaLock className="text-4xl" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
                    <p className="text-red-100 text-sm">Entre com suas credenciais para acessar</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* CPF Field */}
                    <div>
                        <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-2">
                            CPF
                        </label>
                        <div className="relative">
                            <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                id="cpf"
                                value={cpf}
                                onChange={handleCpfChange}
                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${validationErrors.cpf ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        {validationErrors.cpf && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mt-2 text-red-600 text-xs"
                            >
                                <FaExclamationCircle />
                                <span>{validationErrors.cpf}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                        >
                            <FaExclamationCircle className="flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            <>
                                <FaLock />
                                Entrar no Painel
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-xs text-gray-500">
                        Acesso restrito apenas para administradores
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

