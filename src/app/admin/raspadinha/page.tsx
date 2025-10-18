"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaPlus,
    FaTrash,
    FaEdit,
    FaGift,
    FaTicketAlt,
    FaSpinner,
    FaExclamationTriangle,
    FaSave,
    FaTimes
} from "react-icons/fa";
import { raspadinhaService } from "@/services/raspadinha.service";
import type { Prize, Raspadinha, CreatePrizePayload, CreateRaspadinhaPayload, RaspadinhaReward } from "@/types";

type Tab = "premios" | "raspadinhas";
type PrizeType = "PIX" | "PRODUCT" | "DISCOUNT" | "OTHER";

export default function RaspadinhaPage() {
    const [activeTab, setActiveTab] = useState<Tab>("premios");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Prêmios
    const [premios, setPremios] = useState<Prize[]>([]);
    const [modalPremio, setModalPremio] = useState(false);
    const [editingPremio, setEditingPremio] = useState<Prize | null>(null);
    const [formPremio, setFormPremio] = useState<CreatePrizePayload>({
        name: "",
        description: "",
        value: 0,
        type: "PIX",
        image: "",
        active: true,
    });

    // Raspadinhas
    const [raspadinhas, setRaspadinhas] = useState<Raspadinha[]>([]);
    const [modalRaspadinha, setModalRaspadinha] = useState(false);
    const [formRaspadinha, setFormRaspadinha] = useState<CreateRaspadinhaPayload>({
        name: "",
        description: "",
        totalCards: 10000,
        rewards: [],
    });
    const [rewardFields, setRewardFields] = useState<RaspadinhaReward[]>([
        { prizeId: 0, rangeFrom: 0, rangeTo: 0, quantity: 1 }
    ]);

    useEffect(() => {
        carregarDados();
    }, [activeTab]);

    const carregarDados = async () => {
        setLoading(true);
        setError(null);

        if (activeTab === "premios") {
            const result = await raspadinhaService.listarPremios();
            if (result.error) {
                setError(result.error);
            } else {
                // Garantir que sempre definimos um array
                setPremios(Array.isArray(result.data) ? result.data : []);
            }
        } else {
            const result = await raspadinhaService.listarRaspadinhas();
            if (result.error) {
                setError(result.error);
            } else {
                // Garantir que sempre definimos um array
                setRaspadinhas(Array.isArray(result.data) ? result.data : []);
            }
        }

        setLoading(false);
    };

    // Handlers de Prêmios
    const handleOpenModalPremio = (premio?: Prize) => {
        if (premio) {
            setEditingPremio(premio);
            setFormPremio({
                name: premio.name,
                description: premio.description,
                value: premio.value,
                type: premio.type,
                image: premio.image,
                active: premio.active,
            });
        } else {
            setEditingPremio(null);
            setFormPremio({
                name: "",
                description: "",
                value: 0,
                type: "PIX",
                image: "",
                active: true,
            });
        }
        setModalPremio(true);
    };

    const handleCloseModalPremio = () => {
        setModalPremio(false);
        setEditingPremio(null);
        setFormPremio({
            name: "",
            description: "",
            value: 0,
            type: "PIX",
            image: "",
            active: true,
        });
    };

    const handleSavePremio = async () => {
        try {
            if (editingPremio) {
                const result = await raspadinhaService.atualizarPremio(editingPremio.id, formPremio);
                if (result.error) {
                    alert(`Erro: ${result.error}`);
                    return;
                }
            } else {
                const result = await raspadinhaService.criarPremio(formPremio);
                if (result.error) {
                    alert(`Erro: ${result.error}`);
                    return;
                }
            }

            handleCloseModalPremio();
            carregarDados();
        } catch (error) {
            console.error("Erro ao salvar prêmio:", error);
            alert("Erro ao salvar prêmio");
        }
    };

    const handleDeletePremio = async (prizeId: string) => {
        if (!confirm("Tem certeza que deseja deletar este prêmio?")) return;

        const result = await raspadinhaService.deletarPremio(prizeId);
        if (result.error) {
            alert(`Erro: ${result.error}`);
        } else {
            carregarDados();
        }
    };

    // Handlers de Raspadinha
    const handleOpenModalRaspadinha = async () => {
        // Carregar prêmios se ainda não foram carregados
        if (!Array.isArray(premios) || premios.length === 0) {
            const result = await raspadinhaService.listarPremios();
            if (!result.error && result.data) {
                setPremios(Array.isArray(result.data) ? result.data : []);
            }
        }

        setFormRaspadinha({
            name: "",
            description: "",
            totalCards: 10000,
            rewards: [],
        });
        setRewardFields([{ prizeId: 0, rangeFrom: 0, rangeTo: 0, quantity: 1 }]);
        setModalRaspadinha(true);
    };

    const handleCloseModalRaspadinha = () => {
        setModalRaspadinha(false);
        setFormRaspadinha({
            name: "",
            description: "",
            totalCards: 10000,
            rewards: [],
        });
        setRewardFields([{ prizeId: 0, rangeFrom: 0, rangeTo: 0, quantity: 1 }]);
    };

    const handleAddRewardField = () => {
        setRewardFields([...rewardFields, { prizeId: 0, rangeFrom: 0, rangeTo: 0, quantity: 1 }]);
    };

    const handleRemoveRewardField = (index: number) => {
        setRewardFields(rewardFields.filter((_, i) => i !== index));
    };

    const handleRewardFieldChange = (index: number, field: keyof RaspadinhaReward, value: number) => {
        const newFields = [...rewardFields];
        newFields[index] = { ...newFields[index], [field]: value };
        setRewardFields(newFields);
    };

    const handleSaveRaspadinha = async () => {
        try {
            const payload: CreateRaspadinhaPayload = {
                ...formRaspadinha,
                rewards: rewardFields.filter(r => r.prizeId > 0),
            };

            if (payload.rewards.length === 0) {
                alert("Adicione pelo menos um prêmio à raspadinha");
                return;
            }

            const result = await raspadinhaService.criarRaspadinha(payload);
            if (result.error) {
                alert(`Erro: ${result.error}`);
                return;
            }

            handleCloseModalRaspadinha();
            carregarDados();
        } catch (error) {
            console.error("Erro ao salvar raspadinha:", error);
            alert("Erro ao salvar raspadinha");
        }
    };

    const handleDeleteRaspadinha = async (raspadinhaId: string) => {
        if (!confirm("Tem certeza que deseja deletar esta raspadinha?")) return;

        const result = await raspadinhaService.deletarRaspadinha(raspadinhaId);
        if (result.error) {
            alert(`Erro: ${result.error}`);
        } else {
            carregarDados();
        }
    };

    const getPrizeTypeLabel = (type: PrizeType) => {
        const labels: Record<PrizeType, string> = {
            PIX: "PIX",
            PRODUCT: "Produto",
            DISCOUNT: "Desconto",
            OTHER: "Outro",
        };
        return labels[type];
    };

    const getPrizeTypeColor = (type: PrizeType) => {
        const colors: Record<PrizeType, string> = {
            PIX: "from-green-500 to-green-600",
            PRODUCT: "from-blue-500 to-blue-600",
            DISCOUNT: "from-purple-500 to-purple-600",
            OTHER: "from-gray-500 to-gray-600",
        };
        return colors[type];
    };

    return (
        <div className="p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Raspadinhas</h1>
                <p className="text-gray-600">Gerencie prêmios e raspadinhas</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <motion.button
                    onClick={() => setActiveTab("premios")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "premios"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                        }`}
                >
                    <FaGift />
                    Prêmios
                </motion.button>

                <motion.button
                    onClick={() => setActiveTab("raspadinhas")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "raspadinhas"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                        }`}
                >
                    <FaTicketAlt />
                    Raspadinhas
                </motion.button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <FaSpinner className="text-5xl text-red-500 animate-spin" />
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                    <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">Erro</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <motion.button
                        onClick={carregarDados}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Tentar novamente
                    </motion.button>
                </div>
            )}

            {/* Conteúdo */}
            {!loading && !error && (
                <AnimatePresence mode="wait">
                    {activeTab === "premios" && (
                        <motion.div
                            key="premios"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Header com botão adicionar */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Prêmios ({premios.length})
                                </h2>
                                <motion.button
                                    onClick={() => handleOpenModalPremio()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                                >
                                    <FaPlus />
                                    Novo Prêmio
                                </motion.button>
                            </div>

                            {/* Lista de prêmios */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.isArray(premios) && premios.map((premio, index) => (
                                    <motion.div
                                        key={premio.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-red-300 transition-all"
                                    >
                                        {/* Tipo do prêmio */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPrizeTypeColor(
                                                    premio.type
                                                )}`}
                                            >
                                                {getPrizeTypeLabel(premio.type)}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${premio.active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {premio.active ? "Ativo" : "Inativo"}
                                            </span>
                                        </div>

                                        {/* Nome e descrição */}
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {premio.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {premio.description}
                                        </p>

                                        {/* Valor */}
                                        <div className="mb-4">
                                            <p className="text-2xl font-bold text-green-600">
                                                R$ {premio.value.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Ações */}
                                        <div className="flex gap-2">
                                            <motion.button
                                                onClick={() => handleOpenModalPremio(premio)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                            >
                                                <FaEdit />
                                                Editar
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleDeletePremio(premio.id)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                            >
                                                <FaTrash />
                                                Deletar
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {(!Array.isArray(premios) || premios.length === 0) && (
                                <div className="text-center py-12 text-gray-500">
                                    <FaGift className="text-6xl mx-auto mb-4 opacity-30" />
                                    <p className="text-lg">Nenhum prêmio cadastrado</p>
                                    <p className="text-sm">Clique em "Novo Prêmio" para começar</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "raspadinhas" && (
                        <motion.div
                            key="raspadinhas"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Header com botão adicionar */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Raspadinhas ({raspadinhas.length})
                                </h2>
                                <motion.button
                                    onClick={handleOpenModalRaspadinha}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                                >
                                    <FaPlus />
                                    Nova Raspadinha
                                </motion.button>
                            </div>

                            {/* Lista de raspadinhas */}
                            <div className="grid grid-cols-1 gap-4">
                                {Array.isArray(raspadinhas) && raspadinhas.map((raspadinha, index) => (
                                    <motion.div
                                        key={raspadinha.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-red-300 transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {raspadinha.name}
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    {raspadinha.description}
                                                </p>

                                                <div className="flex items-center gap-6 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Total de Cards:</span>
                                                        <span className="ml-2 font-bold text-gray-900">
                                                            {raspadinha.totalCards.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Prêmios:</span>
                                                        <span className="ml-2 font-bold text-gray-900">
                                                            {raspadinha.rewards.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.button
                                                onClick={() => handleDeleteRaspadinha(raspadinha.id)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {(!Array.isArray(raspadinhas) || raspadinhas.length === 0) && (
                                <div className="text-center py-12 text-gray-500">
                                    <FaTicketAlt className="text-6xl mx-auto mb-4 opacity-30" />
                                    <p className="text-lg">Nenhuma raspadinha cadastrada</p>
                                    <p className="text-sm">Clique em "Nova Raspadinha" para começar</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Modal de Prêmio */}
            <AnimatePresence>
                {modalPremio && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModalPremio}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold">
                                        {editingPremio ? "Editar Prêmio" : "Novo Prêmio"}
                                    </h3>
                                    <button
                                        onClick={handleCloseModalPremio}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nome do Prêmio *
                                    </label>
                                    <input
                                        type="text"
                                        value={formPremio.name}
                                        onChange={(e) =>
                                            setFormPremio({ ...formPremio, name: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        placeholder="Ex: R$ 100 via PIX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descrição *
                                    </label>
                                    <textarea
                                        value={formPremio.description}
                                        onChange={(e) =>
                                            setFormPremio({ ...formPremio, description: e.target.value })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Descreva o prêmio..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Valor (R$) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formPremio.value}
                                            onChange={(e) =>
                                                setFormPremio({ ...formPremio, value: parseFloat(e.target.value) })
                                            }
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                            placeholder="100.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tipo *
                                        </label>
                                        <select
                                            value={formPremio.type}
                                            onChange={(e) =>
                                                setFormPremio({
                                                    ...formPremio,
                                                    type: e.target.value as PrizeType,
                                                })
                                            }
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        >
                                            <option value="PIX">PIX</option>
                                            <option value="PRODUCT">Produto</option>
                                            <option value="DISCOUNT">Desconto</option>
                                            <option value="OTHER">Outro</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        URL da Imagem
                                    </label>
                                    <input
                                        type="url"
                                        value={formPremio.image}
                                        onChange={(e) =>
                                            setFormPremio({ ...formPremio, image: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formPremio.active}
                                        onChange={(e) =>
                                            setFormPremio({ ...formPremio, active: e.target.checked })
                                        }
                                        className="w-5 h-5 text-red-500 border-2 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                                        Prêmio ativo
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-gray-50 p-6 flex gap-3 border-t border-gray-200">
                                <motion.button
                                    onClick={handleCloseModalPremio}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    onClick={handleSavePremio}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                                >
                                    <FaSave />
                                    Salvar
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Raspadinha */}
            <AnimatePresence>
                {modalRaspadinha && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModalRaspadinha}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 p-6 text-white z-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold">Nova Raspadinha</h3>
                                    <button
                                        onClick={handleCloseModalRaspadinha}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nome da Raspadinha *
                                    </label>
                                    <input
                                        type="text"
                                        value={formRaspadinha.name}
                                        onChange={(e) =>
                                            setFormRaspadinha({ ...formRaspadinha, name: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        placeholder="Ex: Raspadinha de Natal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descrição *
                                    </label>
                                    <textarea
                                        value={formRaspadinha.description}
                                        onChange={(e) =>
                                            setFormRaspadinha({ ...formRaspadinha, description: e.target.value })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Descreva a raspadinha..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Total de Cards *
                                    </label>
                                    <input
                                        type="number"
                                        value={formRaspadinha.totalCards}
                                        onChange={(e) =>
                                            setFormRaspadinha({
                                                ...formRaspadinha,
                                                totalCards: parseInt(e.target.value),
                                            })
                                        }
                                        min="1"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        placeholder="10000"
                                    />
                                </div>

                                {/* Prêmios */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-gray-900">
                                            Configurar Prêmios
                                        </h4>
                                        <motion.button
                                            onClick={handleAddRewardField}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                                        >
                                            <FaPlus />
                                            Adicionar
                                        </motion.button>
                                    </div>

                                    <div className="space-y-4">
                                        {rewardFields.map((reward, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                                Prêmio
                                                            </label>
                                                            <select
                                                                value={reward.prizeId}
                                                                onChange={(e) =>
                                                                    handleRewardFieldChange(
                                                                        index,
                                                                        "prizeId",
                                                                        parseInt(e.target.value)
                                                                    )
                                                                }
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-sm"
                                                            >
                                                                <option value={0}>
                                                                    Selecione um prêmio
                                                                </option>
                                                                {Array.isArray(premios) && premios.map((premio) => (
                                                                    <option
                                                                        key={premio.id}
                                                                        value={parseInt(premio.id)}
                                                                    >
                                                                        {premio.name} - R$ {premio.value.toFixed(2)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                                    Range De
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={reward.rangeFrom}
                                                                    onChange={(e) =>
                                                                        handleRewardFieldChange(
                                                                            index,
                                                                            "rangeFrom",
                                                                            parseInt(e.target.value)
                                                                        )
                                                                    }
                                                                    min="0"
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-sm"
                                                                    placeholder="0"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                                    Range Até
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={reward.rangeTo}
                                                                    onChange={(e) =>
                                                                        handleRewardFieldChange(
                                                                            index,
                                                                            "rangeTo",
                                                                            parseInt(e.target.value)
                                                                        )
                                                                    }
                                                                    min="0"
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-sm"
                                                                    placeholder="9999"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                                    Quantidade
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={reward.quantity}
                                                                    onChange={(e) =>
                                                                        handleRewardFieldChange(
                                                                            index,
                                                                            "quantity",
                                                                            parseInt(e.target.value)
                                                                        )
                                                                    }
                                                                    min="1"
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-sm"
                                                                    placeholder="1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {rewardFields.length > 1 && (
                                                        <motion.button
                                                            onClick={() => handleRemoveRewardField(index)}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-xs text-gray-600 mt-2">
                                        * Configure os ranges de probabilidade para cada prêmio. O range vai de 0
                                        até o total de cards - 1.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-gray-50 p-6 flex gap-3 border-t border-gray-200 z-10">
                                <motion.button
                                    onClick={handleCloseModalRaspadinha}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    onClick={handleSaveRaspadinha}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                                >
                                    <FaSave />
                                    Salvar
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

