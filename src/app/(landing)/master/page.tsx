'use client';

import { LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUsuario, encerrarSessao } from '@/hooks/useUsuario';

/**
 * Landing do departamento Master.
 *
 * Guard de sessão, fundo, TopBar e container vivem no layout do route group.
 * Aqui só existe o conteúdo do departamento.
 */
export default function LandingMaster() {
  const router = useRouter();
  const user = useUsuario();

  const sair = () => {
    encerrarSessao();
    router.replace('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* CABEÇALHO DA LANDING */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              Master
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Área do departamento
            </p>
          </div>
        </div>

        <button
          onClick={sair}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all cursor-pointer text-[9px] font-black uppercase tracking-widest"
        >
          <LogOut size={13} /> Sair
        </button>
      </div>

      {/* CARTÃO DE BOAS-VINDAS */}
      <div className="p-8 bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] shadow-sm space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
          Bem-vindo
        </p>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {user?.nome || 'Usuário'}
        </h2>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          Este é o ponto de partida do departamento Master. Os módulos e
          indicadores desta área serão adicionados aqui.
        </p>
      </div>

      {/* PLACEHOLDER DE CONTEÚDO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Módulo 1', 'Módulo 2', 'Módulo 3'].map((titulo) => (
          <div
            key={titulo}
            className="p-6 bg-white/50 border border-dashed border-slate-200 rounded-2xl"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
              Em breve
            </p>
            <p className="text-sm font-black text-slate-400 mt-1">{titulo}</p>
          </div>
        ))}
      </div>

    </div>
  );
}