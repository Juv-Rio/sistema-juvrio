'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Settings, LogOut, 
  ShieldCheck, Menu, X, Calendar, Loader2
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // FUNÇÃO PARA RESOLVER A FOTO DO PERFIL (mesma lógica da Gestão de Usuários)
  const resolverFoto = (fotoRaw: string) => {
    if (!fotoRaw) return null;
    // Se for QUALQUER link do Google Drive, extrai o ID e usa o endpoint de miniatura (estável)
    if (fotoRaw.includes('drive.google.com')) {
      const id = fotoRaw.split('id=')[1]?.split('&')[0]
        || fotoRaw.split('/d/')[1]?.split('/')[0]
        || fotoRaw.split('file/d/')[1]?.split('/')[0]
        || '';
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w200`;
    }
    // Se for outro link externo (http), retorna direto
    if (fotoRaw.startsWith('http')) return fotoRaw;
    // Se for apenas o ID, monta a miniatura
    return `https://drive.google.com/thumbnail?id=${fotoRaw}&sz=w200`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user_juvrio');
    if (!storedUser) {
      router.push('/');
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.perfil || !parsedUser.perfil.Admin) {
        console.warn("Acesso negado: Usuário não possui perfil Admin.");
        router.push('/');
        return;
      }
      setUser(parsedUser);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem('user_juvrio');
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_juvrio');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#F0F7FF] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">Validando Acesso...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex font-sans antialiased bg-[#F0F7FF]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>

      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} relative z-20 h-full transition-all duration-500 ease-in-out p-5 flex flex-col gap-6`}>
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-[1.5rem] h-full flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between">
            {isSidebarOpen && <img src="/logo-juvrio.png" alt="Logo" className="h-8 w-auto brightness-0 opacity-70" />}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-blue-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg">
              {isSidebarOpen ? <X size={18} /> : <Menu size={22} className="mx-auto" />}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === '/admin'} isOpen={isSidebarOpen} onClick={() => router.push('/admin')} />
            <NavItem icon={<Users size={20} />} label="Gestão de Usuários" active={pathname === '/admin/usuarios'} isOpen={isSidebarOpen} onClick={() => router.push('/admin/usuarios')} />
            <NavItem icon={<Settings size={20} />} label="Configurações" active={pathname === '/admin/config'} isOpen={isSidebarOpen} onClick={() => router.push('/admin/config')} />
          </nav>

          <div className="p-6 mt-auto border-t border-blue-50 bg-blue-50/30">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group">
              <LogOut size={18} />
              {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative z-10 flex flex-col p-5 pl-0 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 mb-5 bg-white/70 backdrop-blur-md border border-white shadow-sm rounded-[1.5rem]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-blue-400/60 text-[8px] font-black uppercase tracking-[0.4em]">
              <span>Portal Admin</span>
              <span>/</span>
              <span className="text-slate-400">{pathname === '/admin' ? 'Início' : 'Gestão'}</span>
            </div>
            <h1 className="text-slate-800 text-lg font-black uppercase tracking-tighter">
              {stepNamesMapping[pathname] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-full border border-white">
              <Calendar size={14} className="text-blue-400" />
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-slate-800 font-black text-[10px] uppercase tracking-widest">{user?.nome}</p>
                <p className="text-green-500 text-[8px] font-bold uppercase tracking-widest">Administrador Ativo</p>
              </div>

              {/* FOTO DO PERFIL LOGADO (resolvida via miniatura do Drive) */}
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white shadow-sm bg-blue-100 flex items-center justify-center flex-shrink-0">
                {user?.foto ? (
                  <img
                    src={resolverFoto(user.foto) || ''}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                    onError={(e: any) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=DBEAFE&color=3B82F6&bold=true`}
                  />
                ) : (
                  <ShieldCheck size={20} className="text-blue-500" />
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #CBDCF7; border-radius: 10px; }
      `}</style>
    </div>
  );
}

const stepNamesMapping: Record<string, string> = {
  '/admin': 'Visão Geral',
  '/admin/usuarios': 'Gestão de Usuários',
  '/admin/config': 'Configurações do Sistema'
};

function NavItem({ icon, label, active = false, isOpen, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 group ${active ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}>
      <div className={`${active ? 'text-white' : 'group-hover:text-blue-500 transition-colors'}`}>{icon}</div>
      {isOpen && <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>}
    </button>
  );
}