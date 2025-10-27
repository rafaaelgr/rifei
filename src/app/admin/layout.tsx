"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const AdminLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const pathname = usePathname();

    // Permitir acesso à página de login sem autenticação
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <FaSpinner className="text-5xl text-red-500 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-gray-600 font-semibold">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminAuthProvider>
    );
}
