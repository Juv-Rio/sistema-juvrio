import { sheets } from '@/lib/google';

/**
 * Serviço responsável por todas as ações no Google Sheets
 */

// 1. Função para ADICIONAR dados (Logs e Usuários)
export async function adicionarLinha(spreadsheetId: string, range: string, valores: any[]) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: range, 
      valueInputOption: 'RAW',
      requestBody: {
        values: [valores],
      },
    });
  } catch (error) {
    console.error('Erro ao adicionar linha na planilha:', error);
    throw error;
  }
}

// 2. Função para LER dados (Setores e Funções)
export async function lerPlanilha(spreadsheetId: string, range: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });
    return response.data.values;
  } catch (error) {
    console.error('Erro ao ler planilha:', error);
    throw error;
  }
}