"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { authToken } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    cpf: string;
    role: "admin";
}

interface AdminAuthContextType {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (cpf: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedAdmin = localStorage.getItem("admin");
        const token = authToken.get();

        if (savedAdmin && token) {
            setAdmin(JSON.parse(savedAdmin));
        } else if (savedAdmin && !token) {
            localStorage.removeItem("admin");
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading && !admin && pathname?.startsWith("/admin") && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [admin, isLoading, pathname, router]);

    const clearError = () => setError(null);

    const login = async (cpf: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.login({ cpf, password });

            if (result.error || !result.data) {
                throw new Error(result.error || "Erro ao fazer login");
            }

            const responseData = result.data as any;
            let adminData: AdminUser;

            if (responseData.properties) {
                adminData = {
                    id: responseData.distinctId || responseData.properties.cpf || cpf,
                    name: responseData.properties.name,
                    email: responseData.properties.email || "",
                    cpf: responseData.properties.cpf || cpf,
                    role: "admin",
                };
            } else if (responseData.user) {
                adminData = {
                    id: responseData.user.id,
                    name: responseData.user.name,
                    email: responseData.user.email,
                    cpf: responseData.user.cpf,
                    role: "admin",
                };
            } else {
                throw new Error("Formato de resposta inválido");
            }

            setAdmin(adminData);
            localStorage.setItem("admin", JSON.stringify(adminData));
            router.push("/admin");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem("admin");
        authService.logout();
        router.push("/admin/login");
    };

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                isAuthenticated: !!admin,
                isLoading,
                error,
                login,
                logout,
                clearError,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    }
    return context;
};

