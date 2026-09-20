'use client';

import { useState, useEffect } from 'react';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, Loader2, 
  CreditCard, Smartphone, Calendar, CheckCircle2, Info, User, MapPin
} from 'lucide-react';

export default function RecuperarSenha() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buscandoNome, setBuscandoNome] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [verSenha, setVerSenha] = useState(false);

  // Alertas de validação em tempo real
  const [cpfInvalido, setCpfInvalido] = useState(false);
  const [emailInvalido, setEmailInvalido] = useState(false);
  const [telefoneInvalido, setTelefoneInvalido] = useState(false);

  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [bgIndex, setBgIndex] = useState(0);

  const [formData, setFormData] = useState({
    nome: '', email: '', cpf: '', telefone: '', dataNascimento: '',
    novaSenha: '', confirmarSenha: ''
  });

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadBgs() {
      try {
        const res = await fetch('/api/get-backgrounds');
        const data = await res.json();
        setBackgrounds(data.backgrounds || ['https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2070&auto=format&fit=crop']);
      } catch (e) {
        setBackgrounds(['https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2070&auto=format&fit=crop']);
      }
    }
    loadBgs();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const interval = setInterval(() => setBgIndex(p => (p + 1) % backgrounds.length), 5000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  // SVGs de Redes Sociais (para estabilidade do build)
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

  // Máscaras
  const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);
  const maskPhone = (v: string) => {
    let r = v.replace(/\D/g, "");
    if (!r) return "";
    if (r.length > 10) return r.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    return r.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  };

  // Busca automática de nome por CPF
  const buscarNomePorCPF = async (cpf: string) => {
    if (cpf.length < 14) return;
    setBuscandoNome(true);
    setCpfInvalido(false);
    try {
      const res = await fetch(`/api/recovery/get-name?cpf=${cpf}`);
      const data = await res.json();
      if (data.exists) {
        setFormData(prev => ({ ...prev, nome: data.nome }));
      } else {
        setCpfInvalido(true);
        setFormData(prev => ({ ...prev, nome: '' }));
      }
    } catch (e) { console.error(e); }
    finally { setBuscandoNome(false); }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let val = value;
    
    if (name === 'cpf') {
      val = maskCPF(value);
      buscarNomePorCPF(val);
    }
    if (name === 'telefone') {
      val = maskPhone(value);
      setTelefoneInvalido(val.length > 0 && val.length < 14);
    }
    if (name === 'email') {
      setEmailInvalido(val.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    }

    setFormData(prev => ({ ...prev, [name]: val }));
    setErro(null);
  };

  const validarDados = async () => {
    if (!formData.nome || cpfInvalido || emailInvalido || telefoneInvalido) {
      setErro("Por favor, corrija os campos marcados antes de prosseguir.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/recovery/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, cpf: formData.cpf, 
          telefone: formData.telefone, dataNascimento: formData.dataNascimento 
        })
      });
      const data = await res.json();
      if (data.success) setStep(2);
      else setErro("OS DADOS NÃO CONFEREM COM OS REGISTRADOS NO SISTEMA. VERIFIQUE AS CREDENCIAIS.");
    } catch { setErro("Erro de conexão com o servidor."); }
    finally { setLoading(false); }
  };

  const atualizarSenha = async () => {
    if (formData.novaSenha !== formData.confirmarSenha) { setErro("As senhas não coincidem."); return; }
    
    const temMaiuscula = /[A-Z]/.test(formData.novaSenha);
    const temMinuscula = /[a-z]/.test(formData.novaSenha);
    const temNumero = /[0-9]/.test(formData.novaSenha);
    const temEspecial = /[!@#$%*]/.test(formData.novaSenha);

    if (!temMaiuscula || !temMinuscula || !temNumero || !temEspecial) { 
      setErro("A senha não cumpre todos os requisitos de segurança."); 
      return; 
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/recovery/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, novaSenha: formData.novaSenha })
      });
      const data = await res.json();
      if (data.success) {
        alert("Senha atualizada com sucesso!");
        window.location.href = '/';
      } else { setErro(data.error); }
    } catch { setErro("Erro ao atualizar a senha."); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full border border-white/5 rounded-full p-4 bg-white/5 text-white placeholder:text-white/20 focus:ring-1 focus:ring-blue-400 outline-none transition-all shadow-inner text-xs";
  const labelClass = "text-[8px] font-black text-blue-200 uppercase tracking-[0.2em] ml-4 flex items-center gap-2";
  const errorText = "text-red-400 text-[8px] font-black uppercase mt-1 ml-4 animate-pulse";

  return (
    <div className="min-h-screen relative font-sans antialiased flex flex-col justify-between overflow-hidden">
      {backgrounds.map((src, index) => (
        <div key={src} className={`fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ${bgIndex === index ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url('${src}')` }}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[8px]"></div>
        </div>
      ))}

      {/* HEADER */}
      <div className="relative z-10 p-12 flex items-center justify-between">
        <img src="/logo-juvrio.png" alt="Logo JUV-RIO" className="h-16 w-auto drop-shadow-2xl" />
        <div className="flex items-center gap-3">
          <div className="group relative">
            <a href="https://www.instagram.com/juvrio/?hl=pt" target="_blank" rel="noopener noreferrer" 
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg">
              <InstagramIcon />
            </a>
          </div>
          <div className="group relative">
            <a href="https://www.tiktok.com/@juvrio" target="_blank" rel="noopener noreferrer" 
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg">
              <TikTokIcon />
            </a>
          </div>
          <div className="group relative">
            <a href="https://www.google.com/maps/place/JUVRio+-+Secretaria+Especial+da+Juventude+Carioca/data=!4m2!3m1!1s0x0:0xfeabce798a63632e?sa=X&ved=1t:2428&ictx=111" target="_blank" rel="noopener noreferrer" 
               className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg">
              <MapPin size={18} />
            </a>
          </div>
          <div className="h-6 w-px bg-white/20 mx-2"></div>
          <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-3">
            <p className="text-white font-black text-[10px] uppercase tracking-widest">Recuperação</p>
            <ShieldCheck size={16} className="text-blue-300" />
          </div>
        </div>
      </div>

      {/* CONTEÚDO CENTRAL */}
      <div className="relative z-10 w-full mb-12 px-4">
        <div className="max-w-xl mx-auto mb-6 text-center">
          <h2 className="text-white text-3xl font-black uppercase tracking-tighter mb-1">
            {step === 1 ? "Validar Identidade" : "Nova Senha"}
          </h2>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em]">
            {step === 1 ? "Confirme seus dados cadastrados" : "Defina sua nova credencial de acesso"}
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white/4 backdrop-blur-[20px] border-t border-white/5 p-8 md:p-12 shadow-2xl rounded-[3rem]">
          {erro && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 animate-in zoom-in">
              <Info size={14} /> {erro}
            </div>
          )}

          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 relative">
                <label className={labelClass}><CreditCard size={10} /> CPF Identificador</label>
                <input name="cpf" value={formData.cpf} onChange={handleChange} className={`${inputClass} ${cpfInvalido ? 'border-red-500/50' : ''}`} placeholder="000.000.000-00" />
                {buscandoNome && <Loader2 className="absolute right-4 bottom-3.5 animate-spin text-blue-400" size={14} />}
                {cpfInvalido && <p className={errorText}>CPF não localizado.</p>}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}><User size={10} /> Nome do Colaborador</label>
                <input name="nome" value={formData.nome} readOnly className={`${inputClass} opacity-50 cursor-not-allowed`} placeholder="Aguardando CPF..." />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}><Mail size={10} /> Confirmar E-mail</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={`${inputClass} ${emailInvalido ? 'border-red-500/50' : ''}`} placeholder="exemplo@juvrio.com.br" />
                {emailInvalido && <p className={errorText}>E-mail inválido.</p>}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}><Smartphone size={10} /> Confirmar Telefone</label>
                <input name="telefone" value={formData.telefone} onChange={handleChange} className={`${inputClass} ${telefoneInvalido ? 'border-red-500/50' : ''}`} placeholder="(21) 99999-9999" />
                {telefoneInvalido && <p className={errorText}>Telefone incompleto.</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className={labelClass}><Calendar size={10} /> Data de Nascimento</label>
                <input name="dataNascimento" type="date" max={hoje} value={formData.dataNascimento} onChange={handleChange} className={inputClass} />
              </div>

              <button onClick={validarDados} disabled={loading || buscandoNome} className="md:col-span-2 w-full bg-white text-[#001D4A] py-4 rounded-full font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-3 text-[10px] tracking-widest uppercase disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <>Verificar Credenciais <ArrowRight size={16} /></>}
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-1.5">
                <label className={labelClass}><Lock size={10} /> Nova Senha</label>
                <div className="relative">
                  <input name="novaSenha" type={verSenha ? "text" : "password"} value={formData.novaSenha} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                  <button type="button" onClick={() => setVerSenha(!verSenha)} className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-white transition-colors">
                    {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}><Lock size={10} /> Confirmar Senha</label>
                <input name="confirmarSenha" type={verSenha ? "text" : "password"} value={formData.confirmarSenha} onChange={handleChange} className={inputClass} placeholder="••••••••" />
              </div>
              
              <ul className="text-[10px] grid grid-cols-2 gap-2 font-bold ml-4">
                <li className={/[A-Z]/.test(formData.novaSenha) ? "text-green-400" : "text-white/20"}>● Maiúscula</li>
                <li className={/[a-z]/.test(formData.novaSenha) ? "text-green-400" : "text-white/20"}>● Minúscula</li>
                <li className={/[0-9]/.test(formData.novaSenha) ? "text-green-400" : "text-white/20"}>● Número</li>
                <li className={/[!@#$%*]/.test(formData.novaSenha) ? "text-green-400" : "text-white/20"}>● Especial</li>
              </ul>

              <button onClick={atualizarSenha} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-full font-black hover:bg-blue-500 transition-all flex items-center justify-center gap-3 text-[10px] tracking-widest uppercase shadow-lg">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <>Redefinir Senha <CheckCircle2 size={16} /></>}
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <a href="/" className="text-white/40 font-black text-[9px] uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={12} /> Voltar para o Login
            </a>
          </div>
        </div>
        <p className="text-center text-white/30 text-[8px] uppercase tracking-[0.5em] mt-12">
          © 2026 Secretaria Especial da Juventude Carioca - JUV-RIO
        </p>
      </div>
    </div>
  );
}