"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGift, FaStar, FaFire, FaGem, FaCrown, FaHeart } from "react-icons/fa";

interface ScratchCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Prize {
    icon: React.ReactNode;
    text: string;
    color: string;
}

export const ScratchCardModal: React.FC<ScratchCardModalProps> = ({ isOpen, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScratching, setIsScratching] = useState(false);
    const [scratchPercentage, setScratchPercentage] = useState(0);
    const [prizes, setPrizes] = useState<Prize[]>([]);

    // Prêmios possíveis com ícones e cores
    const allPrizes: Prize[] = [
        {
            icon: <FaGift className="text-4xl" />,
            text: "1 Cota",
            color: "from-pink-400 to-pink-600"
        },
        {
            icon: <FaGem className="text-4xl" />,
            text: "5 Cotas",
            color: "from-blue-400 to-blue-600"
        },
        {
            icon: <FaStar className="text-4xl" />,
            text: "10% OFF",
            color: "from-purple-400 to-purple-600"
        },
        {
            icon: <FaCrown className="text-4xl" />,
            text: "20% OFF",
            color: "from-yellow-400 to-yellow-600"
        },
        {
            icon: <FaFire className="text-4xl" />,
            text: "3 Cotas",
            color: "from-orange-400 to-orange-600"
        },
        {
            icon: <FaHeart className="text-4xl" />,
            text: "R$ 50",
            color: "from-red-400 to-red-600"
        },
        {
            icon: <FaGem className="text-4xl" />,
            text: "R$ 100",
            color: "from-emerald-400 to-emerald-600"
        },
        {
            icon: <FaStar className="text-4xl" />,
            text: "25% OFF",
            color: "from-indigo-400 to-indigo-600"
        },
        {
            icon: <FaGift className="text-4xl" />,
            text: "2 Cotas",
            color: "from-teal-400 to-teal-600"
        }
    ];

    useEffect(() => {
        if (isOpen) {
            // Embaralha os prêmios ao abrir o modal
            const shuffledPrizes = [...allPrizes].sort(() => Math.random() - 0.5);
            setPrizes(shuffledPrizes);
            setScratchPercentage(0);

            // Pequeno delay para garantir que o canvas seja renderizado
            setTimeout(() => {
                initCanvas();
            }, 100);
        }
    }, [isOpen]);

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
        gradient.addColorStop(0, "#d4d4d8");
        gradient.addColorStop(0.25, "#f4f4f5");
        gradient.addColorStop(0.5, "#e4e4e7");
        gradient.addColorStop(0.75, "#f4f4f5");
        gradient.addColorStop(1, "#d4d4d8");

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
        ctx.strokeStyle = "rgba(120, 120, 120, 0.2)";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);

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

        ctx.setLineDash([]);

        // Texto "RASPE AQUI" mais elegante
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = "#71717a";
        ctx.font = "bold 32px 'Arial', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("RASPE AQUI", canvas.width / 2, canvas.height / 2 - 25);

        ctx.font = "20px 'Arial', sans-serif";
        ctx.fillStyle = "#a1a1aa";
        ctx.restore();
    };

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Desenha círculo transparente para "raspar" - tamanho maior
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();

        // Adiciona mais área de raspagem para ficar mais suave
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
    };

    const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

        scratch(x, y);
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
        calculateScratchPercentage();
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
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsScratching(true);
        // Raspa no ponto do clique também
        handleClick(e);
    };

    const handleMouseUp = () => {
        setIsScratching(false);
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
        }
    };

    const handleTouchEnd = () => {
        setIsScratching(false);
        // Calcula porcentagem ao soltar
        setTimeout(() => {
            calculateScratchPercentage();
        }, 100);
    };

    const handleCloseModal = () => {
        setScratchPercentage(0);
        setPrizes([]);
        onClose();
    };

    const isFullyRevealed = scratchPercentage >= 60;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
                    onClick={handleCloseModal}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-200"
                    >
                        {/* Botão Fechar */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCloseModal}
                            className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl z-10"
                            aria-label="Fechar modal"
                        >
                            <FaTimes className="text-xl" />
                        </motion.button>

                        {/* Título */}
                        <div className="text-center mb-6">
                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="inline-block mb-4"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                                    <FaGift className="text-white text-4xl" />
                                </div>
                            </motion.div>
                            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                                Raspe & Ganhe!
                            </h2>
                            <p className="text-gray-600 font-medium">
                                Descubra seus 9 prêmios incríveis 🎁
                            </p>
                        </div>

                        {/* Área da Raspadinha */}
                        <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Grid 3x3 de Prêmios (fica atrás do canvas) */}
                            <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-br from-gray-900 to-gray-800 relative z-0">
                                {prizes.map((prize, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`aspect-square bg-gradient-to-br ${prize.color} rounded-xl flex flex-col items-center justify-center shadow-lg border-2 border-white/20 relative overflow-hidden`}
                                    >
                                        {/* Brilho de fundo */}
                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

                                        <motion.div
                                            animate={isFullyRevealed ? {
                                                scale: [1, 1.15, 1],
                                                rotate: [0, 5, -5, 0]
                                            } : {}}
                                            transition={{
                                                duration: 0.6,
                                                repeat: isFullyRevealed ? Infinity : 0,
                                                repeatDelay: 2,
                                                delay: index * 0.1
                                            }}
                                            className="relative z-10 flex flex-col items-center gap-1"
                                        >
                                            <div className="text-white drop-shadow-lg">
                                                {prize.icon}
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold text-white drop-shadow-lg">
                                                {prize.text}
                                            </span>
                                        </motion.div>

                                        {/* Efeito de brilho */}
                                        {isFullyRevealed && (
                                            <motion.div
                                                initial={{ x: '-100%', opacity: 0 }}
                                                animate={{ x: '200%', opacity: [0, 1, 0] }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    repeatDelay: 3,
                                                    delay: index * 0.1
                                                }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                                            />
                                        )}
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

                        {/* Barra de Progresso */}
                        {scratchPercentage > 0 && scratchPercentage < 100 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Progresso</span>
                                    <motion.span
                                        key={Math.round(scratchPercentage)}
                                        initial={{ scale: 1.3 }}
                                        animate={{ scale: 1 }}
                                        className="text-sm font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent"
                                    >
                                        {Math.round(scratchPercentage)}%
                                    </motion.span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scratchPercentage}%` }}
                                        className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full shadow-lg"
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Botões */}
                        {isFullyRevealed && (
                            <div className="flex gap-3">
                                <motion.button
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all shadow-lg relative overflow-hidden"
                                >
                                    <motion.div
                                        animate={{ x: [-20, 200] }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                    />
                                    <span className="relative z-10">🎉 Resgatar Prêmios</span>
                                </motion.button>
                            </div>
                        )}

                        {isFullyRevealed && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-center mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                            >
                                <p className="text-sm font-semibold text-green-700">
                                    🎊 Parabéns! Seus prêmios estão prontos!
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
