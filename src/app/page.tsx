"use client";
import React, { useState, useEffect } from "react";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaIdCard, FaInstagram } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  // Campos de Login
  const [cpfLogin, setCpfLogin] = useState("");
  const [password, setPassword] = useState("");

  // Campos de Registro
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  const { login, register, isLoading: authLoading, error: authError, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (isLogin) {
        await login(cpfLogin, password);
      } else {
        await register(name, email, cpf, whatsapp, instagram, passwordRegister);
      }
      // Limpar campos após sucesso
      handleClearFields();
      router.push("/rifa/1");
    } catch (err) {
      console.error("Erro ao processar:", err);
    }
  };

  const handleClearFields = () => {
    setCpfLogin("");
    setPassword("");
    setName("");
    setEmail("");
    setCpf("");
    setWhatsapp("");
    setInstagram("");
    setPasswordRegister("");
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
              <Image
                src="/LOGO.png"
                alt="Logo"
                width={80}
                height={80}
                className="object-contain rounded-full"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
          </h1>
          <p className="text-red-100">
            {isLogin
              ? "Entre para acessar suas rifas"
              : "Cadastre-se para participar"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Campos de Login */}
          {isLogin ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cpfLogin}
                    onChange={(e) => setCpfLogin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            /* Campos de Registro */
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <FaInstagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="@seuinstagram"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={passwordRegister}
                    onChange={(e) => setPasswordRegister(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </>
          )}

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm"
            >
              {authError}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: authLoading ? 1 : 1.02 }}
            whileTap={{ scale: authLoading ? 1 : 0.98 }}
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
          </motion.button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              {isLogin
                ? "Não tem conta? Cadastre-se"
                : "Já tem conta? Faça login"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
