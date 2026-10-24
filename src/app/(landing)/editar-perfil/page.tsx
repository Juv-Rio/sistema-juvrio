'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, UserRound, Save, Lock, Camera, Mail, Phone,
  MapPin, CalendarDays, CheckCircle2, AlertCircle,
  ArrowLeft, Eye, EyeOff, Upload, Trash2,
  ChevronLeft, ChevronRight, Check, Minus, Plus,
} from 'lucide-react';
import { useUsuario } from '@/hooks/useUsuario';
import { resolverRotaInicial } from '@/lib/landing';

type Aba = 'dados' | 'senha' | 'foto';

const AVATARES_POR_PAGINA = 10; // 2 linhas de 5
const TAMANHO_CANVAS = 400;

/**
 * Edição de perfil do usuário logado.
 *
 * Herda guard, fundo e TopBar do layout do route group (landing).
 *
 * Persistência (endpoints já existentes):
 *   GET  /api/get-usuario?id=   → carrega os dados
 *   GET  /api/get-avatars       → lista os avatares de /public/avatars
 *   POST /api/update-usuario    → grava campos, senha e link da foto
 *   POST /api/upload-foto       → sobe a foto e exclui a anterior do Drive
 *
 * Editáveis: foto, endereço, telefone, Instagram e senha.
 * Somente leitura: nome, e-mail, CPF, setor, função, data de nascimento e status.
 */
