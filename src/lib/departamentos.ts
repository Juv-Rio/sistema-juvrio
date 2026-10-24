import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  CalendarDays,
  Building2,
  Megaphone,
  Settings,
} from 'lucide-react';

/**
 * REGISTRO DE DEPARTAMENTOS — a ÚNICA fonte de verdade estrutural.
 *
 * Tudo o mais é DERIVADO daqui:
 *   - DEPARTAMENTOS (lib/landing.ts)                  -> chave + rota
 *   - SIDEBAR_POR_DEPARTAMENTO (lib/sidebar.ts)       -> logo + itens
 *   - listarAreasPermitidas()                          -> permissão por coluna
 *   - podeAcessarRota()                                -> guard de rota
 *
 * REGRA DE MANUTENÇÃO — ao publicar uma área nova, são DOIS passos:
 *   1. crie a pasta com a page.tsx do índice
 *        src/app/(landing)/<slug>/page.tsx
 *   2. adicione UMA entrada em DEPARTAMENTOS_REGISTRADOS abaixo
 *      (e a logo em public/logos/<slug>.png)
 *
 * O campo `rota` é DERIVADO do slug — nunca declarado à mão.
 */

// ---------------------------------------------------------------------------
// Tipos de navegação
// ---------------------------------------------------------------------------

interface BaseItemNav {
  label: string;
  icone: LucideIcon;
}

/** Folha: navega. */
export interface ItemLinkNav extends BaseItemNav {
  tipo: 'link';
  /** Rota ABSOLUTA completa. Ex.: '/master/usuarios/pendentes'. */
  rota: string;
  /** true = só ativa em match exato ("Visão geral"). */
  exato?: boolean;
  /** Badge numérico. `undefined`/`0` = sem badge. */
  notificacoes?: number;
}

/** Galho: agrupa. Nunca navega — sem `rota`, por invariante de tipo. */
export interface ItemGrupoNav extends BaseItemNav {
  tipo: 'grupo';
  subitens: ItemLinkNav[];
}

export type ItemNav = ItemLinkNav | ItemGrupoNav;

// ---------------------------------------------------------------------------
// Tipos do departamento
// ---------------------------------------------------------------------------

export interface DepartamentoRegistrado {
  /**
   * Slug da pasta em src/app/(landing)/.
   * Também é o valor esperado na coluna LANDING PRIMÁRIA da planilha
   * (comparação tolerante a caixa e acentos).
   */
  slug: string;

  /**
   * Nome exibido na SideBar e no Seletor de Área.
   * Se omitido, usa o próprio slug.
   */
  titulo?: string;

  /**
   * Chave do objeto `user.perfil` que autoriza o acesso.
   * Se omitida, usa o slug. Só mude se a coluna da planilha tiver
   * grafia diferente do slug da pasta (ex.: slug 'ej-estacio' mas
   * coluna 'EJ Estácio').
   */
  chavePermissao?: string;

  /** Ícone da logo (fallback quando a imagem em public não existe). */
  icone: LucideIcon;

  /** Itens da SideBar. Um item `link` por página criada na pasta. */
  itens: ItemNav[];
}

// ---------------------------------------------------------------------------
// O REGISTRO
// ---------------------------------------------------------------------------

export const DEPARTAMENTOS_REGISTRADOS: DepartamentoRegistrado[] = [
  {
    slug: 'master',
    titulo: 'Master',
    icone: LayoutDashboard,
    itens: [
      { tipo: 'link', label: 'Visão geral', rota: '/master', icone: LayoutDashboard, exato: true },
      { tipo: 'link', label: 'Equipe', rota: '/master/equipe', icone: Users },   // ← NOVA LINHA
      {

        tipo: 'grupo',
        label: 'Usuários',
        icone: Users,
        subitens: [
          { tipo: 'link', label: 'Pendentes', rota: '/master/usuarios/pendentes', icone: Users, notificacoes: 3 },
          { tipo: 'link', label: 'Ativos', rota: '/master/usuarios/ativos', icone: Users },
          { tipo: 'link', label: 'Inativos', rota: '/master/usuarios/inativos', icone: Users },
        ],
      },
      { tipo: 'link', label: 'Relatórios', rota: '/master/relatorios', icone: BarChart3 },
    ],
  },
  {
    slug: 'clube',
    titulo: 'Clube',
    icone: CalendarDays,
    itens: [
      { tipo: 'link', label: 'Visão geral', rota: '/clube', icone: LayoutDashboard, exato: true },
      {
        tipo: 'grupo',
        label: 'Atividades',
        icone: CalendarDays,
        subitens: [
          { tipo: 'link', label: 'Agenda', rota: '/clube/atividades/agenda', icone: CalendarDays, notificacoes: 12 },
          { tipo: 'link', label: 'Inscrições', rota: '/clube/atividades/inscricoes', icone: FileText },
        ],
      },
      { tipo: 'link', label: 'Documentos', rota: '/clube/documentos', icone: FileText },
    ],
  },
  // Áreas previstas na planilha, ainda sem página publicada.
  // Descomente quando criar a pasta correspondente.
  // { slug: 'ppj', titulo: 'PPJ', icone: Building2, itens: [] },
  // { slug: 'comunicacao', titulo: 'Comunicação', icone: Megaphone, itens: [] },
  // { slug: 'ej-estacio', titulo: 'EJ Estácio', icone: Settings, itens: [] },
];

// ---------------------------------------------------------------------------
// Derivados — NÃO EDITAR ABAIXO
// ---------------------------------------------------------------------------

/** Rota canônica de um departamento: sempre '/' + slug. */
export function rotaDoDepartamento(slug: string): string {
  return '/' + slug;
}

/** Chave de permissão efetiva (coluna da planilha) de um departamento. */
export function chavePermissaoDe(dep: DepartamentoRegistrado): string {
  return dep.chavePermissao ?? dep.slug;
}

/** Título exibido de um departamento. */
export function tituloDe(dep: DepartamentoRegistrado): string {
  return dep.titulo ?? dep.slug;
}

/** Logo convencionada em /public/logos/. */
export function logoDe(dep: DepartamentoRegistrado): string {
  return `/logos/${dep.slug}.png`;
}