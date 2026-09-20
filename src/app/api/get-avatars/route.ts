import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    
    // Se a pasta não existir, retorna lista vazia
    if (!fs.existsSync(avatarsDir)) {
      return NextResponse.json({ avatars: [] });
    }

    const files = fs.readdirSync(avatarsDir);
    
    // Filtra apenas arquivos de imagem e ordena para manter a ordem numérica/alfabética
    const avatarFiles = files
      .filter(file => /\.(png|jpe?g|svg|webp)$/i.test(file))
      .sort((a, b) => a.localeCompare(undefined, {numeric: true, sensitivity: 'base'}))
      .map(file => `/avatars/${file}`);

    return NextResponse.json({ avatars: avatarFiles });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar avatares' }, { status: 500 });
  }
}