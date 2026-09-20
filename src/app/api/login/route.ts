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

    // 4. MAPEAMENTO DINÂMICO DE PERFIS (Coluna V em diante - índice 21)
    // Pulamos o índice 20 que agora é o Status fixo
    const perfil: Record<string, boolean> = {};
    headers.forEach((headerName, index) => {
      if (index >= 21 && headerName) {
        // Se na coluna do perfil estiver escrito "SIM", o booleano é true
        perfil[headerName] = userRow[index] === 'SIM';
      }
    });

    // 5. Retorna os dados para a sessão
    return NextResponse.json({
      success: true,
      user: {
        id: userRow[0],        // Coluna A
        nome: userRow[1],      // Coluna B
        email: userRow[2],     // Coluna C
        foto: userRow[16],     // Coluna Q
        status: userRow[20],   // Coluna U (Novo campo fixo)
        perfil                 // Objeto dinâmico com Admin, Master, Gerencial, etc.
      }
    });

  } catch (error: any) {
    console.error('Erro no Login JUV-RIO:', error.message);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}