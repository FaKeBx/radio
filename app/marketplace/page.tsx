"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
  const [voices, setVoices] = useState<any[]>([]);

  useEffect(() => {
    // Busca do LocalStorage apenas no cliente
    const stored = localStorage.getItem('radio_voices');
    if (stored) {
      setVoices(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace de Vozes</h1>
          <p className="text-muted-foreground mt-1">
            Escolha um locutor e use sua voz clonada para criar seus próprios áudios.
          </p>
        </div>
        <Link href="/record">
          <Button variant="outline">Adicionar Minha Voz</Button>
        </Link>
      </div>

      {voices.length === 0 ? (
        <div className="text-center p-12 border rounded-xl bg-muted/30">
          <p className="text-muted-foreground mb-4">Nenhuma voz encontrada no Marketplace.</p>
          <Link href="/record">
            <Button>Seja o primeiro a gravar</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voices.map((voice: any) => (
            <div key={voice.id} className="border rounded-xl p-6 flex flex-col items-center text-center bg-card shadow-sm hover:shadow-md transition-shadow">
              <img src={voice.img} alt={voice.name} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-muted" />
              <h2 className="text-xl font-semibold">{voice.name}</h2>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p><span className="font-medium text-foreground">Gênero:</span> {voice.gender}</p>
                <p><span className="font-medium text-foreground">Estilo:</span> {voice.style}</p>
              </div>
              
              {voice.audioBase64 && (
                <div className="mt-4 w-full">
                  <audio controls src={voice.audioBase64} className="w-full h-8" />
                </div>
              )}

              <div className="mt-6 w-full">
                <Link href={`/studio?voiceId=${voice.id}`}>
                  <Button className="w-full">Usar Voz no Estúdio</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
