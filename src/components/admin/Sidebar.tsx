"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    FaHome,
    FaTicketAlt,
    FaChartLine,
    FaUsers,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: FaHome },
    { label: "Rifas", href: "/admin/rifas", icon: FaTicketAlt },
    // { label: "Financeiro", href: "/admin/financeiro", icon: FaChartLine },
    { label: "Clientes", href: "/admin/clientes", icon: FaUsers },
    { label: "Configurações", href: "/admin/configuracoes", icon: FaCog },
];

export const Sidebar = () => {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 flex flex-col z-50"
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
                <Link href="/admin" className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                        <span className="text-white text-2xl font-bold">R</span>
                    </motion.div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Ações</h1>
                        <p className="text-xs text-gray-400">Painel Admin</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                    ? "bg-red-500 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                    }`}
                            >
                                <Icon className="text-xl" />
                                <span className="font-semibold">{item.label}</span>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-700">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-700/50 transition-all"
                >
                    <FaSignOutAlt />
                    <span className="font-semibold">Sair</span>
                </motion.button>
            </div>
        </motion.aside>
    );
};
