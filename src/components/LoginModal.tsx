"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEnvelope, FaLock, FaUser, FaPhone, FaIdCard, FaInstagram, FaExclamationCircle } from "react-icons/fa";
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

// Utilitário para formatar WhatsApp
const formatWhatsApp = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers.length > 0 ? `(${numbers}` : numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// Validação de email
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validação de senha
const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
        return { isValid: false, message: "A senha deve ter no mínimo 6 caracteres" };
    }
    if (password.length > 50) {
        return { isValid: false, message: "A senha deve ter no máximo 50 caracteres" };
    }
    return { isValid: true, message: "" };
};

interface ValidationErrors {
    name?: string;
    email?: string;
    cpf?: string;
    whatsapp?: string;
    instagram?: string;
    password?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Campos de Login
    const [cpfLogin, setCpfLogin] = useState("");
    const [password, setPassword] = useState("");

    // Campos de Registro
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [instagram, setInstagram] = useState("");
    const [passwordRegister, setPasswordRegister] = useState("");

    // Erros de validação
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const { login, register, isLoading: authLoading, error: authError, clearError, user } = useAuth();

    // Validar todos os campos de registro
    const validateRegistrationForm = (): boolean => {
        const errors: ValidationErrors = {};

        // Validar nome
        if (!name.trim()) {
            errors.name = "Nome é obrigatório";
        } else if (name.trim().length < 3) {
            errors.name = "Nome deve ter no mínimo 3 caracteres";
        }

        // Validar email
        if (!email.trim()) {
            errors.email = "E-mail é obrigatório";
        } else if (!validateEmail(email)) {
            errors.email = "E-mail inválido";
        }

        // Validar CPF
        if (!cpf.trim()) {
            errors.cpf = "CPF é obrigatório";
        } else if (!validateCpf(cpf)) {
            errors.cpf = "CPF inválido";
        }

        // Validar WhatsApp
        const whatsappNumbers = whatsapp.replace(/\D/g, "");
        if (!whatsapp.trim()) {
            errors.whatsapp = "WhatsApp é obrigatório";
        } else if (whatsappNumbers.length < 10 || whatsappNumbers.length > 11) {
            errors.whatsapp = "WhatsApp inválido";
        }

        // Validar Instagram
        if (!instagram.trim()) {
            errors.instagram = "Instagram é obrigatório";
        } else if (instagram.trim().length < 3) {
            errors.instagram = "Instagram deve ter no mínimo 3 caracteres";
        }

        // Validar senha
        const passwordValidation = validatePassword(passwordRegister);
        if (!passwordRegister) {
            errors.password = "Senha é obrigatória";
        } else if (!passwordValidation.isValid) {
            errors.password = passwordValidation.message;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccessMessage(null);
        setValidationErrors({});

        try {
            if (isLogin) {
                // Validação básica para login
                const cpfNumbers = unformatCpf(cpfLogin);
                if (!validateCpf(cpfLogin)) {
                    setValidationErrors({ cpf: "CPF inválido" });
                    return;
                }

                await login(cpfNumbers, password);
                handleClearFields();
                onClose();
            } else {
                // Validar formulário de registro
                if (!validateRegistrationForm()) {
                    return;
                }

                // Remover formatação dos campos antes de enviar
                const cpfNumbers = unformatCpf(cpf);
                const whatsappNumbers = whatsapp.replace(/\D/g, "");
                const instagramClean = instagram.trim().replace(/^@/, "");

                // Guardar CPF e senha antes de registrar
                const registrationCpf = cpfNumbers;
                const registrationPassword = passwordRegister;

                await register(
                    name.trim(),
                    email.trim(),
                    cpfNumbers,
                    whatsappNumbers,
                    instagramClean,
                    passwordRegister
                );

                // Verificar se o usuário foi autenticado após o registro
                // Se user ainda for null, significa que a API retornou apenas mensagem de sucesso
                if (!user) {
                    // Redirecionar para o login com os dados preenchidos
                    setSuccessMessage("Conta criada com sucesso! Agora faça login.");
                    setCpfLogin(formatCpf(registrationCpf));
                    setPassword(registrationPassword);
                    setIsLogin(true);
                    // Limpar apenas os campos de registro
                    setName("");
                    setEmail("");
                    setCpf("");
                    setWhatsapp("");
                    setInstagram("");
                    setPasswordRegister("");
                } else {
                    // Login automático funcionou, fechar modal
                    handleClearFields();
                    onClose();
                }
            }
        } catch (err) {
            // Erro já está sendo tratado no AuthContext
            console.error("Erro ao processar:", err);
        }
    };

    const handleClearFields = () => {
        setCpfLogin("");
        setPassword("");
        setName("");
        setEmail("");
        setCpf("");
        setWhatsapp("");
        setInstagram("");
        setPasswordRegister("");
        setSuccessMessage(null);
        setValidationErrors({});
    };

    const handleClose = () => {
        handleClearFields();
        clearError();
        onClose();
    };

    const handleToggleMode = () => {
        setIsLogin(!isLogin);
        clearError();
        setSuccessMessage(null);
        setValidationErrors({});
    };

    // Handlers com formatação e validação
    const handleCpfLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpf(e.target.value);
        setCpfLogin(formatted);
        if (validationErrors.cpf) {
            setValidationErrors({ ...validationErrors, cpf: undefined });
        }
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpf(e.target.value);
        setCpf(formatted);
        if (validationErrors.cpf) {
            setValidationErrors({ ...validationErrors, cpf: undefined });
        }
    };

