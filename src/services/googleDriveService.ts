import { google } from 'googleapis';

// Configuramos o cliente OAuth2 usando as variáveis que você já tem no .env.local
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Exportamos os operários autenticados
export const drive = google.drive({ version: 'v3', auth: oauth2Client });
export const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

// Sua função de upload que já funciona (ajustada para usar o oauth2Client)
export async function uploadArquivo(file: Buffer, fileName: string, mimeType: string, folderId: string) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: mimeType,
        body: require('stream').Readable.from(file),
      },
      fields: 'id',
    });
    return response.data.id;
  } catch (error) {
    console.error('Erro no upload para o Drive:', error);
    throw error;
  }
}