"use client";

import React, { useState, useEffect } from "react";
import { FaFacebook } from "react-icons/fa";
import { FaTelegram } from "react-icons/fa6";
import { AiFillTwitterCircle } from "react-icons/ai";
import { IoLogoWhatsapp } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import type { Rifa } from "@/types";
import { vendasService } from "@/services/vendas.service";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface GameDetailProps {
    rifa: Rifa;
}

export const GameDetail = ({ rifa }: GameDetailProps) => {
    const [activeTab, setActiveTab] = useState("premios");
    const [quantity, setQuantity] = useState(100);
    const [totalValue, setTotalValue] = useState(0);
    const [showPixModal, setShowPixModal] = useState(false);
    const [showCpfModal, setShowCpfModal] = useState(false);
    const [isLoadingPix, setIsLoadingPix] = useState(false);
    const [pixData, setPixData] = useState({
        qrCode: "",
        pixCopiaECola: "",
        saleId: 0,
    });
    const [cpf, setCpf] = useState("");
    const [cpfError, setCpfError] = useState("");
    const [copied, setCopied] = useState(false);

    // Verificação de segurança
    if (!rifa) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-6 mt-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando informações da rifa...</p>
                </div>
            </div>
        );
    }

    const socialIcons = [
        { Icon: FaFacebook, label: "Facebook" },
        { Icon: FaTelegram, label: "Telegram" },
        { Icon: AiFillTwitterCircle, label: "Twitter" },
        { Icon: IoLogoWhatsapp, label: "WhatsApp" },
    ];

    // Calcular valor total baseado na quantidade e promoções
    const calculateTotal = (qty: number): number => {
        if (!rifa.packages || rifa.packages.length === 0) {
            return qty * rifa.ticketsPrice;
        }

        // Encontrar a promoção aplicável (maior quantidade que ainda é <= qty)
        const aplicablePromo = [...rifa.packages]
            .sort((a, b) => b.quantidade - a.quantidade)
            .find(promo => qty >= promo.quantidade);

        if (aplicablePromo) {
            // Calcular quantos "pacotes" da promoção cabem
            const pacotes = Math.floor(qty / aplicablePromo.quantidade);
            const resto = qty % aplicablePromo.quantidade;

            return (pacotes * aplicablePromo.preco) + (resto * rifa.ticketsPrice);
        }

        return qty * rifa.ticketsPrice;
    };

    // Atualizar valor total quando quantidade mudar
    useEffect(() => {
        setTotalValue(calculateTotal(quantity));
    }, [quantity, rifa]);

    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const handleQuickSelect = (value: number) => {
        setQuantity(prev => prev + value);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        setQuantity(Math.max(1, value));
    };

    const handleParticipar = () => {
        // Abrir modal para pedir CPF
        setShowCpfModal(true);
        setCpfError("");
    };

    const validateCpf = (cpf: string): boolean => {
        // Remove caracteres não numéricos
        const cleanCpf = cpf.replace(/\D/g, "");

        // Verifica se tem 11 dígitos
        if (cleanCpf.length !== 11) return false;

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

        return true;
    };

    const handleConfirmPurchase = async () => {
        // Validar CPF
        if (!validateCpf(cpf)) {
            setCpfError("CPF inválido. Digite um CPF válido com 11 dígitos.");
            return;
        }

        setShowCpfModal(false);
        setShowPixModal(true);
        setIsLoadingPix(true);

        try {
            // Chamar API real para gerar PIX
            const response = await vendasService.comprarTicket({
                action_id: rifa.id,
                cpf: cpf.replace(/\D/g, ""), // Remove formatação
                amount: quantity,
            });

            if (response.error || !response.data) {
                alert(`Erro ao gerar PIX: ${response.error || "Erro desconhecido"}`);
                setShowPixModal(false);
                setIsLoadingPix(false);
                return;
            }

            // Usar dados reais da API
            setPixData({
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    response.data.qrCode
                )}`,
                pixCopiaECola: response.data.qrCode,
                saleId: response.data.saleId,
            });
            setIsLoadingPix(false);
        } catch (error) {
            console.error("Erro ao gerar PIX:", error);
            alert("Erro ao gerar código PIX. Tente novamente.");
            setShowPixModal(false);
            setIsLoadingPix(false);
        }
    };

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixData.pixCopiaECola);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleCloseCpfModal = () => {
        setShowCpfModal(false);
        setCpf("");
        setCpfError("");
    };

    const handleClosePixModal = () => {
        setShowPixModal(false);
        setCopied(false);
    };

    const formatCpf = (value: string) => {
        const cleanValue = value.replace(/\D/g, "");
        if (cleanValue.length <= 11) {
            return cleanValue
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return cpf;
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpf(e.target.value);
        setCpf(formatted);
        setCpfError("");
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen pt-24 pb-12 px-6 mt-5"
        >
            <div className="max-w-[900px] mx-auto">
                <motion.div variants={itemVariants} className="bg-[#f7f7f7] rounded-3xl overflow-hidden">
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 rounded-t-3xl rounded-b-6xl"
                            style={{
                                backgroundImage: 'url(/BANNER.png)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        ></motion.div>

                        <div className="absolute bottom-0 left-0 right-0 h-20">
                            <svg
                                className="absolute bottom-0 left-0 w-full h-20"
                                viewBox="0 0 1440 80"
                                preserveAspectRatio="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0,20 Q360,20 480,20 Q540,20 600,45 Q660,70 720,70 Q780,70 840,45 Q900,20 960,20 Q1080,20 1440,20 L1440,80 L0,80 Z"
                                    fill="#f7f7f7"
                                />
                            </svg>
                        </div>

                        <motion.div
                            initial={{ scale: 0, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5, type: "spring", bounce: 0.4 }}
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10"
                        >
                            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-white flex items-center justify-center shadow-2xl bg-cover"
                                style={{ backgroundImage: 'url(/LOGO.png)' }}>

                            </div>
                        </motion.div>
                    </div>

                    <div className="px-3 xs:px-4 sm:px-5 md:px-6 pb-4 sm:pb-6 md:pb-8 pt-10 xs:pt-12 sm:pt-14 md:pt-16 mt-2 xs:mt-3 sm:mt-4 md:mt-5">
                        <motion.h1 variants={itemVariants} className="text-2xl xs:text-2xl sm:text-3xl md:max-w-xl mx-auto font-bold text-gray-900 text-center mb-2 uppercase">
                            {rifa.title}
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-gray-500 text-base sm:text-base text-center mb-2 px-2">{rifa.description}</motion.p>

                        {/* <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-8">
                            {socialIcons.map(({ Icon, label }, index) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + index * 0.1, type: "spring", bounce: 0.5 }}
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-8 h-8 bg-gray-100 hover:bg-red-500 hover:text-white transition-all delay-75 cursor-pointer 
                                    rounded-lg flex items-center justify-center border border-gray-300 text-gray-400"
                                    aria-label={label}
                                >
                                    <Icon />
                                </motion.div>
                            ))}
                        </motion.div> */}

                        <motion.p variants={itemVariants} className="text-gray-500 mt-10 text-sm sm:text-base text-center">
                            Por apenas
                        </motion.p>
                        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-4 sm:mb-6 md:mb-8">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md"
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </motion.div>
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1, type: "spring", bounce: 0.6 }}
                                className="text-3xl xs:text-3xl sm:text-4xl font-bold text-gray-900"
                            >
                                R$ {(rifa.ticketsPrice || 0).toFixed(2).replace(".", ",")}
                            </motion.span>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
                            <div
                                className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Promoção Especial</h2>
                                            <p className="text-white/80 text-xs sm:text-sm">Compre mais e economize!</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                                        <span className="text-white font-bold text-xs sm:text-sm">🔥 Ofertas</span>
                                    </div>
                                </div>
                            </div>

                            {rifa.packages && rifa.packages.length > 0 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-2 gap-2 sm:gap-3"
                                >
                                    {rifa.packages.map((pkg, index) => (
                                        <motion.button
                                            key={index}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-white border-2 border-red-200 hover:border-red-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all group"
                                        >
                                            <div className="text-xs sm:text-sm text-gray-500 mb-1">{pkg.quantidade || 0}</div>
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-[10px] xs:text-xs text-gray-400">por</span>
                                                <span className="text-[10px] xs:text-xs text-gray-400">R$</span>
                                                <span className="text-lg xs:text-xl sm:text-2xl font-bold text-red-500 group-hover:text-red-600">
                                                    {(pkg.preco || 0).toFixed(2).replace(".", ",")}
                                                </span>
                                            </div>
                                            {pkg.desconto && (
                                                <div className="text-[10px] xs:text-xs text-green-600 font-bold mt-1">
                                                    -{pkg.desconto}%
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
                            <div
                                className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Cotas</h2>
                                            <p className="text-white/80 text-xs sm:text-sm">Escolha sua sorte</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-gray-200"
                            >
                                <p className="text-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Selecione a quantidade de números</p>

                                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    {[
                                        { qty: 100, popular: false },
                                        { qty: 500, popular: true },
                                        { qty: 200, popular: false },
                                        { qty: 1000, popular: false },
                                        { qty: 300, popular: false },
                                        { qty: 5000, popular: false },
                                    ].map((item, index) => (
                                        <motion.button
                                            key={item.qty}
                                            onClick={() => handleQuickSelect(item.qty)}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.3 + index * 0.05 }}
                                            whileHover={{ scale: 1.05, y: -3 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`relative ${item.popular
                                                ? "bg-white border-2 border-teal-500"
                                                : "bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400"
                                                } rounded-xl sm:rounded-2xl p-2 xs:p-3 sm:p-4 transition-all`}
                                        >
                                            {item.popular && (
                                                <motion.div
                                                    initial={{ scale: 0, y: 10 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    transition={{ delay: 1.5, type: "spring" }}
                                                    className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                                                >
                                                    <span className="bg-teal-500 text-white text-[10px] xs:text-xs font-bold px-2 xs:px-3 py-0.5 xs:py-1 rounded-full whitespace-nowrap">
                                                        Mais popular
                                                    </span>
                                                </motion.div>
                                            )}
                                            <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 xs:mb-1">+{item.qty}</div>
                                            <div className="text-[10px] xs:text-xs text-gray-500 uppercase tracking-wide">Selecionar</div>
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.6 }}
                                    className="flex items-center gap-2 sm:gap-3"
                                >
                                    <motion.button
                                        onClick={handleDecrement}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center transition-all"
                                        aria-label="Diminuir quantidade"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </motion.button>

                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        className="flex-1 h-10 xs:h-11 sm:h-12 text-center text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                    />

                                    <motion.button
                                        onClick={handleIncrement}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center transition-all"
                                        aria-label="Aumentar quantidade"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        <motion.button
                            onClick={handleParticipar}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-4 sm:mt-5 md:mt-6 bg-green-700 hover:bg-green-500 text-white text-sm xs:text-base sm:text-lg font-bold p-3 xs:p-4 sm:p-5 
                            rounded-xl sm:rounded-2xl transition-all cursor-pointer shadow-lg shadow-green-500/25 
                            flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-1.5 xs:gap-2">
                                <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs xs:text-sm sm:text-base md:text-lg">Participar do Sorteio</div>
                                    <div className="text-[10px] xs:text-xs text-green-200">{quantity} cotas</div>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="p-1.5 xs:p-2 bg-green-400 px-2 xs:px-3 sm:px-5 rounded-full text-black text-xs xs:text-sm sm:text-base flex-shrink-0"
                            >
                                R$ {(totalValue || 0).toFixed(2).replace(".", ",")}
                            </motion.div>
                        </motion.button>

                        <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
                            <div
                                className="p-3 sm:p-4 mb-3 sm:mb-4 px-0"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg md:text-xl font-bold text-red-500">Títulos Premiados</h2>
                                            <p className="text-red-500/80 text-xs sm:text-sm">Veja a lista de prêmios</p>
                                        </div>
                                    </div>
                                    <div className="bg-red-600/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex-shrink-0">
                                        <span className="text-red-500 font-bold text-xs sm:text-sm">
                                            Total {rifa.rewards?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 }}
                                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-gray-200"
                            >
                                {/* Main Tabs */}
                                <div className="relative border-b-2 border-gray-200 mb-4 sm:mb-6">
                                    <div className="flex gap-1">
                                        <motion.button
                                            onClick={() => setActiveTab("premios")}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`relative flex-1 py-3 sm:py-4 px-3 sm:px-4 md:px-6 font-bold text-sm sm:text-base transition-all duration-300
                                                ${activeTab === "premios"
                                                    ? "text-red-600"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            aria-label="Aba de Prêmios"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                Prêmios
                                            </span>
                                            {activeTab === "premios" && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-full shadow-lg shadow-red-500/50"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </motion.button>

                                        {/* <motion.button
                                            onClick={() => setActiveTab("rankings")}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`relative flex-1 py-4 px-6 font-bold text-base transition-all duration-300
                                                ${activeTab === "rankings"
                                                    ? "text-red-600"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            aria-label="Aba de Rankings"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Rankings
                                            </span>
                                            {activeTab === "rankings" && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-full shadow-lg shadow-red-500/50"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </motion.button> */}
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5 }}
                                    className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6"
                                >
                                    <div
                                        className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg shadow-teal-500/20 overflow-hidden group transition-all duration-300"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
                                                    <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                                                        {rifa.rewards?.filter((r) => !r.isSold && !r.winnerId).length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-white/80 text-[10px] sm:text-xs font-medium mb-0.5">Status</p>
                                            <h3 className="text-white font-bold text-sm sm:text-base">Disponíveis</h3>
                                        </div>
                                    </div>

                                    <div
                                        className="relative bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg shadow-red-500/20 overflow-hidden group transition-all duration-300"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
                                                    <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                                                        {rifa.rewards?.filter((r) => r.winnerId !== null).length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-white/80 text-[10px] sm:text-xs font-medium mb-0.5">Status</p>
                                            <h3 className="text-white font-bold text-sm sm:text-base">Sorteados</h3>
                                        </div>
                                    </div>
                                </motion.div>

                                <AnimatePresence mode="wait">
                                    {activeTab === "premios" ? (
                                        <motion.div
                                            key="premios"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-3"
                                        >
                                            {rifa.rewards && rifa.rewards.length > 0 ? (
                                                rifa.rewards.map((reward, index) => (
                                                    <motion.div
                                                        key={reward.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ scale: 1.02, x: 5 }}
                                                        className={`flex items-center justify-between gap-2 p-2 sm:p-3 ${reward.winnerId !== null
                                                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400"
                                                            : "bg-gray-50 border border-gray-200"
                                                            } rounded-lg sm:rounded-xl hover:border-gray-300 transition-colors`}
                                                    >
                                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                            <div
                                                                className={`${reward.winnerId !== null ? "bg-black" : "bg-gray-700"
                                                                    } text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1.5 sm:gap-2 flex-shrink-0`}
                                                            >
                                                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                                                                </svg>
                                                                <span className="font-bold text-xs sm:text-sm">{reward.number}</span>
                                                            </div>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-gray-900 font-bold text-xs sm:text-sm md:text-base truncate">
                                                                    {reward.name}
                                                                </span>
                                                                {reward.description && (
                                                                    <span className="text-gray-600 text-[10px] xs:text-xs sm:text-sm truncate">
                                                                        {reward.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {reward.winnerId !== null ? (
                                                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                                                <span className="text-gray-900 font-bold text-xs sm:text-sm hidden xs:inline">
                                                                    Sorteado
                                                                </span>
                                                                <span className="text-base sm:text-xl">🏆</span>
                                                            </div>
                                                        ) : (
                                                            <span className="bg-teal-100 text-teal-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold text-[10px] xs:text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                                                                Disponível
                                                            </span>
                                                        )}
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 sm:py-8 text-gray-500">
                                                    <p className="text-sm sm:text-base">Nenhum prêmio cadastrado ainda</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="rankings"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex gap-2">
                                                {["Dia", "Semana", "Mês"].map((period, index) => (
                                                    <motion.button
                                                        key={period}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`px-4 py-2 ${index === 0
                                                            ? "bg-red-500 text-white"
                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                            } font-bold rounded-lg text-sm transition-all`}
                                                    >
                                                        {period}
                                                    </motion.button>
                                                ))}
                                            </div>

                                            <div className="space-y-4">
                                                {[
                                                    { name: "João Silva", cotas: "1.250", percent: "100%", color: "from-yellow-400 to-yellow-600" },
                                                    { name: "Maria Santos", cotas: "980", percent: "78%", color: "from-gray-300 to-gray-400" },
                                                    { name: "Carlos Souza", cotas: "750", percent: "60%", color: "from-red-400 to-red-600" },
                                                    { name: "Ana Paula", cotas: "620", percent: "50%", color: "from-teal-400 to-teal-600" },
                                                    { name: "Pedro Lima", cotas: "500", percent: "40%", color: "from-blue-400 to-blue-600" },
                                                    { name: "Fernanda Costa", cotas: "380", percent: "30%", color: "from-purple-400 to-purple-600" },
                                                    { name: "Roberto Alves", cotas: "250", percent: "20%", color: "from-pink-400 to-pink-600" },
                                                ].map((rank, index) => (
                                                    <motion.div
                                                        key={rank.name}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="relative"
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <motion.div
                                                                whileHover={{ scale: 1.2, rotate: 360 }}
                                                                transition={{ duration: 0.5 }}
                                                                className={`w-8 h-8 bg-gradient-to-br ${rank.color} rounded-full flex items-center justify-center font-bold text-white shadow-md`}
                                                            >
                                                                {index + 1}
                                                            </motion.div>
                                                            <span className="font-bold text-gray-900">{rank.name}</span>
                                                            <span className="ml-auto font-bold text-red-500">{rank.cotas} cotas</span>
                                                        </div>
                                                        <div className="relative h-8 bg-gray-100 rounded-xl overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: rank.percent }}
                                                                transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                                                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${rank.color} rounded-xl`}
                                                            ></motion.div>
                                                            <span className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-bold text-white">{rank.percent}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Modal de CPF */}
            <AnimatePresence>
                {showCpfModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={handleCloseCpfModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCloseCpfModal}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                aria-label="Fechar modal"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>

                            <div className="text-center mb-6">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Identificação</h3>
                                <p className="text-sm sm:text-base text-gray-500 px-4">
                                    Digite seu CPF para continuar com a compra
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-200 mb-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Quantidade de cotas</p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900">{quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs sm:text-sm text-gray-600">Valor total</p>
                                        <p className="text-xl sm:text-2xl font-bold text-red-600">
                                            R$ {(totalValue || 0).toFixed(2).replace(".", ",")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700 mb-2">
                                        CPF *
                                    </label>
                                    <input
                                        type="text"
                                        id="cpf"
                                        value={cpf}
                                        onChange={handleCpfChange}
                                        maxLength={14}
                                        className={`w-full px-4 py-3 sm:py-4 border-2 rounded-xl focus:outline-none transition-colors text-center text-lg font-mono ${cpfError
                                            ? "border-red-400 focus:border-red-500 bg-red-50"
                                            : "border-gray-300 focus:border-red-500"
                                            }`}
                                        placeholder="000.000.000-00"
                                    />
                                    {cpfError && (
                                        <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {cpfError}
                                        </p>
                                    )}
                                </div>

                                <motion.button
                                    onClick={handleConfirmPurchase}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg text-sm sm:text-base"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Confirmar e Gerar PIX
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Pagamento PIX */}
            <AnimatePresence>
                {showPixModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
                        onClick={handleClosePixModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full shadow-2xl relative my-8"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClosePixModal}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
                                aria-label="Fechar modal"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>

                            <AnimatePresence mode="wait">
                                {isLoadingPix ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-8 sm:py-12"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-500 border-t-transparent rounded-full mb-4 sm:mb-6"
                                        />
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center px-4">Gerando Pagamento</h3>
                                        <p className="text-sm sm:text-base text-gray-500 text-center px-4">
                                            Aguarde enquanto geramos seu código PIX...
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pix"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-4 sm:space-y-6"
                                    >
                                        <div className="text-center pt-6 sm:pt-0">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pagamento via PIX</h3>
                                            <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
                                                Escaneie o QR Code ou copie o código abaixo
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-200">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-600">Quantidade de cotas</p>
                                                    <p className="text-lg sm:text-xl font-bold text-gray-900">{quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs sm:text-sm text-gray-600">Valor total</p>
                                                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                                                        R$ {(totalValue || 0).toFixed(2).replace(".", ",")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white border-2 sm:border-4 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-center">
                                            <img
                                                src={pixData.qrCode}
                                                alt="QR Code PIX"
                                                className="w-42 h-42 sm:w-44 sm:h-44 md:w-48 md:h-48"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-xs sm:text-sm text-gray-600 font-semibold text-center">
                                                Código PIX Copia e Cola
                                            </p>
                                            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
                                                <p className="text-[10px] whitespace-nowrap sm:text-xs text-gray-600 break-all font-mono">
                                                    {pixData.pixCopiaECola}
                                                </p>
                                            </div>

                                            <motion.button
                                                onClick={handleCopyPix}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`w-full ${copied
                                                    ? "bg-teal-600 hover:bg-teal-700"
                                                    : "bg-green-600 hover:bg-green-700"
                                                    } text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base`}
                                            >
                                                {copied ? (
                                                    <>
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Código Copiado!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        Copiar Código PIX
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                            <div className="flex gap-2 sm:gap-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="text-xs sm:text-sm text-blue-800">
                                                    <p className="font-semibold mb-1">Instruções de Pagamento</p>
                                                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-blue-700">
                                                        <li>Abra seu app de banco</li>
                                                        <li>Escolha pagar via PIX</li>
                                                        <li>Escaneie o QR Code ou cole o código</li>
                                                        <li>Confirme o pagamento</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div> */}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
