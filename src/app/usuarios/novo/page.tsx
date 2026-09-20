'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, Lock, 
  ChevronRight, ChevronLeft, Camera, Check, ShieldCheck, 
  Loader2, AlertCircle, Calendar, CreditCard, Eye, EyeOff, 
  Upload, Trash2, Search, Minus, Plus
} from 'lucide-react';

const stepNames = ["Dados Pessoais", "Dados de Contato", "Atribuições", "Foto de Perfil", "Senha"];

export default function NovoUsuario() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Estados de Dados Dinâmicos
  const [setores, setSetores] = useState<string[]>([]);
  const [mappingFuncoes, setMappingFuncoes] = useState<Record<string, string[]>>({});
  
  // Estados de Interface
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [bgIndex, setBgIndex] = useState(0);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [verSenha, setVerSenha] = useState(false);

  // Estados de Concordância
  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [aceitoPrivacidade, setAceitoPrivacidade] = useState(false);

  // Estados do Carrossel de Avatares
  const [avatarPage, setAvatarPage] = useState(0);
  const avatarsPerPage = 10; // 2 linhas de 5

  // Foto, Redimensionamento e Movimentação
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [fotoOriginal, setFotoOriginal] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome: '', cpf: '', dataNascimento: '',
    email: '', telefone: '', instagram: '',
    cep: '', logradouro: '', numero: '', bairro: '', cidade: '', complemento: '', pontoReferencia: '',
    setor: '', funcao: '',
    avatar: '', senha: '', confirmarSenha: ''
  });

  const hoje = new Date().toISOString().split('T')[0];

  // SVG Fidedigno do Instagram
  const InstagramIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );

  // Carregamento de Recursos
  useEffect(() => {
    async function loadResources() {
      try {
        const [bgRes, avRes, configRes] = await Promise.all([
          fetch('/api/get-backgrounds').then(r => r.json()),
          fetch('/api/get-avatars').then(r => r.json()),
          fetch('/api/get-configs').then(r => r.json())
        ]);
        setBackgrounds(bgRes.backgrounds || []);
        setAvatars(avRes.avatars || []);
        if (configRes.status === 'Sucesso!') {
          const mapping: Record<string, string[]> = {};
          configRes.atribuicoes.forEach((row: any) => {
            const s = row[0]?.toString().trim();
            const f = row[1]?.toString().trim();
            if (s && f) {
              if (!mapping[s]) mapping[s] = [];
              if (!mapping[s].includes(f)) mapping[s].push(f);
            }
          });
          setMappingFuncoes(mapping);
          setSetores(Object.keys(mapping).sort());
        }
      } catch (e) { console.error(e); }
    }
    loadResources();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const interval = setInterval(() => setBgIndex(p => (p + 1) % backgrounds.length), 5000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  const totalAvatarPages = Math.ceil(avatars.length / avatarsPerPage);
  const currentAvatars = avatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage);

  // Máscaras
  const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);
  
  const maskPhone = (v: string) => {
    let r = v.replace(/\D/g, "");
    if (r.length > 10) return r.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    if (r.length > 6) return r.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    if (r.length > 2) return r.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    if (r.length > 0) return "(" + r;
    return "";
  };

  const maskCEP = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  const isEmailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passRules = {
    upper: /[A-Z]/.test(formData.senha),
    lower: /[a-z]/.test(formData.senha),
    number: /[0-9]/.test(formData.senha),
    special: /[!@#$%&]/.test(formData.senha)
  };

  // CEP API
  const handleCepBlur = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(p => ({ ...p, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade }));
      }
    } finally { setBuscandoCep(false); }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cpf') val = maskCPF(value);
    if (name === 'telefone') val = maskPhone(value);
    if (name === 'cep') { val = maskCEP(value); if (val.length === 9) handleCepBlur(val); }
    setFormData(p => ({ ...p, [name]: val, ...(name === 'setor' ? { funcao: '' } : {}) }));
    setErro(null);
  };

  // Lógica de Redimensionamento e Movimentação (Canvas)
  const processCanvas = (img: HTMLImageElement, scale: number, moveX: number, moveY: number) => {
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      const minOriginal = Math.min(img.width, img.height);
      const sourceSize = minOriginal / scale;
      const sx = ((img.width - sourceSize) / 2) - (moveX * (sourceSize / 160));
      const sy = ((img.height - sourceSize) / 2) - (moveY * (sourceSize / 160));
      ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
      setPreviewFoto(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  useEffect(() => {
    if (fotoOriginal) processCanvas(fotoOriginal, zoom, offset.x, offset.y);
  }, [zoom, offset, fotoOriginal]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setFotoOriginal(img);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setFormData(p => ({ ...p, avatar: '' }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fotoOriginal) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const canGoNext = () => {
    if (step === 1) return formData.nome && formData.cpf.length === 14 && formData.dataNascimento && formData.dataNascimento <= hoje;
    if (step === 2) return isEmailValido(formData.email) && formData.telefone.length >= 14 && formData.cep.length === 9 && formData.logradouro && formData.numero && formData.bairro && formData.cidade;
    if (step === 3) return formData.setor && formData.funcao;
    if (step === 4) return previewFoto || formData.avatar;
    return true;
  };

  // Lógica de Transição entre passos (com Upload no Passo 4)
  const handleNextStep = async () => {
    if (step === 4) {
      setLoading(true);
      setErro(null);
      try {
        let fotoParaUpload = previewFoto;

        // Se não tem foto customizada mas tem avatar, converte o avatar para base64 para subir pro Drive
        if (!fotoParaUpload && formData.avatar && formData.avatar.startsWith('/')) {
          const response = await fetch(formData.avatar);
          const blob = await response.blob();
          fotoParaUpload = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }

        if (fotoParaUpload) {
          const upRes = await fetch('/api/upload-foto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fotoBase64: fotoParaUpload, cpf: formData.cpf })
          });
          
          const upData = await upRes.json();
          if (!upRes.ok || !upData.fileId) {
            throw new Error(upData.error || "Erro ao realizar upload da foto de perfil.");
          }
          // Salva o ID do Drive no estado e avança
          setFormData(p => ({ ...p, avatar: upData.fileId }));
        }

        setStep(5);
      } catch (error: any) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    if (!aceitoTermos || !aceitoPrivacidade) {
      setErro("Você precisa aceitar os termos e a política de privacidade para continuar.");
      return;
    }
    if (formData.senha !== formData.confirmarSenha) { setErro("As senhas não coincidem."); return; }
    if (!passRules.upper || !passRules.lower || !passRules.number || !passRules.special) {
      setErro("A senha não atende aos requisitos de segurança.");
      return;
    }
    
    setLoading(true);
    setErro(null);

    try {
      // O ID da foto já está garantido no formData.avatar pelo passo anterior
      const res = await fetch('/api/save-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fotoUrl: formData.avatar })
      });
      
      const data = await res.json();
      
      if (data.success) { 
        setSucesso(true); 
        setTimeout(() => window.location.href = '/', 4000); 
      } else { 
        setErro(data.error || "Erro ao salvar dados do usuário."); 
      }
    } catch (error: any) { 
      setErro(error.message || "Erro de conexão com o servidor."); 
    } finally { 
      setLoading(false); 
    }
  };

  const inputClass = "w-full border border-white/5 rounded-full p-3.5 bg-white/5 text-white placeholder:text-white/20 focus:ring-1 focus:ring-blue-400 outline-none transition-all shadow-inner text-xs";
  const labelClass = "text-[12px] font-black text-blue-200 uppercase tracking-[0.2em] ml-4 flex items-center gap-2";
  const alertText = "text-red-400 text-[9px] font-black uppercase mt-1 ml-4 animate-pulse";

  if (sucesso) {
    return (
      <div className="h-screen relative font-sans antialiased flex flex-col overflow-hidden">
        {backgrounds.map((src, index) => (
          <div key={src} className={`fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ${bgIndex === index ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url('${src}')` }}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]"></div>
          </div>
        ))}

        {/* HEADER */}
        <div className="relative z-10 p-8 md:p-12 flex items-center justify-between flex-shrink-0">
          <img src="/logo-juvrio.png" alt="Logo" className="h-16 w-auto drop-shadow-2xl" />
          <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-3">
            <ShieldCheck size={24} className="text-blue-300" />
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="relative z-10 flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-6">
          <div className="w-full max-w-5xl h-[75vh] bg-white/4 backdrop-blur-[20px] border-t border-white/5 shadow-2xl rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50 shadow-2xl shadow-green-500/10">
              <Check size={64} className="text-green-400" />
            </div>
            <div className="space-y-4">
              <h2 className="text-white text-4xl font-black uppercase tracking-tighter drop-shadow-lg">Solicitação Enviada!</h2>
              <p className="text-blue-200 text-base font-bold uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                Seu cadastro foi registrado com sucesso e agora aguarda a <span className="text-white font-black">aprovação do administrador</span>.
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                <Loader2 size={16} className="animate-spin text-blue-400" /> Redirecionando em instantes...
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <p className="text-center text-white/30 text-[8px] uppercase tracking-[0.5em] mt-4 flex-shrink-0">
            © 2026 Secretaria Especial da Juventude Carioca - JUV-RIO
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative font-sans antialiased flex flex-col overflow-hidden">
      {/* Estilos para a Scrollbar Vitrificada e "Totalmente Interna" */}
      <style jsx global>{`
        .glass-scrollbar::-webkit-scrollbar { width: 3px; }
        .glass-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 40px 0; }
        .glass-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 10px; }
        .glass-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>

      {backgrounds.map((src, index) => (
        <div key={src} className={`fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ${bgIndex === index ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url('${src}')` }}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]"></div>
        </div>
      ))}

      {/* HEADER - Fixo */}
      <div className="relative z-10 p-8 md:p-12 flex items-center justify-between flex-shrink-0">
        <img src="/logo-juvrio.png" alt="Logo" className="h-16 w-auto drop-shadow-2xl" />
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-blue-300 font-black text-[12px] uppercase tracking-[0.3em]">{stepNames[step-1]}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Etapa {step} de 5</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-3">
            <ShieldCheck size={24} className="text-blue-300" />
          </div>
        </div>
      </div>

      {/* CONTAINER CENTRAL - Card Estático de Tamanho Único */}
      <div className="relative z-10 flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pb-6">
        <div className="w-full max-w-5xl h-[75vh] bg-white/4 backdrop-blur-[20px] border-t border-white/5 shadow-2xl rounded-[3.5rem] flex flex-col overflow-hidden relative">
          
          {/* ÁREA DE SCROLL INTERNA */}
          <div className="flex-1 overflow-y-auto glass-scrollbar p-8 md:p-12 pr-14">
            <div className="text-center mb-10">
              <h2 className="text-white text-3xl font-black uppercase tracking-tighter drop-shadow-lg">{stepNames[step-1]}</h2>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.3em]">Preencha os campos marcados com *</p>
            </div>

            {erro && erro !== "Você precisa aceitar os termos e a política de privacidade para continuar." && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-3 animate-in zoom-in">
                <AlertCircle size={14} /> {erro}
              </div>
            )}

            {/* PASSO 1: DADOS PESSOAIS */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2"><label className={labelClass}><User size={18} /> Nome Completo *</label><input name="nome" value={formData.nome} onChange={handleChange} className={inputClass} placeholder="Digite seu nome completo" /></div>
                  <div className="space-y-1.5 relative">
                    <label className={labelClass}><CreditCard size={18} /> CPF *</label>
                    <input name="cpf" value={formData.cpf} onChange={handleChange} className={inputClass} placeholder="000.000.000-00" />
                    {formData.cpf.length > 0 && formData.cpf.length < 14 && <p className={`${alertText} absolute -bottom-4 left-0`}>CPF incompleto ou inválido.</p>}
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className={labelClass}><Calendar size={18} /> Nascimento *</label>
                    <input name="dataNascimento" type="date" max={hoje} value={formData.dataNascimento} onChange={handleChange} className={inputClass} />
                    {formData.dataNascimento > hoje && <p className={`${alertText} absolute -bottom-4 left-0`}>A data de nascimento não pode ser no futuro.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 2: CONTATO E ENDEREÇO */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5 relative">
                    <label className={labelClass}><Mail size={18} /> E-mail *</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="exemplo@juvrio.com.br" />
                    {formData.email.length > 0 && !isEmailValido(formData.email) && <p className={`${alertText} absolute -bottom-4 left-0`}>Insira um e-mail válido.</p>}
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className={labelClass}><Phone size={18} /> Telefone *</label>
                    <input name="telefone" value={formData.telefone} onChange={handleChange} className={inputClass} placeholder="(21) 99999-9999" />
                    {formData.telefone.length > 0 && formData.telefone.length < 14 && <p className={`${alertText} absolute -bottom-4 left-0`}>Telefone incompleto.</p>}
                  </div>
                  <div className="space-y-1.5"><label className={labelClass}><InstagramIcon size={18} /> Instagram</label><input name="instagram" value={formData.instagram} onChange={handleChange} className={inputClass} placeholder="@usuario" /></div>
                  
                  <div className="space-y-1.5 relative">
                    <label className={labelClass}><MapPin size={18} /> CEP *</label>
                    <input name="cep" value={formData.cep} onChange={handleChange} className={inputClass} placeholder="00000-000" />
                    {buscandoCep && <Loader2 className="absolute right-4 bottom-3.5 animate-spin text-blue-400" size={14} />}
                    {formData.cep.length > 0 && formData.cep.length < 9 && (
                      <p className={`${alertText} absolute -bottom-4 left-0`}>CEP incompleto.</p>
                    )}
                  </div>
                  <div className="space-y-1.5 md:col-span-2"><label className={labelClass}>Logradouro *</label><input name="logradouro" value={formData.logradouro} onChange={handleChange} className={inputClass} placeholder="Rua, Avenida, Praça..." /></div>
                  <div className="space-y-1.5"><label className={labelClass}>Número *</label><input name="numero" value={formData.numero} onChange={handleChange} className={inputClass} placeholder="123" /></div>
                  <div className="space-y-1.5"><label className={labelClass}>Bairro *</label><input name="bairro" value={formData.bairro} onChange={handleChange} className={inputClass} placeholder="Bairro" /></div>
                  <div className="space-y-1.5"><label className={labelClass}>Cidade *</label><input name="cidade" value={formData.cidade} onChange={handleChange} className={inputClass} placeholder="Rio de Janeiro" /></div>
                  <div className="space-y-1.5"><label className={labelClass}>Complemento</label><input name="complemento" value={formData.complemento} onChange={handleChange} className={inputClass} placeholder="Apto, Bloco, Casa..." /></div>
                  <div className="space-y-1.5 md:col-span-2"><label className={labelClass}>Ponto de Referência</label><input name="pontoReferencia" value={formData.pontoReferencia} onChange={handleChange} className={inputClass} placeholder="Próximo ao mercado, escola..." /></div>
                </div>
              </div>
            )}

            {/* PASSO 3: ATRIBUIÇÕES */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="space-y-1.5"><label className={labelClass}><Briefcase size={18} /> Setor *</label><select name="setor" value={formData.setor} onChange={handleChange} className={inputClass}><option value="">Selecione o Setor</option>{setores.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}</select></div>
                  <div className="space-y-1.5"><label className={labelClass}><User size={18} /> Função *</label><select name="funcao" value={formData.funcao} onChange={handleChange} disabled={!formData.setor} className={`${inputClass} disabled:opacity-30`}><option value="">Selecione a Função</option>{formData.setor && mappingFuncoes[formData.setor]?.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}</select></div>
                </div>
              </div>
            )}

            {/* PASSO 4: FOTO DE PERFIL */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <div 
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400'); }}
                      onDragLeave={(e) => e.currentTarget.classList.remove('border-blue-400')}
                      onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-400'); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !previewFoto && fileInputRef.current?.click()}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className={`w-40 h-40 rounded-full border-4 border-dashed border-white/10 overflow-hidden transition-all flex items-center justify-center bg-white/5 shadow-2xl relative ${previewFoto ? 'cursor-move' : 'cursor-pointer hover:border-blue-400'}`}
                    >
                      {previewFoto || formData.avatar ? (
                        <img src={previewFoto || formData.avatar} className="w-full h-full object-cover pointer-events-none" />
                      ) : (
                        <Upload className="text-white/20 group-hover:text-blue-400 transition-colors" size={40} />
                      )}
                    </div>
                    {(previewFoto || formData.avatar) && (
                      <button onClick={(e) => { e.stopPropagation(); setPreviewFoto(null); setFotoOriginal(null); setOffset({x:0,y:0}); setFormData(p => ({ ...p, avatar: '' })); }} className="absolute bottom-2 right-2 bg-red-500 p-1.5 rounded-full text-white shadow-lg hover:bg-red-600 transition-all z-30 border-2 border-slate-900"><Trash2 size={12} /></button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" accept="image/*" />
                  </div>

                  {fotoOriginal && (
                    <div className="w-full max-w-xs space-y-2 animate-in zoom-in">
                      <div className="flex items-center justify-between text-[10px] font-black text-blue-200 uppercase tracking-widest"><span>Ajustar Foto</span><span>{Math.round(zoom * 100)}%</span></div>
                      <div className="flex items-center gap-3"><Minus size={14} className="text-white/40" /><input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="flex-1 accent-blue-400" /><Plus size={14} className="text-white/40" /></div>
                    </div>
                  )}

                  <div className="w-full space-y-4">
                    <label className={labelClass}><Camera size={18} /> Ou escolha um Avatar</label>
                    <div className="relative group/carousel px-10">
                      {avatarPage > 0 && (<button onClick={() => setAvatarPage(p => p - 1)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/10 transition-all z-10"><ChevronLeft size={20} className="text-blue-300" /></button>)}
                      <div className="grid grid-cols-5 gap-3">
                        {currentAvatars.map(av => (
                          <button key={av} onClick={() => { setFormData(p => ({ ...p, avatar: av })); setPreviewFoto(null); setFotoOriginal(null); }} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.avatar === av ? 'border-blue-400 scale-110 shadow-lg shadow-blue-400/20' : 'border-white/5 opacity-40 hover:opacity-100'}`}><img src={av} className="w-full h-full object-cover" /></button>
                        ))}
                      </div>
                      {avatarPage < totalAvatarPages - 1 && (<button onClick={() => setAvatarPage(p => p + 1)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/10 transition-all z-10"><ChevronRight size={20} className="text-blue-300" /></button>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 5: SENHA E CONCORDÂNCIA */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-1.5">
                    <label className={labelClass}><Lock size={18} /> Senha *</label>
                    <div className="relative"><input name="senha" type={verSenha ? "text" : "password"} value={formData.senha} onChange={handleChange} className={inputClass} /><button type="button" onClick={() => setVerSenha(!verSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">{verSenha ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                    {formData.senha.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3 px-4">
                        <p className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${passRules.upper ? 'text-green-400' : 'text-red-400'}`}><Check size={12} /> Maiúscula</p>
                        <p className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${passRules.lower ? 'text-green-400' : 'text-red-400'}`}><Check size={12} /> Minúscula</p>
                        <p className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${passRules.number ? 'text-green-400' : 'text-red-400'}`}><Check size={12} /> Número</p>
                        <p className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${passRules.special ? 'text-green-400' : 'text-red-400'}`}><Check size={12} /> Especial (!@#$%&)</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}><Lock size={18} /> Confirmar *</label>
                    <input name="confirmarSenha" type={verSenha ? "text" : "password"} value={formData.confirmarSenha} onChange={handleChange} className={inputClass} />
                    {formData.confirmarSenha.length > 0 && formData.senha !== formData.confirmarSenha && (
                      <p className={alertText}>As senhas não coincidem.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-white/5">
              {step === 5 && (
                <div className="space-y-3 mb-8 px-4 animate-in fade-in slide-in-from-bottom-4">
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" checked={aceitoTermos} onChange={e => setAceitoTermos(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-400 transition-all" /><span className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">Concordo com os <a href="#" className="underline text-blue-300 hover:text-blue-200">termos e condições de uso</a> do Sistema Integrado JUV-RIO *</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" checked={aceitoPrivacidade} onChange={e => setAceitoPrivacidade(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-400 transition-all" /><span className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">Concordo com a <a href="#" className="underline text-blue-300 hover:text-blue-200">política de cookies e tratamento de dados</a> da JUV-RIO *</span></label>
                </div>
              )}

              <div className="flex items-center justify-between">
                {step > 1 ? (<button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-white/40 font-black text-[11px] uppercase hover:text-white transition-colors"><ChevronLeft size={20} /> Voltar</button>) : (<a href="/" className="text-white/40 font-black text-[11px] uppercase hover:text-white">Cancelar</a>)}
                
                {step < 5 ? (
                  <button 
                    onClick={handleNextStep} 
                    disabled={loading || !canGoNext()} 
                    className="bg-white text-[#001D4A] px-8 py-3.5 rounded-full font-black text-[11px] uppercase flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg disabled:opacity-30"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Próximo <ChevronRight size={20} /></>}
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading || !formData.senha || !formData.confirmarSenha || formData.senha !== formData.confirmarSenha || (!formData.avatar)} 
                    className="bg-blue-600 text-white px-10 py-3.5 rounded-full font-black text-[11px] uppercase flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg disabled:opacity-30"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>CONCLUIR CADASTRO <Check size={20} /></>}
                  </button>
                )}
              </div>

              {erro === "Você precisa aceitar os termos e a política de privacidade para continuar." && (<div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-3 animate-in zoom-in"><AlertCircle size={14} /> {erro}</div>)}
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-[8px] uppercase tracking-[0.5em] mt-4 flex-shrink-0">
          © 2026 Secretaria Especial da Juventude Carioca - JUV-RIO
        </p>
      </div>
    </div>
  );
}