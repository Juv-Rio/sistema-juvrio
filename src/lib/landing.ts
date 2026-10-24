/**
 * Mapa de departamentos -> landing page.
 *
 * Esta é a ÚNICA fonte de verdade sobre quais destinos existem.
 * A coluna LANDING PRIMÁRIA da planilha diz QUAL é o departamento do
 * usuário; este mapa diz ONDE a página daquele departamento mora.
 *
 * REGRA DE MANUTENÇÃO: ao criar um departamento novo,
 *   1. crie a pasta em src/app/(landing)/<slug>/page.tsx
 *   2. adicione a entrada correspondente em DEPARTAMENTOS
 * Se a entrada não existir, o usuário cai em ROTA_SEM_LOTACAO (nunca em 404).
 */

/** Rota exibida quando o usuário não tem departamento válido. */
export const ROTA_SEM_LOTACAO = '/sem-lotacao';

/** Rota do painel administrativo (usuários com perfil Admin). */
export const ROTA_ADMIN = '/admin';

export interface Departamento {
  /** Valor literal esperado na coluna LANDING PRIMÁRIA da planilha. */
  chave: string;
  /** Caminho da landing correspondente. */
  rota: string;
}

/**
 * Departamentos com landing publicada.
 * A `chave` deve ser idêntica ao valor da coluna W (comparação tolerante
 * a maiúsculas/minúsculas e acentos).
 */
export const DEPARTAMENTOS: readonly Departamento[] = [
  { chave: 'Master', rota: '/master' },
  { chave: 'Clube', rota: '/clube' },
] as const;

/**
 * Normaliza texto para comparação: sem acentos, sem espaços nas pontas,
 * tudo em minúsculas. Permite que "Master", "master" e "MASTER" batam.
 */
function normalizar(valor: string): string {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Procura a rota correspondente a um departamento.
 * Retorna null quando o valor não corresponde a nenhum departamento cadastrado.
 */
export function buscarRotaDepartamento(
  landingPrimaria: string | undefined | null
): string | null {
  const alvo = normalizar(landingPrimaria || '');
  if (!alvo) return null;

  const encontrado = DEPARTAMENTOS.find(
    (departamento) => normalizar(departamento.chave) === alvo
  );

  return encontrado ? encontrado.rota : null;
}

/**
 * Define para onde o usuário autenticado deve ser enviado.
 *
 * Ordem de decisão:
 *  1. Admin            -> /admin
 *  2. Landing válida   -> rota do departamento
 *  3. Sem landing      -> /sem-lotacao
 */
export function resolverRotaInicial(user: {
  landingPrimaria?: string;
  perfil?: Record<string, boolean>;
}): string {
  if (user?.perfil?.Admin === true) {
    return ROTA_ADMIN;
  }

  const rota = buscarRotaDepartamento(user?.landingPrimaria);
  return rota ?? ROTA_SEM_LOTACAO;
}