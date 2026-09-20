export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  cpf: string;
  setor: string;
  funcao: string;
  telefone: string;
  // Endereço detalhado
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  pontoReferencia?: string; // NOVO CAMPO
  // Social e Foto
  dataNascimento: string;
  instagram: string;
  fotoUrl?: string;
  senha?: string;
  dataCadastro?: string;
  timestamp?: number;
}