"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { rifasService } from "@/services/rifas.service";
import { GameDetail } from "@/components/GameDetail";
import type { Rifa } from "@/types";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MdPix } from "react-icons/md";
import { MyTicketsModal } from "@/components/MyTicketsModal";
import { CheckoutModal } from "@/components/CheckoutModal";

const RifaDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [rifa, setRifa] = useState<Rifa | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMyTicketsModalOpen, setIsMyTicketsModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [ticketQuantity, setTicketQuantity] = useState(1);

    const id = params.id as string;
    const TICKET_PRICE = 10.00; // Preço unitário do bilhete

    // Funções para gerenciar quantidade de bilhetes
    const handlePackageSelect = (amount: number) => {
        setTicketQuantity(prev => prev + amount);
    };

    const handleIncrement = () => {
        setTicketQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        setTicketQuantity(prev => Math.max(1, prev - 1));
    };

    const calculateTotal = () => {
        return (ticketQuantity * TICKET_PRICE).toFixed(2);
    };

    // useEffect(() => {
    //     const carregarRifa = async () => {
    //         if (!id) return;

    //         setLoading(false);
    //         setError(null);

    //         try {
    //             const response = await rifasService.obterInfo(id);

    //             if (response.error || !response.data || response.data.title === "") {
    //                 router.push("/12");
    //                 return;
    //             }

    //             setRifa(response.data);
    //         } catch (err) {
    //             router.push("/12");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     carregarRifa();
    // }, [id, router]);

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

    // if (error || !rifa) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    //             <div className="text-center max-w-md">
    //                 <div className="mb-6">
    //                     <svg
    //                         className="mx-auto h-16 w-16 text-red-500"
    //                         fill="none"
    //                         stroke="currentColor"
    //                         viewBox="0 0 24 24"
    //                     >
    //                         <path
    //                             strokeLinecap="round"
    //                             strokeLinejoin="round"
    //                             strokeWidth={2}
    //                             d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    //                         />
    //                     </svg>
    //                 </div>
    //                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar rifa</h2>
    //                 <p className="text-gray-600 mb-6">{error || "Rifa não encontrada"}</p>
    //                 <button
    //                     onClick={() => router.push("/")}
    //                     className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
    //                 >
    //                     Voltar para Home
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <>
            <Header />
            <section className="relative flex flex-col items-center justify-center text-white overflow-hidden">
                <div className="relative w-full border-b border-[#313238] mb-8 overflow-hidden flex items-center justify-center py-4 sm:py-6 lg:py-8 px-4">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-red-500/30 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-pink-500/20 rounded-full blur-[120px] animate-pulse delay-75"></div>
                        <div className="absolute bottom-20 left-1/3 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse delay-150"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
                            <div className="w-full max-w-sm lg:max-w-md flex-shrink-0">
                                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src={"/BANNER.png"}
                                        alt={"Rifa"}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col justify-center bg-[#25282c] rounded-2xl p-4 sm:p-5 lg:p-6 border border-[#313238] w-full lg:w-auto lg:min-w-[400px]">
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold uppercase text-center lg:text-left">Loja de Pipa ou 25k no pix</h1>
                                <p className="text-base sm:text-lg text-gray-400 uppercase text-center lg:text-left mt-2">
                                    Por apenas{" "}
                                    <span className="text-white font-semibold text-lg sm:text-xl">
                                        R$ 10,00
                                    </span>
                                </p>
                                <hr className="w-full h-[1px] bg-[#3a3b42] border-none my-4 lg:my-5" />
                                <div>
                                    <p className="text-sm text-gray-400 mb-3 text-center lg:text-left">Redes sociais:</p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                        <button className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                            <span className="hidden sm:inline">Instagram</span>
                                        </button>
                                        <button className="bg-[#16ae4d] hover:bg-[#20BA5A] text-white font-semibold px-4 sm:px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            Grupo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-4xl px-4 mx-auto">
                    <div className="w-full bg-[#25282c] rounded-2xl p-4 sm:p-6 mb-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#313238] p-2 rounded-lg flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold">Bilhetes</h2>
                                    <p className="text-xs sm:text-sm text-gray-400">Selecione a quantidade que deseja comprar</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMyTicketsModalOpen(true)}
                                className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                            >
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="whitespace-nowrap">Ver meus bilhetes</span>
                            </button>
                        </div>

                        {/* Pacotes de bilhetes */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
                            <button
                                onClick={() => handlePackageSelect(10)}
                                className="bg-[#313238] hover:bg-[#303546] text-white rounded-xl p-3 sm:p-4 transition-all flex flex-col items-center justify-center min-h-[80px] sm:min-h-[90px]"
                            >
                                <span className="text-xs text-gray-400 mb-1">SELECIONAR</span>
                                <span className="text-lg sm:text-xl font-bold">+10</span>
                            </button>
                            <button
                                onClick={() => handlePackageSelect(37)}
                                className="border border-[#FFD700] hover:bg-[#FFC700] text-[#FFD700] hover:text-black rounded-xl p-3 sm:p-4 pt-5 sm:pt-6 transition-all flex flex-col items-center justify-center relative min-h-[80px] sm:min-h-[90px]"
                            >
                                <span className="absolute -top-2 left-1/2 transform whitespace-nowrap -translate-x-1/2 bg-[#FFD700] text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    ⭐ <span className="hidden sm:inline">Mais popular</span><span className="sm:hidden">Popular</span>
                                </span>
                                <span className="text-xs font-semibold mb-1">SELECIONAR</span>
                                <span className="text-lg sm:text-xl font-bold">+37</span>
                            </button>
                            <button
                                onClick={() => handlePackageSelect(50)}
                                className="bg-[#313238] hover:bg-[#303546] text-white rounded-xl p-3 sm:p-4 transition-all flex flex-col items-center justify-center min-h-[80px] sm:min-h-[90px]"
                            >
                                <span className="text-xs text-gray-400 mb-1">SELECIONAR</span>
                                <span className="text-lg sm:text-xl font-bold">+50</span>
                            </button>
                            <button
                                onClick={() => handlePackageSelect(500)}
                                className="bg-[#313238] hover:bg-[#303546] text-white rounded-xl p-3 sm:p-4 transition-all flex flex-col items-center justify-center min-h-[80px] sm:min-h-[90px]"
                            >
                                <span className="text-xs text-gray-400 mb-1">SELECIONAR</span>
                                <span className="text-lg sm:text-xl font-bold">+500</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
                            <button
                                onClick={handleDecrement}
                                className="bg-[#313238] hover:bg-[#303546] w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
                            >
                                <span className="text-xl sm:text-2xl font-bold">−</span>
                            </button>
                            <div className="bg-[#313238] px-6 sm:px-8 py-2 sm:py-3 rounded-lg min-w-[100px] sm:min-w-[120px] text-center">
                                <span className="text-xl sm:text-2xl font-bold">{ticketQuantity}</span>
                            </div>
                            <button
                                onClick={handleIncrement}
                                className="bg-[#313238] hover:bg-[#303546] w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all"
                            >
                                <span className="text-xl sm:text-2xl font-bold">+</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setIsCheckoutModalOpen(true)}
                            className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl transition-all"
                        >
                            Participar (R$ {calculateTotal().replace('.', ',')})
                        </button>
                    </div>

                    <div className="w-full">
                        <div className="bg-gradient-to-r from-[#252b3d] to-[#2a3142] rounded-2xl p-1">
                            <div className="bg-[#FFD700] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="bg-white p-2 rounded-lg flex-shrink-0">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                                                </svg>
                                                <h3 className="font-bold text-black text-sm sm:text-base">Raspadinhas instantâneas</h3>
                                            </div>
                                            <span className="bg-black text-[#FFD700] text-xs px-2 py-0.5 rounded-full font-semibold w-fit">Combos</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-black font-semibold mt-1">
                                            25 bilhetes <span className="font-normal">por</span> R$ 10,50
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-2 sm:px-3 py-2 rounded-lg w-full sm:w-auto justify-center">
                                    <span className="text-black font-bold text-xs sm:text-sm text-center">Recebe 1 raspadinha instantânea</span>
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        🎯
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 w-full max-w-4xl px-4 pb-20 mx-auto space-y-8 mt-8">
                {/* Bilhetes Premiados */}
                <div className="bg-[#25282c] rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#313238] p-2 rounded-lg flex-shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-white">Bilhetes premiados</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#313238] p-1 rounded-lg w-full lg:w-auto">
                            <button className="bg-[#FFD700] text-black text-xs font-bold px-2 sm:px-3 py-1.5 rounded-md text-center">
                                Todos 58
                            </button>
                            <button className="text-gray-400 hover:text-white text-xs font-bold px-2 sm:px-3 py-1.5 rounded-md transition-colors text-center">
                                Disponíveis 55
                            </button>
                            <button className="text-gray-400 hover:text-white text-xs font-bold px-2 sm:px-3 py-1.5 rounded-md transition-colors text-center">
                                Comprados 3
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        {[
                            { number: "0104453", prize: "R$ 1.000", status: "available" },
                            { number: "0368793", prize: "R$ 300", status: "available" },
                            { number: "0468099", prize: "R$ 300", status: "bought", winner: "Miguel T. C. Gonçalves" },
                            { number: "0545981", prize: "R$ 1.000", status: "available" },
                            { number: "0627531", prize: "R$ 500", status: "bought", winner: "Gustavo H. De S. Costa" },
                        ].map((ticket, index) => (
                            <div key={index} className="bg-[#313238] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group hover:bg-[#3a3c45] transition-colors">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <span className="font-mono font-bold text-white bg-[#25282c] px-2 py-1 rounded text-sm sm:text-base flex-shrink-0">
                                        {ticket.number}
                                    </span>
                                    <span className="text-gray-300 font-medium text-sm sm:text-base">{ticket.prize}</span>
                                </div>
                                <div className="flex-shrink-0">
                                    {ticket.status === "available" ? (
                                        <div className="flex items-center gap-2 justify-end sm:justify-start">
                                            <span className="text-green-500 text-xs sm:text-sm font-medium">Disponível</span>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400 justify-end sm:justify-start">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px] lg:max-w-none">{ticket.winner}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 bg-[#313238] hover:bg-[#3a3c45] text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        Ver mais
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Caixas Instantâneas */}
                <div className="bg-[#25282c] rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#313238] p-2 rounded-lg">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">Caixas instantâneas</h2>
                                <span className="bg-[#313238] text-gray-400 text-xs px-2 py-0.5 rounded font-medium">Ganhadores</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-[#313238] p-1 rounded-lg">
                            <button className="bg-[#FFD700] text-black text-xs font-bold px-3 py-1.5 rounded-md">
                                Todas 7
                            </button>
                            <button className="text-gray-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors">
                                Disponíveis 7
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {[
                            { prize: "R$ 100", status: "available" },
                            { prize: "R$ 150", status: "available" },
                            { prize: "R$ 200", status: "available" },
                            { prize: "R$ 100", status: "available" },
                            { prize: "R$ 150", status: "available" },
                        ].map((box, index) => (
                            <div key={index} className="bg-[#313238] rounded-xl p-4 flex items-center justify-between group hover:bg-[#3a3c45] transition-colors">
                                <span className="font-bold text-white">{box.prize}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-sm font-medium">Disponível</span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 bg-[#313238] hover:bg-[#3a3c45] text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        Ver mais
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Prêmios */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#25282c] p-2 rounded-lg border border-[#313238]">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Prêmios</h2>
                    </div>

                    <div className="bg-[#25282c] rounded-2xl p-6 border border-[#313238]">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🥇</span>
                            <span className="text-white font-semibold">1º ganhador(a): <span className="text-gray-400 font-normal">BMW M4 MAIS PROCURADA</span></span>
                        </div>
                    </div>
                </div>

                {/* Descrição */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#25282c] p-2 rounded-lg border border-[#313238]">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Descrição</h2>
                    </div>

                    <div className="bg-[#25282c] rounded-2xl p-6 border border-[#313238] text-gray-300 space-y-4">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <span>🚘</span>
                            <h3>BMW M4 MAIS PROCURADA</h3>
                        </div>

                        <p className="text-sm leading-relaxed">
                            O prêmio principal da rifa do BIG BOSS é uma BMW M4 MAIS PROCURADA, um veículo de alto padrão, com motorização potente e acabamento refinado.
                        </p>

                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span>💨</span>
                                <span><strong className="text-white">Motor:</strong> 3.0 Turbo a gasolina, 441 cv de potência</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>⚙️</span>
                                <span><strong className="text-white">Câmbio:</strong> Automático de 8 marchas</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>🎨</span>
                                <span><strong className="text-white">Cor:</strong> Vermelho "Puro Sangue" (envelopamento premium)</span>
                            </li>
                        </ul>

                        <div className="pt-2">
                            <div className="flex items-center gap-2 text-white font-bold mb-3 text-sm">
                                <span>🔧</span>
                                <h3>Acessórios e personalizações incluídas:</h3>
                            </div>
                            <ul className="space-y-2 text-sm pl-1">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    Volante BMW M4 em carbono com LED
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    Body Kit BMW M4
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    Jogo de lanternas CS Dragon Style em LED
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="relative z-10 w-full bg-[#1e2024] border-t border-[#313238] mt-5">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
                        {/* Redes Sociais */}
                        <div className="flex flex-col items-center md:items-start">
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Redes sociais</h3>
                            <a
                                href="#"
                                className="bg-[#25282c] p-3 rounded-xl hover:bg-[#313238] hover:scale-110 transition-all duration-300 text-gray-400 hover:text-[#E1306C] border border-[#313238] hover:border-[#E1306C]/30 shadow-lg"
                                aria-label="Instagram"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        </div>

                        {/* Informações */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Informações</h3>
                            <div className="flex flex-col gap-3 text-center">
                                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors text-sm flex items-center gap-2 group">
                                    Termos de uso
                                    <svg className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors text-sm flex items-center gap-2 group">
                                    Política de privacidade
                                    <svg className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end">
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Formas de pagamento</h3>
                            <div className="bg-[#25282c] p-3 rounded-xl border border-[#313238] shadow-lg hover:border-[#00BDAE]/50 transition-colors">
                                <MdPix className="w-8 h-8 text-[#00BDAE]" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8 border-t border-[#313238]">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex items-center gap-2 bg-[#25282c] hover:bg-[#313238] text-gray-400 hover:text-white px-6 py-2.5 rounded-full transition-all text-xs font-bold border border-[#313238] hover:border-gray-500 uppercase tracking-wide group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            Voltar ao topo
                        </button>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-xs text-gray-600">
                            © {new Date().getFullYear()} Rifa. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>

            <WhatsAppButton
                phoneNumber="5541998800114"
                message="Olá! Gostaria de mais informações sobre a rifa."
            />

            <MyTicketsModal
                isOpen={isMyTicketsModalOpen}
                onClose={() => setIsMyTicketsModalOpen(false)}
            />

            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                quantity={ticketQuantity}
                totalAmount={calculateTotal().replace('.', ',')}
                productName="BMW M4 MAIS PROCURADA"
                productImage="/BANNER.png"
            />
        </>
    );
};

export default RifaDetailPage;

