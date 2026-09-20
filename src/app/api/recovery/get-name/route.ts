import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cpfFornecido = searchParams.get('cpf');

  if (!cpfFornecido) return NextResponse.json({ error: 'CPF não fornecido' }, { status: 400 });

  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!B:D',
    });

    const rows = response.data.values || [];
    const apenasNumeros = (str: string) => str.toString().replace(/\D/g, '');
    const cpfLimpoFornecido = apenasNumeros(cpfFornecido);

    const usuario = rows.find(row => {
      const cpfPlanilha = apenasNumeros(row[2] || '');
      return cpfPlanilha === cpfLimpoFornecido;
    });

    if (!usuario) return NextResponse.json({ exists: false });

    return NextResponse.json({ exists: true, nome: usuario[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao consultar banco de dados' }, { status: 500 });
  }
}