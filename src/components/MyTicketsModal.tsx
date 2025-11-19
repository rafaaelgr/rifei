import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSearch, FaTicketAlt, FaGift } from "react-icons/fa";
import { ScratchCardModal } from "./ScratchCardModal";

interface MyTicketsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOCK_DATA = {
    name: "Rafael Rocha",
    tickets: ["0104453", "0368793", "0468099", "0545981", "0627531", "0123456", "0789012", "0345678"],
    scratchCards: [
        { id: 1, status: "available", prize: null, saleId: 1001 },
        { id: 2, status: "scratched", prize: "R$ 10,00", saleId: 1002 },
        { id: 3, status: "scratched", prize: null, saleId: 1003 }, // Lost
    ]
};

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({ isOpen, onClose }) => {
    const [cpf, setCpf] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "result">("input");
    const [error, setError] = useState("");
    const [data, setData] = useState<typeof MOCK_DATA | null>(null);
    const [scratchModalOpen, setScratchModalOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

    const formatCPF = (value: string): string => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        return value.slice(0, 14);
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setCpf(formatted);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cpf.replace(/\D/g, "").length !== 11) {
            setError("CPF inválido. Digite os 11 dígitos.");
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setData(MOCK_DATA);
            setStep("result");
        }, 1500);
    };

    const handleReset = () => {
        setStep("input");
        setCpf("");
        setData(null);
    };

    const handleClose = () => {
        onClose();
        setTimeout(handleReset, 300); // Reset after animation
    };

    const handleOpenScratch = (saleId: number) => {
        setSelectedSaleId(saleId);
        setScratchModalOpen(true);
    };

    const handleCloseScratch = () => {
        setScratchModalOpen(false);
        setSelectedSaleId(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-[#1e2024] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#313238] relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-2 hover:bg-[#313238] rounded-full"
                            >
                                <FaTimes />
                            </button>

                            <AnimatePresence mode="wait">
                                {step === "input" ? (
                                    <motion.div
                                        key="input"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-8"
                                    >
                                        <div className="flex flex-col items-center text-center mb-8">
                                            <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-4 text-[#FFD700]">
                                                <FaSearch size={24} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white mb-2">Buscar meus bilhetes</h2>
                                            <p className="text-gray-400 text-sm">Digite seu CPF para consultar suas cotas e raspadinhas</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                                                    Seu CPF
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cpf}
                                                    onChange={handleCPFChange}
                                                    placeholder="000.000.000-00"
                                                    className={`w-full bg-[#25282c] border ${error ? "border-red-500" : "border-[#313238] focus:border-[#FFD700]"} text-white px-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-gray-600 font-mono text-lg`}
                                                    autoFocus
                                                />
                                                {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold py-3.5 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Buscar bilhetes
                                                        <FaTicketAlt className="text-sm" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col max-h-[80vh]"
                                    >
                                        {/* Header Result */}
                                        <div className="p-6 bg-[#25282c] border-b border-[#313238]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {data?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">{data?.name}</h3>
                                                    <p className="text-gray-400 text-sm font-mono">{cpf}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                            {/* Cotas */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-white font-bold flex items-center gap-2">
                                                        <FaTicketAlt className="text-[#FFD700]" />
                                                        Suas Cotas
                                                    </h4>
                                                    <span className="bg-[#313238] text-gray-300 text-xs font-bold px-2 py-1 rounded">
                                                        {data?.tickets.length} números
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {data?.tickets.map((ticket, i) => (
                                                        <div key={i} className="bg-[#25282c] border border-[#313238] rounded-lg py-2 text-center text-white font-mono text-sm font-bold hover:border-[#FFD700] transition-colors cursor-default">
                                                            {ticket}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Raspadinhas */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-white font-bold flex items-center gap-2">
                                                        <FaGift className="text-[#FFD700]" />
                                                        Raspadinhas
                                                    </h4>
                                                    <span className="bg-[#313238] text-gray-300 text-xs font-bold px-2 py-1 rounded">
                                                        {data?.scratchCards.length} disponíveis
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {data?.scratchCards.map((card) => (
                                                        <div key={card.id} className="bg-[#25282c] border border-[#313238] p-3 rounded-xl flex items-center justify-between group hover:border-[#3a3b42] transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                                                                    ${card.status === 'available' ? 'bg-[#FFD700] text-black' :
                                                                        card.prize ? 'bg-green-500 text-white' : 'bg-[#313238] text-gray-500'}`}>
                                                                    {card.status === 'available' ? '?' : card.prize ? '🎉' : 'X'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-bold text-sm">
                                                                        {card.status === 'available' ? 'Raspadinha Disponível' :
                                                                            card.prize ? 'Você ganhou!' : 'Não foi dessa vez'}
                                                                    </p>
                                                                    <p className="text-gray-500 text-xs">
                                                                        {card.status === 'available' ? 'Clique para raspar' :
                                                                            card.prize ? card.prize : 'Tente novamente na próxima'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {card.status === 'available' && (
                                                                <button
                                                                    onClick={() => handleOpenScratch(card.saleId)}
                                                                    className="bg-[#FFD700] text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:scale-105 transition-transform"
                                                                >
                                                                    RASPAR
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="p-4 bg-[#25282c] border-t border-[#313238] flex gap-3">
                                            <button
                                                onClick={handleReset}
                                                className="flex-1 bg-[#313238] hover:bg-[#3a3b42] text-white font-bold py-3 rounded-xl transition-colors text-sm"
                                            >
                                                Nova Consulta
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Modal de Raspadinha */}
                    <ScratchCardModal
                        isOpen={scratchModalOpen}
                        onClose={handleCloseScratch}
                        saleId={selectedSaleId}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

