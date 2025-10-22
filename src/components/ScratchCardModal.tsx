"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGift, FaStar, FaFire, FaGem, FaCrown, FaHeart, FaCheckCircle, FaTimesCircle, FaCode } from "react-icons/fa";
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

    // Função para mapear texto para ícone e cor
    const getPrizeStyle = (text: string, isWinner: boolean) => {
        // Se perdeu, usa estilo cinza e sem ícone/texto
        if (text.toLowerCase() === "perdeu") {
            return {
                icon: null,
                color: "from-gray-200 to-gray-300",
                showText: false
            };
        }

        // Se ganhou, determina ícone e cor baseado no tipo de prêmio
        const lowerText = text.toLowerCase();

        if (lowerText.includes("cota")) {
            return {
                icon: <FaGift className="text-4xl" />,
                color: "from-pink-400 to-pink-600",
                showText: true
            };
        }

        if (lowerText.includes("%") || lowerText.includes("off") || lowerText.includes("desconto")) {
            return {
                icon: <FaStar className="text-4xl" />,
                color: "from-purple-400 to-purple-600",
                showText: true
            };
        }

        if (lowerText.includes("r$") || lowerText.includes("reais")) {
            return {
                icon: <FaGem className="text-4xl" />,
                color: "from-emerald-400 to-emerald-600",
                showText: true
            };
        }

        // Default para prêmios
        return {
            icon: <FaCrown className="text-4xl" />,
            color: "from-yellow-400 to-yellow-600",
            showText: true
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

            try {
                // Gera um seed único baseado no timestamp
                const clientSeed = `SEED-${Date.now()}-${Math.random().toString(36).substring(7)}`;

                const response = await raspadinhaService.playRaspadinha({
                    saleId,
                    clientSeed
                });

                if (response.error) {
                    setError(response.error);
                    return;
                }

                if (response.data) {
                    setResult(response.data.result);

                    // Mapeia os squares para prizes
                    const mappedPrizes = response.data.result.squares.map((square) => {
                        const isWinner = square.toLowerCase() !== "perdeu";
                        const style = getPrizeStyle(square, isWinner);

                        return {
                            text: square,
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
                }
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
        setResult(null);
        setError(null);
        setShowDebug(false);
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
                    onClick={handleCloseModal}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
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
                            <p className="text-gray-600 font-medium text-base">
                                Para ganhar o prêmio, você precisa encontrar 3 iguais!
                            </p>
                            <p className="text-gray-600 font-medium">
                                {loading ? "Carregando..." : ""}
                            </p>
                        </div>

                        {/* Erro */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                            </motion.div>
                        )}

                        {/* Área da Raspadinha */}
                        {!loading && !error && prizes.length > 0 && (
                            <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl">
                                {/* Grid 3x3 de Prêmios (fica atrás do canvas) */}
                                <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-br from-gray-900 to-gray-800 relative z-0">
                                    {prizes.map((prize, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`aspect-square bg-gradient-to-br ${prize.color} rounded-xl flex flex-col items-center justify-center shadow-lg border-2 ${prize.isWinner ? 'border-yellow-300' : 'border-white/20'} relative overflow-hidden`}
                                        >
                                            {/* Brilho de fundo */}
                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

                                            <motion.div
                                                animate={isFullyRevealed && prize.isWinner ? {
                                                    scale: [1, 1.15, 1],
                                                    rotate: [0, 5, -5, 0]
                                                } : {}}
                                                transition={{
                                                    duration: 0.6,
                                                    repeat: isFullyRevealed && prize.isWinner ? Infinity : 0,
                                                    repeatDelay: 2,
                                                    delay: index * 0.1
                                                }}
                                                className="relative z-10 flex flex-col items-center gap-1"
                                            >
                                                {prize.showText && (
                                                    <>
                                                        <div className="text-white drop-shadow-lg">
                                                            {prize.icon}
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-bold text-white drop-shadow-lg text-center px-1">
                                                            {prize.text}
                                                        </span>
                                                    </>
                                                )}
                                            </motion.div>

                                            {/* Efeito de brilho apenas para vencedores */}
                                            {isFullyRevealed && prize.isWinner && (
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
                        )}

                        {/* Loading state */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-orange-500"></div>
                                </div>
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

                        {/* Resultado do Prêmio */}
                        {isFullyRevealed && result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                {result.squares.some(square => square.toLowerCase() !== "perdeu") ? (
                                    <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300">
                                        <div className="flex flex-col justify-center gap-3 mb-3">
                                            <FaCheckCircle className="text-green-600 text-3xl" />
                                            <h3 className="text-2xl font-bold text-green-700">
                                                Parabéns pelo prêmio!
                                            </h3>
                                            <h3 className="text-center text-gray-700 font-medium">
                                                O prêmio em Pix será enviado em até 48 horas.
                                                Caso precise de ajuda, entre em contato com o nosso suporte.
                                            </h3>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border-2 text-center border-gray-300">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-700">
                                                Você não deu sorte…
                                            </h3>
                                        </div>
                                        <h3 className="text-center text-gray-700 font-medium">Mas aqui vai um bônus!</h3>
                                        <p className="text-center text-gray-600 font-medium">
                                            Entre no nosso grupo VIP e participe de dinâmicas exclusivas!
                                        </p>

                                        <a
                                            href="https://chat.whatsapp.com/H5qGS8KmBmo1d3dtxJv7jJ?mode=wwt"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex text-sm font-bold justify-center items-center mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow hover:from-green-600 hover:to-green-800 transition-all"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            Clique aqui para ser redirecionado ao grupo VIP
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
                                className="w-full mb-4 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all border border-slate-300"
                            >
                                <FaCode size={14} />
                                {showDebug ? "Ocultar" : "Ver"} Informações de Verificação
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
                                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3">
                                    <h4 className="font-bold text-lg mb-3 text-white flex items-center gap-2">
                                        <FaCode />
                                        Informações de Verificação
                                    </h4>

                                    <div className="space-y-2">
                                        <div className="p-3 bg-slate-800 rounded-lg">
                                            <p className="text-xs text-slate-400 mb-1">Roll Principal</p>
                                            <p className="font-mono text-sm text-emerald-400 font-semibold">
                                                {result.debug.mainRoll}
                                            </p>
                                        </div>

                                        <div className="p-3 bg-slate-800 rounded-lg">
                                            <p className="text-xs text-slate-400 mb-2">Código de Verificação PHP</p>
                                            <div className="bg-slate-950 p-3 rounded border border-slate-700 overflow-x-auto">
                                                <code className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                                                    {result.debug.verification.phpCalculateRoll}
                                                </code>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-800 rounded-lg">
                                            <p className="text-xs text-slate-400 mb-2">URL de Verificação</p>
                                            <a
                                                href={result.debug.verification.verifyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
                                            >
                                                {result.debug.verification.verifyUrl}
                                            </a>
                                        </div>

                                        <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg mt-3">
                                            <p className="text-xs text-blue-300">
                                                💡 <strong>Como verificar:</strong> Copie o código PHP acima, cole no site de verificação e execute para confirmar o resultado.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Botões */}
                        {isFullyRevealed && !error && (
                            <div className="flex gap-3">
                                <motion.button
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all shadow-lg relative overflow-hidden"
                                >
                                    <motion.div
                                        animate={{ x: [-20, 200] }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                    />
                                    <span className="relative z-10">Fechar</span>
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
