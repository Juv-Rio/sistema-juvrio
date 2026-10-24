import { NextResponse } from 'next/server';
import { sheets } from '@/services/googleDriveService';
import bcrypt from 'bcryptjs';

const spreadsheetId = process.env.GOOGLE_SHEETS_USERS_ID;

// Colunas que o próprio usuário NUNCA pode alterar (identidade e privilégios)
const COLUNAS_BLOQUEADAS = [
  'ID', 'NOME', 'EMAIL', 'CPF', 'SETOR', 'FUNÇÃO', 'FUNCAO',
  'STATUS', 'ADMIN', 'MASTER', 'LANDING PRIMÁRIA', 'SENHA', 'FOTO URL',
];

// Campos de contato/endereço que o usuário pode editar livremente
const CAMPOS_EDITAVEIS = [
  'Telefone', 'CEP', 'Logradouro', 'Número', 'Bairro', 'Cidade',
  'Complemento', 'Ponto de Referência', 'Data de Nascimento', 'Instagram',
];

function normaliza(valor: any): string {
  return String(valor).trim().toUpperCase();
}

function columnToLetter(columnNumber: number): string {
  let letter = '';
  let num = columnNumber;
  while (num > 0) {
    const resto = (num - 1) % 26;
    letter = String.fromCharCode(65 + resto) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, campos, senhaAtual, senhaNova, novaFotoId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    // 1. Leitura única: cabeçalhos + linha do usuário
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:ZZ',
    });
    const rows = response.data.values || [];
    const headers: any[] = rows[0] || [];

    const rowIndex = rows.findIndex(row => row[0] === id) + 1;
    if (rowIndex === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const rowAtual = rows[rowIndex - 1] || [];

    // 2. Mapa cabeçalho normalizado -> índice real na planilha
    const idxPorColuna: Record<string, number> = {};
    headers.forEach((h, i) => {
      if (h) idxPorColuna[normaliza(h)] = i;
    });

    // 3. Validação de unicidade: Telefone e Instagram (ignorando a própria linha)
    if (campos && typeof campos === 'object') {
      const verificacoes: Array<{ campo: string; rotulo: string }> = [
        { campo: 'TELEFONE', rotulo: 'telefone' },
        { campo: 'INSTAGRAM', rotulo: 'Instagram' },
      ];

      for (const { campo, rotulo } of verificacoes) {
        const idx = idxPorColuna[campo];
        const novoValor = String(campos[campo === 'TELEFONE' ? 'Telefone' : 'Instagram'] || '').trim();
        if (idx === undefined || !novoValor) continue;

        const conflito = rows.slice(1).some((linha, i) => {
          const numeroLinha = i + 2; // +1 cabeçalho, +1 base 1-based
          if (numeroLinha === rowIndex) return false; // ignora o próprio usuário
          return String(linha[idx] || '').trim() === novoValor;
        });

        if (conflito) {
          return NextResponse.json(
            { error: `Este ${rotulo} já está em uso por outro usuário.` },
            { status: 400 }
          );
        }
      }
    }

    // 4. Monta os updates cirúrgicos (apenas células que mudaram)
    const updates: Array<{ range: string; values: string[][] }> = [];

    if (campos && typeof campos === 'object') {
      for (const nomeCampo of Object.keys(campos)) {
        const idx = idxPorColuna[normaliza(nomeCampo)];
        if (idx === undefined) continue; // coluna inexistente: ignora em silêncio
        if (COLUNAS_BLOQUEADAS.includes(normaliza(nomeCampo))) continue; // trava de segurança

        const letra = columnToLetter(idx + 1);
        updates.push({
          range: `Usuarios!${letra}${rowIndex}`,
          values: [[String(campos[nomeCampo] ?? '')]],
        });
      }
    }

    // 5. Troca de foto: grava o novo link na coluna Q
    if (novaFotoId) {
      const idxFoto = idxPorColuna['FOTO URL'] ?? idxPorColuna['FOTO'] ?? 16;
      const letra = columnToLetter(idxFoto + 1);
      updates.push({
        range: `Usuarios!${letra}${rowIndex}`,
        values: [[`https://drive.google.com/uc?id=${novaFotoId}`]],
      });
    }

    // 6. Troca de senha: SÓ se a senha atual estiver correta. Campo vazio = ignora.
    if (senhaNova) {
      if (!senhaAtual) {
        return NextResponse.json(
          { error: 'Informe a senha atual para alterar a senha.' },
          { status: 400 }
        );
      }

      const idxSenha = idxPorColuna['SENHA'];
      if (idxSenha === undefined) {
        return NextResponse.json(
          { error: 'Coluna de senha não encontrada na planilha.' },
          { status: 500 }
        );
      }

      const hashAtual = String(rowAtual[idxSenha] || '');
      const senhaConfere = await bcrypt.compare(senhaAtual, hashAtual);

      if (!senhaConfere) {
        return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 });
      }

      const novoHash = await bcrypt.hash(senhaNova, 10);
      const letra = columnToLetter(idxSenha + 1);
      updates.push({
        range: `Usuarios!${letra}${rowIndex}`,
        values: [[novoHash]],
      });
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true, alteracoes: 0 });
    }

    // 7. Uma única chamada de batchUpdate para todas as células alteradas
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    return NextResponse.json({ success: true, alteracoes: updates.length });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error.message);
    return NextResponse.json({ error: 'Falha ao salvar alterações do perfil.' }, { status: 500 });
  }
}