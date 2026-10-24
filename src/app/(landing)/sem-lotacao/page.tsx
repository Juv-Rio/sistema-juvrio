'use client';

import { useRouter } from 'next/navigation';
import { LogOut, UserX } from 'lucide-react';

/**
 * Página de estado: usuário autenticado, mas sem departamento atribuído.
 *
 * Alcançada quando resolverRotaInicial() não encontra a LANDING PRIMÁRIA
 * na coluna W da planilha, ou quando o valor não corresponde a nenhum
 * departamento cadastrado em src/lib/landing.ts.
 *
 * Esta página NÃO é uma landing de departamento: não tem TopBar nem guard
 * de sessão. Ela existe justamente para o usuário cuja sessão ainda não
 * aponta para lugar nenhum — por isso o único caminho oferecido é o logout.
 */
export default function SemLotacao() {
  const router = useRouter();

  const sair = () => {
    localStorage.removeItem('user_juvrio');
    router.replace('/');
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center font-sans antialiased bg-[#F0F7FF] p-6">
      <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-50 via-white to-blue-50" />

      <div className="relative z-10 w-full max-w-lg">

        <div className="p-10 bg-white/70 backdrop-blur-md border border-white rounded-3xl shadow-sm space-y-6 text-center">

          {/* ÍCONE */}
          <div className="flex justify-center">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-500">
              <UserX size={32} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              Acesso ainda não liberado
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
              Sem lotação definida
            </p>
          </div>

          {/* MENSAGEM */}
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Sua conta está ativa, mas ainda não foi vinculada a um
            departamento no sistema. Entre em contato com o seu coordenador
            para que a lotação seja regularizada.
          </p>

          {/* IDENTIFICAÇÃO */}
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
            Se você já comunicou seu coordenador, aguarde a atualização e
            tente novamente mais tarde.
          </p>

          {/* AÇÃO */}
          <div className="pt-2">
            <button
              onClick={sair}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest shadow-sm shadow-blue-200"
            >
              <LogOut size={13} /> Voltar ao login
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}