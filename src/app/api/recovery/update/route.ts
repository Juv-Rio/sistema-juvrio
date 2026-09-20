import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, novaSenha } = await request.json();
    const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

    if (!email || !novaSenha) {
      return NextResponse.json({ error: 'Dados insuficientes para atualização.' }, { status: 400 });
    }

    // 1. Normalização do E-mail (lowercase e sem espaços)
    const emailBusca = email.trim().toLowerCase();

    // 2. Buscar a base de usuários (Coluna C é o E-mail, Coluna R é o Hash)
    // Buscamos de A até R para mapear a linha inteira
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:R', 
    });

    const rows = response.data.values || [];
    
    // 3. Encontrar o índice da linha usando o E-mail (Coluna C = Index 2)
    const rowIndex = rows.findIndex(row => {
      const emailPlanilha = (row[2] || '').toString().trim().toLowerCase();
      return emailPlanilha === emailBusca;
    });

    // Erro se não encontrar ou se for o cabeçalho (index 0)
    if (rowIndex === -1 || rowIndex === 0) {
      return NextResponse.json({ error: 'Usuário não localizado no banco de dados.' }, { status: 404 });
    }

    // 4. Validar se a nova senha é igual à atual (Coluna R = Index 17)
    const senhaAtualHash = rows[rowIndex][17]; 
    if (senhaAtualHash) {
      const senhaIgual = await bcrypt.compare(novaSenha, senhaAtualHash);
      if (senhaIgual) {
        return NextResponse.json({ 
          error: 'A nova senha não pode ser igual à senha atual.' 
        }, { status: 400 });
      }
    }

    // 5. Gerar novo Hash de segurança
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // 6. Atualizar a célula na Coluna R da linha correspondente
    // No Sheets, a linha física é rowIndex + 1
    const linhaPlanilha = rowIndex + 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!R${linhaPlanilha}`, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[novaSenhaHash]],
      },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erro crítico na atualização:', error);
    return NextResponse.json({ error: 'Falha técnica ao gravar a nova senha.' }, { status: 500 });
  }
}