import { NextResponse } from 'next/server';
import { criarPasta } from '@/services/googleDriveService';
import { adicionarLinha } from '@/services/googleSheetsService';

export async function GET() {
  try {
    const planilhaId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    const nomeDoProcesso = "Processo JUV-RIO #001";

    // 1. Cria a pasta no Drive
    const folderId = await criarPasta(nomeDoProcesso);

    // 2. Registra automaticamente na Planilha
    await adicionarLinha(planilhaId, [
      nomeDoProcesso,
      'JUV-RIO',
      `Pasta criada com ID: ${folderId}`,
      new Date().toLocaleString('pt-BR')
    ]);

    return NextResponse.json({ 
      status: 'Integração Completa!', 
      pasta: folderId,
      log: 'Gravado na planilha'
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'Erro', mensagem: error.message }, { status: 500 });
  }
}