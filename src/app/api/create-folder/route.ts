import { NextResponse } from 'next/server';
import { criarPasta } from '@/services/googleDriveService';

export async function GET() {
  try {
    // Tenta criar a pasta no seu Drive
    const folderId = await criarPasta('Teste Sistema JUV-RIO');

    return NextResponse.json({ 
      status: 'Sucesso!', 
      mensagem: 'Pasta criada no Google Drive',
      idDaPasta: folderId 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      status: 'Erro', 
      mensagem: error.message 
    }, { status: 500 });
  }
}