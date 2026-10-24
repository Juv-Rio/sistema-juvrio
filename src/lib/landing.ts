/**
 * Mapa de departamentos -> landing page.
 *
 * IMPORTANTE: este arquivo NÃO declara mais a lista de departamentos.
 * Ele DERIVA tudo de `DEPARTAMENTOS_REGISTRADOS` (lib/departamentos.ts),
 * que é a ÚNICA fonte de verdade estrutural do sistema.
 *
 * Aqui vivem apenas as REGRAS:
 *   1. Como converter a rota em departamento.
 *   2. Quem pode acessar cada destino (coluna de perfil correspondente).
 *   3. Para onde o usuário vai ao entrar.
 *
 * REGRA DE MANUTENÇÃO: ao publicar uma área nova, NÃO edite este arquivo.
 *   1. crie a pasta src/app/(landing)/<slug>/page.tsx
 *   2. adicione a entrada em DEPARTAMENTOS_REGISTRADOS
 */

import {
  DEPARTAMENTOS_REGISTRADOS,
  rotaDoDepartamento,
  chavePermissaoDe,
  type DepartamentoRegistrado,
} from './departamentos';

/** Rota exibida quando o usuário não tem departamento válido. */
export const ROTA_SEM_LOTACAO = '/sem-lotacao';

/** Rota do painel administrativo (usuários com perfil Admin). */
export const ROTA_ADMIN = '/admin';

/** Rota exibida quando o usuário tenta acessar uma Área Gerencial sem permissão. */
export const ROTA_SEM_ACESSO = '/sem-acesso';

export interface Departamento {
  /** Valor literal esperado na coluna LANDING PRIMÁRIA e nas colunas SIM. */
  chave: string;
  /** Caminho da landing correspondente. Sempre '/' + slug. */
  rota: string;
  /** Slug da pasta em src/app/(landing)/. */
  slug: string;
  /**
   * Cabeçalho da coluna de perfil que autoriza o acesso.
   * `null` significa: a rota não depende de perfil.
   * Derivado de `chavePermissao` (ou do slug, quando omitido).
   */
  coluna: string | null;
}

/**
 * DERIVADO de DEPARTAMENTOS_REGISTRADOS — NÃO EDITAR.
 * Mantém a ordem de declaração do registro.
 */
export const DEPARTAMENTOS: readonly Departamento[] =
  DEPARTAMENTOS_REGISTRADOS.map(dep => ({
    chave: chavePermissaoDe(dep),
    rota: rotaDoDepartamento(dep.slug),
    slug: dep.slug,
    coluna: chavePermissaoDe(dep),
  }));

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
 * Acesso aos registros completos (logo, itens da sidebar, ícone).
 * A SideBar e o layout consomem preferencialmente esta função.
 */
export function departamentosRegistrados(): readonly DepartamentoRegistrado[] {
  return DEPARTAMENTOS_REGISTRADOS;
}

/**
 * Procura a rota correspondente a um departamento.
 * Aceita tanto a chave de permissão ("Master") quanto o slug ("master").
 * Retorna null quando o valor não corresponde a nenhum departamento.
 */
export function buscarRotaDepartamento(
  landingPrimaria: string | undefined | null
): string | null {
  const alvo = normalizar(landingPrimaria || '');
  if (!alvo) return null;

  const encontrado = DEPARTAMENTOS.find(
    d => normalizar(d.chave) === alvo || normalizar(d.slug) === alvo
  );

  return encontrado ? encontrado.rota : null;
}

/**
 * Procura o departamento a partir do pathname atual.
 *
 * Usa o PREFIXO MAIS LONGO que casa, e não apenas o primeiro segmento.
 * Isso permite que um dia existam rotas aninhadas com dono próprio
 * (ex.: '/master/usuarios' registrado separadamente) sem ambiguidade.
 *
 * Ex.: "/clube"              -> Clube
 *      "/clube/relatorios"   -> Clube
 *      "/editar-perfil"      -> null
 */
export function buscarDepartamentoPorRota(
  pathname: string | null | undefined
): Departamento | null {
  if (!pathname) return null;

  const candidatos = DEPARTAMENTOS.filter(
    d => pathname === d.rota || pathname.startsWith(d.rota + '/')
  ).sort((a, b) => b.rota.length - a.rota.length);

  return candidatos[0] ?? null;
}

/**
 * Decide se um usuário pode acessar determinada Área Gerencial.
 *
 * Regras:
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
  user: { landingPrimaria?: string; perfil?: Record<string, boolean> } | null | undefined
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
    chave => normalizar(chave) === normalizar(departamento.coluna as string)
  );

  // Sem a coluna no perfil, ainda pode valer a landing primária.
  // Espelha exatamente a regra de listarAreasPermitidas().
  if (!chavePerfil) {
    return normalizar(departamento.chave) === normalizar(user?.landingPrimaria ?? '');
  }

  if (perfil[chavePerfil] === true) return true;

  return normalizar(departamento.chave) === normalizar(user?.landingPrimaria ?? '');
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

/**
 * Landings que o usuário tem permissão de acessar.
 *
 * Regra de negócio:
 *   - Admin acessa TODAS as landings publicadas.
 *   - Demais perfis acessam apenas os departamentos com a coluna SIM,
 *     mais a própria landing primária (garantia de que o usuário nunca
 *     fica sem a própria casa).
 *
 * A permissão é lida em `user.perfil`, cujas chaves são os cabeçalhos
 * da planilha. A comparação é tolerante a caixa e acentos.
 *
 * Retorna na ordem de DEPARTAMENTOS. Vazio quando o usuário não tem
 * nenhuma marcação e nenhuma landing primária válida.
 */
export function listarAreasPermitidas(user: {
  landingPrimaria?: string;
  perfil?: Record<string, boolean>;
}): Departamento[] {
  // Admin: passe livre em todas as landings publicadas.
  if (user?.perfil?.Admin === true) {
    return [...DEPARTAMENTOS];
  }

  const perfil = user?.perfil ?? {};

  return DEPARTAMENTOS.filter(departamento => {
    // Permissão explícita na coluna do departamento (tolerante a caixa/acento).
    const chavePerfil = Object.keys(perfil).find(
      chave => normalizar(chave) === normalizar(departamento.chave)
    );

    if (chavePerfil && perfil[chavePerfil] === true) return true;

    // A landing primária sempre está acessível, mesmo sem coluna explícita.
    return normalizar(departamento.chave) === normalizar(user?.landingPrimaria ?? '');
  });
}