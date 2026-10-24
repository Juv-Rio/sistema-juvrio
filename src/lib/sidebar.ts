import type { LucideIcon } from 'lucide-react';
import {
  DEPARTAMENTOS_REGISTRADOS,
  logoDe,
  tituloDe,
  chavePermissaoDe,
  type ItemNav,
  type ItemLinkNav,
  type ItemGrupoNav,
} from './departamentos';

/**
 * Configuração da SideBar por Área Gerencial.
 *
 * IMPORTANTE: este arquivo NÃO declara mais departamentos.
 * Ele DERIVA a configuração de DEPARTAMENTOS_REGISTRADOS
 * (lib/departamentos.ts), que é a ÚNICA fonte de verdade estrutural.
 *
 * Aqui vivem apenas:
 *   1. Os tipos consumidos pelos componentes (reexportados com os
 *      nomes já usados em SideBar.tsx e SeletorArea.tsx).
 *   2. A derivação `chave do perfil -> { titulo, logo, itens }`.
 *
 * REGRA DE MANUTENÇÃO: ao criar uma página nova, NÃO edite este arquivo.
 *   1. crie src/app/(landing)/<slug>/<secao>/page.tsx
 *   2. adicione um ItemLinkNav no array `itens` do departamento
 *      em lib/departamentos.ts
 */

// ---------------------------------------------------------------------------
// Tipos reexportados
//
// Os componentes já importam estes nomes. A definição canônica mora em
// lib/departamentos.ts; aqui só publicamos os mesmos contratos com a
// terminologia da SideBar.
// ---------------------------------------------------------------------------

/** Árvore de navegação: folha que navega ou galho que agrupa. */
export type ItemSideBar = ItemNav;

/** Folha: navega para `rota`. */
export type ItemLinkSideBar = ItemLinkNav;

/** Galho: agrupa filhos. NUNCA navega, por isso não tem `rota`. */
export type ItemGrupoSideBar = ItemGrupoNav;

export interface ConfigSideBar {
  /** Nome do departamento exibido sob a logo. */
  titulo: string;
  /** Caminho da logo em /public. */
  logo: string;
  /** Árvore de navegação. */
  itens: ItemSideBar[];
}

// ---------------------------------------------------------------------------
// Derivação
// ---------------------------------------------------------------------------

/**
 * DERIVADO de DEPARTAMENTOS_REGISTRADOS — NÃO EDITAR.
 *
 * A chave é a CHAVE DE PERMISSÃO do departamento (o cabeçalho da coluna
 * SIM/NÃO na planilha), que é o que o layout usa para buscar a config
 * a partir de `buscarDepartamentoPorRota(pathname)`.
 *
 * Ex.: { Master: {...}, Clube: {...} }
 */
export const SIDEBAR_POR_DEPARTAMENTO: Record<string, ConfigSideBar> =
  Object.fromEntries(
    DEPARTAMENTOS_REGISTRADOS.map(dep => [
      chavePermissaoDe(dep),
      {
        titulo: tituloDe(dep),
        logo: logoDe(dep),
        itens: dep.itens,
      },
    ])
  );

/**
 * Departamentos previstos na planilha, mas ainda sem sidebar publicada.
 *
 * Mantido vazio de propósito: hoje a intenção de expansão fica registrada
 * como comentário dentro de DEPARTAMENTOS_REGISTRADOS, junto do lugar
 * onde a entrada precisa ser ativada. Duplicar aqui reintroduziria a
 * segunda fonte de verdade que estamos eliminando.
 *
 * Se algum código antigo ainda importa este símbolo, ele continua
 * compilando — apenas não tem mais conteúdo.
 */
export const DEPARTAMENTOS_RESERVADOS: Record<string, LucideIcon> = {};