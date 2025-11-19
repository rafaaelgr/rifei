"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { authToken } from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    cpf: string;
    whatsapp: string;
    instagram?: string;
    avatar?: string;
    totalTickets: number;
    activeTickets: number;
    wonPrizes: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (cpf: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    clearError: () => void;
    resetPassword: {
        requestCode: () => Promise<void>;
        validateCode: (code: string) => Promise<boolean>;
        changePassword: (password: string) => Promise<void>;
    };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const token = authToken.get();

        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        } else if (savedUser && !token) {
            localStorage.removeItem("user");
        }
    }, []);

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
            let userData: User;

            if (responseData.properties) {
                userData = {
                    id: responseData.distinctId || responseData.properties.cpf || cpf,
                    name: responseData.properties.name,
                    email: responseData.properties.email || "",
                    cpf: responseData.properties.cpf || cpf,
                    whatsapp: responseData.properties.whatsapp || "",
                    totalTickets: 0,
                    activeTickets: 0,
                    wonPrizes: 0,
                };
            } else if (responseData.user) {
                userData = {
                    id: responseData.user.id,
                    name: responseData.user.name,
                    email: responseData.user.email,
                    cpf: responseData.user.cpf,
                    whatsapp: responseData.user.whatsapp,
                    totalTickets: 0,
                    activeTickets: 0,
                    wonPrizes: 0,
                };
            } else {
                throw new Error("Formato de resposta inválido");
            }

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        authService.logout();
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }
    };

    const resetPassword = {
        requestCode: async () => {
            setIsLoading(true);
            setError(null);
        },

        validateCode: async (code: string): Promise<any> => {
            setIsLoading(true);
            setError(null);
        },

        changePassword: async (password: string) => {
            setIsLoading(true);
            setError(null);
        },
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                error,
                login,
                logout,
                updateUser,
                clearError,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

