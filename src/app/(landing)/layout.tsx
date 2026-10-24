'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/SideBar';
import CarregandoJuvrio from '@/components/CarregandoJuvrio';
import {
  podeAcessarRota,
  buscarDepartamentoPorRota,
  listarAreasPermitidas,
  ROTA_SEM_LOTACAO,
} from '@/lib/landing';
import { SIDEBAR_POR_DEPARTAMENTO } from '@/lib/sidebar';

/**
 * Layout comum a TODAS as landings de departamento.
 *
 * Responsabilidades:
 *  1. Validar a sessão (guard).                    -> "estou autenticado?"
 *  2. Validar a permissão na Área Gerencial atual. -> "posso estar aqui?"
 *  3. Renderizar a moldura: TopBar + SideBar.
 *
 * O conteúdo de cada departamento fica em <page.tsx>, que é livre
 * para definir seus próprios cards, cores e módulos.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // Estado de colapso da SideBar vive AQUI (e não dentro dela) para
  // sobreviver à navegação: o layout não remonta entre páginas do
  // mesmo route group, mas a SideBar sim.
  const [sidebarColapsada, setSidebarColapsada] = useState(false);

  // 1) GUARD DE SESSÃO: quem é você?
  useEffect(() => {
    const sessao = localStorage.getItem('user_juvrio');

    if (!sessao) {
      router.replace('/');
      return;
    }

    try {
      const parsed = JSON.parse(sessao);

      if (!parsed?.id) {
        localStorage.removeItem('user_juvrio');
        router.replace('/');
        return;
      }

      if (String(parsed.status || '').toUpperCase() === 'INATIVO') {
        localStorage.removeItem('user_juvrio');
        router.replace('/');
        return;
      }

      setUser(parsed);
    } catch {
      localStorage.removeItem('user_juvrio');
      router.replace('/');
      return;
    } finally {
      setCarregando(false);
    }
  }, [router]);

  // 2) GUARD DE PERMISSÃO: você pode estar nesta Área Gerencial?
  //
  //    Só roda depois que o usuário está disponível. Como o `carregando`
  //    bloqueia a renderização do conteúdo, a verificação nunca acontece
  //    com `user === null` — o que expulsaria todo mundo no primeiro render.
  useEffect(() => {
    if (!user) return;

    // A própria página de destino do bloqueio não redireciona para si mesma.
    if (pathname === ROTA_SEM_LOTACAO) return;

    if (!podeAcessarRota(pathname, user)) {
      router.replace(ROTA_SEM_LOTACAO);
    }
  }, [user, pathname, router]);

  // 3) CONFIG DA SIDEBAR: derivada do departamento da rota atual.
  //
  //    Devolve o objeto completo (titulo + logo + itens) ou `null`.
  //    Rotas fora do mapa de departamentos (ex.: /editar-perfil,
  //    /sem-lotacao) retornam null, e a SideBar simplesmente não renderiza.
  const configSideBar = useMemo(() => {
    const departamento = buscarDepartamentoPorRota(pathname);
    if (!departamento) return null;
    return SIDEBAR_POR_DEPARTAMENTO[departamento.chave] ?? null;
  }, [pathname]);

  // 4) ÁREAS PERMITIDAS: para o seletor no rodapé da SideBar.
  //
  //    Admin recebe todas as landings publicadas; demais perfis recebem
  //    apenas as que têm a coluna SIM correspondente (mais a própria
  //    landing primária, por segurança). O SeletorArea só aparece quando
  //    há 2 ou mais áreas — a decisão fica dentro dele.
  const areasPermitidas = useMemo(() => {
    if (!user) return [];
    return listarAreasPermitidas(user);
  }, [user]);

  const areaAtual = useMemo(() => {
    const departamento = buscarDepartamentoPorRota(pathname);
    return departamento?.chave ?? null;
  }, [pathname]);

  // Enquanto a sessão está sendo lida, ou enquanto o usuário (inválido) está
  // sendo redirecionado, a tela de carregamento ocupa a área inteira.
  if (carregando || !user) {
    return <CarregandoJuvrio mensagem="Carregando" />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans antialiased bg-[#F0F7FF]">
      <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-50 via-white to-blue-50" />

      <TopBar user={user} />

      {/* CORPO: SideBar à esquerda + conteúdo à direita */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {configSideBar && (
          <SideBar
            config={configSideBar}
            colapsada={sidebarColapsada}
            onToggleColapso={() => setSidebarColapsada(v => !v)}
            areasPermitidas={areasPermitidas}
            areaAtual={areaAtual}
          />
        )}

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}