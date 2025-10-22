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

const getPrizeValue = (value: number): string => {
    if (value > 0) {
        return `R$ ${value}`;
    }
    return "Prêmio";
};

const PrizeCard = ({ prize, index }: { prize: Prize; index: number }) => {
    const prizeLabel = getPrizeValue(prize.value);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-48 sm:w-52 mx-2"
        >
            <div className="relative bg-[#2c0201]/10 border border-[#2c0201] rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 h-full">
                <div className="flex flex-col gap-2">
                    {/* Value Badge */}
                    <div className="flex items-center justify-between">
                        <span className="inline-block uppercase bg-[#2c0201]/20 border border-[#2c0201] px-3 py-1 rounded-full text-[#2c0201] text-xs font-bold">
                            {prizeLabel}
                        </span>
                    </div>

                    {/* Prize Name */}
                    <h3 className="text-[#2c0201] font-bold text-base leading-tight line-clamp-2">
                        {prize.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[#2c0201]/80 text-xs leading-snug line-clamp-2">
                        {prize.description}
                    </p>
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
    const cardWidth = 220; // width + margin (192px + 16px margin)
    const totalWidth = prizes.length * cardWidth;

    useEffect(() => {
        const animate = async () => {
            await controls.start({
                x: -totalWidth,
                transition: {
                    duration: prizes.length * 2, // 2 segundos por prêmio
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

