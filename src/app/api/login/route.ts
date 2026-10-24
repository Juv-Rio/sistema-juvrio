import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();
    const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

    // 1. Busca todos os dados da aba Usuarios
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:ZZ', // Range amplo para capturar todos os futuros perfis
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json({ error: 'Nenhum usuário cadastrado.' }, { status: 404 });
    }

    const headers = rows[0]; // Linha 1 (Cabeçalhos)

    // 2. Localiza o usuário pelo e-mail (Coluna C - Índice 2)
    const userRow = rows.find(row => row[2] === email);

    if (!userRow) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    // 3. Verifica a senha (Hash na coluna R - índice 17)
    const senhaValida = await bcrypt.compare(senha, userRow[17]);
    if (!senhaValida) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    // 4. DESCOBRE PELO CABEÇALHO ONDE FICAM OS PERFIS E A LANDING
    //    Não confiamos em índices fixos: a coluna LANDING PRIMÁRIA
    //    não é um perfil, e o Admin pode reordenar colunas no futuro.
    const normaliza = (valor: any) => String(valor || '').trim().toUpperCase();

    const indiceLanding = headers.findIndex(
      (h: any) => normaliza(h) === 'LANDING PRIMÁRIA' || normaliza(h) === 'LANDING PRIMARIA'
    );

    // Perfis: todas as colunas de permissão a partir da coluna V (índice 21),
    // EXCLUINDO a coluna de landing, que não é permissão booleana.
    const perfil: Record<string, boolean> = {};
    headers.forEach((headerName: any, index: number) => {
      if (index < 21 || !headerName) return;
      if (index === indiceLanding) return; // LANDING PRIMÁRIA não é perfil

      perfil[String(headerName).trim()] = userRow[index] === 'SIM';
    });

    // 5. Landing primária: valor literal da célula (ex.: "Clube")
    const landingPrimaria =
      indiceLanding >= 0 ? String(userRow[indiceLanding] || '').trim() : '';

    // 6. Retorna os dados para a sessão
    return NextResponse.json({
      success: true,
      user: {
        id: userRow[0],        // Coluna A
        nome: userRow[1],      // Coluna B
        email: userRow[2],     // Coluna C
        foto: userRow[16],     // Coluna Q
        status: userRow[20],   // Coluna U
        landingPrimaria,       // Coluna W (nome do departamento)
        perfil,                // Objeto dinâmico apenas com perfis reais
      },
    });
  } catch (error: any) {
    console.error('Erro no Login JUV-RIO:', error.message);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}