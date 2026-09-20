import { NextResponse } from 'next/server';
import { lerPlanilha } from '@/services/googleSheetsService';

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID!;
    // Lendo a nova aba única de Atribuições (Coluna A e B)
    const dadosAtribuicoes = await lerPlanilha(spreadsheetId, 'Atribuições!A2:B500');

    return NextResponse.json({ 
      status: 'Sucesso!', 
      atribuicoes: dadosAtribuicoes || []
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'Erro', mensagem: error.message }, { status: 500 });
  }
}