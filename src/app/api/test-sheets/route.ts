import { NextResponse } from 'next/server';
import { adicionarLinha } from '@/services/googleSheetsService';

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    
    // Vamos simular um registro de log
    // Dados: Nome, Departamento, Ação, Data/Hora
    await adicionarLinha(spreadsheetId, [
      'Sistema JUV-RIO', 
      'TI / Infra', 
      'Teste de conexão inicial', 
      new Date().toLocaleString('pt-BR')
    ]);

    return NextResponse.json({ 
      status: 'Sucesso!', 
      mensagem: 'Dados gravados na planilha com sucesso!' 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      status: 'Erro', 
      mensagem: error.message 
    }, { status: 500 });
  }
}