"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingBag } from "react-icons/fa";

const NAMES = [
  "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa",
  "Lucas Ferreira", "Julia Rodrigues", "Marcos Souza", "Fernanda Lima",
  "Rafael Alves", "Beatriz Pereira", "Gabriel Gomes", "Larissa Martins"
];

const AMOUNTS = [
  "2", "5", "10", "20", "50", "100"
];

interface PurchaseNotification {
  id: number;
  name: string;
  amount: string;
  time: string;
}

export const PurchaseAlert: React.FC = () => {
  const [notification, setNotification] = useState<PurchaseNotification | null>(null);

  const generateNotification = () => {
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomAmount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];

    return {
      id: Date.now(),
      name: randomName,
      amount: randomAmount,
      time: "Agora mesmo"
    };
  };

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setNotification(generateNotification());
    }, 10000);

    const interval = setInterval(() => {
      setNotification(generateNotification());
    }, 5 * 60 * 1000);

    setNotification(generateNotification());

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  // Auto hide notification after 7 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white/95 backdrop-blur-sm text-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 min-w-[300px] pointer-events-auto"
          >
            <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
              <FaShoppingBag className="text-green-600 text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-600 mb-0.5 uppercase tracking-wide">
                Nova compra realizada!
              </p>
              <p className="text-sm font-bold text-gray-900">
                {notification.name}
              </p>
              <p className="text-xs text-gray-500">
                Comprou <span className="font-bold text-gray-700">{notification.amount} cotas</span> • {notification.time}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

