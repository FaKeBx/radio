"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function StudioContent() {
  const searchParams = useSearchParams();
  const voiceIdParam = searchParams.get("voiceId") || "1";
  
  const [voices, setVoices] = useState<any[]>([]);
  const [voiceId, setVoiceId] = useState(voiceIdParam);
  
  useEffect(() => {
    fetch('/api/voices')
      .then(res => res.json())
      .then(data => {
        setVoices(data);
        if (!data.find((v: any) => v.id === voiceIdParam) && data.length > 0) {
          setVoiceId(data[0].id);
        }
      });
  }, [voiceIdParam]);

  const selectedVoice = voices.find(v => v.id === voiceId) || voices[0];

  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;
    
    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice.id })
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar áudio");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar áudio. Verifique se o backend (OmniVoice) está rodando.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (voices.length === 0) {
    return <div className="p-8 text-center text-muted-foreground border rounded-xl bg-muted/20">Nenhuma voz disponível no Marketplace.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">O que o locutor deve dizer?</label>
          <textarea
            className="w-full min-h-[200px] p-4 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            placeholder="Digite o texto aqui (Ex: [laughter] Olá ouvintes da nossa rádio!)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex justify-between items-center">
            <select 
              className="p-2 border rounded-md bg-background text-sm"
              value={voiceId}
              onChange={e => setVoiceId(e.target.value)}
            >
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !text.trim()}
              className="w-full sm:w-auto ml-4"
            >
              {isGenerating ? "Gerando Áudio..." : "Gerar Áudio"}
            </Button>
          </div>
        </div>

        {audioUrl && (
          <div className="bg-card border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-semibold mb-4">Resultado</h3>
            <audio controls className="w-full" src={audioUrl}>
              Seu navegador não suporta o elemento de áudio.
            </audio>
            <div className="mt-4">
              <a href={audioUrl} download="audio_gerado.wav">
                <Button variant="outline" className="w-full">Baixar Áudio</Button>
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-muted/50 border rounded-xl p-6">
          <h3 className="font-semibold mb-4 text-lg">Voz Selecionada</h3>
          {selectedVoice && (
            <div className="flex items-center gap-4">
              <img src={selectedVoice.img} className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover" alt="" />
              <div>
                <p className="font-medium">{selectedVoice.name}</p>
                <p className="text-xs text-muted-foreground">{selectedVoice.style}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm text-sm">
          <h3 className="font-semibold mb-2">Dicas do OmniVoice</h3>
          <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
            <li>Você pode inserir emoções como <code className="bg-muted px-1 rounded">[laughter]</code> ou <code className="bg-muted px-1 rounded">[sigh]</code> no meio do texto.</li>
            <li>Para pausas, use pontuação adequada.</li>
            <li>A clonagem de voz mantém o sotaque e o timbre do locutor original.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Estúdio de Criação</h1>
        <p className="text-muted-foreground mt-1">
          Gere áudios usando a voz do locutor escolhido.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center">Carregando estúdio...</div>}>
        <StudioContent />
      </Suspense>
    </div>
  );
}
