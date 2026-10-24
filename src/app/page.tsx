'use client';
import { useState, useEffect } from 'react';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, UserPlus, MapPin, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { resolverRotaInicial } from '@/lib/landing';
export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [exibirErro, setExibirErro] = useState(false);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [bgIndex, setBgIndex] = useState(0);
  const router = useRouter();
  useEffect(() => {
    async function carregarBackgrounds() {
      try {
        const res = await fetch('/api/get-backgrounds');
        const data = await res.json();
        if (data.backgrounds && data.backgrounds.length > 0) {
          setBackgrounds(data.backgrounds);
        } else {
          setBackgrounds(['https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2070&auto=format&fit=crop']);
        }
      } catch (e) { console.error(e); }
    }
    carregarBackgrounds();
  }, []);
  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds]);
  // Lógica de Temporização do Erro (5 segundos)
  useEffect(() => {
    if (erro) {
      setExibirErro(true);
      const timer = setTimeout(() => {
        setExibirErro(false);
        // Aguarda a animação de fade-out terminar para limpar o estado
        setTimeout(() => setErro(null), 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [erro]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (data.success) {
        // SALVA A SESSÃO NO NAVEGADOR
        localStorage.setItem('user_juvrio', JSON.stringify(data.user));
        // BLOQUEIA USUÁRIOS INATIVOS
        if (data.user.status === 'INATIVO') {
          setErro('Usuário sem permissão de acesso.');
        } else {
          // REDIRECIONA CONFORME A LANDING PRIMÁRIA (Admin tem precedência)
          router.push(resolverRotaInicial(data.user));
        }
      } else {
        setErro(data.error || 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };
  // SVG Fidedigno do Instagram (Diretriz Permanente)
  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-5.838 2.435-5.838 5.838s2.435 5.838 5.838 5.838 5.838-2.435 5.838-5.838-2.435-5.838-5.838-5.838zm0 9.513c-2.03 0-3.675-1.645-3.675-3.675 0-2.03 1.645-3.675 3.675-3.675 2.03 0 3.675 1.645 3.675 3.675 0 2.03-1.645 3.675-3.675 3.675zm4.961-10.405c.732 0 1.326.594 1.326 1.326s-.594 1.326-1.326 1.326-1.326-.594-1.326-1.326.594-1.326 1.326-1.326z"/>
    </svg>
  );
  const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-.99.01-1.49.18-3.33 2.32-6.21 5.47-7.24 1.21-.44 2.52-.57 3.81-.42.01 1.21-.01 2.42.02 3.62-1.13-.36-2.35-.35-3.37.27-1.19.71-1.89 2.03-1.97 3.41-.02.75.11 1.5.4 2.22.45 1.09 1.42 1.92 2.56 2.26 1.27.41 2.73.29 3.84-.52.8-.56 1.31-1.45 1.44-2.44.04-1.62.02-3.24.02-4.87.01-4.38-.01-8.76.02-13.13z"/>
    </svg>
  );
  return (
    <div className="min-h-screen relative font-sans antialiased selection:bg-blue-500 selection:text-white overflow-hidden flex flex-col justify-between">
      {backgrounds.map((src, index) => (
        <div 
          key={src}
          className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${bgIndex === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${src}')` }}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[0.8px]"></div>
        </div>
      ))}
      {/* HEADER */}
      <div className="relative z-10 p-12 flex items-center justify-between">
        <img 
          src="/logo-juvrio.png" 
          alt="Logo JUV-RIO" 
          className="h-18 w-auto drop-shadow-2xl animate-in fade-in slide-in-from-top-8 duration-1000" 
        />
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="group relative">
            <a href="https://www.instagram.com/juvrio/?hl=pt" target="_blank" rel="noopener noreferrer" 
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg">
              <InstagramIcon />
            </a>
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
              Instagram JUV-RIO
            </span>
          </div>
          <div className="group relative">
            <a href="https://www.tiktok.com/@juvrio" target="_blank" rel="noopener noreferrer" 
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg">
              <TikTokIcon />
            </a>
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
              TikTok JUV-RIO
            </span>
          </div>
          <div className="group relative">
            <a href="https://www.google.com/maps/place/JUVRio+-+Secretaria+Especial+da+Juventude+Carioca/data=!4m2!3m1!1s0x0:0xfeabce798a63632e?sa=X&ved=1t:2428&ictx=111" target="_blank" rel="noopener noreferrer" 
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg">
              <MapPin size={18} />
            </a>
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
              Nossa Localização
            </span>
          </div>
          <div className="h-6 w-px bg-white/20 mx-2"></div>
          <div className="hidden md:flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <div className="text-right">
              <p className="text-white font-black text-[10px] uppercase tracking-widest">Portal Seguro</p>
            </div>
            <ShieldCheck size={16} className="text-blue-300" />
          </div>
        </div>
      </div>
      {/* BOTTOM BAR */}
      <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="px-12 mb-4 max-w-2xl">
          <h2 className="text-white text-3xl font-black uppercase tracking-tighter drop-shadow-lg mb-1">
            Gestão Estratégica da JUV-RIO
          </h2>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em] drop-shadow-md">
            Portal de Acesso Interno
          </p>
        </div>
        <div className="bg-white/4 backdrop-blur-[20px] border-t border-white/5 py-5 md:py-6 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
          <div className="px-12 flex flex-col lg:flex-row items-center justify-between gap-6">
            <form onSubmit={handleLogin} className="flex flex-col md:flex-row items-start gap-4 w-full lg:w-auto">
              {/* E-MAIL */}
              <div className="w-full md:w-64 space-y-1.5">
                <label className="text-[8px] font-black text-blue-200 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
                  <Mail size={10} /> E-mail Institucional
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-white/5 rounded-full p-3.5 bg-white/5 text-white placeholder:text-white/20 focus:ring-1 focus:ring-blue-400 outline-none transition-all shadow-inner text-xs h-11.5"
                    placeholder="exemplo@juvrio.com.br"
                  />
                </div>
              </div>
              {/* SENHA */}
              <div className="w-full md:w-56 space-y-1.5">
                <label className="text-[8px] font-black text-blue-200 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
                  <Lock size={10} /> Senha
                </label>
                <div className="relative">
                  <input 
                    type={verSenha ? "text" : "password"} 
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full border border-white/5 rounded-full p-3.5 bg-white/5 text-white placeholder:text-white/20 focus:ring-1 focus:ring-blue-400 outline-none transition-all shadow-inner text-xs h-11.5"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setVerSenha(!verSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-white transition-colors"
                  >
                    {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end pr-4 mt-1">
                  <a 
                    href="/usuarios/recuperar" 
                    className="text-[9px] font-black text-blue-300/60 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
              </div>
              {/* BOTÃO LOGIN COM ALERTA LATERAL */}
              <div className="w-full md:w-32 space-y-1.5 relative">
                <label className="text-[8px] font-black text-blue-200 uppercase tracking-[0.2em] ml-4 flex items-center gap-2 invisible">
                  <ShieldCheck size={10} /> Login
                </label>
                {/* BALÃO DE ALERTA LATERAL COM TEMPORIZADOR */}
                {erro && (
                  <div className={`absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 p-3 bg-red-500/20 border border-red-500/30 backdrop-blur-xl text-red-200 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center shadow-2xl transition-all duration-500 z-50 ${exibirErro ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-2 pointer-events-none'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle size={12} /> {erro}
                    </div>
                    {/* SETA DO BALÃO APONTANDO PARA A ESQUERDA */}
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500/20 border-l border-b border-red-500/30 rotate-45 backdrop-blur-xl"></div>
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={carregando}
                  className="w-full bg-white text-[#001D4A] py-3.5 rounded-full font-black hover:bg-blue-50 shadow-lg transition-all active:scale-95 uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 disabled:bg-slate-400 h-11.5"
                >
                  {carregando ? <Loader2 className="animate-spin" size={14} /> : "LOGIN"}
                </button>
              </div>
            </form>
            <div className="flex flex-col items-center lg:items-end gap-3">
              <div className="flex items-center gap-4">
                <a 
                  href="/usuarios/novo" 
                  className="flex items-center gap-2 text-blue-300/70 font-black text-[8px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  <UserPlus size={12} /> Solicitar Cadastro
                </a>
                <div className="h-3 w-px bg-white/10"></div>
                <p className="text-white/20 font-bold text-[8px] uppercase tracking-[0.2em]">
                  Acesso Restrito
                </p>
                <div className="h-3 w-px bg-white/10"></div>
                <a 
                  href="/politica-de-privacidade" 
                  className="text-blue-300/70 font-black text-[8px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  Política de Privacidade
                </a>
              </div>
              <p className="text-white/30 font-medium text-[8px] uppercase tracking-[0.4em] whitespace-nowrap">
                © 2026 Secretaria Especial da Juventude Carioca - JUV-RIO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}