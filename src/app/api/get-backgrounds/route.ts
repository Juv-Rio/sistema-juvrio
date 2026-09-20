import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const bgDir = path.join(process.cwd(), 'public', 'backgrounds');
    if (!fs.existsSync(bgDir)) return NextResponse.json({ backgrounds: [] });

    const files = fs.readdirSync(bgDir);
    const bgFiles = files
      .filter(file => /\.(png|jpe?g|webp)$/i.test(file))
      .map(file => `/backgrounds/${file}`);

    return NextResponse.json({ backgrounds: bgFiles });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar fundos' }, { status: 500 });
  }
}