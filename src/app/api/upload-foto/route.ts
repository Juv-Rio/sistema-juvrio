import { NextResponse } from 'next/server';
import { drive } from '@/services/googleDriveService';
import { Readable } from 'stream';

/**
 * Extrai o fileId de uma URL de foto do Google Drive.
 * Formatos suportados: uc?id=..., /d/..., file/d/..., thumbnail?id=...
 * Retorna null quando a URL não é do Drive ou não contém um ID válido.
 */
function extrairFileIdDoDrive(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) return null;

  const id = url.split('id=')[1]?.split('&')[0]
    || url.split('/d/')[1]?.split('/')[0]
    || '';

  return id || null;
}

export async function POST(request: Request) {
  try {
    const { fotoBase64, cpf, fotoAntigaUrl } = await request.json();
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

    // 3. Upload da nova foto para o Drive
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

    const novoFileId = response.data.id!;

    // 4. Remove a foto ANTIGA do Drive (evita acúmulo de arquivos órfãos).
    //    Roda DEPOIS do upload bem-sucedido e nunca derruba a operação:
    //    no pior caso sobra um arquivo órfão, nunca um usuário sem foto.
    const fileIdAntigo = extrairFileIdDoDrive(String(fotoAntigaUrl || ''));
    let fotoAntigaRemovida = false;

    if (fileIdAntigo && fileIdAntigo !== novoFileId) {
      try {
        await drive.files.delete({ fileId: fileIdAntigo });
        fotoAntigaRemovida = true;
      } catch (err: any) {
        // Arquivo já inexistente ou sem permissão: registra e segue.
        console.warn(`Não foi possível remover a foto antiga (${fileIdAntigo}):`, err.message);
      }
    }

    return NextResponse.json({
      fileId: novoFileId,
      fotoAntigaRemovida,
    });
  } catch (error: any) {
    console.error('Erro no Upload JUV-RIO:', error.message);
    return NextResponse.json({ error: 'Falha ao salvar foto no Google Drive.' }, { status: 500 });
  }
}