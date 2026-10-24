'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  ConfigSideBar,
  ItemGrupoSideBar,
  ItemLinkSideBar,
} from '@/lib/sidebar';
import SeletorArea from '@/components/SeletorArea';
import type { Departamento } from '@/lib/landing';

/**
 * SideBar transversal das landings de departamento.
 *
 * Estrutura vertical:
 *   1. Cabeçalho — logo do departamento emoldurada (só na sidebar expandida).
 *   2. Seletor de Área — troca entre Áreas Gerenciais permitidas.
 *   3. Navegação rolável — árvore de dois níveis (link | grupo).
 *   4. Rodapé — botão de recolher.
 *
 * GRUPOS (acordeão exclusivo):
 *   - Não navegam. Clique alterna a expansão.
 *   - Apenas UM grupo fica aberto por vez: abrir um fecha os demais.
 *   - Abrem automaticamente quando contêm o item ativo.
 *   - O ícone do pai exibe uma bolinha vermelha quando algum filho
 *     tem notificação. O número aparece só no filho.
 *   - Com a sidebar colapsada, o grupo exibe só o ícone e o clique
 *     EXPANDE a sidebar (em 72px não há espaço para indentar filhos).
 *
 * LOGO:
 *   As artes têm 300×80px (proporção 3,75:1). Como a largura útil da
 *   sidebar expandida é 208px (240px - 32px de padding), a logo é
 *   limitada pela LARGURA — nunca pela altura — para não encolher a
 *   ponto de ficar ilegível. `object-contain` garante que a proporção
 *   original seja preservada.
 *
 *   Com a sidebar colapsada (72px), a logo e sua moldura não fazem
 *   sentido visual: o cabeçalho é omitido por inteiro e o seletor de
 *   área passa a ocupar o topo.
 */
export default function SideBar({
  config,
  colapsada,
  onToggleColapso,
  areasPermitidas,
  areaAtual,
}: {
  config: ConfigSideBar;
  colapsada: boolean;
  onToggleColapso: () => void;
  areasPermitidas: Departamento[];
  areaAtual: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { titulo, logo, itens } = config;

  // Acordeão exclusivo: guarda o label do ÚNICO grupo aberto.
  // `null` = nenhum aberto.
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);

  // Abre automaticamente o grupo que contém o item ativo.
  // Como o acordeão é exclusivo, apenas um pode estar ativo por vez —
  // então simplesmente sobrescrevemos o estado.
  useEffect(() => {
    const grupoComAtivo = itens
      .filter((i): i is ItemGrupoSideBar => i.tipo === 'grupo')
      .find(grupo =>
        grupo.subitens.some(
          sub => pathname === sub.rota || pathname.startsWith(sub.rota + '/')
        )
      );

    setGrupoAberto(grupoComAtivo ? grupoComAtivo.label : null);
  }, [pathname, itens]);

  if (itens.length === 0) return null;

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const linkEstaAtivo = (item: ItemLinkSideBar) => {
    if (item.exato) return pathname === item.rota;
    return pathname === item.rota || pathname.startsWith(item.rota + '/');
  };

  const alternarGrupo = (label: string) => {
    // Com a sidebar colapsada o grupo não pode abrir (sem espaço).
    // O clique expande a sidebar — comportamento previsível.
    if (colapsada) {
      onToggleColapso();
      return;
    }

    // Acordeão exclusivo: abre este, fecha o que estava aberto.
    setGrupoAberto(prev => (prev === label ? null : label));
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <aside
      className={`relative z-10 hidden md:flex flex-col shrink-0 overflow-hidden transition-all duration-300 ${
        colapsada ? 'w-18' : 'w-60'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0b1b3a 0%, #122a52 45%, #0e2a4d 100%)',
        boxShadow: '4px 0 24px -8px rgba(11, 27, 58, 0.45)',
      }}
    >
      {/* Textura vitrificada */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 60% at 0% 0%, rgba(56,189,248,0.28) 0%, transparent 55%), radial-gradient(100% 50% at 100% 100%, rgba(37,99,235,0.30) 0%, transparent 60%)',
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-sky-400/40 via-white/20 to-transparent" />

      {/* ===== 1) CABEÇALHO: LOGO EMOLDURADA (só na SideBar expandida) ===== */}
      {!colapsada && (
        <div className="relative shrink-0 border-b border-white/10 flex items-center px-3 py-3">
          {/*
            Moldura da logo.
            Segue o mesmo ID do botão do seletor de área:
            borda white/15, fundo white/5 e cantos rounded-xl.
            Como todas as artes chegam em 300×80 (proporção 3,75:1),
            a moldura tem altura fixa (h-14) e a imagem é limitada por
            `max-h-full` + `object-contain` — nunca corta, nunca distorce.
          */}
          <div className="flex items-center justify-center w-full h-14 rounded-xl border border-white/15 bg-white/5 px-3 shadow-inner shadow-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt={titulo}
              className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
      )}

      {/* ===== 2) SELETOR DE ÁREA ===== */}
      <div className="relative shrink-0 pt-2">
        <SeletorArea
          areas={areasPermitidas}
          areaAtual={areaAtual}
          colapsada={colapsada}
          onExpandirSidebar={onToggleColapso}
        />
      </div>

      {/* ===== 3) NAVEGAÇÃO ===== */}
      <nav className="relative flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1 sidebar-scroll">
        {!colapsada && (
          <p className="px-3 pb-2 text-[8px] font-black uppercase tracking-[0.3em] text-sky-300/40">
            Navegação
          </p>
        )}

        {itens.map(item =>
          item.tipo === 'link' ? (
            <ItemLink
              key={item.rota}
              item={item}
              ativo={linkEstaAtivo(item)}
              colapsada={colapsada}
              onNavegar={() => router.push(item.rota)}
            />
          ) : (
            <ItemGrupo
              key={item.label}
              grupo={item}
              aberto={grupoAberto === item.label}
              caminhoAtual={pathname}
              colapsada={colapsada}
              onAlternar={() => alternarGrupo(item.label)}
              onNavegar={rota => router.push(rota)}
            />
          )
        )}
      </nav>

      {/* ===== 4) RODAPÉ: RECOLHER ===== */}
      <div className="relative shrink-0 border-t border-white/10">
        <div className="px-2 py-2">
          <button
            type="button"
            onClick={onToggleColapso}
            aria-label={colapsada ? 'Expandir menu' : 'Recolher menu'}
            title={colapsada ? 'Expandir menu' : 'Recolher menu'}
            className="w-full flex items-center justify-center px-3 py-2 rounded-xl text-sky-300/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            {colapsada ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

/** Badge numérico (somente para itens-folha). */
function Badge({ valor, ativo }: { valor?: number; ativo: boolean }) {
  if (typeof valor !== 'number' || valor <= 0) return null;

  return (
    <span
      className={`shrink-0 min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[9px] font-black tabular-nums leading-none ${
        ativo
          ? 'bg-white/25 text-white'
          : 'bg-sky-500/25 text-sky-200 ring-1 ring-sky-400/30'
      }`}
    >
      {valor > 99 ? '99+' : valor}
    </span>
  );
}

/** Bolinha vermelha de notificação do grupo (sem número). */
function BolinhaNotificacao({ posicionada }: { posicionada: boolean }) {
  return (
    <span
      className={`h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0e2a4d] ${
        posicionada ? 'absolute -top-1 -right-1' : 'shrink-0'
      }`}
    />
  );
}

/** Folha da árvore: navega. */
function ItemLink({
  item,
  ativo,
  colapsada,
  onNavegar,
}: {
  item: ItemLinkSideBar;
  ativo: boolean;
  colapsada: boolean;
  onNavegar: () => void;
}) {
  const Icone = item.icone;
  const temBadge = typeof item.notificacoes === 'number' && item.notificacoes > 0;

  return (
    <button
      type="button"
      onClick={onNavegar}
      title={colapsada ? item.label : undefined}
      aria-current={ativo ? 'page' : undefined}
      className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
        ativo
          ? 'bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-900/40'
          : 'text-blue-100/70 hover:text-white hover:bg-white/10'
      } ${colapsada ? 'justify-center' : ''}`}
    >
      {ativo && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full bg-sky-300" />
      )}

      <div className="relative shrink-0">
        <Icone size={17} />
        {colapsada && temBadge && <BolinhaNotificacao posicionada />}
      </div>

      {!colapsada && (
        <>
          <span className="flex-1 text-[10px] font-black uppercase tracking-widest truncate">
            {item.label}
          </span>
          <Badge valor={item.notificacoes} ativo={ativo} />
        </>
      )}
    </button>
  );
}

