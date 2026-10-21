import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Calendar, MapPin, Phone, Globe } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidade | Portal JUV-RIO',
  description: 'Política de Privacidade e Proteção de Dados do Portal JUV-RIO - Secretaria Especial da Juventude Carioca.',
};

const secoes = [
  {
    titulo: '1. Apresentação',
    paragrafos: [
      'A Secretaria Especial da Juventude Carioca (JUV-RIO), órgão da Administração Pública Municipal do Rio de Janeiro, está comprometida com a proteção dos dados pessoais dos usuários de seus programas, projetos, equipamentos públicos, serviços e plataformas digitais, observando os princípios da transparência, da segurança da informação, da boa-fé, da finalidade, da necessidade e da responsabilização previstos na Lei Geral de Proteção de Dados Pessoais (LGPD — Lei Federal nº 13.709/2018).',
      'Esta Política de Privacidade disciplina especificamente o tratamento de dados pessoais no Portal JUV-RIO, plataforma interna de gestão, cadastro e controle de acesso de colaboradores da Secretaria, e informa de forma clara e acessível como os dados são coletados, utilizados, armazenados, compartilhados, protegidos e eliminados, bem como orienta os titulares acerca de seus direitos.',
      'O tratamento de dados realizado no âmbito do Portal observa, além da LGPD: a Lei nº 12.965/2014 (Marco Civil da Internet), a Lei nº 12.527/2011 (Lei de Acesso à Informação), a Lei nº 14.129/2021 (Lei do Governo Digital), o Decreto Rio nº 49.558/2021 (Programa Municipal de Proteção de Dados), o Decreto Rio nº 53.700/2023 (Política Municipal de Segurança da Informação), a Resolução SEGOVI nº 91/2022, a Resolução CVL nº 216/2023 e demais normas aplicáveis à Administração Pública.',
    ],
  },
  {
    titulo: '2. Definições',
    intro: 'Para os fins desta Política, aplicam-se as definições previstas na LGPD e, complementarmente:',
    lista: [
      'Dado Pessoal: informação relacionada à pessoa natural identificada ou identificável.',
      'Dado Pessoal Sensível: dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação sindical ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural.',
      'Titular dos Dados: pessoa natural a quem se referem os dados pessoais objeto de tratamento.',
      'Tratamento: toda operação realizada com dados pessoais, incluindo coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação, controle da informação, modificação, comunicação, transferência, difusão ou extração.',
      'Controlador: órgão da Administração Pública responsável pelas decisões referentes ao tratamento de dados pessoais.',
      'Operador: pessoa natural ou jurídica que realiza o tratamento de dados pessoais em nome do controlador.',
      'Encarregado (DPO): pessoa designada para atuar como canal de comunicação entre o controlador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD).',
      'Anonimização: utilização de meios técnicos razoáveis e disponíveis para impedir a identificação direta ou indireta do titular dos dados.',
      'Incidente de Segurança: evento confirmado que resulte ou possa resultar em acesso não autorizado, destruição, perda, alteração, vazamento ou qualquer forma de tratamento inadequado ou ilícito de dados pessoais.',
    ],
  },
  {
    titulo: '3. Dados coletados no Portal',
    intro: 'No âmbito do Portal JUV-RIO, a Secretaria trata os seguintes dados pessoais dos colaboradores cadastrados:',
    lista: [
      'Dados de identificação: nome completo, CPF e e-mail institucional;',
      'Dados funcionais: setor de lotação, função/cargo exercida e status da conta (ativo, inativo ou pendente);',
      'Dados de acesso: perfis de permissão atribuídos e registros de auditoria das ações realizadas no sistema;',
      'Dados de identificação visual: fotografia do colaborador, utilizada exclusivamente para exibição no ambiente autenticado do Portal.',
    ],
    paragrafos: [
      'A coleta ocorre quando o próprio colaborador solicita cadastro, quando um administrador da Secretaria efetua o cadastro, ou quando os dados são atualizados em razão das atribuições funcionais do colaborador.',
    ],
  },
  {
    titulo: '4. Finalidade do tratamento',
    intro: 'Os dados pessoais coletados são tratados exclusivamente para as seguintes finalidades:',
    lista: [
      'Autenticação e controle de acesso ao Portal e às áreas restritas, conforme o perfil de cada usuário;',
      'Gestão de colaboradores, incluindo cadastro, atualização de dados funcionais, atribuição e revogação de permissões;',
      'Registro de auditoria das ações realizadas no sistema, em cumprimento às normas de governança e segurança da informação da Administração Municipal;',
      'Comunicação institucional relacionada à conta do usuário (ex.: aprovação de cadastro, recuperação de senha);',
      'Cumprimento de obrigações legais e regulatórias aplicáveis à Administração Pública.',
    ],
    paragrafos: [
      'Os dados não serão utilizados para finalidades distintas das aqui descritas, salvo nas hipóteses legais de compatibilidade previstas na LGPD.',
    ],
  },
  {
    titulo: '5. Bases legais',
    paragrafos: [
      'O tratamento de dados pessoais no Portal fundamenta-se nas hipóteses autorizadas pela LGPD, em especial: os artigos 7º, incisos II e III, e 23, caput e incisos I e II (execução de políticas públicas e exercício das competências legais da Administração Pública); o artigo 7º, inciso II (cumprimento de obrigação legal ou regulatória); e o artigo 7º, inciso VI (exercício regular de direitos em processos administrativos e judiciais).',
      'Na hipótese de tratamento que depender de consentimento, este será solicitado de forma livre, informada, inequívoca e específica para as finalidades correspondentes, podendo ser revogado pelo titular a qualquer momento, mediante solicitação aos canais indicados nesta Política, sem prejuízo do tratamento já realizado sob fundamento legal anterior.',
    ],
  },
  {
    titulo: '6. Compartilhamento e armazenamento',
    paragrafos: [
      'Os dados pessoais são armazenados em bases de dados gerenciadas pela própria Secretaria (Google Sheets e Google Drive institucionais), acessíveis apenas pelos agentes de tratamento autorizados, mediante credenciais individuais e controle de permissões.',
    ],
    intro: 'O compartilhamento de dados poderá ocorrer exclusivamente:',
    lista: [
      'Com outros órgãos e entidades da Administração Pública Municipal, nas hipóteses previstas em lei, na Lei de Acesso à Informação e nas normas de governança de dados do Município;',
      'Com prestadores de serviços formalmente contratados, na condição de operadores, vinculados por obrigação contratual de confidencialidade e proteção de dados;',
      'Por determinação judicial ou requisito legal.',
    ],
    paragrafos: [
      'A JUV-RIO não comercializa, não cede e não transfere dados pessoais a terceiros para fins comerciais ou de publicidade.',
    ],
  },
  {
    titulo: '7. Segurança da informação',
    paragrafos: [
      'A Secretaria adota medidas técnicas e administrativas adequadas à proteção dos dados pessoais, incluindo: controle de acesso por autenticação individual, atribuição de perfis com privilégio mínimo, criptografia em trânsito (HTTPS), registros de auditoria das operações realizadas e alinhamento à Política de Segurança da Informação do Município do Rio de Janeiro (Decreto Rio nº 53.700/2023).',
      'Em caso de incidente de segurança que possa acarretar risco ou dano relevante ao titular, a JUV-RIO comunicará o fato ao titular e à ANPD nos prazos e nas formas previstas na legislação vigente.',
    ],
  },
  {
    titulo: '8. Tempo de conservação (retenção)',
    paragrafos: [
      'Os dados pessoais serão conservados pelo período necessário à consecução das finalidades descritas nesta Política e pelo prazo previsto na legislação aplicável, incluindo o prazo de guarda de documentos da Administração Pública estabelecido pela legislação arquivística municipal.',
      'Após o encerramento do vínculo funcional do colaborador: a conta será desativada (perfil "Inativo"), cessando todo o acesso ao Portal; os registros de auditoria permanecerão armazenados pelo prazo legal, em observância às normas de gestão documental e aos prazos processuais; e a eliminação definitiva dos dados ocorrerá quando cesserem as finalidades do tratamento e não houver obrigação legal de conservação, mediante anonimização ou exclusão segura.',
    ],
  },
  {
    titulo: '9. Direitos do titular',
    intro: 'Nos termos do art. 18 da LGPD, o titular dos dados tem direito a solicitar, junto à JUV-RIO:',
    lista: [
      'A confirmação da existência de tratamento de seus dados pessoais;',
      'O acesso aos dados pessoais que lhe dizem respeito;',
      'A correção de dados incompletos, inexatos ou desatualizados;',
      'A anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;',
      'A portabilidade dos dados a outro fornecedor de serviço ou produto, quando aplicável;',
      'A eliminação dos dados tratados com base em consentimento, mediante sua revogação;',
      'A informação das entidades públicas e privadas com as quais a Secretaria tenha compartilhado seus dados;',
      'A informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;',
      'A revogação do consentimento, quando o tratamento se fundar nesta base legal.',
    ],
    paragrafos: ['Os pedidos serão respondidos nos prazos previstos na legislação vigente.'],
  },
  {
    titulo: '10. Encarregado e canal de atendimento ao titular',
    intro: 'O canal oficial para contato com os encarregados de dados da JUV-RIO e para atendimento ao titular dos dados é:',
    paragrafos: [
      'Controlador dos dados: Secretaria Especial da Juventude Carioca (JUV-RIO) — Rua Campo de São Cristóvão, nº 268, 2º andar, São Cristóvão, Rio de Janeiro - RJ.',
      'Os titulares poderão utilizar o canal acima para: esclarecer dúvidas sobre esta Política; exercer os direitos previstos no item 9; solicitar informações sobre o tratamento de seus dados; e comunicar incidentes ou apresentar reclamações relativas à privacidade. O titular também poderá peticionar diretamente à Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    titulo: '11. Uso de cookies e sessões',
    paragrafos: [
      'O Portal utiliza mecanismos de armazenamento local no navegador do usuário (armazenamento de sessão) para manter o usuário autenticado durante o uso da plataforma. Esses registros contêm apenas os dados da sessão do próprio usuário autenticado, não são utilizados para rastreamento publicitário e são eliminados ao encerrar a sessão.',
    ],
  },
  {
    titulo: '12. Disposições finais',
    paragrafos: [
      'Esta Política será revista sempre que houver alteração normativa, mudança nos serviços oferecidos pelo Portal ou necessidade de atualização decorrente de melhorias nos processos de governança, privacidade e proteção de dados pessoais. A versão vigente permanecerá disponível para consulta nos canais oficiais da JUV-RIO, assegurando transparência ao titular.',
      'A eventual nulidade de qualquer disposição não prejudicará a validade das demais, que permanecerão em pleno vigor. Os casos omissos serão resolvidos pela JUV-RIO, observadas as competências legais, os princípios da Administração Pública e a legislação vigente.',
    ],
  },
];

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen font-sans antialiased bg-[#F0F7FF] selection:bg-blue-500 selection:text-white">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* CABEÇALHO */}
        <div className="bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] shadow-sm p-10 mb-8">
          <div className="flex items-center gap-3 text-blue-400 mb-4">
            <ShieldCheck size={28} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Portal JUV-RIO
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
            Política de Privacidade
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            Secretaria Especial da Juventude Carioca (JUV-RIO) — Versão 1.0
          </p>
        </div>

        {/* CANAL LGPD EM DESTAQUE */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-[1.5rem] p-8 mb-8">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
            Canal oficial de atendimento ao titular e dos encarregados de dados
          </p>
          <a
            href="https://juv.prefeitura.rio/lgpd/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800 underline underline-offset-4 transition-colors"
          >
            <Globe size={16} /> https://juv.prefeitura.rio/lgpd/
          </a>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-400" /> Rua Campo de São Cristóvão, nº 268, 2º andar, São Cristóvão, Rio de Janeiro - RJ</span>
            <span className="flex items-center gap-2"><Phone size={12} className="text-blue-400" /> (21) 2976-3438</span>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="bg-white/70 backdrop-blur-md border border-white rounded-[1.5rem] shadow-sm p-10 space-y-10">
          {secoes.map((secao) => (
            <section key={secao.titulo} className="space-y-4">
              <h2 className="text-slate-800 text-sm font-black uppercase tracking-tight border-b border-blue-50 pb-2">
                {secao.titulo}
              </h2>
              {secao.intro && (
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{secao.intro}</p>
              )}
              {secao.lista && (
                <ul className="space-y-2 pl-1">
                  {secao.lista.map((item, i) => (
                    <li key={i} className="text-slate-500 text-xs leading-relaxed font-medium flex gap-2">
                      <span className="text-blue-400 font-black mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {secao.paragrafos?.map((p, i) => (
                <p key={i} className="text-slate-500 text-xs leading-relaxed font-medium">{p}</p>
              ))}
            </section>
          ))}

          {/* VIGÊNCIA */}
          <div className="flex items-center gap-2 text-slate-400 pt-4 border-t border-slate-100">
            <Calendar size={14} className="text-blue-400" />
            <p className="text-[9px] font-bold uppercase tracking-widest">
              Vigência: esta política entra em vigor na data de sua publicação no Portal e permanece válida até a publicação de nova versão.
            </p>
          </div>
        </div>

        {/* BOTÃO VOLTAR */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#001D4A] rounded-full font-black uppercase tracking-[0.2em] text-[9px] shadow-lg border border-white hover:bg-blue-50 transition-all active:scale-95"
          >
            <ArrowLeft size={14} /> Voltar ao Portal
          </Link>
        </div>

        <p className="text-center text-white/40 font-medium text-[8px] uppercase tracking-[0.4em] mt-8">
          © 2026 Secretaria Especial da Juventude Carioca - JUV-RIO
        </p>
      </main>
    </div>
  );
}