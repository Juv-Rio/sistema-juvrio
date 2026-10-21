'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Calendar, Clock, FolderOpen, UserRound, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Lista de projetos/departamentos. Será definida depois; por ora um item padrão.
const PROJETOS = [
  { id: 'inicial', nome: 'Projeto Inicial' },
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
  const [projetoAtivo, setProjetoAtivo] = useState(PROJETOS[0]?.id || '');
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  // Timers para o comportamento híbrido (hover com atraso + clique)
  const abrirTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fecharTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Limpa os timers ao desmontar
  useEffect(() => {
    return () => {
      if (abrirTimer.current) clearTimeout(abrirTimer.current);
      if (fecharTimer.current) clearTimeout(fecharTimer.current);
    };
  }, []);

  const abrirMenu = () => {
    if (fecharTimer.current) clearTimeout(fecharTimer.current);
    abrirTimer.current = setTimeout(() => setMenuAberto(true), 120);
  };

  const fecharMenu = () => {
    if (abrirTimer.current) clearTimeout(abrirTimer.current);
    fecharTimer.current = setTimeout(() => setMenuAberto(false), 250);
  };

  const alternarMenu = () => {
    if (abrirTimer.current) clearTimeout(abrirTimer.current);
    if (fecharTimer.current) clearTimeout(fecharTimer.current);
    setMenuAberto(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_juvrio');
    router.push('/');
  };

  const data = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-white shadow-sm z-30">
      <div className="h-16 px-6 flex items-center justify-between gap-6">
        {/* LOGO JUV-RIO (posição do logo do SEI) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src="/logo-juvrio.png" alt="JUV-RIO" className="h-9 w-auto brightness-0 opacity-80" />
          <div className="hidden md:block leading-tight">
            <p className="text-slate-800 font-black text-[11px] uppercase tracking-tight">Portal JUV-RIO</p>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Secretaria Especial da Juventude Carioca</p>
          </div>
        </div>

        {/* DATA E HORA */}
        <div className="hidden lg:flex items-center gap-5 text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{data}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest tabular-nums">{hora}</span>
          </div>
        </div>

        {/* PROJETO + FOTO DE PERFIL COM MENU DE USUÁRIO */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 bg-blue-50/60 border border-white rounded-xl px-3 py-2">
            <FolderOpen size={14} className="text-blue-400" />
            <select
              value={projetoAtivo}
              onChange={(e) => setProjetoAtivo(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer appearance-none"
            >
              {PROJETOS.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <ChevronDown size={14} className="text-blue-400" />
          </div>

          {/* AVATAR + BALÃO (hover abre, clique alterna, sai fecha) */}
          <div
            className="relative"
            onMouseEnter={abrirMenu}
            onMouseLeave={fecharMenu}
          >
            <button
              type="button"
              onClick={alternarMenu}
              className="w-10 h-10 rounded-xl overflow-hidden border border-white shadow-sm bg-blue-100 flex items-center justify-center flex-shrink-0 ring-offset-2 ring-offset-white transition-shadow hover:ring-2 hover:ring-blue-300 cursor-pointer"
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

            {menuAberto && (
              <>
                {/* Overlay invisível: fecha ao clicar fora */}
                <div className="fixed inset-0 z-40" onClick={fecharMenu} />
                <div className="absolute right-0 top-full mt-3 z-50 w-56 bg-white rounded-2xl border border-blue-50 shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Cabeçalho discreto com o nome do usuário logado */}
                  <div className="px-3 py-2.5 border-b border-slate-50 mb-1">
                    <p className="text-slate-800 font-black text-[10px] uppercase tracking-widest truncate">{user?.nome || 'Usuário'}</p>
                    <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest truncate">{user?.Email || user?.email || ''}</p>
                  </div>
                  <MenuBotao icon={<UserRound size={16} />} label="Editar Perfil" />
                  <MenuBotao icon={<Settings size={16} />} label="Configurações" />
                  <div className="h-px bg-slate-100 my-1" />
                  <MenuBotao icon={<LogOut size={16} />} label="Sair" danger onClick={handleLogout} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
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