export default function EditarPerfil() {
  const router = useRouter();
  const sessao = useUsuario();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState<Aba>('dados');
  const [dados, setDados] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  // Dados editáveis
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [complemento, setComplemento] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [instagram, setInstagram] = useState('');
  const [alterou, setAlterou] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [verSenhas, setVerSenhas] = useState(false);

  // Foto
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [fotoOriginal, setFotoOriginal] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [avatarSelecionado, setAvatarSelecionado] = useState('');
  const [fotoNova, setFotoNova] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatares
  const [avatares, setAvatares] = useState<string[]>([]);
  const [paginaAvatar, setPaginaAvatar] = useState(0);

  /**
   * Id da sessão já estreitado para string.
   * Evita repetir `if (!sessao?.id) return;` em cada handler e deixa o
   * TypeScript satisfeito ao passar a sessão para funções que exigem objeto.
   */
  const idUsuario = sessao?.id ? String(sessao.id) : null;

  // ---------- Máscaras (idênticas ao cadastro) ----------
  const maskPhone = (v: string) => {
    const r = v.replace(/\D/g, '');
    if (r.length > 10) return r.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    if (r.length > 6) return r.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    if (r.length > 2) return r.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    if (r.length > 0) return '(' + r;
    return '';
  };

  const maskCEP = (v: string) =>
    v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

  // ---------- Regras de senha (idênticas ao cadastro) ----------
  const regrasSenha = {
    upper: /[A-Z]/.test(senhaNova),
    lower: /[a-z]/.test(senhaNova),
    number: /[0-9]/.test(senhaNova),
    special: /[!@#$%&]/.test(senhaNova),
  };
  const senhaForte =
    regrasSenha.upper && regrasSenha.lower && regrasSenha.number && regrasSenha.special;

  // ---------- Carrega dados do usuário ----------
  useEffect(() => {
    if (!idUsuario) return;

    (async () => {
      try {
        const res = await fetch(`/api/get-usuario?id=${idUsuario}`);
        const json = await res.json();

        if (!res.ok || !json.usuario) {
          setFeedback({ tipo: 'erro', texto: json.error || 'Não foi possível carregar seus dados.' });
          return;
        }

        const u = json.usuario as Record<string, string>;
        setDados(u);
        setTelefone(u['Telefone'] || '');
        setCep(u['CEP'] || '');
        setLogradouro(u['Logradouro'] || '');
        setNumero(u['Número'] || '');
        setBairro(u['Bairro'] || '');
        setCidade(u['Cidade'] || '');
        setComplemento(u['Complemento'] || '');
        setPontoReferencia(u['Ponto de Referência'] || '');
        setInstagram(u['Instagram'] || '');
        setPreviewFoto(u['Foto URL'] || null);
      } catch {
        setFeedback({ tipo: 'erro', texto: 'Falha de conexão ao carregar seus dados.' });
      } finally {
        setCarregando(false);
      }
    })();
  }, [idUsuario]);

  // ---------- Carrega avatares ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/get-avatars');
        const json = await res.json();
        setAvatares(Array.isArray(json.avatars) ? json.avatars : []);
      } catch {
        /* sem avatares a página segue funcional */
      }
    })();
  }, []);

  const totalPaginasAvatar = Math.ceil(avatares.length / AVATARES_POR_PAGINA);
  const avataresVisiveis = avatares.slice(
    paginaAvatar * AVATARES_POR_PAGINA,
    (paginaAvatar + 1) * AVATARES_POR_PAGINA
  );

  // ---------- CEP (ViaCEP) ----------
  const buscarCep = async (valor: string) => {
    const limpo = valor.replace(/\D/g, '');
    if (limpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const json = await res.json();

      if (!json.erro) {
        setLogradouro(json.logradouro || '');
        setBairro(json.bairro || '');
        setCidade(json.localidade || '');
        setAlterou(true);
      }
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Não foi possível consultar o CEP agora.' });
    } finally {
      setBuscandoCep(false);
    }
  };

  // ---------- Canvas: recorte circular com zoom e arraste ----------
  const processarCanvas = (img: HTMLImageElement, scale: number, moveX: number, moveY: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = TAMANHO_CANVAS;
    canvas.height = TAMANHO_CANVAS;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, TAMANHO_CANVAS, TAMANHO_CANVAS);

    const menorLado = Math.min(img.width, img.height);
    const origem = menorLado / scale;
    const sx = (img.width - origem) / 2 - moveX * (origem / 160);
    const sy = (img.height - origem) / 2 - moveY * (origem / 160);

    ctx.drawImage(img, sx, sy, origem, origem, 0, 0, TAMANHO_CANVAS, TAMANHO_CANVAS);
    setPreviewFoto(canvas.toDataURL('image/jpeg', 0.9));
  };

  useEffect(() => {
    if (fotoOriginal) processarCanvas(fotoOriginal, zoom, offset.x, offset.y);
  }, [zoom, offset, fotoOriginal]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        setFotoOriginal(img);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setAvatarSelecionado('');
        setFotoNova(true);
        setFeedback(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Arraste da foto dentro do círculo (só quando há foto enviada do computador)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fotoOriginal) return;
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const escolherAvatar = (url: string) => {
    setAvatarSelecionado(url);
    setPreviewFoto(url);
    setFotoOriginal(null);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setFotoNova(true);
    setFeedback(null);
  };

  // Limpa a seleção: volta à foto atual da planilha
  const limparFoto = () => {
    setPreviewFoto(dados['Foto URL'] || null);
    setFotoOriginal(null);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setAvatarSelecionado('');
    setFotoNova(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- Salvar dados ----------
  const salvarDados = async () => {
    if (!idUsuario) return;

    if (telefone && telefone.length < 14) {
      setFeedback({ tipo: 'erro', texto: 'Telefone incompleto.' });
      return;
    }
    if (cep && cep.length !== 9) {
      setFeedback({ tipo: 'erro', texto: 'CEP incompleto.' });
      return;
    }

    setSalvando(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/update-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: idUsuario,
          campos: {
            Telefone: telefone,
            CEP: cep,
            Logradouro: logradouro,
            'Número': numero,
            Bairro: bairro,
            Cidade: cidade,
            Complemento: complemento,
            'Ponto de Referência': pontoReferencia,
            Instagram: instagram,
          },
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({ tipo: 'erro', texto: json.error || 'Falha ao salvar.' });
        return;
      }

      setAlterou(false);
      setFeedback({ tipo: 'ok', texto: 'Dados atualizados com sucesso.' });
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Falha de conexão ao salvar.' });
    } finally {
      setSalvando(false);
    }
  };

  // ---------- Salvar senha ----------
  const salvarSenha = async () => {
    if (!idUsuario) return;

    if (!senhaAtual) {
      setFeedback({ tipo: 'erro', texto: 'Informe a senha atual.' });
      return;
    }
    if (!senhaNova || !confirmacao) {
      setFeedback({ tipo: 'erro', texto: 'Preencha a nova senha e a confirmação.' });
      return;
    }
    if (senhaNova !== confirmacao) {
      setFeedback({ tipo: 'erro', texto: 'As senhas não coincidem.' });
      return;
    }
    if (!senhaForte) {
      setFeedback({ tipo: 'erro', texto: 'A senha não atende aos requisitos de segurança.' });
      return;
    }

    setSalvando(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/update-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idUsuario, senhaAtual, senhaNova }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({ tipo: 'erro', texto: json.error || 'Falha ao alterar a senha.' });
        return;
      }

      setSenhaAtual('');
      setSenhaNova('');
      setConfirmacao('');
      setFeedback({ tipo: 'ok', texto: 'Senha alterada com sucesso.' });
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Falha de conexão ao alterar a senha.' });
    } finally {
      setSalvando(false);
    }
  };

  // ---------- Salvar foto ----------
  const salvarFoto = async () => {
    if (!idUsuario) return;

    if (!fotoNova || !previewFoto) {
      setFeedback({ tipo: 'erro', texto: 'Selecione ou envie uma foto primeiro.' });
      return;
    }

    const cpf = dados['CPF'];
    if (!cpf) {
      setFeedback({ tipo: 'erro', texto: 'CPF não encontrado no cadastro. Procure o administrador.' });
      return;
    }

    setSalvando(true);
    setFeedback(null);

    try {
      // Avatar escolhido (/avatars/...) vira base64 — mesmo caminho do cadastro
      let fotoBase64 = previewFoto;
      if (avatarSelecionado && avatarSelecionado.startsWith('/')) {
        const resposta = await fetch(avatarSelecionado);
        const blob = await resposta.blob();
        fotoBase64 = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result));
          reader.readAsDataURL(blob);
        });
      }

      const resUpload = await fetch('/api/upload-foto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoBase64,
          cpf,
          fotoAntigaUrl: dados['Foto URL'] || '',
        }),
      });

      const jsonUpload = await resUpload.json();

      if (!resUpload.ok || !jsonUpload.fileId) {
        setFeedback({ tipo: 'erro', texto: jsonUpload.error || 'Falha no upload da foto.' });
        return;
      }

      const resUpdate = await fetch('/api/update-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idUsuario, novaFotoId: jsonUpload.fileId }),
      });

      const jsonUpdate = await resUpdate.json();

      if (!resUpdate.ok) {
        setFeedback({ tipo: 'erro', texto: jsonUpdate.error || 'Foto enviada, mas o link não foi salvo.' });
        return;
      }

      const novoLink = `https://drive.google.com/uc?id=${jsonUpload.fileId}`;
      setDados(prev => ({ ...prev, 'Foto URL': novoLink }));
      setPreviewFoto(novoLink);
      setFotoOriginal(null);
      setAvatarSelecionado('');
      setFotoNova(false);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      if (fileInputRef.current) fileInputRef.current.value = '';

      atualizarSessaoLocal({ foto: novoLink });
      setFeedback({ tipo: 'ok', texto: 'Foto atualizada com sucesso.' });
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Falha de conexão ao enviar a foto.' });
    } finally {
      setSalvando(false);
    }
  };

  const atualizarSessaoLocal = (patch: Record<string, string>) => {
    try {
      const atual = JSON.parse(localStorage.getItem('user_juvrio') || '{}');
      localStorage.setItem('user_juvrio', JSON.stringify({ ...atual, ...patch }));
    } catch {
      /* sessão ilegível: ignore */
    }
  };

  const voltarParaLanding = () => {
    // Sem sessão carregada não há landing primária a resolver: volta ao login.
    if (!sessao) {
      router.push('/');
      return;
    }
    router.push(resolverRotaInicial(sessao));
  };

  if (carregando) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
          Carregando perfil...
        </p>
      </div>
    );
  }

  const alerta = 'text-red-500 text-[9px] font-black uppercase mt-1 ml-1 animate-pulse';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={voltarParaLanding}
            aria-label="Voltar"
            className="w-9 h-9 rounded-xl border border-sky-100 shadow-sm bg-sky-50/70 flex items-center justify-center cursor-pointer hover:bg-sky-100/70 transition-all"
          >
            <ArrowLeft size={16} className="text-sky-500" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              Editar Perfil
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {dados['Nome'] || 'Meus dados'}
            </p>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex gap-2 p-1 bg-white/70 backdrop-blur-md border border-white rounded-2xl shadow-sm">
        {([
          { id: 'dados' as Aba, label: 'Dados', icon: <UserRound size={14} /> },
          { id: 'senha' as Aba, label: 'Senha', icon: <Lock size={14} /> },
          { id: 'foto' as Aba, label: 'Foto', icon: <Camera size={14} /> },
        ]).map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setAba(t.id); setFeedback(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              aba === t.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50/70'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* FEEDBACK */}
      {feedback && (
        <div
          className={`flex items-start gap-2 p-4 rounded-xl border text-[11px] font-bold ${
            feedback.tipo === 'ok'
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >
          {feedback.tipo === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.texto}</span>
        </div>
      )}

      {/* ================= ABA DADOS ================= */}
      {aba === 'dados' && (
        <div className="space-y-6">

          <section className="p-6 bg-white/70 backdrop-blur-md border border-white rounded-3xl shadow-sm space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Identificação
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoLeitura label="Nome completo" valor={dados['Nome']} />
              <CampoLeitura label="E-mail" valor={dados['E-mail']} icon={<Mail size={13} />} />
              <CampoLeitura label="CPF" valor={dados['CPF']} />
              <CampoLeitura
                label="Data de nascimento"
                valor={dados['Data Nascimento']}
                icon={<CalendarDays size={13} />}
              />
              <CampoLeitura label="Setor" valor={dados['Setor']} />
              <CampoLeitura label="Função" valor={dados['Função']} />
            </div>

            <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
              Nome, e-mail, CPF, data de nascimento, setor e função só podem ser
              alterados pelo administrador do sistema.
            </p>
          </section>

          <section className="p-6 bg-white/70 backdrop-blur-md border border-white rounded-3xl shadow-sm space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Contato e endereço
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* TELEFONE */}
              <div className="relative">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Telefone
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-sky-400 transition-all">
                  <Phone size={13} className="text-slate-300 shrink-0" />
                  <input
                    value={telefone}
                    onChange={e => { setTelefone(maskPhone(e.target.value)); setAlterou(true); }}
                    placeholder="(21) 99999-9999"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none min-w-0"
                  />
                </div>
                {telefone.length > 0 && telefone.length < 14 && (
                  <p className={alerta}>Telefone incompleto.</p>
                )}
              </div>

              {/* INSTAGRAM */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Instagram
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-sky-400 transition-all">
                  <span className="text-slate-300 shrink-0"><InstagramIcon size={13} /></span>
                  <input
                    value={instagram}
                    onChange={e => { setInstagram(e.target.value); setAlterou(true); }}
                    placeholder="@usuario"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none min-w-0"
                  />
                </div>
              </div>

              {/* CEP */}
              <div className="relative">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  CEP
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-sky-400 transition-all">
                  <MapPin size={13} className="text-slate-300 shrink-0" />
                  <input
                    value={cep}
                    onChange={e => {
                      const mascarado = maskCEP(e.target.value);
                      setCep(mascarado);
                      setAlterou(true);
                      if (mascarado.length === 9) buscarCep(mascarado);
                    }}
                    placeholder="00000-000"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none min-w-0"
                  />
                  {buscandoCep && <Loader2 size={13} className="animate-spin text-sky-500 shrink-0" />}
                </div>
                {cep.length > 0 && cep.length < 9 && (
                  <p className={alerta}>CEP incompleto.</p>
                )}
              </div>

              {/* LOGRADOURO */}
              <CampoEditavelLongo
                label="Logradouro"
                value={logradouro}
                onChange={v => { setLogradouro(v); setAlterou(true); }}
              />

              {/* NÚMERO */}
              <CampoEditavel
                label="Número"
                value={numero}
                onChange={v => { setNumero(v); setAlterou(true); }}
                placeholder="123"
              />

              {/* BAIRRO */}
              <CampoEditavel
                label="Bairro"
                value={bairro}
                onChange={v => { setBairro(v); setAlterou(true); }}
                placeholder="Bairro"
              />

              {/* CIDADE */}
              <CampoEditavel
                label="Cidade"
                value={cidade}
                onChange={v => { setCidade(v); setAlterou(true); }}
                placeholder="Rio de Janeiro"
              />

              {/* COMPLEMENTO */}
              <CampoEditavel
                label="Complemento"
                value={complemento}
                onChange={v => { setComplemento(v); setAlterou(true); }}
                placeholder="Apto, Bloco, Casa..."
              />

              {/* PONTO DE REFERÊNCIA */}
              <CampoEditavelLongo
                label="Ponto de Referência"
                value={pontoReferencia}
                onChange={v => { setPontoReferencia(v); setAlterou(true); }}
                placeholder="Próximo ao mercado, escola..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={salvarDados}
                disabled={salvando || !alterou}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {salvando ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Salvar dados
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ================= ABA SENHA ================= */}
      {aba === 'senha' && (
        <section className="p-6 bg-white/70 backdrop-blur-md border border-white rounded-3xl shadow-sm space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Alterar senha
          </p>

          <div className="space-y-5">
            <CampoEditavel
              label="Senha atual"
              value={senhaAtual}
              onChange={setSenhaAtual}
              type={verSenhas ? 'text' : 'password'}
              icon={<Lock size={13} />}
              placeholder="Digite sua senha atual"
            />

            <div className="relative">
              <CampoEditavel
                label="Nova senha"
                value={senhaNova}
                onChange={setSenhaNova}
                type={verSenhas ? 'text' : 'password'}
                icon={<Lock size={13} />}
                placeholder="Nova senha"
              />

              {senhaNova.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3 px-1">
                  <RegraSenha ok={regrasSenha.upper} texto="Maiúscula" />
                  <RegraSenha ok={regrasSenha.lower} texto="Minúscula" />
                  <RegraSenha ok={regrasSenha.number} texto="Número" />
                  <RegraSenha ok={regrasSenha.special} texto="Especial (!@#$%&)" />
                </div>
              )}
            </div>

            <div className="relative">
              <CampoEditavel
                label="Confirmar nova senha"
                value={confirmacao}
                onChange={setConfirmacao}
                type={verSenhas ? 'text' : 'password'}
                icon={<Lock size={13} />}
                placeholder="Repita a nova senha"
              />
              {confirmacao.length > 0 && senhaNova !== confirmacao && (
                <p className={alerta}>As senhas não coincidem.</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setVerSenhas(v => !v)}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all cursor-pointer"
            >
              {verSenhas ? <EyeOff size={13} /> : <Eye size={13} />}
              {verSenhas ? 'Ocultar senhas' : 'Mostrar senhas'}
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={salvarSenha}
              disabled={salvando || !senhaAtual || !senhaNova || !confirmacao || senhaNova !== confirmacao || !senhaForte}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {salvando ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Alterar senha
            </button>
          </div>
        </section>
      )}

      {/* ================= ABA FOTO ================= */}
      {aba === 'foto' && (
        <section className="p-6 bg-white/70 backdrop-blur-md border border-white rounded-3xl shadow-sm space-y-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Foto do perfil
          </p>

          {/* ===== CÍRCULO DE FOTO ===== */}
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              {/* Container: recebe o arraste da imagem */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-sky-400'); }}
                onDragLeave={e => e.currentTarget.classList.remove('ring-sky-400')}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('ring-sky-400');
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
                className={`w-40 h-40 rounded-full overflow-hidden flex items-center justify-center border-[3px] border-dashed border-sky-400 bg-sky-100/70 shadow-lg ring-offset-2 ring-offset-white transition-all ${
                  fotoOriginal
                    ? isDragging
                      ? 'cursor-grabbing ring-2 ring-sky-300'
                      : 'cursor-grab'
                    : ''
                }`}
              >
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto do perfil"
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    onError={() => setPreviewFoto(null)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={26} className="text-sky-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-sky-600">
                      Escolher foto
                    </span>
                  </div>
                )}
              </div>

              {/* Alvo de clique: cobre o círculo inteiro, sempre acessível */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Selecionar foto do computador"
                title="Selecionar foto do computador"
                className="absolute inset-0 w-full h-full rounded-full cursor-pointer z-10 group"
              >
                <span className="sr-only">Selecionar foto do computador</span>
                {previewFoto && (
                  <span className="absolute inset-0 rounded-full bg-slate-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                    <Upload size={24} className="text-white" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-white">
                      Trocar foto
                    </span>
                  </span>
                )}
              </button>

              {/* Lixeira: remove a seleção pendente */}
              {fotoNova && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); limparFoto(); }}
                  aria-label="Remover foto selecionada"
                  title="Remover foto selecionada"
                  className="absolute -bottom-1 right-0 w-9 h-9 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all flex items-center justify-center border-2 border-white z-30 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* AJUSTE DE ZOOM (só para fotos do computador) */}
            {fotoOriginal && (
              <div className="w-full max-w-xs space-y-2 animate-in zoom-in">
                <div className="flex items-center justify-between text-[10px] font-black text-sky-600 uppercase tracking-widest">
                  <span>Ajustar foto</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Minus size={14} className="text-slate-400" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-sky-500"
                  />
                  <Plus size={14} className="text-slate-400" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 text-center">
                  Arraste a foto dentro do círculo para reposicionar.
                </p>
              </div>
            )}
          </div>

          {/* ===== AVATARES ===== */}
          {avatares.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Camera size={13} /> Ou escolha um avatar
                </p>
                {totalPaginasAvatar > 1 && (
                  <span className="text-[9px] font-black text-slate-500 tabular-nums">
                    {paginaAvatar + 1}/{totalPaginasAvatar}
                  </span>
                )}
              </div>

              <div className="relative px-10">
                {paginaAvatar > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaginaAvatar(p => p - 1)}
                    aria-label="Avatares anteriores"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-400 transition-all z-10 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                <div className="grid grid-cols-5 gap-3">
                  {avataresVisiveis.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => escolherAvatar(av)}
                      aria-label="Escolher avatar"
                      className={`relative aspect-square rounded-xl overflow-hidden bg-slate-100 transition-all cursor-pointer ${
                        avatarSelecionado === av
                          ? 'ring-[3px] ring-sky-500 ring-offset-2 ring-offset-white scale-105 shadow-lg shadow-sky-500/30'
                          : 'ring-1 ring-slate-300 hover:ring-2 hover:ring-sky-400 hover:scale-105'
                      }`}
                    >
                      <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {paginaAvatar < totalPaginasAvatar - 1 && (
                  <button
                    type="button"
                    onClick={() => setPaginaAvatar(p => p + 1)}
                    aria-label="Próximos avatares"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-slate-400 transition-all z-10 cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={salvarFoto}
              disabled={salvando || !fotoNova || !previewFoto}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {salvando ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
              Salvar foto
            </button>
          </div>
        </section>
      )}

      {/* BOTÃO VOLTAR */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={voltarParaLanding}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all cursor-pointer text-[9px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={13} />
          Voltar para {dados['Landing Primária'] || 'a área do departamento'}
        </button>
      </div>

    </div>
  );
}

/* ---------- Auxiliares ---------- */

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function RegraSenha({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <p className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-red-500'}`}>
      <Check size={12} /> {texto}
    </p>
  );
}

function CampoLeitura({ label, valor, icon }: { label: string; valor?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 min-h-10.5">
        {icon && <span className="text-slate-300">{icon}</span>}
        <span className="text-sm text-slate-600 font-medium truncate">{valor || '—'}</span>
      </div>
    </div>
  );
}

function CampoEditavel({
  label, value, onChange, type = 'text', icon, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-sky-400 transition-all">
        {icon && <span className="text-slate-300 shrink-0">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-slate-700 outline-none min-w-0"
        />
      </div>
    </div>
  );
}

function CampoEditavelLongo({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-sky-400 transition-all">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-slate-700 outline-none min-w-0"
        />
      </div>
    </div>
  );
}