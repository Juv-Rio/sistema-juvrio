'use client';

import { ShieldAlert, ArrowLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUsuario } from '@/hooks/useUsuario';
import { resolverRotaInicial } from '@/lib/landing';

/**
 * Página exibida quando o usuário tenta acessar uma Área Gerencial
 * para a qual não tem permissão na planilha (coluna de perfil = NÃO).
 *
 * Fica dentro de (landing) para herdar o guard de sessão e a TopBar,
 * mas é explicitamente liberada na checagem de permissão — caso
 * contrário, redirecionaria para si mesma em loop.
 */
export default function SemAcesso() {
  const router = useRouter();
  const user = useUsuario();

  const voltarParaMinhaArea = () => {
    if (!user) {
      router.push('/');
      return;
    }
    router.push(resolverRotaInicial(user));
  };

  return (
    <div className="max-w-xl mx-auto h-full flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500 text-center py-16">

      <div className="p-5 bg-amber-50 rounded-full text-amber-500 shadow-sm">
        <ShieldAlert size={38} />
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
          Área Gerencial
        </p>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Você não tem acesso a esta área
        </h1>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Seu perfil não inclui permissão para esta Área Gerencial.
          Se você precisa deste acesso para desempenhar suas atividades,
          entre em contato com o seu coordenador.
        </p>
      </div>

      <div className="p-8 bg-white/70 backdrop-blur-md border border-white rounded-3xl shadow-sm w-full">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Precisa solicitar acesso?
        </p>
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <Mail size={14} className="text-sky-500" />
          <span className="text-sm font-bold">
            Fale com seu coordenador ou com o administrador do sistema.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={voltarParaMinhaArea}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all cursor-pointer shadow-sm"
      >
        <ArrowLeft size={14} />
        Voltar para minha área
      </button>

    </div>
  );
}