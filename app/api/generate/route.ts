import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Texto não fornecido' }, { status: 400 });
    }

    // 1. Obter o áudio de referência do locutor no banco local (data/voices.json)
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dataFilePath = path.join(process.cwd(), 'data', 'voices.json');
    const voicesData = await fs.readFile(dataFilePath, 'utf8').catch(() => '[]');
    const voices = JSON.parse(voicesData);
    
    const selectedVoice = voices.find((v: any) => v.id === voiceId);
    if (!selectedVoice || !selectedVoice.audioFile) {
      return NextResponse.json({ error: 'Locutor ou arquivo de áudio não encontrado' }, { status: 404 });
    }

    const audioFilePath = path.join(process.cwd(), 'public', 'uploads', selectedVoice.audioFile);
    const audioBuffer = await fs.readFile(audioFilePath);
    const refAudioBlob = new Blob([audioBuffer], { type: audioFilePath.endsWith('.webm') ? 'audio/webm' : 'audio/wav' });

    // 2. Montar FormData para enviar ao Colab
    const formData = new FormData();
    formData.append("text", text);
    formData.append("file", refAudioBlob, selectedVoice.audioFile); 

    // 3. Fazer POST para o endpoint público do ngrok rodando no Google Colab
    const colabUrl = "https://benmost-norman-ultrasonically.ngrok-free.dev/clone";
    console.log(`Chamando OmniVoice em ${colabUrl}...`);
    
    const colabResponse = await fetch(colabUrl, {
      method: "POST",
      body: formData,
    });

    if (!colabResponse.ok) {
      const errText = await colabResponse.text();
      console.error("Erro da API do OmniVoice:", errText);
      return NextResponse.json({ error: 'Falha no processamento pelo OmniVoice', details: errText }, { status: colabResponse.status });
    }

    // 4. Repassar o áudio de volta para o front-end
    const audioBlob = await colabResponse.blob();
    return new NextResponse(audioBlob, { 
      headers: { 
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="audio_gerado.wav"'
      } 
    });

  } catch (error) {
    console.error('Erro ao comunicar com o OmniVoice:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar voz.' }, { status: 500 });
  }
}
