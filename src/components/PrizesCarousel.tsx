"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

interface Prize {
    name: string;
    description: string;
    value: number;
}

const prizes: Prize[] = [
    {
        name: "PIX 20",
        description: "PIX DE 20 REAIS",
        value: 20
    },
    {
        name: "100 REAIS",
        description: "PIX",
        value: 100
    },
    {
        name: "100 REAIS",
        description: "PIX",
        value: 100
    },
    {
        name: "50 REAIS",
        description: "PIX",
        value: 50
    },
    {
        name: "20 REAIS",
        description: "PIX",
        value: 20
    },
    {
        name: "200 REAIS",
        description: "PIX",
        value: 200
    },
    {
        name: "500 REAIS",
        description: "PIX",
        value: 500
    },
    {
        name: "1000 REAIS",
        description: "PIX",
        value: 1000
    },
    {
        name: "VIP",
        description: "ACESSO AO GRUPO VIP",
        value: 0
    },
    {
        name: "TENTE NOVAMENTE",
        description: "Você ganhou mais uma chance",
        value: 0
    },
    {
        name: "KIT JOIA RARA",
        description: "Você ganhou uma carretilha 18 polegadas e uma linha joia rara",
        value: 0
    },
    {
        name: "CARRETILHA 18 POLEGADAS",
        description: "Você ganhou uma carretilha 18 polegadas",
        value: 0
    },
    {
        name: "LINHA JOIA RARA",
        description: "Você ganhou uma linha joia rara",
        value: 0
    }
];

const getPrizeGradient = (value: number, name: string): string => {
    if (name.includes("TENTE NOVAMENTE")) {
        return "from-gray-600 via-gray-700 to-gray-800";
    }
    if (name === "VIP") {
        return "from-purple-600 via-purple-700 to-purple-800";
    }
    if (name.includes("KIT") || name.includes("CARRETILHA") || name.includes("LINHA")) {
        return "from-green-600 via-green-700 to-green-800";
    }
    if (value >= 500) {
        return "from-yellow-500 via-amber-600 to-orange-600";
    }
    if (value >= 200) {
        return "from-blue-600 via-blue-700 to-blue-800";
    }
    if (value >= 100) {
        return "from-cyan-600 via-cyan-700 to-cyan-800";
    }
    if (value >= 50) {
        return "from-teal-600 via-teal-700 to-teal-800";
    }
    return "from-emerald-600 via-emerald-700 to-emerald-800";
};

const getPrizeIcon = (name: string): string => {
    if (name.includes("TENTE NOVAMENTE")) return "🔄";
    if (name === "VIP") return "👑";
    if (name.includes("KIT") || name.includes("CARRETILHA") || name.includes("LINHA")) return "🎣";
    return "💰";
};

const PrizeCard = ({ prize, index }: { prize: Prize; index: number }) => {
    const gradient = getPrizeGradient(prize.value, prize.name);
    const icon = getPrizeIcon(prize.name);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-72 sm:w-80 mx-3"
        >
            <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300 h-full`}>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Icon and Value */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-5xl drop-shadow-lg">{icon}</span>
                        {prize.value > 0 && (
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span className="text-white font-bold text-lg">
                                    R$ {prize.value}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Prize Name */}
                    <h3 className="text-white font-extrabold text-2xl mb-2 drop-shadow-lg leading-tight">
                        {prize.name}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-sm font-medium drop-shadow leading-relaxed">
                        {prize.description}
                    </p>

                    {/* Decorative element */}
                    <div className="mt-auto pt-4">
                        <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white/40"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const PrizesCarousel = () => {
    const [isPaused, setIsPaused] = useState(false);
    const controls = useAnimationControls();

    // Triplicar os prêmios para criar o efeito infinito
    const infinitePrizes = [...prizes, ...prizes, ...prizes];
    const cardWidth = 320; // width + margin
    const totalWidth = prizes.length * cardWidth;

    useEffect(() => {
        const animate = async () => {
            await controls.start({
                x: -totalWidth,
                transition: {
                    duration: prizes.length * 3, // 3 segundos por prêmio
                    ease: "linear",
                    repeat: Infinity,
                }
            });
        };

        if (!isPaused) {
            animate();
        }
    }, [controls, totalWidth, isPaused, prizes.length]);

    const handleMouseEnter = () => {
        setIsPaused(true);
        controls.stop();
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    return (
        <div className="w-full overflow-hidden">

            <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >

                <motion.div
                    className="flex"
                    animate={controls}
                    style={{ width: "fit-content" }}
                >
                    {infinitePrizes.map((prize, index) => (
                        <PrizeCard key={`prize-${index}`} prize={prize} index={index % prizes.length} />
                    ))}
                </motion.div>
            </div>

            {/* Pause indicator */}
            {isPaused && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-6"
                >
                    <span className="inline-block px-6 py-2 rounded-full text-black text-xs font-medium">
                        Pausado - Mova o mouse para continuar
                    </span>
                </motion.div>
            )}
        </div>
    );
};

