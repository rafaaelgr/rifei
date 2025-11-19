"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaLock, FaGift, FaBullseye, FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdPix } from "react-icons/md";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    quantity: number;
    totalAmount: string;
    productName: string;
    productImage: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    quantity,
    totalAmount,
    productName,
    productImage,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [fullName, setFullName] = useState("");
    const [nameError, setNameError] = useState("");
    const [saveInfo, setSaveInfo] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [pixCode, setPixCode] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);

    // Reset ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setPhone("");
            setPhoneError("");
            setFullName("");
            setNameError("");
            setSaveInfo(false);
            setShowPayment(false);
            setPixCode("");
            setCopySuccess(false);
        }
    }, [isOpen]);

    // Formatar telefone enquanto digita
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");

        if (numbers.length <= 2) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else if (numbers.length <= 11) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        }
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setPhone(formatted);
        setPhoneError("");
    };

    // Validar telefone brasileiro
    const validatePhone = () => {
        const numbers = phone.replace(/\D/g, "");

        if (numbers.length === 0) {
            setPhoneError("Telefone é obrigatório");
            return false;
        }

        if (numbers.length < 10) {
            setPhoneError("Telefone incompleto");
            return false;
        }

        if (numbers.length === 10) {
            // Formato: (XX) XXXX-XXXX
            const ddd = parseInt(numbers.slice(0, 2));
            if (ddd < 11 || ddd > 99) {
                setPhoneError("DDD inválido");
                return false;
            }
        } else if (numbers.length === 11) {
            // Formato: (XX) 9XXXX-XXXX
            const ddd = parseInt(numbers.slice(0, 2));
            const firstDigit = numbers[2];

            if (ddd < 11 || ddd > 99) {
                setPhoneError("DDD inválido");
                return false;
            }

            if (firstDigit !== "9") {
                setPhoneError("Celular deve começar com 9");
                return false;
            }
        } else {
            setPhoneError("Telefone inválido");
            return false;
        }

        setPhoneError("");
        return true;
    };

    // Validar nome completo
    const validateName = () => {
        const trimmedName = fullName.trim();

        if (trimmedName.length === 0) {
            setNameError("Nome completo é obrigatório");
            return false;
        }

        if (trimmedName.length < 3) {
            setNameError("Nome muito curto");
            return false;
        }

        // Verificar se tem pelo menos nome e sobrenome
        const nameParts = trimmedName.split(" ").filter(part => part.length > 0);
        if (nameParts.length < 2) {
            setNameError("Digite seu nome completo");
            return false;
        }

        // Verificar se contém apenas letras e espaços
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName)) {
            setNameError("Nome deve conter apenas letras");
            return false;
        }

        setNameError("");
        return true;
    };

    const handleContinueStep1 = () => {
        if (validatePhone()) {
            setCurrentStep(2);
        }
    };

    const handleContinueStep2 = () => {
        if (validateName()) {
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinalizePurchase = () => {
        // Gerar código PIX (aqui você faria a chamada à API real)
        const mockPixCode = "00020101021226830014BR.GOV.BCB.PIX2561qrcodespix.sejaefi.com.br/v2/d7c0a4f8-7d3e-4c3e-9b5a-1234567890ab5204000053039865802BR5925NOME DO RECEBEDOR AQUI6009SAO PAULO62070503***63041D3D";
        setPixCode(mockPixCode);
        setShowPayment(true);
    };

    const handleCopyPixCode = async () => {
        try {
            await navigator.clipboard.writeText(pixCode);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (err) {
            console.error("Erro ao copiar:", err);
        }
    };

    if (!isOpen) return null;

    const steps = [
        { number: 1, label: "Telefone" },
        { number: 2, label: "Dados" },
        { number: 3, label: "Revisar" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div
                        className="fixed inset-0 z-[70] overflow-y-auto"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) onClose();
                        }}
                    >
                        <div
                            className="flex min-h-full items-center justify-center p-4"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) onClose();
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-5xl mx-auto my-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Botão Fechar */}
                                <button
                                    onClick={onClose}
                                    className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
                                >
                                    <IoMdClose size={28} />
                                </button>

                                {/* Tela de Pagamento PIX */}
                                {showPayment ? (
                                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                                        {/* Coluna Esquerda - Instruções PIX */}
                                        <div className="flex-1 bg-[#25282c] max-w-2xl max-h-[50vh] overflow-y-auto rounded-2xl p-4 sm:p-6 shadow-2xl border border-[#313238]">
                                            {/* Banner Amarelo */}
                                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
                                                <div className="bg-white/20 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                                    </svg>
                                                </div>
                                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Quase lá!</h2>
                                                <p className="text-white/90 text-xs sm:text-sm">
                                                    Efetue o pagamento do seu pedido para garantir a sua participação
                                                </p>
                                            </div>

                                            {/* Copie o código para pagar */}
                                            <div className="mb-4 sm:mb-6">
                                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                    <div className="bg-[#313238] p-1.5 sm:p-2 rounded-lg">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-base sm:text-xl font-bold text-white">Copie o código para pagar</h3>
                                                </div>

                                                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="bg-[#313238] w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs sm:text-base">
                                                            1
                                                        </div>
                                                        <p className="text-gray-300 text-xs sm:text-sm pt-0.5 sm:pt-1">Abra o aplicativo do seu banco.</p>
                                                    </div>
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="bg-[#313238] w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs sm:text-base">
                                                            2
                                                        </div>
                                                        <p className="text-gray-300 text-xs sm:text-sm pt-0.5 sm:pt-1">Escolha pagar via Pix, e clique em código copia e cola.</p>
                                                    </div>
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="bg-[#313238] w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs sm:text-base">
                                                            3
                                                        </div>
                                                        <p className="text-gray-300 text-xs sm:text-sm pt-0.5 sm:pt-1">Cole o código abaixo:</p>
                                                    </div>
                                                </div>

                                                <div className="bg-[#313238] rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 border border-[#3a3b42]">
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-gray-400 text-xs truncate font-mono">
                                                            {pixCode}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={handleCopyPixCode}
                                                        className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${copySuccess
                                                            ? "bg-green-500 text-white"
                                                            : "bg-orange-500 hover:bg-orange-600 text-white"
                                                            }`}
                                                    >
                                                        {copySuccess ? (
                                                            <>
                                                                <FaCheck size={12} className="sm:w-3.5 sm:h-3.5" />
                                                                <span className="hidden sm:inline">Copiado</span>
                                                                <span className="sm:hidden">✓</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                Copiar
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Ou escaneie o QR code */}
                                            <div>
                                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                    <div className="bg-[#313238] p-1.5 sm:p-2 rounded-lg">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-base sm:text-xl font-bold text-white">Ou escaneie o QR code</h3>
                                                </div>

                                                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="bg-[#313238] w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs sm:text-base">
                                                            1
                                                        </div>
                                                        <p className="text-gray-300 text-xs sm:text-sm pt-0.5 sm:pt-1">Abra o aplicativo do seu banco.</p>
                                                    </div>
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="bg-[#313238] w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs sm:text-base">
                                                            2
                                                        </div>
                                                        <p className="text-gray-300 text-xs sm:text-sm pt-0.5 sm:pt-1">Escolha pagar via Pix, e escaneie o código abaixo:</p>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center">
                                                    {/* QR Code Placeholder - você pode usar uma biblioteca como qrcode.react */}
                                                    <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-white border-2 sm:border-4 border-gray-200 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                                                        <svg className="w-full h-full p-3 sm:p-4" viewBox="0 0 100 100">
                                                            {/* QR Code Pattern simplificado */}
                                                            <rect width="100" height="100" fill="white" />
                                                            <rect x="0" y="0" width="20" height="20" fill="black" />
                                                            <rect x="80" y="0" width="20" height="20" fill="black" />
                                                            <rect x="0" y="80" width="20" height="20" fill="black" />
                                                            <rect x="5" y="5" width="10" height="10" fill="white" />
                                                            <rect x="85" y="5" width="10" height="10" fill="white" />
                                                            <rect x="5" y="85" width="10" height="10" fill="white" />
                                                            {/* Padrão de dados */}
                                                            {Array.from({ length: 15 }).map((_, i) => (
                                                                <g key={i}>
                                                                    {Array.from({ length: 15 }).map((_, j) => {
                                                                        const shouldFill = (i + j) % 3 === 0 || (i * j) % 5 === 0;
                                                                        return shouldFill ? (
                                                                            <rect
                                                                                key={`${i}-${j}`}
                                                                                x={25 + j * 3.5}
                                                                                y={25 + i * 3.5}
                                                                                width="3"
                                                                                height="3"
                                                                                fill="black"
                                                                            />
                                                                        ) : null;
                                                                    })}
                                                                </g>
                                                            ))}
                                                        </svg>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-xs sm:text-sm font-medium">Pague e será creditado na hora</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coluna Direita - Resumo (mesmo do checkout) */}
                                        <div className="w-full lg:w-[380px] flex flex-col gap-3 sm:gap-4">
                                            <div className="bg-[#25282c] rounded-2xl p-4 border border-[#313238] flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#313238]">
                                                    <img
                                                        src={productImage}
                                                        alt={productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium text-sm mb-1">
                                                        {productName}
                                                    </h3>
                                                    <p className="text-gray-400 text-xs">
                                                        Quantidade: {quantity}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-[#25282c] rounded-2xl p-4 border border-[#313238] flex items-center justify-between">
                                                <p className="text-gray-200 text-xs sm:text-sm font-medium pr-4">
                                                    Você irá receber{" "}
                                                    <span className="text-white font-bold">
                                                        1 roleta instantânea
                                                    </span>{" "}
                                                    nesta compra!
                                                </p>
                                                <div className="text-red-500 text-xl">
                                                    <FaBullseye />
                                                </div>
                                            </div>

                                            <div className="bg-[#25282c] rounded-2xl p-4 border border-[#313238] flex items-center justify-between">
                                                <p className="text-gray-200 text-xs sm:text-sm font-medium pr-4">
                                                    Você irá receber{" "}
                                                    <span className="text-white font-bold">
                                                        1 caixa instantânea
                                                    </span>{" "}
                                                    nesta compra!
                                                </p>
                                                <div className="text-yellow-500 text-xl">
                                                    <FaGift />
                                                </div>
                                            </div>

                                            <div className="bg-[#25282c] rounded-2xl p-6 border border-[#313238] space-y-3">
                                                <div className="flex justify-between items-center text-gray-400 text-sm">
                                                    <span>Subtotal</span>
                                                    <span>R$ {totalAmount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-white font-bold text-lg pt-3 border-t border-[#313238]">
                                                    <span>Total</span>
                                                    <span>R$ {totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Coluna Esquerda - Formulário */}
                                        <div className="flex-1 bg-[#25282c] rounded-2xl p-6 shadow-2xl border border-[#313238]">
                                            {/* Indicador de Progresso */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-center gap-2 sm:gap-4">
                                                    {steps.map((step, index) => (
                                                        <React.Fragment key={step.number}>
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div
                                                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${currentStep > step.number
                                                                        ? "bg-green-500 text-white"
                                                                        : currentStep === step.number
                                                                            ? "bg-blue-600 text-white"
                                                                            : "bg-[#313238] text-gray-500"
                                                                        }`}
                                                                >
                                                                    {currentStep > step.number ? (
                                                                        <FaCheck size={16} />
                                                                    ) : (
                                                                        step.number
                                                                    )}
                                                                </div>
                                                                <span
                                                                    className={`text-xs sm:text-sm font-medium ${currentStep >= step.number
                                                                        ? "text-white"
                                                                        : "text-gray-500"
                                                                        }`}
                                                                >
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                            {index < steps.length - 1 && (
                                                                <div
                                                                    className={`h-0.5 w-12 sm:w-20 mb-6 transition-all ${currentStep > step.number
                                                                        ? "bg-green-500"
                                                                        : "bg-[#313238]"
                                                                        }`}
                                                                />
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {/* PASSO 1: Telefone */}
                                                {currentStep === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="bg-[#313238] p-2 rounded-full text-gray-400">
                                                                <FaUser size={16} />
                                                            </div>
                                                            <h2 className="text-xl font-bold text-white">
                                                                Dados pessoais
                                                            </h2>
                                                        </div>

                                                        <div className="mb-8">
                                                            <label className="block text-sm text-gray-400 mb-2">
                                                                Telefone com DDD
                                                            </label>
                                                            <div
                                                                className={`flex items-center bg-[#313238] rounded-xl border ${phoneError
                                                                    ? "border-red-500"
                                                                    : "border-[#3a3b42] focus-within:border-blue-500"
                                                                    } transition-colors h-12 sm:h-14 overflow-hidden`}
                                                            >
                                                                <button className="flex items-center gap-2 px-4 h-full bg-[#383a42] border-r border-[#3a3b42] hover:bg-[#40424b] transition-colors">
                                                                    <img
                                                                        src="https://flagcdn.com/w20/br.png"
                                                                        srcSet="https://flagcdn.com/w40/br.png 2x"
                                                                        width="20"
                                                                        height="15"
                                                                        alt="Brasil"
                                                                    />
                                                                    <svg
                                                                        className="w-3 h-3 text-gray-400"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M19 9l-7 7-7-7"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                                <input
                                                                    type="tel"
                                                                    value={phone}
                                                                    onChange={handlePhoneChange}
                                                                    placeholder="(11) 99999-9999"
                                                                    maxLength={15}
                                                                    className="flex-1 bg-transparent px-4 text-white placeholder-gray-500 outline-none h-full"
                                                                />
                                                            </div>
                                                            {phoneError && (
                                                                <p className="text-red-500 text-xs mt-2">
                                                                    {phoneError}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={handleContinueStep1}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm sm:text-base w-full sm:w-auto"
                                                            >
                                                                Continuar
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* PASSO 2: Nome Completo */}
                                                {currentStep === 2 && (
                                                    <motion.div
                                                        key="step2"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="bg-[#313238] p-2 rounded-full text-gray-400">
                                                                <FaUser size={16} />
                                                            </div>
                                                            <h2 className="text-xl font-bold text-white">
                                                                Dados pessoais
                                                            </h2>
                                                        </div>

                                                        <div className="mb-6">
                                                            <label className="block text-sm text-gray-400 mb-2">
                                                                Nome completo
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={fullName}
                                                                onChange={(e) => {
                                                                    setFullName(e.target.value);
                                                                    setNameError("");
                                                                }}
                                                                placeholder="Digite seu nome completo"
                                                                className={`w-full bg-[#313238] rounded-xl border ${nameError
                                                                    ? "border-red-500"
                                                                    : "border-[#3a3b42] focus:border-blue-500"
                                                                    } px-4 py-3 sm:py-4 text-white placeholder-gray-500 outline-none transition-colors`}
                                                            />
                                                            {nameError && (
                                                                <p className="text-red-500 text-xs mt-2">
                                                                    {nameError}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="mb-8">
                                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                                <div className="relative">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={saveInfo}
                                                                        onChange={(e) =>
                                                                            setSaveInfo(e.target.checked)
                                                                        }
                                                                        className="sr-only"
                                                                    />
                                                                    <div
                                                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${saveInfo
                                                                            ? "bg-blue-600 border-blue-600"
                                                                            : "bg-[#313238] border-[#3a3b42] group-hover:border-blue-500"
                                                                            }`}
                                                                    >
                                                                        {saveInfo && (
                                                                            <FaCheck
                                                                                size={12}
                                                                                className="text-white"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm text-gray-300">
                                                                    Salvar informações para próximas compras
                                                                </span>
                                                            </label>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={handleBack}
                                                                className="bg-[#313238] hover:bg-[#3a3c45] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm sm:text-base"
                                                            >
                                                                Voltar
                                                            </button>
                                                            <button
                                                                onClick={handleContinueStep2}
                                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm sm:text-base"
                                                            >
                                                                Continuar
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* PASSO 3: Revisão */}
                                                {currentStep === 3 && (
                                                    <motion.div
                                                        key="step3"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-[#313238] p-2 rounded-full text-gray-400">
                                                                    <svg
                                                                        className="w-4 h-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <h2 className="text-xl font-bold text-white">
                                                                    Revisar
                                                                </h2>
                                                            </div>
                                                            <button
                                                                onClick={() => setCurrentStep(1)}
                                                                className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                                    />
                                                                </svg>
                                                                Editar
                                                            </button>
                                                        </div>

                                                        <div className="space-y-4 mb-8">
                                                            <div className="bg-[#313238] rounded-xl p-4">
                                                                <p className="text-gray-400 text-sm mb-1">
                                                                    Dados pessoais
                                                                </p>
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <p className="text-white font-medium text-sm">
                                                                            Nome:
                                                                        </p>
                                                                        <p className="text-gray-300">
                                                                            {fullName}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-white font-medium text-sm">
                                                                            Telefone:
                                                                        </p>
                                                                        <p className="text-gray-300">
                                                                            +55 {phone}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-[#313238] rounded-xl p-4">
                                                                <p className="text-gray-400 text-sm mb-3">
                                                                    Forma de pagamento
                                                                </p>
                                                                <div className="flex items-center gap-3 bg-[#25282c] p-3 rounded-lg">
                                                                    <div className="bg-[#00BDAE] p-2 rounded-lg">
                                                                        <MdPix className="w-6 h-6 text-white" />
                                                                    </div>
                                                                    <span className="text-white font-medium">
                                                                        Pix
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-[#1a1c20] rounded-xl p-4 mb-6">
                                                            <p className="text-gray-400 text-xs leading-relaxed">
                                                                Ao reservar este pedido declaro ter lido e
                                                                concordado com o{" "}
                                                                <span className="text-white font-semibold">
                                                                    regulamento da campanha
                                                                </span>
                                                                , e com os{" "}
                                                                <span className="text-white font-semibold">
                                                                    termos de uso
                                                                </span>{" "}
                                                                e a{" "}
                                                                <span className="text-white font-semibold">
                                                                    política de privacidade
                                                                </span>
                                                                .
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={handleBack}
                                                                className="bg-[#313238] hover:bg-[#3a3c45] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm sm:text-base"
                                                            >
                                                                Voltar
                                                            </button>
                                                            <button
                                                                onClick={handleFinalizePurchase}
                                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                                                            >
                                                                <FaLock size={14} />
                                                                Finalizar compra
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Coluna Direita - Resumo (sempre visível) */}
                                        <div className="w-full md:w-[400px] flex flex-col gap-4">
                                            {/* Card Produto */}
                                            <div className="bg-[#25282c] rounded-2xl p-4 border border-[#313238] flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#313238]">
                                                    <img
                                                        src={productImage}
                                                        alt={productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium text-sm mb-1">
                                                        {productName}
                                                    </h3>
                                                    <p className="text-gray-400 text-xs">
                                                        Quantidade: {quantity}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bônus 1 - Roleta */}
                                            <div className="bg-[#25282c] rounded-2xl p-4 border border-[#313238] flex items-center justify-between">
                                                <p className="text-gray-200 text-xs sm:text-sm font-medium pr-4">
                                                    Você irá receber{" "}
                                                    <span className="text-white font-bold">
                                                        1 roleta instantânea
                                                    </span>{" "}
                                                    nesta compra!
                                                </p>
                                                <div className="text-red-500 text-xl">
                                                    <FaBullseye />
                                                </div>
                                            </div>

                                            {/* Bônus 2 - Caixa */}
                                            <div className="bg-[#25282c] rounded-2xl p-4 border border-[#313238] flex items-center justify-between">
                                                <p className="text-gray-200 text-xs sm:text-sm font-medium pr-4">
                                                    Você irá receber{" "}
                                                    <span className="text-white font-bold">
                                                        1 caixa instantânea
                                                    </span>{" "}
                                                    nesta compra!
                                                </p>
                                                <div className="text-yellow-500 text-xl">
                                                    <FaGift />
                                                </div>
                                            </div>

                                            {/* Totais */}
                                            <div className="bg-[#25282c] rounded-2xl p-6 border border-[#313238] space-y-3">
                                                <div className="flex justify-between items-center text-gray-400 text-sm">
                                                    <span>Subtotal</span>
                                                    <span>R$ {totalAmount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-white font-bold text-lg pt-3 border-t border-[#313238]">
                                                    <span>Total</span>
                                                    <span>R$ {totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer Checkout Seguro */}
                                {!showPayment && (
                                    <div className="mt-8 flex justify-center">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            <FaLock className="text-gray-500" />
                                            Checkout 100% seguro
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
