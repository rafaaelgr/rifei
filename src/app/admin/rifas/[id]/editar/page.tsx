"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaImage, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { rifasService } from "@/services/rifas.service";

export default function EditarRifaPage() {
    const router = useRouter();
    const params = useParams();
    const rifaId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const [formData, setFormData] = useState({
        titulo: "",
        descricao: "",
        imagemPrincipal: "",
        preco: "",
        totalCotas: "",
        dataInicio: "",
        dataFim: "",
        status: "ativa" as "ativa" | "pausada" | "finalizada",
    });

    const [promocoes, setPromocoes] = useState<Array<{ id?: string; quantidade: string; preco: string }>>([
        { quantidade: "", preco: "" },
    ]);

    const [rewardsCurrentPage, setRewardsCurrentPage] = useState(1);
    const rewardsPerPage = 4;

    const [premios, setPremios] = useState<Array<{
        id?: string;
        numero: string;
        name: string;
        descricao: string;
        rewardType: "NUMBER" | "RASPADINHA";
        saved?: boolean;
    }>>([]);

    const [numerosBloqueados, setNumerosBloqueados] = useState<string>("");

    // Buscar dados da rifa ao carregar o componente
    useEffect(() => {
        const carregarDadosRifa = async () => {
            if (!rifaId) {
                setError("ID da rifa não encontrado");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Buscar informações da rifa
                const responseRifa = await rifasService.obterInfo(rifaId);

                if (responseRifa.error || !responseRifa.data) {
                    throw new Error(responseRifa.error || "Erro ao carregar dados da rifa");
                }

                const rifa = responseRifa.data;

                // Log para debug
                // Preencher formulário com dados da rifa (com valores padrão)
                setFormData({
                    titulo: rifa.title || "",
                    descricao: rifa.description || "",
                    imagemPrincipal: rifa.image || "",
                    preco: (rifa.ticketsPrice !== undefined && rifa.ticketsPrice !== null) ? rifa.ticketsPrice.toString() : "0.00",
                    totalCotas: "0", // Campo não mais disponível na nova API
                    dataInicio: new Date().toISOString().split('T')[0], // Campo não mais disponível na nova API
                    dataFim: rifa.closure ? new Date(rifa.closure).toISOString().split('T')[0] : "",
                    status: rifa.finished ? "finalizada" : "ativa",
                });

                // Preencher promoções (packages)
                if (rifa.packages && rifa.packages.length > 0) {
                    setPromocoes(rifa.packages.map((pkg, index) => ({
                        id: index.toString(),
                        quantidade: (pkg.quantidade !== undefined && pkg.quantidade !== null) ? pkg.quantidade.toString() : "",
                        preco: (pkg.preco !== undefined && pkg.preco !== null) ? pkg.preco.toString() : "",
                    })));
                } else {
                    // Se não houver promoções, manter uma linha vazia
                    setPromocoes([{ quantidade: "", preco: "" }]);
                }

                // Buscar prêmios
                const responsePremios = await rifasService.obterPremios(rifaId);

                if (responsePremios.data && Array.isArray(responsePremios.data)) {
                    setPremios(responsePremios.data.map((premio: any) => ({
                        id: premio.id,
                        numero: premio.number?.toString() || "",
                        name: premio.name || "",
                        descricao: premio.description || "",
                        rewardType: premio.rewardType || "NUMBER",
                        saved: true,
                    })));
                } else {
                    // Se não houver prêmios, manter array vazio
                    setPremios([]);
                }

                // Carregar números bloqueados se existirem
                if (rifa.blocked && rifa.blocked.length > 0) {
                    setNumerosBloqueados(rifa.blocked.join(", "));
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar dados");
            } finally {
                setLoading(false);
            }
        };

        carregarDadosRifa();
    }, [rifaId]);

    // Efeito para validar e carregar a imagem quando a URL mudar
    useEffect(() => {
        const loadImage = () => {
            const url = formData.imagemPrincipal.trim();

            // Reset estados
            setImageLoaded(false);
            setImageError(false);

            // Se não houver URL, não fazer nada
            if (!url) {
                setImageLoading(false);
                return;
            }

            // Validar se é uma URL válida
            try {
                new URL(url);
            } catch {
                setImageError(true);
                setImageLoading(false);
                return;
            }

            // Começar loading
            setImageLoading(true);

            // Criar elemento de imagem para pré-carregar
            const img = new Image();

            img.onload = () => {
                setImageLoading(false);
                setImageLoaded(true);
                setImageError(false);
            };

            img.onerror = () => {
                setImageLoading(false);
                setImageLoaded(false);
                setImageError(true);
            };

            img.src = url;
        };

        // Debounce para não fazer requisições a cada tecla digitada
        const timeoutId = setTimeout(loadImage, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.imagemPrincipal]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddPromocao = () => {
        setPromocoes([...promocoes, { quantidade: "", preco: "" }]);
    };

    const handleRemovePromocao = (index: number) => {
        setPromocoes(promocoes.filter((_, i) => i !== index));
    };

    const handlePromocaoChange = (index: number, field: string, value: string) => {
        const newPromocoes = [...promocoes];
        newPromocoes[index] = { ...newPromocoes[index], [field]: value };
        setPromocoes(newPromocoes);
    };

    const handleAddPremio = () => {
        setPremios([...premios, { numero: "", name: "", descricao: "", rewardType: "NUMBER", saved: false }]);
    };

    const handleRemovePremio = async (index: number) => {
        const premio = premios[index];

        // Se o prêmio já foi salvo, deletar da API
        if (premio.id && premio.saved) {
            try {
                const response = await rifasService.deletarPremio(premio.id);
                if (response.error) {
                    alert(`Erro ao remover prêmio: ${response.error}`);
                    return;
                }
            } catch (error) {
                alert("Erro ao remover prêmio");
                return;
            }
        }

        setPremios(premios.filter((_, i) => i !== index));
    };

    const handlePremioChange = (index: number, field: string, value: string) => {
        const newPremios = [...premios];
        newPremios[index] = { ...newPremios[index], [field]: value };
        setPremios(newPremios);
    };

    const handleSavePremio = async (index: number) => {
        const premio = premios[index];

        // Validar campos obrigatórios
        if (!premio.numero || !premio.name || !premio.descricao || !premio.rewardType) {
            alert("Por favor, preencha todos os campos do prêmio");
            return;
        }

        if (!rifaId) {
            alert("ID da rifa não encontrado");
            return;
        }

        try {
            // Preparar payload para a API
            const payload = {
                raffleId: parseInt(rifaId),
                number: parseInt(premio.numero),
                rewardType: premio.rewardType,
                name: premio.name,
                description: premio.descricao,
                image: "",
            };

            const response = await rifasService.adicionarPremio(payload);

            if (response.error) {
                alert(`Erro ao salvar prêmio: ${response.error}`);
                return;
            }

            // Atualizar o prêmio no state marcando como salvo
            const newPremios = [...premios];
            newPremios[index] = {
                ...newPremios[index],
                saved: true,
                id: (response.data as any)?.id?.toString() || premio.id,
            };
            setPremios(newPremios);

            alert("Prêmio salvo com sucesso!");
        } catch (error) {
            alert("Erro ao salvar prêmio");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rifaId) {
            alert("ID da rifa não encontrado");
            return;
        }

        // Processar números bloqueados
        const blockedNumbers = numerosBloqueados
            .split(",")
            .map(n => n.trim())
            .filter(n => n !== "" && !isNaN(Number(n)))
            .map(n => Number(n));

        // Preparar dados para enviar para a API no formato esperado
        const payload = {
            title: formData.titulo,
            description: formData.descricao,
            image: formData.imagemPrincipal,
            ticketsPrice: parseFloat(formData.preco),
            minPrice: parseFloat(formData.preco),
            numberTickets: parseInt(formData.totalCotas),
            finished: formData.status === "finalizada",
            mainAction: true,
            blocked: blockedNumbers,
            packages: promocoes
                .filter(p => p.quantidade && p.preco)
                .map((promo, idx) => ({
                    id: idx + 1,
                    quantity: parseInt(promo.quantidade),
                })),
        };

        try {
            setSubmitting(true);
            setError(null);

            // Tentar atualizar usando o serviço
            const response = await rifasService.atualizar(rifaId, payload);

            if (response.error) {
                throw new Error(response.error);
            }

            router.push("/admin/rifas");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar rifa";

            // Se for erro de endpoint não implementado, mostrar mensagem específica
            if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
                alert("⚠️ Endpoint de atualização ainda não implementado no backend.\nDados preparados e logados no console para referência.");
            } else {
                setError(errorMessage);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen bg-[#1c1d1f]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <FaSpinner className="text-6xl text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-400">Carregando dados da rifa...</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-8 min-h-screen bg-[#1c1d1f]">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Voltar</span>
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center"
                >
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Erro ao Carregar Rifa</h2>
                    <p className="text-red-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/admin/rifas")}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        Voltar para Rifas
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-[#1c1d1f]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    disabled={submitting}
                >
                    <FaArrowLeft />
                    <span>Voltar</span>
                </button>

                <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">EDITAR RIFA</h1>
                <p className="text-gray-400">Atualize os dados da rifa #{rifaId}</p>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informações Básicas */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Informações Básicas</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="titulo" className="block text-sm font-semibold text-gray-400 mb-2">
                                        Título da Rifa *
                                    </label>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-600"
                                        placeholder="Ex: iPhone 17 Pro Max"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="descricao" className="block text-sm font-semibold text-gray-400 mb-2">
                                        Descrição *
                                    </label>
                                    <textarea
                                        id="descricao"
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none text-white placeholder-gray-600"
                                        placeholder="Descreva os detalhes da rifa..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="preco" className="block text-sm font-semibold text-gray-400 mb-2">
                                            Preço por Cota (R$) *
                                        </label>
                                        <input
                                            type="number"
                                            id="preco"
                                            name="preco"
                                            value={formData.preco}
                                            onChange={handleInputChange}
                                            required
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-600"
                                            placeholder="5.00"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="totalCotas" className="block text-sm font-semibold text-gray-400 mb-2">
                                            Total de Cotas *
                                        </label>
                                        <input
                                            type="number"
                                            id="totalCotas"
                                            name="totalCotas"
                                            value={formData.totalCotas}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-600"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="dataInicio" className="block text-sm font-semibold text-gray-400 mb-2">
                                            Data de Início *
                                        </label>
                                        <input
                                            type="date"
                                            id="dataInicio"
                                            name="dataInicio"
                                            value={formData.dataInicio}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-600 [color-scheme:dark]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="dataFim" className="block text-sm font-semibold text-gray-400 mb-2">
                                            Data de Término *
                                        </label>
                                        <input
                                            type="date"
                                            id="dataFim"
                                            name="dataFim"
                                            value={formData.dataFim}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white placeholder-gray-600 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Prêmios */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Prêmios</h2>
                                <motion.button
                                    type="button"
                                    onClick={handleAddPremio}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
                                >
                                    <FaPlus /> Adicionar
                                </motion.button>
                            </div>

                            <div className="space-y-4">
                                {premios.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="mb-2">Nenhum prêmio adicionado</p>
                                        <p className="text-sm">Clique em "Adicionar" para criar um prêmio</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Lista Paginada */}
                                        {premios
                                            .slice((rewardsCurrentPage - 1) * rewardsPerPage, rewardsCurrentPage * rewardsPerPage)
                                            .map((premio, index) => {
                                                const globalIndex = (rewardsCurrentPage - 1) * rewardsPerPage + index;
                                                return (
                                                    <div
                                                        key={globalIndex}
                                                        className={`p-4 rounded-xl border ${premio.saved
                                                            ? "bg-green-500/10 border-green-500/30"
                                                            : "bg-[#1c1d1f] border-[#313238]"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-1 space-y-3">
                                                                {premio.saved && (
                                                                    <div className="flex items-center gap-2 text-green-500 text-sm font-semibold mb-2">
                                                                        <span>✓</span>
                                                                        <span>Prêmio Salvo</span>
                                                                    </div>
                                                                )}

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                                                                            Número *
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={premio.numero}
                                                                            onChange={(e) => handlePremioChange(globalIndex, "numero", e.target.value)}
                                                                            disabled={premio.saved}
                                                                            className="w-full px-4 py-2 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            placeholder="5"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-sm font-semibold text-gray-400 mb-2">
                                                                            Tipo de Prêmio *
                                                                        </label>
                                                                        <select
                                                                            value={premio.rewardType}
                                                                            onChange={(e) => handlePremioChange(globalIndex, "rewardType", e.target.value)}
                                                                            disabled={premio.saved}
                                                                            className="w-full px-4 py-2 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            <option value="NUMBER">Número</option>
                                                                            <option value="RASPADINHA">Raspadinha</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                                                                        Nome do Prêmio *
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={premio.name}
                                                                        onChange={(e) => handlePremioChange(globalIndex, "name", e.target.value)}
                                                                        disabled={premio.saved}
                                                                        className="w-full px-4 py-2 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-600"
                                                                        placeholder="TESTE REWARD"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                                                                        Descrição *
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={premio.descricao}
                                                                        onChange={(e) => handlePremioChange(globalIndex, "descricao", e.target.value)}
                                                                        disabled={premio.saved}
                                                                        className="w-full px-4 py-2 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-600"
                                                                        placeholder="TEST DESC"
                                                                    />
                                                                </div>

                                                                {!premio.saved && (
                                                                    <motion.button
                                                                        type="button"
                                                                        onClick={() => handleSavePremio(globalIndex)}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
                                                                    >
                                                                        <FaSave /> Salvar Prêmio
                                                                    </motion.button>
                                                                )}
                                                            </div>

                                                            <motion.button
                                                                type="button"
                                                                onClick={() => handleRemovePremio(globalIndex)}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                                            >
                                                                <FaTrash />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        {/* Controles de Paginação */}
                                        {Math.ceil(premios.length / rewardsPerPage) > 1 && (
                                            <div className="mt-6 flex items-center justify-between border-t border-[#313238] pt-4">
                                                <div className="text-sm text-gray-500">
                                                    Mostrando {((rewardsCurrentPage - 1) * rewardsPerPage) + 1} a {Math.min(rewardsCurrentPage * rewardsPerPage, premios.length)} de {premios.length}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {Array.from({ length: Math.ceil(premios.length / rewardsPerPage) }, (_, i) => i + 1).map((page) => (
                                                        <button
                                                            key={page}
                                                            type="button"
                                                            onClick={() => setRewardsCurrentPage(page)}
                                                            className={`w-8 h-8 rounded-lg font-semibold text-sm transition-all ${rewardsCurrentPage === page
                                                                ? 'bg-orange-500 text-white'
                                                                : 'text-gray-400 hover:bg-[#313238] hover:text-white'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Números Bloqueados */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Números Bloqueados</h2>
                            <p className="text-sm text-gray-400 mb-4">
                                Digite os números que não poderão ser escolhidos pelos clientes, separados por vírgula.
                            </p>

                            <div>
                                <label htmlFor="numerosBloqueados" className="block text-sm font-semibold text-gray-400 mb-2">
                                    Números (separados por vírgula)
                                </label>
                                <textarea
                                    id="numerosBloqueados"
                                    value={numerosBloqueados}
                                    onChange={(e) => setNumerosBloqueados(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none text-white placeholder-gray-600"
                                    placeholder="Ex: 13, 7, 666, 1313"
                                />
                                {numerosBloqueados && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Total de números bloqueados: {numerosBloqueados.split(",").filter(n => n.trim() !== "").length}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Imagem */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Imagem Principal</h2>

                            <div className="mb-4">
                                <div className="relative w-full h-64 bg-[#1c1d1f] rounded-xl overflow-hidden border border-[#313238]">
                                    <AnimatePresence mode="wait">
                                        {/* Estado: Sem imagem */}
                                        {!formData.imagemPrincipal && !imageLoading && (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 flex items-center justify-center border border-dashed border-[#313238] hover:border-orange-500/50 transition-colors cursor-pointer"
                                            >
                                                <div className="text-center p-6">
                                                    <FaImage className="text-5xl text-gray-500 mx-auto mb-3" />
                                                    <p className="text-sm font-semibold text-gray-400 mb-1">
                                                        Cole a URL da imagem abaixo
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        A prévia será exibida automaticamente
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Estado: Carregando */}
                                        {imageLoading && (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 flex items-center justify-center bg-[#1c1d1f]"
                                            >
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <FaSpinner className="text-5xl text-orange-500 mx-auto mb-3" />
                                                    </motion.div>
                                                    <p className="text-sm font-semibold text-gray-400 mb-1">
                                                        Carregando imagem...
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Aguarde um momento
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Estado: Erro */}
                                        {imageError && formData.imagemPrincipal && !imageLoading && (
                                            <motion.div
                                                key="error"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 flex items-center justify-center bg-red-500/10 border border-red-500/20"
                                            >
                                                <div className="text-center p-6">
                                                    <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
                                                    <p className="text-sm font-semibold text-red-500 mb-1">
                                                        Erro ao carregar imagem
                                                    </p>
                                                    <p className="text-xs text-red-400 mb-3">
                                                        Verifique se a URL está correta
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, imagemPrincipal: "" }))}
                                                        className="text-xs text-red-500 hover:text-red-400 underline font-semibold"
                                                    >
                                                        Limpar URL
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Estado: Imagem carregada */}
                                        {formData.imagemPrincipal && !imageError && !imageLoading && (
                                            <motion.div
                                                key="loaded"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0"
                                            >
                                                <img
                                                    src={formData.imagemPrincipal}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover z-[999]"
                                                />

                                                {imageLoaded && (
                                                    <div className="absolute top-2 right-2">
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                                                        >
                                                            ✓ Imagem carregada
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="imagemPrincipal" className="block text-sm font-semibold text-gray-400 mb-2">
                                    URL da Imagem {formData.imagemPrincipal && !imageError && <span className="text-green-500">✓</span>}
                                </label>
                                <input
                                    type="url"
                                    id="imagemPrincipal"
                                    name="imagemPrincipal"
                                    value={formData.imagemPrincipal}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors text-white placeholder-gray-600 bg-[#1c1d1f] ${imageError
                                        ? "border-red-500 focus:border-red-500"
                                        : imageLoaded
                                            ? "border-green-500 focus:border-green-500"
                                            : "border-[#313238] focus:border-orange-500"
                                        }`}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                />
                                {imageError && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <FaExclamationTriangle className="text-xs" />
                                        URL inválida ou imagem não encontrada
                                    </p>
                                )}
                                {imageLoading && (
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <FaSpinner className="text-xs animate-spin" />
                                        Verificando imagem...
                                    </p>
                                )}
                                {imageLoaded && !imageError && (
                                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                        ✓ Imagem válida e carregada
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Status */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#25282c] rounded-2xl shadow-xl p-6 border border-[#313238]"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Status</h2>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-[#1c1d1f] border border-[#313238] rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-white"
                            >
                                <option value="ativa">Ativa</option>
                                <option value="pausada">Pausada</option>
                                <option value="finalizada">Finalizada</option>
                            </select>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-3"
                        >
                            <motion.button
                                type="submit"
                                disabled={submitting}
                                whileHover={{ scale: submitting ? 1 : 1.02 }}
                                whileTap={{ scale: submitting ? 1 : 0.98 }}
                                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all ${submitting ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Salvar Alterações
                                    </>
                                )}
                            </motion.button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={submitting}
                                className={`w-full px-6 py-4 border border-[#313238] text-gray-400 rounded-xl font-bold hover:bg-[#313238] hover:text-white transition-all ${submitting ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </div>
                </div>
            </form>
        </div>
    );
}
