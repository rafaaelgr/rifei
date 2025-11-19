"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGift, FaStar, FaGem, FaCrown, FaHeart, FaCheckCircle, FaCode } from "react-icons/fa";
import { raspadinhaService, PlayRaspadinhaResult } from "@/services/raspadinha.service";

interface ScratchCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleId: number | null;
}

interface Prize {
    icon: React.ReactNode;
    text: string;
    color: string;
    isWinner: boolean;
    showText: boolean;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({ isOpen, onClose, saleId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScratching, setIsScratching] = useState(false);
    const [scratchPercentage, setScratchPercentage] = useState(0);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PlayRaspadinhaResult | null>(null);
    const [showDebug, setShowDebug] = useState(false);
    const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

    // Textos de motivação para quando não ganhar
    const motivationalTexts = [
        "Continue",
        "Vai chegar",
        "Você vai conseguir",
        "Não desista",
        "Próxima vez",
        "Quase lá",
        "Tente novamente",
        "Sorte na próxima"
    ];

    // Função para mapear texto para ícone e cor
    const getPrizeStyle = (text: string, isWinner: boolean, index: number) => {
        // Se perdeu, usa textos de motivação
        if (text.toLowerCase() === "perdeu") {
            const motivationalText = motivationalTexts[index % motivationalTexts.length];
            return {
                icon: <FaHeart className="text-3xl" />,
                color: "from-[#25282c] to-[#1e2024]", // Dark colors for losers
                showText: true,
                displayText: motivationalText
            };
        }

        // Se ganhou, determina ícone e cor baseado no tipo de prêmio
        const lowerText = text.toLowerCase();

        if (lowerText.includes("cota")) {
            return {
                icon: <FaGift className="text-4xl" />,
                color: "from-pink-500 to-purple-600",
                showText: true,
                displayText: text
            };
        }

        if (lowerText.includes("%") || lowerText.includes("off") || lowerText.includes("desconto")) {
            return {
                icon: <FaStar className="text-4xl" />,
                color: "from-purple-500 to-indigo-600",
                showText: true,
                displayText: text
            };
        }

        if (lowerText.includes("r$") || lowerText.includes("reais")) {
            return {
                icon: <FaGem className="text-4xl" />,
                color: "from-emerald-500 to-teal-600",
                showText: true,
                displayText: text
            };
        }

        // Default para prêmios
        return {
            icon: <FaCrown className="text-4xl" />,
            color: "from-yellow-400 to-orange-500",
            showText: true,
            displayText: text
        };
    };

    useEffect(() => {
        const fetchRaspadinha = async () => {
            if (!isOpen || !saleId) return;

            setLoading(true);
            setError(null);
            setScratchPercentage(0);
            setResult(null);
            setPrizes([]);
            lastPositionRef.current = null;

            try {
                // FAKE FETCH PARA TESTE - Simula resposta da API
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay de 1 segundo

                // Dados mockados para teste
                const fakePrizes = [
                    "R$ 10,00",      // Prêmio
                    "perdeu",        // Não ganhou
                    "R$ 10,00",      // Prêmio
                    "perdeu",        // Não ganhou
                    "R$ 10,00",      // Prêmio
                    "perdeu",        // Não ganhou
                    "perdeu",        // Não ganhou
                    "1 Cota Grátis", // Prêmio alternativo
                    "perdeu"         // Não ganhou
                ];

                const fakeResult: PlayRaspadinhaResult = {
                    squares: fakePrizes,
                    wonPrize: fakePrizes.filter(s => s.toLowerCase() !== "perdeu").length >= 3 ? 1 : null,
                    wonPrizeDetails: fakePrizes.filter(s => s.toLowerCase() !== "perdeu").length >= 3 ? {
                        type: "MONEY",
                        value: 10,
                        description: "R$ 10,00"
                    } : null,
                    debug: {
                        mainRoll: 0.42857142857142855,
                        verification: {
                            phpCalculateRoll: "<?php\necho hash_hmac('sha256', 'SERVER-SEED', 'CLIENT-SEED');\n?>",
                            verifyUrl: "https://phpfiddle.org/"
                        }
                    }
                };

                setResult(fakeResult);

                // Mapeia os squares para prizes
                const mappedPrizes = fakeResult.squares.map((square, index) => {
                    const isWinner = square.toLowerCase() !== "perdeu";
                    const style = getPrizeStyle(square, isWinner, index);

                    return {
                        text: style.displayText || square,
                        icon: style.icon,
                        color: style.color,
                        isWinner,
                        showText: style.showText
                    };
                });

                setPrizes(mappedPrizes);

                // Pequeno delay para garantir que o canvas seja renderizado
                setTimeout(() => {
                    initCanvas();
                }, 100);

                // ===== CÓDIGO REAL DA API (COMENTADO PARA TESTE) =====
                // const clientSeed = `SEED-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                // const response = await raspadinhaService.playRaspadinha({
                //     saleId,
                //     clientSeed
                // });
                // if (response.error) {
                //     setError(response.error);
                //     return;
                // }
                // if (response.data) {
                //     setResult(response.data.result);
                //     const mappedPrizes = response.data.result.squares.map((square, index) => {
                //         const isWinner = square.toLowerCase() !== "perdeu";
                //         const style = getPrizeStyle(square, isWinner, index);
                //         return {
                //             text: style.displayText || square,
                //             icon: style.icon,
                //             color: style.color,
                //             isWinner,
                //             showText: style.showText
                //         };
                //     });
                //     setPrizes(mappedPrizes);
                //     setTimeout(() => {
                //         initCanvas();
                //     }, 100);
                // }
            } catch (err) {
                console.error("Erro ao buscar raspadinha:", err);
                setError("Erro ao carregar raspadinha. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchRaspadinha();
    }, [isOpen, saleId]);

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Define o tamanho do canvas (ajusta ao container)
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }

        // Desenha o fundo prateado com textura de raspadinha mais sofisticada
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#9ca3af"); // gray-400
        gradient.addColorStop(0.25, "#d1d5db"); // gray-300
        gradient.addColorStop(0.5, "#9ca3af"); // gray-400
        gradient.addColorStop(0.75, "#d1d5db"); // gray-300
        gradient.addColorStop(1, "#9ca3af"); // gray-400

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Adiciona textura mais refinada
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        for (let i = 0; i < 300; i++) {
            const size = Math.random() * 2 + 1;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                size,
                size
            );
        }

        // Adiciona pequenas manchas escuras para textura
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        for (let i = 0; i < 150; i++) {
            const size = Math.random() * 3 + 1;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                size,
                size
            );
        }

        // Desenha linhas do grid mais sutis
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;

        // Linhas verticais
        ctx.beginPath();
        ctx.moveTo(canvas.width / 3, 0);
        ctx.lineTo(canvas.width / 3, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo((canvas.width / 3) * 2, 0);
        ctx.lineTo((canvas.width / 3) * 2, canvas.height);
        ctx.stroke();

        // Linhas horizontais
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 3);
        ctx.lineTo(canvas.width, canvas.height / 3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 3) * 2);
        ctx.lineTo(canvas.width, (canvas.height / 3) * 2);
        ctx.stroke();

