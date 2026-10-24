'use client';

import { useEffect, useState } from 'react';

export interface UsuarioSessao {
  id?: string;
  nome?: string;
  email?: string;
  status?: string;
  perfil?: Record<string, boolean>;
  [chave: string]: unknown;
}

const CHAVE_SESSAO = 'user_juvrio';

/**
 * Lê o usuário autenticado a partir da sessão gravada no navegador.
 *
 * IMPORTANTE: este hook NÃO valida sessão nem redireciona.
 * A validação é responsabilidade exclusiva do layout do route group
 * (src/app/(landing)/layout.tsx). Aqui só devolvemos os dados.
 *
 * Como o layout garantiu a existência da sessão antes de renderizar
 * a página, a leitura é segura e não corre risco de retornar `null`
 * em um usuário que já passou pelo guard.
 */
export function useUsuario(): UsuarioSessao | null {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);

  useEffect(() => {
    try {
      const sessao = localStorage.getItem(CHAVE_SESSAO);
      if (sessao) setUsuario(JSON.parse(sessao) as UsuarioSessao);
    } catch {
      // Sessão ilegível: o guard do layout já trata esse caso.
    }
  }, []);

  return usuario;
}

/**
 * Encerra a sessão local e devolve o usuário ao login.
 * Centralizar aqui evita repetir a limpeza em cada botão "Sair".
 */
export function encerrarSessao(): void {
  localStorage.removeItem(CHAVE_SESSAO);
}