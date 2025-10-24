"use client";

import type { Rifa } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback, useRef } from "react";

import { LoginModal } from "./LoginModal";
import { FaFacebook } from "react-icons/fa";
import { FaTelegram } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { useAuth } from "@/contexts/AuthContext";
import { PrizesCarousel } from "./PrizesCarousel";
import { AiFillTwitterCircle } from "react-icons/ai";
import { authService } from "@/services/auth.service";
import { UserProfileModal } from "./UserProfileModal";
import { CPFInputModal } from "./CPFInputModal";
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
    const { isAuthenticated } = useAuth();
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
    const [timeRemaining, setTimeRemaining] = useState({
        days: 2,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [showAllTickets, setShowAllTickets] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCPFModalOpen, setIsCPFModalOpen] = useState(false);
    const [consultedCPF, setConsultedCPF] = useState<string | undefined>(undefined);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [registerData, setRegisterData] = useState({
        email: "",
        name: "",
        cpf: "",
        whatsapp: "",
    });
    const [registerErrors, setRegisterErrors] = useState({
        email: "",
        name: "",
        whatsapp: "",
    });

    // Ref para a seção de cotas
    const cotasRef = useRef<HTMLDivElement>(null);

    // Função para scroll suave até as cotas
    const handleScrollToCotas = () => {
        cotasRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Calcular valor total baseado na quantidade e promoções
    const calculateTotal = useCallback((qty: number): number => {
        if (!rifa) return 0;

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
    }, [rifa]);

    // Atualizar valor total quando quantidade mudar
    useEffect(() => {
        const total = calculateTotal(quantity);
        setTotalValue(total);
    }, [quantity, calculateTotal, rifa]);

    // Polling para verificar o status do pagamento
    useEffect(() => {
        if (!showPixModal || isLoadingPix || paymentConfirmed) {
            return;
        }

        setIsCheckingPayment(true);

        // Se o usuário NÃO está autenticado
        if (!isAuthenticated) {
            // Aguardar 30 segundos e então mostrar mensagem
            const timeout = setTimeout(() => {
                setPaymentConfirmed(true);
                setIsCheckingPayment(false);
            }, 60000); // 90 segundos

            return () => clearTimeout(timeout);
        }

        // Se o usuário ESTÁ autenticado, fazer polling
        const checkPaymentStatus = async () => {
            try {
                const response = await vendasService.obterPedidos();

                if (response.data && response.data.length > 0) {
                    // Pegar o pedido com o maior ID
                    const latestOrder = response.data.reduce((prev, current) =>
                        current.id > prev.id ? current : prev
                    );

                    // Verificar se o status é "paid"
                    if (latestOrder.status === "paid") {
                        setPaymentConfirmed(true);
                        setIsCheckingPayment(false);
                    }
                }
            } catch (error) {
            }
        };

        // Verificar imediatamente
        checkPaymentStatus();

        // Continuar verificando a cada 3 segundos
        const interval = setInterval(checkPaymentStatus, 3000);

        return () => clearInterval(interval);
    }, [showPixModal, isLoadingPix, paymentConfirmed, isAuthenticated]);

    // Calcular countdown regressivo de 48 horas
    useEffect(() => {
        // Define a data de término: 48 horas a partir de agora
        const startTime = new Date().getTime();
        const campaignDuration = 48 * 60 * 60 * 1000; // 48 horas em milissegundos
        const endDate = startTime + campaignDuration;

        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const difference = endDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeRemaining({ days, hours, minutes, seconds });

                // Calcular progresso (quanto tempo já passou das 48 horas)
                const elapsed = now - startTime;
                const progress = Math.min((elapsed / campaignDuration) * 100, 100);
                setProgressPercentage(progress);
            } else {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setProgressPercentage(100);
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
        setSelectedPackage(null);
    };

    const handleDecrement = () => {
        setQuantity(prev => Math.max(1, prev - 1));
        setSelectedPackage(null);
    };

    const handleQuickSelect = (value: number) => {
        setQuantity(value);
        setSelectedPackage(value);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        setQuantity(Math.max(1, value));
        setSelectedPackage(null);
    };

    const handleParticipar = () => {
        setShowCpfModal(true);
        setCpfError("");
    };

    const validateCpf = (cpf: string): boolean => {
        const cleanCpf = cpf.replace(/\D/g, "");
        if (cleanCpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

        return true;
    };

    const handleConfirmPurchase = async () => {
        // Validação do valor mínimo
        const valorTotal = calculateTotal(quantity);
        const VALOR_MINIMO = 5;

        if (valorTotal < VALOR_MINIMO) {
            setCpfError(`O valor mínimo para compra é R$ ${VALOR_MINIMO.toFixed(2)}. Valor atual: R$ ${valorTotal.toFixed(2)}. Por favor, aumente a quantidade de números.`);
            return;
        }

        if (!validateCpf(cpf)) {
            setCpfError("CPF inválido. Digite um CPF válido com 11 dígitos.");
            return;
        }

        setShowCpfModal(false);
        setShowPixModal(true);
        setIsLoadingPix(true);

        try {
            const response = await vendasService.comprarTicket({
                action_id: rifa.id,
                cpf: cpf.replace(/\D/g, ""),
                amount: quantity,
            });

            if (!response || response.error) {
                setIsLoadingPix(false);
                setShowRegisterForm(true);
                setRegisterData({
                    email: "",
                    name: "",
                    cpf: cpf.replace(/\D/g, ""),
                    whatsapp: "",
                });
                return;
            }

            // Verifica se é erro de CPF não encontrado de várias formas possíveis
            const errorMessage = response.data?.message?.toLowerCase() || "";
            const isCpfNotFound =
                errorMessage.includes("cpf não encontrado") ||
                errorMessage.includes("cpf nao encontrado") ||
                errorMessage.includes("unauthorized");

            if (isCpfNotFound) {
                setIsLoadingPix(false);
                setShowRegisterForm(true);
                setRegisterData({
                    email: "",
                    name: "",
                    cpf: cpf.replace(/\D/g, ""),
                    whatsapp: "",
                });
                return;
            }
            // Se chegou aqui, response.data existe
            setPixData({
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    response?.data?.qrCode || ""
                )}`,
                pixCopiaECola: response?.data?.qrCode || "",
                saleId: response?.data?.saleId || 0,
            });
            setIsLoadingPix(false);

        } catch (error: any) {
            setIsLoadingPix(false);
            setShowRegisterForm(true);
            setRegisterData({
                email: "",
                name: "",
                cpf: cpf.replace(/\D/g, ""),
                whatsapp: "",
            });
            return;
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
        setPaymentConfirmed(false);
        setIsCheckingPayment(false);
        setShowRegisterForm(false);
        setRegisterData({ email: "", name: "", cpf: "", whatsapp: "" });
        setRegisterErrors({ email: "", name: "", whatsapp: "" });
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

    const handleVerMeusNumeros = () => {
        setIsCPFModalOpen(true);
    };

    const handleCPFSuccess = (cpf: string) => {
        setConsultedCPF(cpf);
        setIsCPFModalOpen(false);
        setIsProfileModalOpen(true);
    };

    const handleGoToProfile = () => {
        setShowPixModal(false);
        setPaymentConfirmed(false);
        setIsCheckingPayment(false);

        if (isAuthenticated) {
            setIsProfileModalOpen(true);
        } else {
            setIsLoginModalOpen(true);
        }
    };

    const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "whatsapp") {
            const formattedWhatsapp = value
                .replace(/\D/g, "")
                .replace(/^(\d{2})(\d)/g, "($1) $2")
                .replace(/(\d)(\d{4})$/, "$1-$2");
            setRegisterData(prev => ({ ...prev, [name]: formattedWhatsapp }));
        } else {
            setRegisterData(prev => ({ ...prev, [name]: value }));
        }

        setRegisterErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateRegisterForm = () => {
        const errors = {
            email: "",
            name: "",
            whatsapp: "",
        };

        let isValid = true;

        if (!registerData.email) {
            errors.email = "Email é obrigatório";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
            errors.email = "Email inválido";
            isValid = false;
        }

        if (!registerData.name) {
            errors.name = "Nome é obrigatório";
            isValid = false;
        } else if (registerData.name.length < 3) {
            errors.name = "Nome deve ter pelo menos 3 caracteres";
            isValid = false;
        }

        if (!registerData.whatsapp) {
            errors.whatsapp = "WhatsApp é obrigatório";
            isValid = false;
        } else if (registerData.whatsapp.replace(/\D/g, "").length < 10) {
            errors.whatsapp = "WhatsApp inválido";
            isValid = false;
        }

        setRegisterErrors(errors);
        return isValid;
    };

    const handleRegisterAndGeneratePix = async () => {
        // Validação do valor mínimo
        const valorTotal = calculateTotal(quantity);
        const VALOR_MINIMO = 5;

        if (valorTotal < VALOR_MINIMO) {
            alert(`O valor mínimo para compra é R$ ${VALOR_MINIMO.toFixed(2)}. Valor atual: R$ ${valorTotal.toFixed(2)}. Por favor, aumente a quantidade de números.`);
            return;
        }

        if (!validateRegisterForm()) {
            return;
        }

        setIsLoadingPix(true);
        setShowRegisterForm(false);

        try {
            // Primeiro cria a conta
            const registerResponse = await authService.criarConta({
                email: registerData.email,
                name: registerData.name,
                cpf: registerData.cpf,
                whatsapp: registerData.whatsapp.replace(/\D/g, ""),
            });

            if (registerResponse.error || !registerResponse.data) {
                alert(`Erro ao criar conta: ${registerResponse.error || "Erro desconhecido"}`);
                setIsLoadingPix(false);
                setShowRegisterForm(true);
                return;
            }

            // Após criar a conta com sucesso, gera o PIX
            const pixResponse = await vendasService.comprarTicket({
                action_id: rifa.id,
                cpf: registerData.cpf,
                amount: quantity,
            });

            if (pixResponse.error || !pixResponse.data) {
                alert(`Erro ao gerar PIX: ${pixResponse.error || "Erro desconhecido"}`);
                setIsLoadingPix(false);
                setShowPixModal(false);
                return;
            }

            // Sucesso! Define os dados do PIX e para o loading
            setPixData({
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    pixResponse.data.qrCode
                )}`,
                pixCopiaECola: pixResponse.data.qrCode,
                saleId: pixResponse.data.saleId,
            });

            // Para o loading para mostrar o QR Code
            setIsLoadingPix(false);
        } catch (error) {
            alert("Erro ao processar sua solicitação. Tente novamente.");
            setIsLoadingPix(false);
            setShowRegisterForm(true);
        }
    };

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

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen pt-24 pb-12 px-6"
        >
            <div className="max-w-[900px] mx-auto">
                <motion.div variants={itemVariants} className="bg-[#f7f7f7] rounded-xl overflow-hidden">
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 rounded-t-md rounded-xl"
                            style={{
                                backgroundImage: 'url(/BANNER.png)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        ></motion.div>

                        <div className="flex w-full gap-1 mt-1">
                            <motion.div
                                initial={{ scale: 0, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                onClick={handleVerMeusNumeros}
                                transition={{ delay: 0.6, duration: 0.5, type: "spring", bounce: 0.4 }}
                                className="w-full"
                            >
                                <motion.button className="bg-[#4e0b09] shadow-xl border-t border-white/50 text-white p-1.5 text-xs uppercase font-bold rounded-md w-full">
                                    ver meus numeros
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Barra de Progresso de Vendas */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className=""
                    >
                        <div className="w-full mt-5">
                            {/* Header da barra de progresso */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-2 h-2 bg-green-400 rounded-full"
                                    />
                                    <span className="text-black/90 text-xs sm:text-sm font-semibold uppercase tracking-wide">
                                        Progresso da ação
                                    </span>
                                </div>
                                <span className="text-black/70 text-xs sm:text-sm font-bold">
                                    {(((rifa.soldTicketsCount || 0) / 1000000) * 100).toFixed(1)}%
                                </span>
                            </div>

                            {/* Barra de progresso */}
                            <div className="relative h-3 sm:h-4 bg-black/10 rounded-full overflow-hidden backdrop-blur-sm">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((rifa.soldTicketsCount || 0) / 1000000) * 100, 100)}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r overflow-hidden from-green-400 via-green-500 to-emerald-500 rounded-full shadow-lg"
                                >
                                    {/* Efeito de brilho animado */}
                                    <motion.div
                                        animate={{
                                            x: ['-100%', '200%']
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                            repeatDelay: 1
                                        }}
                                        className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-black/30 to-transparent"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="">
                        <motion.p variants={itemVariants} className="text-gray-500 text-xs mt-5 sm:text-base text-center mb-2 px-2">{rifa.description}</motion.p>

                        {/* Planos de Cotas Normais */}
                        <motion.div variants={itemVariants} className="mt-4 sm:mt-6">
                            <div
                                className="bg-[#2c0201] rounded-xl mb-5 flex items-center py-3 justify-between px-5"
                            >
                                <motion.p variants={itemVariants} className="text-white/70 uppercase text-sm sm:text-base text-center">
                                    Por apenas
                                </motion.p>
                                <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center shadow-md"
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
                                        className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white"
                                    >
                                        R$ {(rifa.ticketsPrice || 0).toFixed(2).replace(".", ",")}
                                    </motion.span>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3 }}
                                className="bg-white rounded-xl p-2.5 sm:p-3 border-2 border-gray-200"
                            >
                                <p className="text-center text-gray-600 text-xs sm:text-sm mb-3">
                                    Planos sem raspadinhas bônus
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                                    {[
                                        { qty: 5 },
                                        { qty: 10 },
                                        { qty: 25 },
                                        { qty: 50 },
                                    ].map((item, index) => (
                                        <motion.button
                                            key={item.qty}
                                            onClick={() => handleQuickSelect(item.qty)}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.4 + index * 0.05 }}
                                            whileHover={{ scale: 1.05, y: -3 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`relative ${selectedPackage === item.qty
                                                ? "bg-[#2c0201]/20 border-2 border-[#2c0201] shadow-lg shadow-teal-500/50"
                                                : "bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400"
                                                } rounded-xl p-2.5 sm:p-3 transition-all`}
                                        >
                                            {/* Badge de seleção */}
                                            {selectedPackage === item.qty && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                                                >
                                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </motion.div>
                                            )}

                                            <div className={`text-xl sm:text-2xl font-bold mb-1 text-black`}>

                                                {item.qty === 50 ? <div className="flex items-center justify-center">
                                                    <span className="text-[22px] sm:text-xs text-black">
                                                        {item.qty} +
                                                    </span>
                                                    <img src="/ico.png" className="max-w-12 -ml-1 -mr-2 invert-100" alt="" />
                                                </div> : item.qty}
                                            </div>

                                            <div className={`text-[10px] sm:text-xs uppercase tracking-wide text-black`}>
                                                Cotas
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.7 }}
                                    className="flex flex-row items-stretch gap-2 sm:gap-3 mt-3"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        <motion.button
                                            onClick={handleDecrement}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-full sm:rounded-full flex items-center justify-center transition-all"
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
                                            className="w-14 xs:w-24 sm:w-28 h-8 xs:h-11 sm:h-12 text-center text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                        />

                                        <motion.button
                                            onClick={handleIncrement}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-full sm:rounded-full flex items-center justify-center transition-all"
                                            aria-label="Aumentar quantidade"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        onClick={handleParticipar}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-4 bg-[#26a34a] hover:bg-green-500 text-white text-xs xs:text-sm sm:text-base font-bold h-10 xs:h-11 sm:h-12 px-3 xs:px-4
                                        rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-lg shadow-green-500/25 
                                        flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-1.5 text-base justify-center w-full">
                                            <span className="xs:hidden">PAGAR</span>
                                            R$ {(totalValue || 0).toFixed(2).replace(".", ",")}
                                        </div>
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Seção Encerra Em */}
                        {!rifa.closure && (
                            <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
                                <div
                                    className="bg-white shadow-md rounded-xl p-2 sm:rounded-2xl sm:p-6 relative overflow-hidden"
                                >
                                    <motion.div
                                        className="relative z-10">
                                        {/* Título */}
                                        <motion.h2
                                            className="text-center flex items-center justify-center gap-1 uppercase p-2 text-base px-5 sm:text-2xl md:text-3xl font-bold text-[#2c0201] mb-4"
                                        >
                                            menor cota valendo PS5 ou <br />R$ 3.000,00 no pix
                                            {/* <img src="/ico.png" alt="" className="max-w-12 rounded-full absolute right-0" /> */}
                                        </motion.h2>
                                        {/* Countdown Regressivo */}
                                        <div className="bg-[#2c0201] backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 uppercase">
                                            <p className="text-center text-white/90 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                                                Encerra em
                                            </p>
                                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                {timeRemaining.days > 0 && (
                                                    <>
                                                        <motion.div
                                                            key={`days-${timeRemaining.days}`}
                                                            initial={{ y: -20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="text-center"
                                                        >
                                                            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                                                                <span className="text-xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                                                                    {String(timeRemaining.days).padStart(2, '0')}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] sm:text-xs text-white/80 mt-1 block">dias</span>
                                                        </motion.div>
                                                        <span className="text-2xl sm:text-3xl font-bold text-white">:</span>
                                                    </>
                                                )}
                                                <motion.div
                                                    key={`hours-${timeRemaining.hours}`}
                                                    initial={{ y: -20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-center"
                                                >
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                                                        <span className="text-xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                                                            {String(timeRemaining.hours).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-white/80 mt-1 block">horas</span>
                                                </motion.div>
                                                <span className="text-2xl sm:text-3xl font-bold text-white">:</span>
                                                <motion.div
                                                    key={`minutes-${timeRemaining.minutes}`}
                                                    initial={{ y: -20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-center"
                                                >
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                                                        <span className="text-xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                                                            {String(timeRemaining.minutes).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-white/80 mt-1 block">min</span>
                                                </motion.div>
                                                <span className="text-2xl sm:text-3xl font-bold text-white">:</span>
                                                <motion.div
                                                    key={`seconds-${timeRemaining.seconds}`}
                                                    initial={{ y: -20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-center"
                                                >
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                                                        <span className="text-xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                                                            {String(timeRemaining.seconds).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-white/80 mt-1 block">seg</span>
                                                </motion.div>
                                            </div>
                                        </div>
                                        <motion.p className="text-center text-sm mt-2 text-[#2c0201] mb-2">valendo para compras acima de R$ 20,00</motion.p>

                                        {/* Texto promocional */}
                                        <motion.button
                                            onClick={handleScrollToCotas}
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                                            className="text-center w-full text-base sm:text-lg md:text-xl z-50 font-bold mb-2 bg-[#26a34a] rounded-md p-3 text-white uppercase">
                                            GARANTIR MINHA CHANCE
                                        </motion.button>

                                        {/* Data de validade */}
                                        {rifa.closure && (
                                            <p className="text-center text-white/80 text-xs sm:text-sm">
                                                Válido até {new Date(rifa.closure).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 }}
                            className="bg-[#fff] mt-2 shadow-sm rounded-xl p-5 sm:p-4 mb-3 sm:mb-4"
                        >
                            <div className="flex items-start gap-2 mb-2">
                                <div className="flex-1 text-center">
                                    <h4 className="text-base sm:text-sm font-bold text-[#2c0201] uppercase">A cada 50 cotas você ganha uma raspadinha</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                                {[
                                    { cotas: 100, raspadinhas: 2 },
                                    { cotas: 250, raspadinhas: 4 },
                                    { cotas: 500, raspadinhas: 8 },
                                    { cotas: 1000, raspadinhas: 16 },
                                    { cotas: 2000, raspadinhas: 32 },
                                    { cotas: 5000, raspadinhas: 80 },
                                ].map((item, index) => (
                                    <div
                                        key={item.cotas}
                                        className="bg-[#2c0201] rounded-lg whitespace-nowrap px-4 pr-0 sm:p-2 flex items-center justify-between gap-1"
                                    >
                                        <span className="text-[12px] sm:text-xs font-bold text-white">
                                            {item.cotas} cotas
                                        </span>
                                        <div className="flex items-center px-1.5 py-0.5 rounded">
                                            <span className="text-[12px] sm:text-xs font-black text-white">
                                                {item.raspadinhas}
                                            </span>
                                            <img src="/ico.png" className="max-w-12 -ml-1 -mr-2" alt="" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div ref={cotasRef} variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
                            <div
                                className="bg-[#2c0201] shadow-md rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        </div>
                                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Escolha seu combo de sorte</h2>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-gray-200"
                            >
                                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    {[
                                        { qty: 100, popular: false },
                                        { qty: 250, popular: false },
                                        { qty: 500, popular: true },
                                        { qty: 1000, popular: false },
                                        { qty: 2000, popular: false },
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
                                            className={`relative ${selectedPackage === item.qty
                                                ? "bg-[#2c0201]/30 border-2 border-[#2c0201] text-[#2c0201]"
                                                : item.popular
                                                    ? " border-2 border-[#2c0201]"
                                                    : "border-[#2c0201] border-2"
                                                } rounded-xl sm:rounded-2xl p-2 xs:p-3 sm:p-4 transition-all`}
                                        >
                                            {item.popular && selectedPackage !== item.qty && (
                                                <motion.div
                                                    initial={{ scale: 0, y: 10 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    transition={{ delay: 1.5, type: "spring" }}
                                                    className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                                                >
                                                    <span className="bg-[#2c0201] text-white text-[10px] xs:text-xs font-bold px-2 xs:px-3 py-0.5 xs:py-1 rounded-full whitespace-nowrap">
                                                        Mais popular
                                                    </span>
                                                </motion.div>
                                            )}

                                            {/* Badge de seleção */}
                                            {selectedPackage === item.qty && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                                                >
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </motion.div>
                                            )}

                                            <div className={`text-xl -mb-1 mt-1 xs:text-2xl flex items-center justify-center sm:text-3xl font-bold xs:mb-1 ${selectedPackage === item.qty ? "text-[#2c0201]" : "text-gray-900"
                                                }`}>
                                                {item.qty} + <img src="/ico.png" className={`max-w-9 -mx-2 invert-100`} alt="" />
                                            </div>

                                            <div className={`text-[10px] xs:text-xs uppercase tracking-wide mb-1 ${selectedPackage === item.qty ? "text-[#2c0201]/90" : "text-gray-500"
                                                }`}>
                                                Cotas
                                            </div>

                                        </motion.button>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.7 }}
                                    className="flex flex-row items-stretch gap-2 sm:gap-3 mt-3"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        <motion.button
                                            onClick={handleDecrement}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-full sm:rounded-full flex items-center justify-center transition-all"
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
                                            className="w-14 xs:w-24 sm:w-28 h-8 xs:h-11 sm:h-12 text-center text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                        />

                                        <motion.button
                                            onClick={handleIncrement}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 xs:w-11 xs:h-11 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-full sm:rounded-full flex items-center justify-center transition-all"
                                            aria-label="Aumentar quantidade"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        onClick={handleParticipar}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-4 bg-[#26a34a] hover:bg-green-500 text-white text-xs xs:text-sm sm:text-base font-bold h-10 xs:h-11 sm:h-12 px-3 xs:px-4
                                        rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-lg shadow-green-500/25 
                                        flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-1.5 text-base justify-center w-full">
                                            <span className="xs:hidden">PAGAR</span>
                                            R$ {(totalValue || 0).toFixed(2).replace(".", ",")}
                                        </div>
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Seção Bilhetes Premiados */}
                        <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
                            <div className="bg-[#2c0201] rounded-xl p-2.5 sm:p-3 mb-2 sm:mb-3">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm sm:text-base font-bold text-white">Bilhetes Premiados, achou ganhou!</h2>
                                </div>
                            </div>

                            {rifa.rewards && rifa.rewards.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                        {(showAllTickets ? rifa.rewards : rifa.rewards.slice(0, 8)).map((reward, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.03 * index }}
                                                whileHover={{ scale: 1.03 }}
                                                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 sm:p-2.5 border border-gray-200 hover:border-yellow-400 transition-all"
                                            >
                                                <div className="text-center mb-1.5">
                                                    <span className="text-sm sm:text-base font-bold text-gray-900">
                                                        {reward.name}
                                                    </span>
                                                </div>

                                                <div className="bg-[#2c0201]/20 rounded-md p-1.5 sm:p-2 mb-1">
                                                    <span className="text-[#2c0201] font-bold text-xs sm:text-sm tracking-wider block text-center">
                                                        {String(reward.number).padStart(6, '0')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className={`text-green-600 font-bold text-[10px] sm:text-xs ${reward.winnerId !== null ? "text-orange-400" : "text-green-600"}`}>
                                                        {reward.winnerId !== null ? "Sorteado" : "Disponível"}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Botão mostrar mais/menos */}
                                    {rifa.rewards.length > 8 && (
                                        <motion.button
                                            onClick={() => setShowAllTickets(!showAllTickets)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-[#2c0201] text-white mt-3 font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                                        >
                                            {showAllTickets ? (
                                                <>
                                                    Mostrar menos
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <>
                                                    Mostrar mais
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            )}
                                        </motion.button>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-6 sm:py-8 text-gray-500">
                                    <p className="text-sm sm:text-base">Nenhum prêmio cadastrado ainda</p>
                                </div>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
                            <div
                                className="p-3 sm:p-4 mb-3 sm:mb-4 px-0"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                                            <img src={"/ico.png"} className="invert-100 max-w-20" />
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg md:text-xl font-bold text-black">Raspadinhas Premiadas</h2>
                                            <p className="text-black/80 text-xs sm:text-sm">Veja a lista de prêmios</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 }}
                                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-gray-200"
                            >
                                <div className="relative border-b-2 border-gray-200 mb-4 sm:mb-6">
                                    <div className="flex gap-1">
                                        <motion.button
                                            onClick={() => setActiveTab("premios")}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`relative flex-1 py-3 sm:py-4 px-3 sm:px-4 md:px-6 font-bold text-sm sm:text-base transition-all duration-300
                                                ${activeTab === "premios"
                                                    ? "text-[#2c0201]"
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
                                                    className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full shadow-lg shadow-red-500/50"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>


                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key="premios"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-3"
                                    >
                                        <PrizesCarousel />
                                    </motion.div>

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
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Identificação</h3>
                                <p className="text-sm sm:text-base text-gray-500 px-4">
                                    Digite seu CPF para continuar com a compra
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-200 mb-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Cotas</p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900">{quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Raspadinhas</p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                                            {quantity === 50 && "1"}
                                            {quantity === 100 && "2"}
                                            {quantity === 200 && "4"}
                                            {quantity === 500 && "10"}
                                            {quantity === 1000 && "20"}
                                            {quantity === 2000 && "40"}
                                            {quantity === 5000 && "100"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs sm:text-sm text-gray-600">Valor total</p>
                                        <p className="text-xl sm:text-2xl font-bold text-green-600">
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
                                            ? "border-green-400 focus:border-green-500 bg-green-50"
                                            : "border-gray-300 focus:border-green-500"
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
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg text-sm sm:text-base"
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
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center px-4">
                                            {showRegisterForm ? "Criando sua conta..." : "Gerando Pagamento"}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-500 text-center px-4">
                                            {showRegisterForm ? "Aguarde enquanto criamos sua conta e geramos o pagamento..." : "Aguarde enquanto geramos seu código PIX..."}
                                        </p>
                                    </motion.div>
                                ) : showRegisterForm ? (
                                    <motion.div
                                        key="register"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-4 sm:space-y-6"
                                    >
                                        <div className="text-center pt-6 sm:pt-0">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Complete seu Cadastro</h3>
                                            <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
                                                CPF não encontrado. Complete seu cadastro para continuar com a compra.
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-600">Quantidade de cotas</p>
                                                    <p className="text-lg sm:text-xl font-bold text-gray-900">{quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs sm:text-sm text-gray-600">Valor total</p>
                                                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                                        R$ {(totalValue || 0).toFixed(2).replace(".", ",")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Nome completo *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="register-name"
                                                    name="name"
                                                    value={registerData.name}
                                                    onChange={handleRegisterInputChange}
                                                    className={`w-full px-4 py-3 sm:py-4 border-2 rounded-xl focus:outline-none transition-colors ${registerErrors.name
                                                        ? "border-red-400 focus:border-red-500 bg-red-50"
                                                        : "border-gray-300 focus:border-blue-500"
                                                        }`}
                                                    placeholder="Digite seu nome completo"
                                                />
                                                {registerErrors.name && (
                                                    <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {registerErrors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="register-email"
                                                    name="email"
                                                    value={registerData.email}
                                                    onChange={handleRegisterInputChange}
                                                    className={`w-full px-4 py-3 sm:py-4 border-2 rounded-xl focus:outline-none transition-colors ${registerErrors.email
                                                        ? "border-red-400 focus:border-red-500 bg-red-50"
                                                        : "border-gray-300 focus:border-blue-500"
                                                        }`}
                                                    placeholder="seu@email.com"
                                                />
                                                {registerErrors.email && (
                                                    <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {registerErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="register-cpf" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    CPF *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="register-cpf"
                                                    name="cpf"
                                                    value={formatCpf(registerData.cpf)}
                                                    disabled
                                                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed text-center font-mono"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="register-whatsapp" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    WhatsApp *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="register-whatsapp"
                                                    name="whatsapp"
                                                    value={registerData.whatsapp}
                                                    onChange={handleRegisterInputChange}
                                                    maxLength={15}
                                                    className={`w-full px-4 py-3 sm:py-4 border-2 rounded-xl focus:outline-none transition-colors ${registerErrors.whatsapp
                                                        ? "border-red-400 focus:border-red-500 bg-red-50"
                                                        : "border-gray-300 focus:border-blue-500"
                                                        }`}
                                                    placeholder="(00) 00000-0000"
                                                />
                                                {registerErrors.whatsapp && (
                                                    <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {registerErrors.whatsapp}
                                                    </p>
                                                )}
                                            </div>

                                            <motion.button
                                                onClick={handleRegisterAndGeneratePix}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg text-sm sm:text-base"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Criar Conta e Gerar PIX
                                            </motion.button>

                                            <button
                                                onClick={handleClosePixModal}
                                                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : paymentConfirmed ? (
                                    <motion.div
                                        key="confirmed"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                            className={`w-16 h-16 sm:w-20 sm:h-20 ${isAuthenticated ? "bg-green-500" : "bg-blue-500"} rounded-full flex items-center justify-center`}
                                        >
                                            {isAuthenticated ? (
                                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            )}
                                        </motion.div>

                                        <div className="text-center px-4">
                                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                                {isAuthenticated ? "Pagamento Confirmado!" : "Pagamento Gerado!"}
                                            </h3>
                                            {isAuthenticated ? (
                                                <>
                                                    <p className="text-sm sm:text-base text-gray-600">
                                                        Acesse seu perfil para ver seus números da sorte e verificar se você ganhou algum bilhete premiado!
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                                                        Seu código PIX foi gerado com sucesso!
                                                    </p>
                                                    <p className="text-sm sm:text-base text-gray-600">
                                                        <strong>Faça login</strong> para acompanhar seus números da sorte e verificar se você ganhou algum bilhete premiado!
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <div className={`bg-gradient-to-br ${isAuthenticated ? "from-green-50 to-green-100 border-green-200" : "from-blue-50 to-blue-100 border-blue-200"} rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 w-full`}>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <svg className={`w-5 h-5 ${isAuthenticated ? "text-green-600" : "text-blue-600"}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <p className="text-sm sm:text-base font-bold text-gray-900">
                                                        {quantity} cotas adquiridas
                                                    </p>
                                                </div>
                                                {isAuthenticated ? (
                                                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                                                        Seus números estão sendo processados e em breve estarão disponíveis no seu perfil
                                                    </p>
                                                ) : (
                                                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                                                        Seus números estarão disponíveis após o pagamento ser confirmado. Faça login para acompanhar!
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {isAuthenticated ? (
                                            <motion.button
                                                onClick={handleGoToProfile}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Ver Meus Números e Prêmios
                                            </motion.button>
                                        ) : (<>
                                            <motion.button
                                                onClick={handleGoToProfile}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                Fazer Login
                                            </motion.button>
                                            <p className="w-full text-center text-green-400 text-sm">Sua senha foi enviada para o seu email, confira sua caixa de entrada ou spam.</p>
                                        </>)}

                                        <button
                                            onClick={handleClosePixModal}
                                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
                                        >
                                            Fechar
                                        </button>
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
                                                    ? "bg-green-400 hover:bg-teal-700"
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

            <CPFInputModal
                isOpen={isCPFModalOpen}
                onClose={() => setIsCPFModalOpen(false)}
                onSuccess={handleCPFSuccess}
            />
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => {
                    setIsProfileModalOpen(false);
                    setConsultedCPF(undefined);
                }}
                cpf={consultedCPF}
            />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </motion.div>
    );
};
