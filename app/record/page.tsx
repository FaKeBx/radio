"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Upload } from "lucide-react";

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioUrl(null);
      setAudioBlob(null);
    } catch (err) {
      console.error("Erro ao acessar microfone", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handlePublish = async () => {
    if (!audioBlob || !name.trim()) {
      alert("Preencha o nome e grave um áudio.");
      return;
    }
    
    setIsPublishing(true);
    
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("name", name);
    formData.append("style", style);

    try {
      const response = await fetch("/api/voices", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar");
      }

      alert("Voz enviada com sucesso para o Marketplace!");
      // Limpa tudo
      setAudioUrl(null);
      setAudioBlob(null);
      setName("");
      setStyle("");
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar voz.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Painel do Locutor</h1>
        <p className="text-muted-foreground mt-1">
          Grave uma amostra da sua voz para disponibilizá-la no Marketplace. O modelo OmniVoice requer cerca de 5 a 10 segundos de áudio claro.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-8">
          
          <div className="relative flex items-center justify-center w-48 h-48 rounded-full bg-muted border-4 border-dashed border-primary/20">
            {isRecording ? (
              <div className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
            ) : null}
            <Mic className={`w-16 h-16 ${isRecording ? "text-red-500" : "text-muted-foreground"}`} />
          </div>

          <div className="flex gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8">
                Gravar Voz
              </Button>
            ) : (
              <Button onClick={stopRecording} size="lg" variant="outline" className="rounded-full px-8 border-red-500 text-red-500 hover:bg-red-50">
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            )}
          </div>

          {audioUrl && (
            <div className="w-full max-w-md mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Amostra Gravada</p>
                <audio controls src={audioUrl} className="w-full" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome Artístico</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 rounded border bg-background" 
                    placeholder="Ex: Felipe Locutor"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estilo da Voz</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 rounded border bg-background" 
                    placeholder="Ex: Comercial, Jornalismo, Animado..." 
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                  />
                </div>
                <Button onClick={handlePublish} className="w-full" size="lg" disabled={isPublishing}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isPublishing ? "Publicando..." : "Publicar no Marketplace"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
