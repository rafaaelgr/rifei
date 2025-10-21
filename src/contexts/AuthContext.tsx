"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import type { LoginResponse } from "@/services/auth.service";

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
    register: (name: string, email: string, cpf: string, whatsapp: string, instagram: string, password: string) => Promise<void>;
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
        // Verificar se há usuário salvo no localStorage
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
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

            // A API pode retornar em dois formatos diferentes
            const responseData = result.data as any;
            let userData: User;

            if (responseData.properties) {
                // Formato com properties (resposta real da API)
                userData = {
                    id: responseData.distinctId || responseData.properties.cpf || cpf,
                    name: responseData.properties.name,
                    email: responseData.properties.email || "",
                    cpf: responseData.properties.cpf || cpf,
                    whatsapp: responseData.properties.whatsapp || "",
                    instagram: responseData.properties.instagram || "",
                    totalTickets: 0,
                    activeTickets: 0,
                    wonPrizes: 0,
                };
            } else if (responseData.user) {
                // Formato padrão documentado
                userData = {
                    id: responseData.user.id,
                    name: responseData.user.name,
                    email: responseData.user.email,
                    cpf: responseData.user.cpf,
                    whatsapp: responseData.user.whatsapp,
                    instagram: responseData.user.instagram,
                    totalTickets: 0,
                    activeTickets: 0,
                    wonPrizes: 0,
                };
            } else {
                throw new Error("Formato de resposta inválido");
            }

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            // Token pode não vir na resposta
            const token = responseData.token || `temp_${userData.cpf}_${Date.now()}`;
            localStorage.setItem("token", token);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (
        name: string,
        email: string,
        cpf: string,
        whatsapp: string,
        instagram: string,
        password: string
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.criarConta({
                name,
                email,
                cpf,
                whatsapp,
                instagram,
                password,
            });

            if (result.error || !result.data) {
                throw new Error(result.error || "Erro ao criar conta");
            }

            // A API pode retornar em diferentes formatos
            // Formato 1: { token, user: {...} }
            // Formato 2: { distinctId, event, properties: {...} }
            // Formato 3: { name, email, cpf, whatsapp, instagram, password }
            // Formato 4: { message: "Usuário criado com sucesso" } - apenas mensagem de sucesso
            const responseData = result.data as any;

            // Se a resposta for apenas uma mensagem de sucesso, retornar sem processar dados
            if (responseData.message && !responseData.properties && !responseData.user && !responseData.name) {
                // Retornar sucesso sem dados do usuário - LoginModal vai lidar com o redirecionamento
                return;
            }

            let userData: User;

            if (responseData.properties) {
                // Formato com properties (resposta real da API)
                userData = {
                    id: responseData.distinctId || responseData.properties.cpf,
                    name: responseData.properties.name,
                    email: responseData.properties.email,
                    cpf: responseData.properties.cpf,
                    whatsapp: whatsapp, // Não vem na resposta, usar o enviado
                    instagram: instagram, // Não vem na resposta, usar o enviado
                    totalTickets: 0,
                    activeTickets: 0,
                    wonPrizes: 0,
                };
            } else if (responseData.user) {
                // Formato padrão documentado
                userData = {
                    id: responseData.user.id,
                    name: responseData.user.name,
                    email: responseData.user.email,
                    cpf: responseData.user.cpf,
                    whatsapp: responseData.user.whatsapp,
                    instagram: responseData.user.instagram,
                    totalTickets: 0,
                    activeTickets: 0,
                    wonPrizes: 0,
                };
            } else if (responseData.name && responseData.email && responseData.cpf) {
                // Formato direto - a resposta retorna os dados do usuário diretamente
                userData = {
                    id: responseData.cpf,
                    name: responseData.name,
                    email: responseData.email,
                    cpf: responseData.cpf,
                    whatsapp: responseData.whatsapp || whatsapp,
                    instagram: responseData.instagram || instagram,
                    totalTickets: 0,
                    activeTickets: 0,
                    wonPrizes: 0,
                };
            } else {
                throw new Error("Formato de resposta inválido");
            }

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            // Token pode não vir na resposta, criar um token temporário se necessário
            const token = responseData.token || `temp_${userData.cpf}_${Date.now()}`;
            localStorage.setItem("token", token);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao criar conta";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
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

            try {
                const result = await authService.criarCodigoSeguranca();

                if (result.error || !result.data) {
                    throw new Error(result.error || "Erro ao solicitar código");
                }

                // Em desenvolvimento, o código pode vir na resposta
                if (process.env.NODE_ENV === "development" && result.data.code) {
                    console.log("Código de segurança:", result.data.code);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao solicitar código";
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },

        validateCode: async (code: string): Promise<boolean> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await authService.validarCodigo({ code });

                if (result.error || !result.data) {
                    throw new Error(result.error || "Código inválido");
                }

                return result.data.valid;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao validar código";
                setError(errorMessage);
                return false;
            } finally {
                setIsLoading(false);
            }
        },

        changePassword: async (password: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await authService.trocarSenha({ password });

                if (result.error || !result.data) {
                    throw new Error(result.error || "Erro ao trocar senha");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao trocar senha";
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
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
                register,
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

