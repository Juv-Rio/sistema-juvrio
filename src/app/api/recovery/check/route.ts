import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';

export async function POST(request: Request) {
  try {
    const { email, cpf, telefone, dataNascimento } = await request.json();
    const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!B:O', 
    });

    const rows = response.data.values || [];
    
    // FUNÇÕES DE NORMALIZAÇÃO EXTREMA
    const apenasNumeros = (str: string) => str.toString().replace(/\D/g, '');
    const normalizarEmail = (str: string) => str.toString().trim().toLowerCase();
    
    // Converte DD/MM/YYYY para YYYY-MM-DD para bater com o input do navegador
    const normalizarData = (data: string) => {
      const d = data.toString().trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        const [dia, mes, ano] = d.split('/');
        return `${ano}-${mes}-${dia}`;
      }
      return d;
    };

    const emailBusca = normalizarEmail(email);
    const cpfBusca = apenasNumeros(cpf);
    // Pegamos apenas os últimos 11 dígitos do telefone para ignorar +55 ou 0 inicial
    const telBusca = apenasNumeros(telefone).slice(-11);

    const usuario = rows.find(row => {
      const emailPlanilha = normalizarEmail(row[1] || '');
      const cpfPlanilha = apenasNumeros(row[2] || '');
      const telPlanilha = apenasNumeros(row[5] || '').slice(-11);
      const dataPlanilha = normalizarData(row[13] || '');

      return (
        emailPlanilha === emailBusca &&
        cpfPlanilha === cpfBusca &&
        telPlanilha === telBusca &&
        dataPlanilha === dataNascimento
      );
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Dados não conferem. Verifique se a data e o telefone estão corretos.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, email: usuario[1] });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}