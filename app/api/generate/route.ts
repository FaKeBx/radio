import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, voiceId, audioBase64, colabUrl } = await request.json();

    if (!text || !audioBase64 || !colabUrl) {
      return NextResponse.json({ error: 'Texto, áudio ou URL do Colab ausentes' }, { status: 400 });
    }

    // 1. Converter Base64 do LocalStorage de volta para Buffer/Blob
    const base64Data = audioBase64.split(';base64,').pop();
    const audioBuffer = Buffer.from(base64Data, 'base64');
    
    // O tipo MIME geralmente está na primeira parte, ex: "data:audio/webm;base64,..."
    const mimeMatch = audioBase64.match(/data:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';

    const refAudioBlob = new Blob([audioBuffer], { type: mimeType });

    // 2. Montar FormData para enviar ao Colab
    const formData = new FormData();
    formData.append("text", text);
    formData.append("file", refAudioBlob, `voice_${voiceId}.webm`); 

    // 3. Fazer POST para o endpoint público do ngrok rodando no Google Colab
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
