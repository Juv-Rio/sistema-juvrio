import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';

const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

/**
 * GET /api/get-usuario?id=0001
 * Retorna os dados completos de um usuário, com as chaves vindas dos
 * cabeçalhos reais da planilha (leitura por cabeçalho, nunca por índice).
 * NUNCA devolve a senha (coluna R) para o cliente.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:ZZ',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json({ error: 'Base de usuários está vazia.' }, { status: 404 });
    }

    const headers: any[] = rows[0];
    const userRow = rows.slice(1).find(row => row[0] === id);

    if (!userRow) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const usuario: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) usuario[String(header).trim()] = userRow[index] || '';
    });

    // Remoção defensiva de qualquer coluna sensível, independente do nome do cabeçalho
    Object.keys(usuario).forEach(chave => {
      const normalizada = chave.toUpperCase();
      if (normalizada === 'SENHA' || normalizada.includes('SENHA')) {
        delete usuario[chave];
      }
    });

    return NextResponse.json({ success: true, usuario });
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error.message);
    return NextResponse.json({ error: 'Falha ao carregar dados do usuário.' }, { status: 500 });
  }
}