/** Galho da árvore: expande/colapsa. NUNCA navega. */
function ItemGrupo({
  grupo,
  aberto,
  caminhoAtual,
  colapsada,
  onAlternar,
  onNavegar,
}: {
  grupo: ItemGrupoSideBar;
  aberto: boolean;
  caminhoAtual: string;
  colapsada: boolean;
  onAlternar: () => void;
  onNavegar: (rota: string) => void;
}) {
  const Icone = grupo.icone;

  // Bolinha derivada: acende se QUALQUER filho tiver notificação.
  // Nada é declarado no grupo — evita estado dessincronizado.
  const temNotificacao = grupo.subitens.some(
    sub => typeof sub.notificacoes === 'number' && sub.notificacoes > 0
  );
  const contemAtivo = grupo.subitens.some(
    sub => caminhoAtual === sub.rota || caminhoAtual.startsWith(sub.rota + '/')
  );

  return (
    <div>
      <button
        type="button"
        onClick={onAlternar}
        title={colapsada ? grupo.label : undefined}
        aria-expanded={colapsada ? undefined : aberto}
        className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
          contemAtivo && !colapsada
            ? 'text-white bg-white/5'
            : 'text-blue-100/70 hover:text-white hover:bg-white/10'
        } ${colapsada ? 'justify-center' : ''}`}
      >
        <div className="relative shrink-0">
          <Icone size={17} />
          {temNotificacao && <BolinhaNotificacao posicionada />}
        </div>

        {!colapsada && (
          <>
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest truncate">
              {grupo.label}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-sky-300/50 transition-transform duration-200 ${
                aberto ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {/* Filhos: só existem no DOM quando abertos E a sidebar expandida */}
      {aberto && !colapsada && (
        <div className="mt-1 ml-3 pl-3 border-l border-white/10 space-y-0.5">
          {grupo.subitens.map(sub => {
            const ativo =
              caminhoAtual === sub.rota || caminhoAtual.startsWith(sub.rota + '/');
            const SubIcone = sub.icone;

            return (
              <button
                key={sub.rota}
                type="button"
                onClick={() => onNavegar(sub.rota)}
                aria-current={ativo ? 'page' : undefined}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all cursor-pointer text-left ${
                  ativo
                    ? 'text-white bg-linear-to-r from-sky-500/80 to-blue-600/80'
                    : 'text-blue-100/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <SubIcone size={13} className="shrink-0" />
                <span className="flex-1 text-[9px] font-black uppercase tracking-widest truncate">
                  {sub.label}
                </span>
                <Badge valor={sub.notificacoes} ativo={ativo} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}