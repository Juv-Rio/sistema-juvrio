import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';

const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

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

// POST: Atualiza Setor, Função, Status e Perfis de Acesso (dinamicamente)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, setor, funcao, perfis, status } = body;

    // 1. Localiza a linha correta baseada no ID (Coluna A)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:A',
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id) + 1;

    if (rowIndex === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // 2. Atualiza Setor (E) e Função (F) - Índices 4 e 5
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!E${rowIndex}:F${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[setor, funcao]]
      }
    });

    // 3. Busca os cabeçalhos (linha 1) para mapear os perfis dinamicamente
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!1:1',
    });
    const headers = headersResponse.data.values?.[0] || [];

    // Perfis de acesso = cabeçalhos a partir da coluna V (índice 21)
    const perfisExistentes = headers
      .map((header, index) => ({ nome: String(header).trim(), idx: index }))
      .filter(item => item.idx >= 21 && item.nome);

    // Monta a linha de Status + Perfis
    const perfisRow = [status || 'ATIVO']; // Coluna U (índice 20)

    perfisExistentes.forEach(perfil => {
      const valor = perfis?.[perfil.nome];
      const ativo = valor === true || valor === 'SIM' || valor === 'sim' || valor === 'TRUE';
      perfisRow.push(ativo ? 'SIM' : 'NÃO');
    });

    // Define a última coluna a ser gravada (U no mínimo, ou a última coluna de perfil encontrada)
    const ultimaColuna = perfisExistentes.length > 0
      ? Math.max(...perfisExistentes.map(p => p.idx)) + 1
      : 21;
    const ultimaLetra = columnToLetter(ultimaColuna);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!U${rowIndex}:${ultimaLetra}${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [perfisRow]
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error.message);
    return NextResponse.json({ error: 'Falha ao salvar alterações.' }, { status: 500 });
  }
}