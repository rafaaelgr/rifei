"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaImage, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { rifasService } from "@/services/rifas.service";
import { raspadinhaService } from "@/services/raspadinha.service";
import type { CreateActionPayload } from "@/services/rifas.service";
import type { Raspadinha } from "@/types";

export default function NovaRifaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        status: "ativa",
    });

    const [promocoes, setPromocoes] = useState([
        { quantidade: "", preco: "" },
    ]);

    const [premios, setPremios] = useState([
        { numero: "", valor: "", descricao: "" },
    ]);

    const [numerosBloqueados, setNumerosBloqueados] = useState<string>("");

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
        setPremios([...premios, { numero: "", valor: "", descricao: "" }]);
    };

    const handleRemovePremio = (index: number) => {
        setPremios(premios.filter((_, i) => i !== index));
    };

    const handlePremioChange = (index: number, field: string, value: string) => {
        const newPremios = [...premios];
        newPremios[index] = { ...newPremios[index], [field]: value };
        setPremios(newPremios);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validações básicas
            if (!formData.titulo || !formData.descricao) {
                alert("Por favor, preencha todos os campos obrigatórios");
                setLoading(false);
                return;
            }

            if (!formData.preco || Number(formData.preco) <= 0) {
                alert("O preço deve ser maior que zero");
                setLoading(false);
                return;
            }

            if (!formData.totalCotas || Number(formData.totalCotas) <= 0) {
                alert("O total de cotas deve ser maior que zero");
                setLoading(false);
                return;
            }

            // Processar números bloqueados
            const blockedNumbers = numerosBloqueados
                .split(",")
                .map(n => n.trim())
                .filter(n => n !== "" && !isNaN(Number(n)))
                .map(n => Number(n));

            // Converter os dados do formulário para o formato da API
            const payload: CreateActionPayload = {
                title: formData.titulo,
                description: formData.descricao,
                finished: formData.status === "finalizada",
                ticketsPrice: Number(formData.preco),
                minPrice: Number(formData.preco),
                mainAction: true,
                numberTickets: Number(formData.totalCotas),
                image: formData.imagemPrincipal || "default-image.png",
                blocked: blockedNumbers,
                packages: promocoes
                    .filter((p) => p.quantidade && p.preco)
                    .map((p, index) => ({
                        id: index + 1,
                        quantity: Number(p.quantidade),
                    })),
            };

            console.log("Enviando payload para API:", payload);

            const result = await rifasService.criar(payload);

            if (result.error || !result.data) {
                alert(`Erro ao criar rifa: ${result.error || "Erro desconhecido"}`);
                setLoading(false);
                return;
            }

            console.log("Rifa criada com sucesso:", result.data);

            // Se tiver prêmios, adicionar cada um
            if (premios.length > 0 && premios[0].numero && result.data) {
                console.log("Adicionando prêmios...");
                for (const premio of premios) {
                    if (premio.numero && premio.valor && premio.descricao) {
                        const premioResult = await rifasService.adicionarPremio({
                            raffleId: Number(result.data.id),
                            number: Number(premio.numero),
                            rewardType: "NUMBER",
                            name: premio.descricao,
                            description: premio.descricao,
                        });

                        if (premioResult.error) {
                            console.warn(`Erro ao adicionar prêmio: ${premioResult.error}`);
                        } else {
                            console.log("Prêmio adicionado:", premio);
                        }
                    }
                }
            }

            router.push("/admin/rifas");
        } catch (error) {
            console.error("Erro ao criar rifa:", error);
            alert(`Erro ao criar rifa: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <FaArrowLeft />
                    <span>Voltar</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Rifa</h1>
                <p className="text-gray-600">Preencha os dados para criar uma nova rifa</p>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informações Básicas */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Informações Básicas</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Título da Rifa *
                                    </label>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        placeholder="Ex: iPhone 17 Pro Max"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descrição *
                                    </label>
                                    <textarea
                                        id="descricao"
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Descreva os detalhes da rifa..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="preco" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                            placeholder="5.00"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="totalCotas" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="dataInicio" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Data de Início *
                                        </label>
                                        <input
                                            type="date"
                                            id="dataInicio"
                                            name="dataInicio"
                                            value={formData.dataInicio}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="dataFim" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Data de Término *
                                        </label>
                                        <input
                                            type="date"
                                            id="dataFim"
                                            name="dataFim"
                                            value={formData.dataFim}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Promoções */}
                        {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Promoções</h2>
                                <motion.button
                                    type="button"
                                    onClick={handleAddPromocao}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
                                >
                                    <FaPlus /> Adicionar
                                </motion.button>
                            </div>

                            <div className="space-y-3">
                                {promocoes.map((promocao, index) => (
                                    <div key={index} className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Quantidade de Cotas
                                            </label>
                                            <input
                                                type="number"
                                                value={promocao.quantidade}
                                                onChange={(e) => handlePromocaoChange(index, "quantidade", e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                                placeholder="100"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Preço (R$)
                                            </label>
                                            <input
                                                type="number"
                                                value={promocao.preco}
                                                onChange={(e) => handlePromocaoChange(index, "preco", e.target.value)}
                                                step="0.01"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                                placeholder="10.00"
                                            />
                                        </div>

                                        {promocoes.length > 1 && (
                                            <motion.button
                                                type="button"
                                                onClick={() => handleRemovePromocao(index)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div> */}

                        {/* Números Bloqueados */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Números Bloqueados</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Digite os números que não poderão ser escolhidos pelos clientes, separados por vírgula.
                            </p>

                            <div>
                                <label htmlFor="numerosBloqueados" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Números (separados por vírgula)
                                </label>
                                <textarea
                                    id="numerosBloqueados"
                                    value={numerosBloqueados}
                                    onChange={(e) => setNumerosBloqueados(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Ex: 13, 7, 666, 1313"
                                />
                                {numerosBloqueados && (
                                    <p className="text-xs text-gray-600 mt-2">
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
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Imagem Principal</h2>

                            <div className="mb-4">
                                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300">
                                    <AnimatePresence mode="wait">
                                        {/* Estado: Sem imagem */}
                                        {!formData.imagemPrincipal && !imageLoading && (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors"
                                            >
                                                <div className="text-center p-6">
                                                    <FaImage className="text-5xl text-gray-400 mx-auto mb-3" />
                                                    <p className="text-sm font-semibold text-gray-600 mb-1">
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
                                                className="absolute inset-0 flex items-center justify-center bg-gray-50"
                                            >
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <FaSpinner className="text-5xl text-red-500 mx-auto mb-3" />
                                                    </motion.div>
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">
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
                                                className="absolute inset-0 flex items-center justify-center bg-red-50 border-2 border-red-300"
                                            >
                                                <div className="text-center p-6">
                                                    <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
                                                    <p className="text-sm font-semibold text-red-700 mb-1">
                                                        Erro ao carregar imagem
                                                    </p>
                                                    <p className="text-xs text-red-600 mb-3">
                                                        Verifique se a URL está correta
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, imagemPrincipal: "" }))}
                                                        className="text-xs text-red-600 hover:text-red-800 underline font-semibold"
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
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <img
                                                    src={formData.imagemPrincipal}
                                                    alt="Preview"
                                                    className="max-w-62 object-cover"
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
                                <label htmlFor="imagemPrincipal" className="block text-sm font-semibold text-gray-700 mb-2">
                                    URL da Imagem {formData.imagemPrincipal && !imageError && <span className="text-green-600">✓</span>}
                                </label>
                                <input
                                    type="url"
                                    id="imagemPrincipal"
                                    name="imagemPrincipal"
                                    value={formData.imagemPrincipal}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${imageError
                                        ? "border-red-400 focus:border-red-500 bg-red-50"
                                        : imageLoaded
                                            ? "border-green-400 focus:border-green-500 bg-green-50"
                                            : "border-gray-300 focus:border-red-500"
                                        }`}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                />
                                {imageError && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <FaExclamationTriangle className="text-xs" />
                                        URL inválida ou imagem não encontrada
                                    </p>
                                )}
                                {imageLoading && (
                                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                        <FaSpinner className="text-xs animate-spin" />
                                        Verificando imagem...
                                    </p>
                                )}
                                {imageLoaded && !imageError && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
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
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
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
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Salvar Rifa
                                    </>
                                )}
                            </motion.button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
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
