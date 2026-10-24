'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Check, Clock, House, UserRound, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { resolverRotaInicial } from '@/lib/landing';

// Opções de status do usuário (bolinha do avatar)
type StatusUsuario = 'disponivel' | 'nao_disponivel' | 'em_reuniao';

const CORES_STATUS: Record<StatusUsuario, string> = {
  disponivel: 'bg-green-500',
  nao_disponivel: 'bg-red-500',
  em_reuniao: 'bg-yellow-500',
};

const STATUS_OPCOES: { id: StatusUsuario; label: string; cor: string; fundoSel: string; textoSel: string }[] = [
  { id: 'disponivel', label: 'Disponível', cor: 'bg-green-500', fundoSel: 'bg-green-50', textoSel: 'text-green-600' },
  { id: 'nao_disponivel', label: 'Não disponível', cor: 'bg-red-500', fundoSel: 'bg-red-50', textoSel: 'text-red-600' },
  { id: 'em_reuniao', label: 'Em reunião', cor: 'bg-yellow-500', fundoSel: 'bg-yellow-50', textoSel: 'text-yellow-600' },
];

// Resolve a foto do perfil (mesma lógica usada no portal admin)
function resolverFoto(fotoRaw: string) {
  if (!fotoRaw) return null;

  if (fotoRaw.includes('drive.google.com')) {
    const id = fotoRaw.split('id=')[1]?.split('&')[0]
      || fotoRaw.split('/d/')[1]?.split('/')[0]
      || fotoRaw.split('file/d/')[1]?.split('/')[0]
      || '';
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w200`;
  }

  if (fotoRaw.startsWith('http')) return fotoRaw;

  return `https://drive.google.com/thumbnail?id=${fotoRaw}&sz=w200`;
}

export default function TopBar({ user }: { user: any }) {
  const [agora, setAgora] = useState(new Date());
  const [menuAberto, setMenuAberto] = useState(false);
  const [statusUsuario, setStatusUsuario] = useState<StatusUsuario>('disponivel');
  const router = useRouter();

  // Timer de fechamento automático (menu aberto + mouse fora da foto e do balão)
  const fecharTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Limpa o timer ao desmontar
  useEffect(() => {
    return () => {
      if (fecharTimer.current) clearTimeout(fecharTimer.current);
    };
  }, []);

  // Carrega o status salvo em sessões anteriores
  useEffect(() => {
    const salvo = localStorage.getItem('status_juvrio');
    if (salvo === 'disponivel' || salvo === 'nao_disponivel' || salvo === 'em_reuniao') {
      setStatusUsuario(salvo);
    }
  }, []);

  const cancelarFechamento = () => {
    if (fecharTimer.current) clearTimeout(fecharTimer.current);
    fecharTimer.current = null;
  };

  const agendarFechamento = () => {
    cancelarFechamento();
    fecharTimer.current = setTimeout(() => setMenuAberto(false), 3000); // 3s de cortesia
  };

  const alternarMenu = () => {
    cancelarFechamento();
    setMenuAberto(prev => !prev);
  };

  const fecharMenuAgora = () => {
    cancelarFechamento();
    setMenuAberto(false);
  };

  const alterarStatus = (novo: StatusUsuario) => {
    setStatusUsuario(novo);
    localStorage.setItem('status_juvrio', novo);
  };

  const irParaHome = () => {
    cancelarFechamento();
    router.push(resolverRotaInicial(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('user_juvrio');
    router.push('/');
  };

  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="w-full bg-white/80 backdrop-blur-md shadow-sm z-30">
      <div className="h-16 px-6 flex items-center justify-between gap-6">

        {/* LOGO JUV-RIO (clicável) + BOTÃO HOME */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={irParaHome}
            aria-label="Ir para a página inicial"
            title="Início"
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <img src="/logo-juvrio-colorida-horizontal.png" alt="JUV-RIO" className="h-9 w-auto" />
          </button>

          {/* BOTÃO HOME (pronto para futuras implementações) */}
          <button
            type="button"
            onClick={irParaHome}
            aria-label="Início"
            title="Início"
            className="w-9 h-9 rounded-xl border border-sky-100 shadow-sm bg-sky-50/70 flex items-center justify-center cursor-pointer hover:bg-sky-100/70 hover:ring-2 hover:ring-sky-400 transition-all"
          >
            <House size={16} className="text-sky-500" />
          </button>
        </div>

        {/* SAUDAÇÃO + DATA/HORA + FOTO DE PERFIL COM MENU DE USUÁRIO */}
        <div className="flex items-center gap-4 shrink-0">

          {/* DATA E HORA (empilhada, sem caixa; ícones à direita, junto ao separador) */}
          <div className="hidden lg:flex flex-col justify-center gap-0.5 leading-tight">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 tabular-nums">{data}</span>
              <Calendar size={12} className="text-sky-500" />
            </div>
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 tabular-nums">{hora}</span>
              <Clock size={12} className="text-sky-500" />
            </div>
          </div>

          {/* SEPARADOR VERTICAL (mesmo gradiente do rodapé da TopBar) */}
          <div className="hidden lg:block w-0.75 h-8 rounded-full bg-linear-to-b from-sky-400 via-blue-500 to-blue-600" />

          {/* SAUDAÇÃO AMIGÁVEL */}
          <p className="hidden sm:block text-[11px] font-bold text-slate-500">
            Olá, <span className="font-black text-blue-900">{user?.nome?.split(' ')[0] || 'Usuário'}</span>
          </p>

          {/* AVATAR + BALÃO (abre no clique; fecha no 2º clique; mouse fora fecha em 3s) */}
          <div className="relative">
            <button
              type="button"
              onClick={alternarMenu}
              onMouseEnter={cancelarFechamento}
              onMouseLeave={() => { if (menuAberto) agendarFechamento(); }}
              className={`w-10 h-10 rounded-xl overflow-hidden border border-sky-100 shadow-sm bg-blue-100 flex items-center justify-center shrink-0 ring-offset-2 ring-offset-white transition-shadow hover:ring-2 hover:ring-sky-400 ${menuAberto ? 'ring-2 ring-sky-400' : ''}`}
              aria-label="Menu do usuário"
            >
              {user?.foto ? (
                <img
                  src={resolverFoto(user.foto) || ''}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                  onError={(e: any) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=DBEAFE&color=3B82F6&bold=true`}
                />
              ) : (
                <span className="text-blue-500 font-black text-sm uppercase">{user?.nome?.charAt(0) || 'U'}</span>
              )}
            </button>

            {/* Indicador de status (cor conforme escolha do usuário) */}
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white z-10 pointer-events-none ${CORES_STATUS[statusUsuario]}`} />

            {menuAberto && (
              <>
                {/* Overlay invisível: fecha ao clicar fora */}
                <div className="fixed inset-0 z-40" onClick={fecharMenuAgora} />

                <div
                  className="absolute right-0 top-full mt-3 z-50 w-56 bg-white rounded-2xl border border-blue-50 shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={cancelarFechamento}
                  onMouseLeave={agendarFechamento}
                >
                  {/* Cabeçalho discreto com o nome do usuário logado */}
                  <div className="px-3 py-2.5 border-b border-slate-50 mb-1">
                    <p className="text-slate-800 font-black text-[10px] uppercase tracking-widest truncate">{user?.nome || 'Usuário'}</p>
                    <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest truncate">{user?.Email || user?.email || ''}</p>
                  </div>

                  {/* SELETOR DE STATUS */}
                  <div className="px-1 pb-1 mb-1 border-b border-slate-50">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 py-1">Status</p>
                    {STATUS_OPCOES.map(op => (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => alterarStatus(op.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-all cursor-pointer ${
                          statusUsuario === op.id
                            ? `${op.fundoSel} ${op.textoSel}`
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${op.cor}`} />
                        {op.label}
                        {statusUsuario === op.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </div>

                  <MenuBotao icon={<UserRound size={16} />} label="Editar Perfil" onClick={() => router.push('/portal/editar-perfil')} />
                  <MenuBotao icon={<Settings size={16} />} label="Configurações" />
                  <div className="h-px bg-slate-100 my-1" />
                  <MenuBotao icon={<LogOut size={16} />} label="Sair" danger onClick={handleLogout} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACENTO GRADIENTE (eco do brasão da logo) */}
      <div className="h-0.75 w-full bg-linear-to-r from-sky-400 via-blue-500 to-blue-600" />
    </header>
  );
}

function MenuBotao({ icon, label, danger = false, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-left ${
        danger
          ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
          : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/70'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}