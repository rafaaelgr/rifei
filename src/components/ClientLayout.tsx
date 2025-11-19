"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { PurchaseAlert } from "./PurchaseAlert";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
    return (
        <AuthProvider>
            {children}
            <PurchaseAlert />
        </AuthProvider>
    );
};
