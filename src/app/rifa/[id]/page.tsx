"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { rifasService } from "@/services/rifas.service";
import { GameDetail } from "@/components/GameDetail";
import type { Rifa } from "@/types";
import { Header } from "@/components/Header";

const RifaDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [rifa, setRifa] = useState<Rifa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const id = params.id as string;

    useEffect(() => {
        const carregarRifa = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await rifasService.obterInfo(id);

                if (response.error || !response.data || response.data.title === "") {
                    router.push("/rifa/12");
                    return;
                }

                setRifa(response.data);
            } catch (err) {
                console.error("Erro ao carregar rifa:", err);
                router.push("/rifa/12");
            } finally {
                setLoading(false);
            }
        };

        carregarRifa();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
                    <p className="mt-4 text-gray-600 font-medium">Carregando rifa...</p>
                </div>
            </div>
        );
    }

    if (error || !rifa) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center max-w-md">
                    <div className="mb-6">
                        <svg
                            className="mx-auto h-16 w-16 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar rifa</h2>
                    <p className="text-gray-600 mb-6">{error || "Rifa não encontrada"}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    return (<>
        <Header />
        <GameDetail rifa={rifa} />
    </>);
};

export default RifaDetailPage;

