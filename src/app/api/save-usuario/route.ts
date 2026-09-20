import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

    if (!spreadsheetId) {
      throw new Error("A variável GOOGLE_SHEETS_USERS_ID não foi encontrada no .env.local");
    }

    // 1. Validação de Duplicidade (CPF e E-mail)
    const checkResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!C:D',
    });

    const rows = checkResponse.data.values || [];
    const cpfLimpo = body.cpf.replace(/\D/g, '');
    
    // Verifica se já existe o e-mail ou CPF (pulando o cabeçalho)
    const emailExistente = rows.some((row, index) => index > 0 && row[0] === body.email);
    const cpfExistente = rows.some((row, index) => index > 0 && row[1]?.replace(/\D/g, '') === cpfLimpo);

    if (cpfExistente) {
      return NextResponse.json({ error: 'Este CPF já está registrado no sistema.' }, { status: 400 });
    }

    if (emailExistente) {
      return NextResponse.json({ error: 'Este e-mail institucional já está em uso.' }, { status: 400 });
    }

    // 2. Criptografia da Senha (Hash)
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(body.senha, saltRounds);

    // 3. Lógica do Link da Foto (Coluna Q) - Mantendo o Link Cru (Raw)
    const fotoUrlSegura = String(body.fotoUrl || '');
    const fotoValue = fotoUrlSegura.startsWith('http') 
      ? fotoUrlSegura 
      : (fotoUrlSegura ? `https://drive.google.com/uc?id=${fotoUrlSegura}` : '');

    // 4. Fuso Horário de Brasília para Timestamps
    const agora = new Date();
    const dataBr = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const timestampBr = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // 5. Gerar ID Sequencial
    const idResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:A',
    });
    const rowsA = idResponse.data.values || [];
    const proximoId = rowsA.length.toString().padStart(4, '0');

    // 6. Linha Final (21 colunas - Status na Coluna U / Índice 20)
    const novaLinha = [
      proximoId,          // A (0)
      body.nome,          // B (1)
      body.email,         // C (2)
      body.cpf,           // D (3)
      body.setor,         // E (4)
      body.funcao,        // F (5)
      body.telefone,      // G (6)
      body.cep,           // H (7)
      body.logradouro,    // I (8)
      body.numero,        // J (9)
      body.bairro,        // K (10)
      body.cidade,        // L (11)
      body.complemento,   // M (12)
      body.pontoReferencia, // N (13)
      body.dataNascimento, // O (14)
      body.instagram,     // P (15)
      fotoValue,          // Q (16)
      senhaCriptografada, // R (17)
      dataBr,             // S (18)
      timestampBr,        // T (19)
      'PENDENTE'          // U (20) - Status Fixo para novos usuários
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Usuarios!A:U',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [novaLinha] },
    });

    return NextResponse.json({ success: true, id: proximoId });
  } catch (error: any) {
    console.error('Erro no servidor JUV-RIO:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}