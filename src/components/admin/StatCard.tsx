"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg relative overflow-hidden`}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        {icon}
                    </div>
                </div>

                <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white mb-1">{value}</p>
                {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
            </div>
        </motion.div>
    );
};
