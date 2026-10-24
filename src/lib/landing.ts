/**
 * Mapa de departamentos -> landing page.
 *
 * Esta é a ÚNICA fonte de verdade sobre:
 *   1. Quais destinos existem (rota de cada departamento).
 *   2. Quem pode acessar cada destino (coluna de perfil correspondente).
 *
 * A coluna LANDING PRIMÁRIA da planilha diz QUAL é o departamento inicial
 * do usuário. As colunas de perfil (SIM/NÃO) dizem QUAIS ele pode acessar.
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

/** Rota exibida quando o usuário tenta acessar uma Área Gerencial sem permissão. */
export const ROTA_SEM_ACESSO = '/sem-acesso';

export interface Departamento {
  /** Valor literal esperado na coluna LANDING PRIMÁRIA da planilha. */
  chave: string;
  /** Caminho da landing correspondente. */
  rota: string;
  /**
   * Nome EXATO do cabeçalho da coluna de perfil na aba Usuarios.
   * `null` significa: a existência da rota não depende de perfil
   * (ex.: /sem-lotacao, /admin, /editar-perfil).
   */
  coluna: string | null;
}

/**
 * Departamentos com landing publicada.
 * A `coluna` deve ser idêntica ao cabeçalho da planilha (comparação
 * tolerante a maiúsculas/minúsculas e acentos).
 */
export const DEPARTAMENTOS: readonly Departamento[] = [
  { chave: 'Master', rota: '/master', coluna: 'Master' },
  { chave: 'Clube', rota: '/clube', coluna: 'Clube' },
] as const;

/**
 * Rotas que não são Áreas Gerenciais e, portanto, não dependem de perfil.
 * Qualquer usuário autenticado e ativo pode acessá-las.
 */
export const ROTAS_LIVRES: readonly string[] = [
  ROTA_SEM_LOTACAO,
  ROTA_SEM_ACESSO,
  ROTA_ADMIN,
  '/editar-perfil',
] as const;

/**
 * Normaliza texto para comparação: sem acentos, sem espaços nas pontas,
 * tudo em minúsculas. Permite que "Master", "master" e "MASTER" batam,
 * e que "Comunicação" bata com "comunicacao".
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
 * Procura o departamento a partir do slug da URL atual.
 * Ex.: "/clube" -> { chave: 'Clube', rota: '/clube', coluna: 'Clube' }
 *      "/clube/relatorios" -> ainda encontra Clube (primeiro segmento).
 * Retorna null para rotas que não são de departamento.
 */
export function buscarDepartamentoPorRota(
  pathname: string | null | undefined
): Departamento | null {
  if (!pathname) return null;

  const segmento = '/' + String(pathname).split('/').filter(Boolean)[0];
  if (segmento === '/') return null;

  return (
    DEPARTAMENTOS.find(
      (departamento) => normalizar(departamento.rota) === normalizar(segmento)
    ) ?? null
  );
}

/**
 * Decide se um usuário pode acessar determinada Área Gerencial.
 *
 * Regras (definidas em 24/10/2026):
 *   1. Admin   -> acessa tudo.
 *   2. Demais  -> acessam apenas departamentos com a coluna marcada "SIM".
 *   3. Rotas fora do mapa de departamentos -> liberadas (o guard de sessão
 *      do layout já garantiu que o usuário está autenticado e ativo).
 *
 * O parâmetro `perfil` vem do login, onde cada chave é o cabeçalho da
 * planilha: { "Admin": true, "Master": true, "Clube": false, ... }.
 */
export function podeAcessarRota(
  pathname: string | null | undefined,
  user: { perfil?: Record<string, boolean> } | null | undefined
): boolean {
  // Admin tem passe livre em qualquer Área Gerencial.
  if (user?.perfil?.Admin === true) return true;

  const departamento = buscarDepartamentoPorRota(pathname);

  // Rota que não é de departamento: não há perfil a exigir.
  if (!departamento) return true;

  // Departamento sem coluna associada: não há perfil a exigir.
  if (!departamento.coluna) return true;

  // Comparação tolerante: o cabeçalho pode ter acento ou caixa diferentes.
  const perfil = user?.perfil ?? {};
  const chavePerfil = Object.keys(perfil).find(
    (chave) => normalizar(chave) === normalizar(departamento.coluna as string)
  );

  if (!chavePerfil) return false;

  return perfil[chavePerfil] === true;
}

/**
 * Define para onde o usuário autenticado deve ser enviado ao entrar.
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