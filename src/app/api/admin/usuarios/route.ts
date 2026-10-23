import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';

const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

// Cabeçalho da coluna de Landing Primária (comparação tolerante via normaliza)
const CABECALHO_LANDING_PRIMARIA = 'LANDING PRIMÁRIA';

// Índices (0-based) das colunas de sistema do bloco Status + Perfis
const IDX_STATUS = 20; // U: Status
const IDX_ADMIN = 21;  // V: Admin (checkbox, gravado como SIM/NÃO)

// Normaliza cabeçalhos para comparação segura (trim + caixa alta)
function normaliza(valor: any): string {
  return String(valor).trim().toUpperCase();
}

// Função auxiliar: converte número da coluna (1-based) para letra (1 -> A, 21 -> U, ...)
function columnToLetter(columnNumber: number): string {
  let letter = '';
  let num = columnNumber;
  while (num > 0) {
    const resto = (num - 1) % 26;
    letter = String.fromCharCode(65 + resto) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
}

// GET: Busca todos os usuários para listar na tabela de gestão
// (leitura dinâmica por cabeçalho — o campo "LANDING PRIMÁRIA" já chega pronto no objeto)
export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:ZZ', // Range amplo para capturar todos os dados e perfis
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return NextResponse.json([]);

    const headers = rows[0];
    const users = rows.slice(1).map((row) => {
      const userObj: any = {};
      headers.forEach((header, index) => {
        userObj[header] = row[index] || '';
      });
      return userObj;
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error.message);
    return NextResponse.json({ error: 'Erro ao carregar lista de usuários.' }, { status: 500 });
  }
}

// POST: Atualiza Setor, Função, Status, Landing Primária (texto) e Perfis de Acesso (SIM/NÃO)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, setor, funcao, perfis, status } = body;

    // "landingPrimaria" é opcional: se não vier no body, a coluna W é PRESERVADA como está
    const definirLanding = Object.prototype.hasOwnProperty.call(body, 'landingPrimaria');
    const landingPrimaria = definirLanding ? String(body.landingPrimaria || '').trim() : '';

    // 1. Localiza a linha correta E os cabeçalhos em uma única leitura
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:ZZ',
    });
    const rows = response.data.values || [];
    const headers: any[] = rows[0] || [];

    const rowIndex = rows.findIndex(row => row[0] === id) + 1;
    if (rowIndex === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const rowAtual = rows[rowIndex - 1] || [];

    // 2. Atualiza Setor (E) e Função (F) - Índices 4 e 5
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!E${rowIndex}:F${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[setor, funcao]]
      }
    });

    // 3. Localiza a coluna de Landing Primária pelo CABEÇALHO (não pela letra da coluna)
    const idxLanding = headers.findIndex(h => normaliza(h) === normaliza(CABECALHO_LANDING_PRIMARIA));

    // Admin definiu uma landing, mas a coluna não existe? Avisa em vez de falhar em silêncio.
    if (definirLanding && landingPrimaria && idxLanding < 0) {
      return NextResponse.json(
        { error: `Coluna "${CABECALHO_LANDING_PRIMARIA}" não encontrada na planilha de usuários.` },
        { status: 400 }
      );
    }

    // 4. REGRA DE INTEGRIDADE: a Landing Primária exige que o usuário tenha acesso ao
    //    departamento correspondente. Se o Admin retirou o acesso (checkbox desmarcada)
    //    ou definiu uma landing sem o acesso concedido, a coluna W é gravada VAZIA,
    //    forçando o Admin a redefinir uma nova Landing Primária.
    const acessosConcedidos = new Set(
      Object.entries(perfis || {})
        .filter(([, ativo]) => ativo === true)
        .map(([nome]) => normaliza(nome))
    );

    let landingGravar = definirLanding ? landingPrimaria : '';
    let landingResetada = false;
    if (landingGravar && !acessosConcedidos.has(normaliza(landingGravar))) {
      landingGravar = '';
      landingResetada = true;
    }

    // 5. Perfis de acesso (checkboxes) = cabeçalhos a partir de V (Admin), EXCETO a coluna de
    //    Landing Primária — que é gravada como TEXTO pelo dropdown, nunca como SIM/NÃO
    const perfisExistentes = headers
      .map((header, index) => ({ nome: String(header).trim(), idx: index }))
      .filter(
        (item) =>
          item.idx >= IDX_ADMIN &&
          item.nome &&
          normaliza(item.nome) !== normaliza(CABECALHO_LANDING_PRIMARIA)
      );

    // 6. Monta a linha por ÍNDICE ABSOLUTO — cada valor cai na coluna certa,
    //    mesmo com a Landing Primária (W) no meio do bloco
    const tocarLanding = idxLanding >= 0; // grava novo valor OU preserva o atual
    const ultimoIdx = Math.max(
      IDX_STATUS,
      ...(perfisExistentes.map(p => p.idx)),
      tocarLanding ? idxLanding : IDX_STATUS
    );

    const perfisRow: string[] = new Array(ultimoIdx - IDX_STATUS + 1).fill('');

    // Status (U)
    perfisRow[0] = status || 'ATIVO';

    // Landing Primária (W): texto do departamento (vazio = automático) — ou o valor atual preservado
    if (tocarLanding) {
      perfisRow[idxLanding - IDX_STATUS] = definirLanding
        ? landingGravar
        : (rowAtual[idxLanding] || '');
    }

    // Perfis de acesso (V, X, Y, ...): SIM/NÃO
    perfisExistentes.forEach(perfil => {
      const valor = perfis?.[perfil.nome];
      const ativo = valor === true || valor === 'SIM' || valor === 'sim' || valor === 'TRUE';
      perfisRow[perfil.idx - IDX_STATUS] = ativo ? 'SIM' : 'NÃO';
    });

    // 7. Grava o bloco inteiro (U -> última coluna) em uma única escrita
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!U${rowIndex}:${columnToLetter(ultimoIdx + 1)}${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [perfisRow]
      }
    });

    return NextResponse.json({ success: true, landingResetada });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error.message);
    return NextResponse.json({ error: 'Falha ao salvar alterações.' }, { status: 500 });
  }
}