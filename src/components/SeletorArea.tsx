'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, Building2 } from 'lucide-react';
import type { Departamento } from '@/lib/landing';

/**
 * Seletor de Área da SideBar.
 *
 * Permite ao usuário trocar de Área Gerencial quando tem permissão em
 * mais de uma. A lista é montada pelo layout a partir de
 * listarAreasPermitidas() — este componente não decide permissão,
 * apenas apresenta opções.
 *
 * Comportamentos:
 *  - Retorna null quando há menos de 2 áreas (nada para escolher).
 *  - Fecha ao clicar fora, ao pressionar Escape ou ao escolher uma área.
 *  - Sidebar colapsada: exibe só o ícone; o clique expande a sidebar
 *    (mesmo padrão adotado pelo grupo de acordeão).
 */
export default function SeletorArea({
  areas,
  areaAtual,
  colapsada,
  onExpandirSidebar,
}: {
  areas: Departamento[];
  areaAtual: string | null;
  colapsada: boolean;
  onExpandirSidebar: () => void;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!aberto) return;

    const aoClicarFora = (evento: MouseEvent) => {
      if (!containerRef.current?.contains(evento.target as Node)) {
        setAberto(false);
      }
    };
    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAberto(false);
    };

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoPressionarTecla);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoPressionarTecla);
    };
  }, [aberto]);

  // Um departamento ou nenhum: não há o que escolher.
  if (areas.length < 2) return null;

  const atual = areas.find(a => a.chave === areaAtual) ?? areas[0];

  const aoClicarBotao = () => {
    // Colapsada: não abre dropdown de 72px — expande a sidebar primeiro.
    if (colapsada) {
      onExpandirSidebar();
      return;
    }
    setAberto(v => !v);
  };

  const escolher = (departamento: Departamento) => {
    setAberto(false);
    if (departamento.chave === atual.chave) return;
    router.push(departamento.rota);
  };

  return (
    <div ref={containerRef} className="relative px-2 pb-2">
      {/* RÓTULO */}
      {!colapsada && (
        <p className="px-2 pb-2 text-[8px] font-black uppercase tracking-[0.3em] text-sky-300/40">
          Área
        </p>
      )}

      {/* BOTÃO */}
      <button
        type="button"
        onClick={aoClicarBotao}
        aria-haspopup="listbox"
        aria-expanded={colapsada ? undefined : aberto}
        title={colapsada ? `Área: ${atual.chave}` : undefined}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-left ${
          colapsada ? 'justify-center' : ''
        }`}
      >
        <Building2 size={14} className="shrink-0 text-sky-300/70" />

        {!colapsada && (
          <>
            <span className="flex-1 text-[9px] font-black uppercase tracking-widest text-white truncate">
              {atual.chave}
            </span>
            <ChevronDown
              size={13}
              className={`shrink-0 text-sky-300/50 transition-transform duration-200 ${
                aberto ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {/* DROPDOWN */}
      {aberto && !colapsada && (
        <div
          role="listbox"
          className="absolute bottom-full left-2 right-2 mb-2 z-30 rounded-xl overflow-hidden border border-white/15 shadow-2xl shadow-black/40"
          style={{
            background: 'linear-gradient(180deg, #122a52 0%, #0e2140 100%)',
          }}
        >
          {areas.map(departamento => {
            const selecionado = departamento.chave === atual.chave;

            return (
              <button
                key={departamento.chave}
                type="button"
                role="option"
                aria-selected={selecionado}
                onClick={() => escolher(departamento)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 transition-all cursor-pointer text-left ${
                  selecionado
                    ? 'bg-white/10 text-white'
                    : 'text-blue-100/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex-1 text-[9px] font-black uppercase tracking-widest truncate">
                  {departamento.chave}
                </span>
                {selecionado && <Check size={12} className="shrink-0 text-sky-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}