    const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatWhatsApp(e.target.value);
        setWhatsapp(formatted);
        if (validationErrors.whatsapp) {
            setValidationErrors({ ...validationErrors, whatsapp: undefined });
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (validationErrors.name) {
            setValidationErrors({ ...validationErrors, name: undefined });
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (validationErrors.email) {
            setValidationErrors({ ...validationErrors, email: undefined });
        }
    };

    const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInstagram(e.target.value);
        if (validationErrors.instagram) {
            setValidationErrors({ ...validationErrors, instagram: undefined });
        }
    };

    const handlePasswordRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordRegister(e.target.value);
        if (validationErrors.password) {
            setValidationErrors({ ...validationErrors, password: undefined });
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
                                <h2 className="text-2xl font-bold">
                                    {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
                                </h2>
                                <p className="text-red-100 text-sm mt-1">
                                    {isLogin
                                        ? "Entre para acessar suas rifas"
                                        : "Cadastre-se para participar"}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Campos de Login */}
                                {isLogin ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CPF
                                            </label>
                                            <div className="relative">
                                                <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={cpfLogin}
                                                    onChange={handleCpfLoginChange}
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
                                    </>
                                ) : (
                                    /* Campos de Registro */
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nome completo
                                            </label>
                                            <div className="relative">
                                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={handleNameChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${validationErrors.name ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    placeholder="Seu nome completo"
                                                    required
                                                />
                                            </div>
                                            {validationErrors.name && (
                                                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                                    <FaExclamationCircle className="flex-shrink-0" />
                                                    <span>{validationErrors.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                E-mail
                                            </label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={handleEmailChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${validationErrors.email ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    placeholder="seu@email.com"
                                                    required
                                                />
                                            </div>
                                            {validationErrors.email && (
                                                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                                    <FaExclamationCircle className="flex-shrink-0" />
                                                    <span>{validationErrors.email}</span>
                                                </div>
                                            )}
                                        </div>

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
                                                WhatsApp
                                            </label>
                                            <div className="relative">
                                                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={whatsapp}
                                                    onChange={handleWhatsAppChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${validationErrors.whatsapp ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    placeholder="(11) 99999-9999"
                                                    maxLength={15}
                                                    required
                                                />
                                            </div>
                                            {validationErrors.whatsapp && (
                                                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                                    <FaExclamationCircle className="flex-shrink-0" />
                                                    <span>{validationErrors.whatsapp}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Instagram
                                            </label>
                                            <div className="relative">
                                                <FaInstagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={instagram}
                                                    onChange={handleInstagramChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${validationErrors.instagram ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    placeholder="@seuinstagram"
                                                    required
                                                />
                                            </div>
                                            {validationErrors.instagram && (
                                                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                                    <FaExclamationCircle className="flex-shrink-0" />
                                                    <span>{validationErrors.instagram}</span>
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
                                                    value={passwordRegister}
                                                    onChange={handlePasswordRegisterChange}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${validationErrors.password ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                            {validationErrors.password && (
                                                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                                    <FaExclamationCircle className="flex-shrink-0" />
                                                    <span>{validationErrors.password}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm font-medium"
                                    >
                                        {successMessage}
                                    </motion.div>
                                )}

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
                                    {authLoading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
                                </motion.button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleToggleMode}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                                    >
                                        {isLogin
                                            ? "Não tem conta? Cadastre-se"
                                            : "Já tem conta? Faça login"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

