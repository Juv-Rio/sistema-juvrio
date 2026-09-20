import { NextResponse } from 'next/server';
import { drive } from '@/services/googleDriveService';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const { fotoBase64, cpf } = await request.json();
    const folderId = process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID;

    if (!fotoBase64 || !cpf) {
      return NextResponse.json({ error: 'Dados insuficientes para upload.' }, { status: 400 });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const fileName = `PERFIL - ${cpfLimpo}.jpg`;

    // 1. Converter Base64 para Buffer de forma segura
    const base64Data = fotoBase64.includes(',') ? fotoBase64.split(',')[1] : fotoBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Criar stream compatível com a API do Google
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 3. Upload para o Drive
    const response = await drive.files.create({
      requestBody: { 
        name: fileName, 
        parents: [folderId!] 
      },
      media: { 
        mimeType: 'image/jpeg', 
        body: stream 
      },
      fields: 'id',
    });

    return NextResponse.json({ fileId: response.data.id });
  } catch (error: any) {
    console.error('Erro no Upload JUV-RIO:', error.message);
    return NextResponse.json({ error: 'Falha ao salvar foto no Google Drive.' }, { status: 500 });
  }
}