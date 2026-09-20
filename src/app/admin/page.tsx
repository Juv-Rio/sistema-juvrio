'use client';

import { Users, UserCheck, UserX, Clock, ArrowUpRight, ArrowDownRight, Activity, Zap } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* KPIS CANDY STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total de Usuários" value="128" icon={<Users />} trend="+12%" positive />
        <KpiCard title="Aprovações Pendentes" value="14" icon={<Clock />} trend="Urgente" />
        <KpiCard title="Usuários Ativos" value="112" icon={<UserCheck />} trend="+5%" positive />
        <KpiCard title="Acessos Negados" value="03" icon={<UserX />} trend="-2%" />
      </div>

      {/* ÁREAS DE CONTEÚDO SOFT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[350px] bg-white/60 backdrop-blur-md border border-white rounded-[1.5rem] p-10 flex flex-col items-center justify-center border-dashed group shadow-sm">
          <Activity size={40} className="text-blue-200 mb-4 group-hover:text-blue-400 transition-colors" />
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[9px] text-center">Monitoramento Estratégico</p>
          <p className="text-blue-300 font-bold uppercase tracking-[0.2em] text-[7px] mt-2">Sincronizando com base de dados...</p>
        </div>
        
        <div className="min-h-[350px] bg-white/60 backdrop-blur-md border border-white rounded-[1.5rem] p-10 flex flex-col items-center justify-center border-dashed group shadow-sm">
          <Zap size={40} className="text-blue-200 mb-4 group-hover:text-yellow-400 transition-colors" />
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[9px] text-center">Logs de Atividade</p>
          <p className="text-blue-300 font-bold uppercase tracking-[0.2em] text-[7px] mt-2">Nenhum evento crítico</p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, trend, positive = false }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white p-7 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-5">
        <div className="p-3 bg-blue-50 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 border border-blue-100">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${positive ? 'text-green-500' : 'text-rose-400'}`}>
          {trend} {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        </div>
      </div>
      
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-slate-800 text-3xl font-black tracking-tighter">{value}</h3>
      </div>
    </div>
  );
}