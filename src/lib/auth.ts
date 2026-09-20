import bcrypt from 'bcryptjs';

// Transforma a senha em um código seguro (Hash)
export async function hashPassword(senha: string) {
  const salt = await bcrypt.genSalt(10); // Adiciona um "tempero" aleatório para segurança extra
  return await bcrypt.hash(senha, salt);
}

// Compara a senha digitada com o código salvo na planilha
export async function verificarSenha(senhaDigitada: string, senhaSalva: string) {
  return await bcrypt.compare(senhaDigitada, senhaSalva);
}