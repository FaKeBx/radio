import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'voices.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function getVoices() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Retorna array vazio se não existir
    return [];
  }
}

export async function GET() {
  const voices = await getVoices();
  return NextResponse.json(voices);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const name = formData.get('name') as string;
    const style = formData.get('style') as string;

    if (!file || !name) {
      return NextResponse.json({ error: 'Faltam dados.' }, { status: 400 });
    }

    // Certifique-se de que o diretório de uploads existe
    await fs.mkdir(uploadsDir, { recursive: true });

    // Crie um nome único
    const id = Date.now().toString();
    const fileExtension = file.type === 'audio/webm' ? '.webm' : '.wav'; // fallback
    const fileName = `voice_${id}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Salva o arquivo localmente
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Cria o novo registro
    const newVoice = {
      id,
      name,
      gender: "Não especificado", // Pode adicionar no form se quiser
      style: style || "Geral",
      img: `https://i.pravatar.cc/150?u=${id}`,
      audioFile: fileName
    };

    // Lê os existentes e adiciona o novo
    const voices = await getVoices();
    voices.push(newVoice);

    // Salva o JSON
    await fs.writeFile(dataFilePath, JSON.stringify(voices, null, 2));

    return NextResponse.json({ success: true, voice: newVoice });
  } catch (error) {
    console.error("Erro ao salvar voz:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
