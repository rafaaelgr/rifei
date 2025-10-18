"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ClientesPage() {
    return (
        <div className="p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
                <p className="text-gray-600">Gerencie seus clientes e compradores</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
                <div className="text-6xl mb-4">👥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Em Desenvolvimento</h2>
                <p className="text-gray-600">
                    A página de gerenciamento de clientes estará disponível em breve.
                </p>
            </motion.div>
        </div>
    );
}