        // Texto "RASPE AQUI" mais elegante
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;

        ctx.fillStyle = "#4b5563"; // gray-600
        ctx.font = "bold 32px 'Arial', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("RASPE AQUI", canvas.width / 2, canvas.height / 2);

        ctx.restore();

        // Logo ou marca d'água opcional
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.font = "bold 60px 'Arial', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText("RIFA", 0, 0);
        ctx.restore();
    };

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.globalCompositeOperation = "destination-out";

        // Raio maior para facilitar a raspagem (aumentado de 40 para 60)
        const radius = 60;

        // Desenha o círculo principal de raspagem
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Desenha círculos adicionais para área mais suave e ampla
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    };

    const scratchLine = (x1: number, y1: number, x2: number, y2: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calcula a distância entre os pontos
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        // Define quantos círculos desenhar ao longo da linha (mais círculos = mais suave)
        const steps = Math.ceil(distance / 10);

        // Desenha círculos ao longo da linha
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            scratch(x, y);
        }
    };

    const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isScratching) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        let clientX: number;
        let clientY: number;

        if ('touches' in e) {
            if (e.touches.length === 0) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // Para mouse, só raspa se o botão estiver pressionado
            if (e.buttons !== 1) return;
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        // Se temos posição anterior, desenha linha entre os pontos
        if (lastPositionRef.current) {
            scratchLine(lastPositionRef.current.x, lastPositionRef.current.y, x, y);
        } else {
            // Primeira raspagem no ponto
            scratch(x, y);
        }

        // Atualiza posição anterior
        lastPositionRef.current = { x, y };
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        scratch(x, y);
        lastPositionRef.current = { x, y };
    };

    const calculateScratchPercentage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Usa amostragem para melhor performance
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        let totalPixels = 0;

        // Verifica pixel por pixel com stride menor para mais precisão
        for (let i = 3; i < pixels.length; i += 16) {
            totalPixels++;
            // Considera transparente se alpha é menor que 128
            if (pixels[i] < 128) {
                transparentPixels++;
            }
        }

        const percentage = (transparentPixels / totalPixels) * 100;
        setScratchPercentage(percentage);

        // Se raspou mais de 70%, revela automaticamente
        if (percentage > 70 && scratchPercentage < 70) {
            handleRevealAll();
        }
    };

    const handleRevealAll = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Limpa o canvas completamente
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setScratchPercentage(100);
        lastPositionRef.current = null;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsScratching(true);
        // Raspa no ponto do clique também
        handleClick(e);
    };

    const handleMouseUp = () => {
        setIsScratching(false);
        lastPositionRef.current = null;
        // Calcula porcentagem ao soltar
        setTimeout(() => {
            calculateScratchPercentage();
        }, 100);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        setIsScratching(true);
        // Raspa no ponto do toque também
        if (e.touches.length > 0) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.touches[0].clientX - rect.left) * scaleX;
            const y = (e.touches[0].clientY - rect.top) * scaleY;

            scratch(x, y);
            lastPositionRef.current = { x, y };
        }
    };

    const handleTouchEnd = () => {
        setIsScratching(false);
        lastPositionRef.current = null;
        // Calcula porcentagem ao soltar
        setTimeout(() => {
            calculateScratchPercentage();
        }, 100);
    };

    const handleCloseModal = () => {
        setScratchPercentage(0);
        setPrizes([]);
        setResult(null);
        setError(null);
        setShowDebug(false);
        lastPositionRef.current = null;
        onClose();
    };

    const isFullyRevealed = scratchPercentage >= 60;

    // Não renderiza se não tem saleId
    if (!saleId) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4"
                    onClick={handleCloseModal}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-[#1e2024] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#313238] max-h-[90vh] overflow-y-auto"
                    >
                        {/* Botão Fechar */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#313238] rounded-full z-10"
                            aria-label="Fechar modal"
                        >
                            <FaTimes />
                        </button>

                        {/* Título */}
                        <div className="text-center mb-8 mt-2">
                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="inline-block mb-4"
                            >
                                <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center text-[#FFD700]">
                                    <FaGift className="text-3xl" />
                                </div>
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Raspe & Ganhe!
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Encontre 3 símbolos iguais para ganhar o prêmio indicado.
                            </p>
                        </div>

                        {/* Erro */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                            >
                                <p className="text-red-400 text-sm font-medium text-center">{error}</p>
                            </motion.div>
                        )}

                        {/* Área da Raspadinha */}
                        {!loading && !error && prizes.length > 0 && (
                            <div className="relative mb-6 rounded-xl overflow-hidden shadow-xl border border-[#313238]">
                                {/* Grid 3x3 de Prêmios (fica atrás do canvas) */}
                                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#25282c] relative z-0">
                                    {prizes.map((prize, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`aspect-square bg-gradient-to-br ${prize.color} rounded-lg flex flex-col items-center justify-center relative overflow-hidden`}
                                        >
                                            {/* Brilho de fundo */}
                                            <div className="absolute inset-0 bg-white/5"></div>

                                            <motion.div
                                                animate={isFullyRevealed && prize.isWinner ? {
                                                    scale: [1, 1.1, 1],
                                                    rotate: [0, 5, -5, 0]
                                                } : {}}
                                                transition={{
                                                    duration: 0.6,
                                                    repeat: isFullyRevealed && prize.isWinner ? Infinity : 0,
                                                    repeatDelay: 2,
                                                    delay: index * 0.1
                                                }}
                                                className="relative z-10 flex flex-col items-center gap-1 p-1"
                                            >
                                                {prize.showText && (
                                                    <>
                                                        <div className="text-white drop-shadow-md text-2xl">
                                                            {prize.icon}
                                                        </div>
                                                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md text-center leading-tight px-1">
                                                            {prize.text}
                                                        </span>
                                                    </>
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Canvas da Raspadinha (cobre todo o grid) */}
                                {scratchPercentage < 100 && (
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 cursor-crosshair w-full h-full select-none z-50"
                                        style={{ touchAction: "none" }}
                                        onMouseDown={handleMouseDown}
                                        onMouseUp={handleMouseUp}
                                        onMouseMove={handleScratch}
                                        onMouseLeave={handleMouseUp}
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                        onTouchMove={handleScratch}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                )}
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Barra de Progresso */}
                        {scratchPercentage > 0 && scratchPercentage < 100 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-gray-500">Progresso</span>
                                    <span className="text-xs font-bold text-[#FFD700]">
                                        {Math.round(scratchPercentage)}%
                                    </span>
                                </div>
                                <div className="w-full bg-[#25282c] rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scratchPercentage}%` }}
                                        className="h-full bg-[#FFD700] rounded-full"
                                        transition={{ duration: 0.1 }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Resultado do Prêmio */}
                        {isFullyRevealed && result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                {result.squares.filter(square => square.toLowerCase() !== "perdeu").length >= 3 ? (
                                    <div className="p-5 bg-[#25282c] border border-[#FFD700]/30 rounded-xl text-center">
                                        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FaCheckCircle size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Parabéns, você ganhou!
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            O prêmio será creditado automaticamente.
                                            Caso precise de ajuda, entre em contato com o suporte.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-[#25282c] border border-[#313238] rounded-xl text-center">
                                        <div className="w-12 h-12 bg-[#313238] text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FaHeart size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Não foi dessa vez
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Mas não desanime! Continue participando e boa sorte na próxima.
                                        </p>

                                        <a
                                            href="https://chat.whatsapp.com/H5qGS8KmBmo1d3dtxJv7jJ?mode=wwt"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-3 bg-[#313238] hover:bg-[#3a3b42] text-white text-sm font-bold rounded-xl transition-colors"
                                        >
                                            Entrar no Grupo VIP
                                        </a>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Botão de Debug */}
                        {isFullyRevealed && result && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={() => setShowDebug(!showDebug)}
                                className="w-full mb-4 flex items-center justify-center gap-2 text-gray-500 hover:text-white py-2 text-xs transition-colors"
                            >
                                <FaCode size={12} />
                                {showDebug ? "Ocultar" : "Ver"} validação
                            </motion.button>
                        )}

                        {/* Debug Info */}
                        {showDebug && result && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-4 bg-black/30 rounded-xl space-y-3 border border-[#313238]">
                                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                        <FaCode className="text-[#FFD700]" />
                                        Dados de Verificação
                                    </h4>

                                    <div className="space-y-2">
                                        <div className="p-2 bg-[#25282c] rounded-lg">
                                            <p className="text-[10px] text-gray-500 mb-1">Roll</p>
                                            <p className="font-mono text-xs text-green-400">
                                                {result.debug.mainRoll}
                                            </p>
                                        </div>

                                        <div className="p-2 bg-[#25282c] rounded-lg">
                                            <p className="text-[10px] text-gray-500 mb-1">Hash PHP</p>
                                            <div className="overflow-x-auto">
                                                <code className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap break-all">
                                                    {result.debug.verification.phpCalculateRoll}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Botões Finais */}
                        {isFullyRevealed && !error && (
                            <motion.button
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCloseModal}
                                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-[#FFD700]/10"
                            >
                                Fechar Raspadinha
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
