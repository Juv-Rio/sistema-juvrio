'use client';
import { useState, useEffect } from 'react';
import { 
  Search, Filter, UserCheck, Edit3, CheckCircle2, 
  Loader2, X, UserX, ShieldCheck, Mail, Briefcase, Info,
  Clock
} from 'lucide-react';
export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);
  // Estados para Configurações Dinâmicas (Setores e Funções)
  const [setores, setSetores] = useState<string[]>([]);
  const [mappingFuncoes, setMappingFuncoes] = useState<Record<string, string[]>>({});
  useEffect(() => {
    fetchUsuarios();
    fetchConfigs();
  }, []);
  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/get-configs');
      const data = await res.json();
      if (data.status === 'Sucesso!') {
        const mapping: Record<string, string[]> = {};
        data.atribuicoes.forEach((row: any) => {
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
    } catch (e) {
      console.error("Erro ao carregar configurações:", e);
    }
  };
  // FUNÇÃO MESTRE PARA RESOLVER A FOTO (Drive ou URL Direta)
  const resolverFoto = (user: any) => {
    // Tenta encontrar o valor da foto em diferentes nomes de colunas possíveis
    const fotoRaw = user['Foto URL'] || user['Foto'] || user['fotoUrl'] || user['Link da Foto'] || '';
    if (!fotoRaw) return null;
    // Se for QUALQUER link do Google Drive, extrai o ID e usa o endpoint de miniatura (estável)
    if (fotoRaw.includes('drive.google.com')) {
      // Extrai o ID de qualquer formato de link do Drive (uc?id=, /d/ID, file/d/ID)
      const id = fotoRaw.split('id=')[1]?.split('&')[0]
        || fotoRaw.split('/d/')[1]?.split('/')[0]
        || fotoRaw.split('file/d/')[1]?.split('/')[0]
        || '';
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w500`;
    }
    // Se for outro link externo (http), retorna direto
    if (fotoRaw.startsWith('http')) return fotoRaw;
    // Se for apenas o ID, monta a miniatura
    return `https://drive.google.com/thumbnail?id=${fotoRaw}&sz=w500`;
  };
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
    } finally {
      setLoading(false);
    }
  };
  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const perfis = {
        Admin: usuarioSelecionado.Admin === 'SIM',
        Master: usuarioSelecionado.Master === 'SIM',
        Gestao: usuarioSelecionado.Gestao === 'SIM',
        Gerencial: usuarioSelecionado.Gerencial === 'SIM',
        Operacional: usuarioSelecionado.Operacional === 'SIM',
        Territorio: usuarioSelecionado.Territorio === 'SIM',
      };
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuarioSelecionado.ID,
          setor: usuarioSelecionado.Setor,
          funcao: usuarioSelecionado['Função'],
          perfis,
          status: usuarioSelecionado.Status === 'PENDENTE' ? 'ATIVO' : usuarioSelecionado.Status
        })
      });
      if (res.ok) {
        setUsuarioSelecionado(null);
        fetchUsuarios();
      } else {
        alert("Erro ao salvar alterações.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  };
  const usuariosFiltrados = usuarios.filter(u => 
    u.Nome?.toLowerCase().includes(filtro.toLowerCase()) || 
    u.CPF?.includes(filtro)
  );
  const inputSelectClass = "w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-400 transition-all font-bold text-slate-700 appearance-none cursor-pointer";
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER DA PÁGINA & BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm text-slate-600 placeholder:text-slate-300"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-xl border border-white">
          <Info size={14} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {usuariosFiltrados.length} Usuários Encontrados
          </span>
        </div>
      </div>
      {/* TABELA VITRIFICADA */}
      <div className="bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-50 bg-blue-50/30 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Colaborador</th>
                <th className="px-6 py-5">Atribuição</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-400" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Carregando Base...</p>
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum registro encontrado.</td>
                </tr>
              ) : usuariosFiltrados.map((user) => (
                <tr key={user.ID} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-white shadow-sm overflow-hidden flex-shrink-0">
                        <img 
                          src={resolverFoto(user) || ''} 
                          className="w-full h-full object-cover" 
                          alt="" 
                          onError={(e: any) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Nome)}&background=DBEAFE&color=3B82F6&bold=true`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{user.Nome}</p>
                        <p className="text-[10px] text-slate-400 font-bold truncate">{user.Email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{user.Setor || 'N/A'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{user['Função'] || 'Não definida'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                      user.Status === 'PENDENTE' ? 'bg-amber-100 text-amber-600' : 
                      user.Status === 'INATIVO' ? 'bg-rose-100 text-rose-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      {user.Status === 'PENDENTE' ? <Clock size={10} /> : 
                       user.Status === 'INATIVO' ? <UserX size={10} /> : 
                       <CheckCircle2 size={10} />}
                      {user.Status || 'PENDENTE'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => setUsuarioSelecionado({...user})}
                      className="p-2.5 bg-white border border-blue-100 text-blue-500 rounded-xl shadow-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 group-hover:shadow-md"
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {usuarioSelecionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md h-full bg-white shadow-2xl p-10 flex flex-col gap-8 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><ShieldCheck size={20} /></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Gestão de Acesso</h2>
              </div>
              <button onClick={() => setUsuarioSelecionado(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scroll">
              {/* CARD DE IDENTIFICAÇÃO COM FOTO CORRIGIDA */}
              <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-white rounded-[1.5rem] border border-blue-100 shadow-inner">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                  <img 
                    src={resolverFoto(usuarioSelecionado) || ''} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e: any) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioSelecionado.Nome)}&background=DBEAFE&color=3B82F6&bold=true`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">ID: {usuarioSelecionado.ID}</p>
                  <p className="text-lg font-black text-slate-800 uppercase leading-tight truncate">{usuarioSelecionado.Nome}</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate">{usuarioSelecionado.CPF}</p>
                </div>
              </div>
              {/* FORMULÁRIO DE AJUSTE COM SELECTS CONDICIONADOS */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Briefcase size={12} /> Setor Profissional</label>
                  <select 
                    className={inputSelectClass}
                    value={usuarioSelecionado.Setor}
                    onChange={(e) => setUsuarioSelecionado({...usuarioSelecionado, Setor: e.target.value, 'Função': ''})}
                  >
                    <option value="">Selecione o Setor</option>
                    {setores.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><UserCheck size={12} /> Função / Cargo</label>
                  <select 
                    className={`${inputSelectClass} disabled:opacity-50`}
                    value={usuarioSelecionado['Função']}
                    onChange={(e) => setUsuarioSelecionado({...usuarioSelecionado, 'Função': e.target.value})}
                    disabled={!usuarioSelecionado.Setor}
                  >
                    <option value="">Selecione a Função</option>
                    {usuarioSelecionado.Setor && mappingFuncoes[usuarioSelecionado.Setor]?.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* STATUS DO COLABORADOR */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Info size={12} /> Status da Conta</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setUsuarioSelecionado({...usuarioSelecionado, Status: 'ATIVO'})}
                    className={`flex-1 p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${usuarioSelecionado.Status === 'ATIVO' || usuarioSelecionado.Status === 'PENDENTE' ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-200' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    <CheckCircle2 size={14} /> Ativo
                  </button>
                  <button 
                    onClick={() => setUsuarioSelecionado({...usuarioSelecionado, Status: 'INATIVO'})}
                    className={`flex-1 p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${usuarioSelecionado.Status === 'INATIVO' ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    <UserX size={14} /> Inativo
                  </button>
                </div>
              </div>
              {/* SELEÇÃO DE PERFIS (CHAVES DE ACESSO) */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><ShieldCheck size={12} /> Perfis de Acesso</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Admin', 'Master', 'Gestao', 'Gerencial', 'Operacional', 'Territorio'].map(perfil => (
                    <button 
                      key={perfil}
                      onClick={() => setUsuarioSelecionado({
                        ...usuarioSelecionado, 
                        [perfil]: usuarioSelecionado[perfil] === 'SIM' ? 'NÃO' : 'SIM'
                      })}
                      className={`p-4 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${usuarioSelecionado[perfil] === 'SIM' ? 'bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-blue-50/30'}`}
                    >
                      {perfil}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${usuarioSelecionado[perfil] === 'SIM' ? 'bg-white border-white text-blue-500' : 'bg-slate-50 border-slate-200 text-transparent'}`}>
                        <CheckCircle2 size={10} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* BOTÃO DE AÇÃO FINAL */}
            <div className="pt-6 border-t border-slate-100">
              <button 
                onClick={handleSalvar}
                disabled={salvando || !usuarioSelecionado.Setor || !usuarioSelecionado['Função']}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300"
              >
                {salvando ? <Loader2 className="animate-spin" size={20} /> : <><UserCheck size={20} /> {usuarioSelecionado.Status === 'PENDENTE' ? 'Aprovar e Salvar' : 'Atualizar Cadastro'}</>}
              </button>
              <p className="text-center text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-4">Ação registrada no log de auditoria</p>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #CBDCF7; border-radius: 10px; }
      `}</style>
    </div>
  );
}