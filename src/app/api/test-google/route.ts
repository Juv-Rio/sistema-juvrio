import { NextResponse } from 'next/server';
import { drive } from '@/lib/google';

export async function GET() {
  try {
    // Tenta pedir ao Google uma lista simples de arquivos
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)',
    });

    return NextResponse.json({ 
      status: 'Conectado com sucesso!', 
      dados: response.data 
    });
  } catch (error: any) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ 
      status: 'Erro na conexão', 
      mensagem: error.message 
    }, { status: 500 });
  }
}