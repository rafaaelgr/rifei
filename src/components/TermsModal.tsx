"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaFileContract } from "react-icons/fa";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleBackdropClick}
                    onKeyDown={handleKeyDown}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="terms-modal-title"
                    tabIndex={-1}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FaFileContract className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h2 id="terms-modal-title" className="text-2xl font-bold text-white">
                                        Acordo de Termos
                                    </h2>
                                    <p className="text-red-100 text-sm">JHOL ART PAPEL AÇÕES</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                                aria-label="Fechar modal"
                                tabIndex={0}
                            >
                                <FaTimes className="text-white text-xl" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] custom-scrollbar">
                            <div className="space-y-6 text-gray-700">
                                {/* Introdução */}
                                <section>
                                    <p className="text-sm leading-relaxed">
                                        Ao acessar ou usar o site da <strong>JHOL ART PAPEL AÇÕES</strong>, você concorda integralmente com os termos descritos neste documento.
                                    </p>
                                    <p className="text-sm leading-relaxed mt-2">
                                        Alguns serviços oferecidos pelo site podem incluir condições adicionais, incorporadas a este Termo.
                                    </p>
                                    <p className="text-sm leading-relaxed mt-2">
                                        <strong>Leia atentamente antes de utilizar o site.</strong>
                                    </p>
                                    <p className="text-sm leading-relaxed mt-2">
                                        Ao usar o site, o usuário declara estar de acordo com estes termos e garante possuir <strong>18 anos ou mais</strong>.
                                    </p>
                                    <p className="text-sm leading-relaxed mt-2">
                                        Caso atue em nome de uma empresa, declara ter autorização para vinculá-la a este Termo.
                                    </p>
                                </section>

                                {/* 2. Modificações dos Termos */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">2. Modificações dos Termos</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>JHOL ART PAPEL AÇÕES poderá alterar este Termo periodicamente.</li>
                                        <li>Em caso de alterações, os usuários serão notificados por aviso no site e/ou por e-mail cadastrado.</li>
                                        <li>As mudanças entram em vigor imediatamente para novos usuários e, para os demais, 15 dias após a notificação.</li>
                                    </ul>
                                </section>

                                {/* 3. Informações do Usuário */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">3. Informações do Usuário</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Para participar das ações ou promoções, poderá ser necessário fornecer informações pessoais.</li>
                                        <li>O usuário declara que todas as informações fornecidas são verdadeiras, completas e atualizadas, assumindo total responsabilidade pelos dados inseridos.</li>
                                    </ul>
                                </section>

                                {/* 4. Privacidade */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">4. Privacidade</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>O usuário concorda que seus dados pessoais poderão ser utilizados conforme descrito na Política de Privacidade disponível no site.</li>
                                        <li>A JHOL ART PAPEL AÇÕES compromete-se a respeitar as normas da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</li>
                                    </ul>
                                </section>

                                {/* 5. Conduta no Site */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">5. Conduta no Site</h3>
                                    <p className="text-sm mb-2">Ao utilizar o site, o usuário compromete-se a:</p>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Não interferir na experiência de outros usuários.</li>
                                        <li>Não enviar vírus, spam, scripts ou qualquer conteúdo malicioso.</li>
                                        <li>Cumprir este Termo e a legislação aplicável.</li>
                                        <li>Não se passar por outra pessoa ou entidade.</li>
                                        <li>Não enviar conteúdo ilegal, ofensivo, enganoso ou difamatório.</li>
                                    </ul>
                                </section>

                                {/* 6. Violações */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">6. Violações</h3>
                                    <p className="text-sm mb-2">Em caso de violação destes Termos, a JHOL ART PAPEL AÇÕES poderá:</p>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Remover conteúdos;</li>
                                        <li>Bloquear ou excluir o cadastro do usuário;</li>
                                        <li>Adotar medidas legais cabíveis e notificar autoridades competentes.</li>
                                    </ul>
                                </section>

                                {/* 7. Links Externos */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">7. Links Externos</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>O site pode conter links para sites de terceiros.</li>
                                        <li>A JHOL ART PAPEL AÇÕES não se responsabiliza pelos conteúdos, serviços ou políticas desses sites.</li>
                                        <li>O uso de links externos é de total responsabilidade do usuário.</li>
                                    </ul>
                                </section>

                                {/* 8. Indenização */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">8. Indenização</h3>
                                    <p className="text-sm">
                                        O usuário concorda em indenizar a JHOL ART PAPEL AÇÕES, seus administradores e colaboradores por quaisquer perdas, custos ou despesas decorrentes do uso indevido do site, violação deste Termo ou fornecimento de informações falsas.
                                    </p>
                                </section>

                                {/* 9. Armazenamento e Limites */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">9. Armazenamento e Limites</h3>
                                    <p className="text-sm">
                                        A JHOL ART PAPEL AÇÕES poderá definir práticas e limites quanto ao uso do site, incluindo armazenamento e tempo de disponibilidade dos conteúdos, podendo alterar tais práticas a qualquer momento.
                                    </p>
                                </section>

                                {/* 10. Propriedade Intelectual */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">10. Propriedade Intelectual</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Todo o conteúdo do site — incluindo textos, logos, imagens e layout — é propriedade da JHOL ART PAPEL AÇÕES e protegido por direitos autorais.</li>
                                        <li>É proibido copiar, reproduzir ou distribuir qualquer material sem autorização expressa.</li>
                                        <li>Sugestões ou ideias enviadas ao site serão consideradas não confidenciais e poderão ser utilizadas sem compensação.</li>
                                    </ul>
                                </section>

                                {/* 11. Isenção de Garantia */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">11. Isenção de Garantia</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>O site e seus serviços são fornecidos <strong>"no estado em que se encontram"</strong>.</li>
                                        <li>A JHOL ART PAPEL AÇÕES não garante que o site será ininterrupto, livre de erros ou totalmente seguro.</li>
                                    </ul>
                                </section>

                                {/* 12. Limitação de Responsabilidade */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">12. Limitação de Responsabilidade</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>A JHOL ART PAPEL AÇÕES não será responsável por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso do site.</li>
                                        <li>As limitações serão aplicadas na máxima extensão permitida pela legislação.</li>
                                    </ul>
                                </section>

                                {/* 13. Direitos Autorais */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">13. Direitos Autorais</h3>
                                    <p className="text-sm">
                                        Caso algum material no site infrinja direitos autorais, o titular poderá solicitar sua remoção através do e-mail indicado no site, enviando as informações necessárias à identificação do conteúdo.
                                    </p>
                                </section>

                                {/* 14. Envio de Vídeo para Recebimento de Prêmios */}
                                <section className="bg-red-50 p-4 rounded-xl">
                                    <h3 className="text-lg font-bold text-red-600 mb-3">14. Envio de Vídeo para Recebimento de Prêmios</h3>
                                    <p className="text-sm mb-2">
                                        O participante, ao aderir a qualquer sorteio, promoção ou ação beneficente da JHOL ART PAPEL AÇÕES, concorda que poderá ser solicitado a enviar um vídeo comprovando o recebimento ou a vitória.
                                    </p>
                                    <p className="text-sm font-semibold mb-2">O vídeo deve conter:</p>
                                    <ol className="list-decimal list-inside space-y-2 text-sm mb-3">
                                        <li>O participante se identificando claramente;</li>
                                        <li>Declaração mencionando o site joiasrarasacoes.com.br e a premiação recebida;</li>
                                        <li>Informações adicionais solicitadas para validação.</li>
                                    </ol>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>O vídeo poderá ser utilizado pela JHOL ART PAPEL AÇÕES em redes sociais e canais oficiais, com fins de transparência e divulgação de campanhas futuras.</li>
                                        <li>A recusa no envio do vídeo pode resultar na retenção do pagamento até o envio do material.</li>
                                        <li>Ao participar, o usuário autoriza o uso da imagem para fins promocionais, sem ônus adicional.</li>
                                    </ul>
                                </section>

                                {/* 15. Marcas */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">15. Marcas</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>O nome JHOL ART PAPEL AÇÕES, sua logomarca e identidade visual são marcas de uso exclusivo.</li>
                                        <li>É proibido utilizá-las sem autorização formal.</li>
                                    </ul>
                                </section>

                                {/* 16. Alterações e Suspensão do Site */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">16. Alterações e Suspensão do Site</h3>
                                    <p className="text-sm">
                                        A JHOL ART PAPEL AÇÕES reserva-se o direito de modificar, suspender ou encerrar o site, total ou parcialmente, a qualquer momento e sem aviso prévio.
                                    </p>
                                </section>

                                {/* 17. Comunicações Eletrônicas */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">17. Comunicações Eletrônicas</h3>
                                    <p className="text-sm">
                                        Ao se cadastrar, o usuário concorda em receber comunicações por e-mail, SMS ou WhatsApp, referentes às ações, atualizações e promoções da JHOL ART PAPEL AÇÕES.
                                    </p>
                                </section>

                                {/* 18. Legislação e Foro Aplicável */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">18. Legislação e Foro Aplicável</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Este Termo é regido pela legislação brasileira, especialmente o Código de Defesa do Consumidor, o Marco Civil da Internet e a Lei Geral de Proteção de Dados.</li>
                                        <li>Fica eleito o Foro da Comarca de Curitiba – PR, para resolver eventuais controvérsias, com renúncia a qualquer outro.</li>
                                    </ul>
                                </section>

                                {/* 19. Disposições Gerais */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">19. Disposições Gerais</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Este Termo constitui o acordo integral entre o usuário e a JHOL ART PAPEL AÇÕES.</li>
                                        <li>Se qualquer cláusula for considerada inválida, as demais permanecem em vigor.</li>
                                    </ul>
                                </section>

                                {/* 20. Participação em Sorteios e Promoções */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">20. Participação em Sorteios e Promoções</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>Ao participar das rifas e sorteios promovidos pela JHOL ART PAPEL AÇÕES, o usuário aceita as regras específicas divulgadas em cada campanha.</li>
                                        <li>A empresa reserva-se o direito de cancelar, alterar ou encerrar promoções a qualquer momento, caso haja necessidade técnica ou legal.</li>
                                    </ul>
                                </section>

                                {/* 21. Limitações no Sistema de Reservas */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-600 mb-3">21. Limitações no Sistema de Reservas</h3>
                                    <p className="text-sm">
                                        Para garantir equidade e integridade, o sistema de reservas da JHOL ART PAPEL AÇÕES possui mecanismos que impedem concentração excessiva de cotas por um único participante, mantendo transparência e justiça em todas as ações.
                                    </p>
                                </section>

                                {/* Contato */}
                                <section className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                                    <h3 className="text-lg font-bold text-red-600 mb-3">Contato Oficial</h3>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>E-mail:</strong>{" "}
                                            <a href="mailto:suporte@joiasrarasacoes.com.br" className="text-red-600 hover:text-red-700 underline">
                                                suporte@joiasrarasacoes.com.br
                                            </a>
                                        </p>
                                        <p>
                                            <strong>WhatsApp:</strong>{" "}
                                            <a href="https://wa.me/5541998800114" className="text-red-600 hover:text-red-700 underline" target="_blank" rel="noopener noreferrer">
                                                +55 41 99880-0114
                                            </a>
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                                tabIndex={0}
                            >
                                Entendi
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

