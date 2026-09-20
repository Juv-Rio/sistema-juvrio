import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';

const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

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

// POST: Atualiza Setor, Função, Status e Perfis de Acesso
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

    // 3. Atualiza Status (U) e Perfis de Acesso (V até AA)
    // Mapeamos o objeto recebido do frontend para o padrão "SIM" / "NÃO"
    const perfisRow = [
      status || 'ATIVO',               // U (20)
      perfis.Admin ? 'SIM' : 'NÃO',     // V (21)
      perfis.Master ? 'SIM' : 'NÃO',    // W (22)
      perfis.Gestao ? 'SIM' : 'NÃO',    // X (23)
      perfis.Gerencial ? 'SIM' : 'NÃO', // Y (24)
      perfis.Operacional ? 'SIM' : 'NÃO',// Z (25)
      perfis.Territorio ? 'SIM' : 'NÃO' // AA (26)
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!U${rowIndex}:AA${rowIndex}`,
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