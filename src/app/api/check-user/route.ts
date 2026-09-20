import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get('cpf');
  const email = searchParams.get('email');
  const telefone = searchParams.get('telefone');
  const instagram = searchParams.get('instagram'); // Novo parâmetro
  const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

  try {
    // Buscamos do Email (C) até o Instagram (P)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!C:P', 
    });

    const rows = response.data.values || [];
    
    // Verificação de CPF (Coluna D -> Index 1 no range C:P)
    if (cpf) {
      const exists = rows.some(row => row[1] === cpf);
      return NextResponse.json({ exists });
    }

    // Verificação de Email (Coluna C -> Index 0 no range C:P)
    if (email) {
      const exists = rows.some(row => row[0] === email);
      return NextResponse.json({ exists });
    }

    // Verificação de Telefone (Coluna G -> Index 4 no range C:P)
    if (telefone) {
      const exists = rows.some(row => row[4] === telefone);
      return NextResponse.json({ exists });
    }

    // Verificação de Instagram (Coluna P -> Index 13 no range C:P)
    if (instagram) {
      const exists = rows.some(row => row[13] === instagram);
      return NextResponse.json({ exists });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    return NextResponse.json({ error: 'Erro na verificação' }, { status: 500 });
  }
}