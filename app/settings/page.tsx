"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Carrega a URL salva previamente no LocalStorage
    const storedUrl = localStorage.getItem("omnivoice_url");
    if (storedUrl) {
      setUrl(storedUrl);
    }
  }, []);

  const handleSave = () => {
    let finalUrl = url.trim();
    
    // Garante que a URL termine com /clone para funcionar com a API
    if (finalUrl && !finalUrl.endsWith("/clone")) {
      // Remove barra extra no final se tiver antes de adicionar /clone
      if (finalUrl.endsWith("/")) {
        finalUrl = finalUrl.slice(0, -1);
      }
      finalUrl += "/clone";
    }

    localStorage.setItem("omnivoice_url", finalUrl);
    setUrl(finalUrl);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Configure a conexão com a sua API do OmniVoice no Google Colab.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              URL Pública do Ngrok (Google Colab)
            </label>
            <input 
              type="text" 
              className="w-full p-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="Ex: https://abcde-12345.ngrok-free.dev"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Cole a URL gerada no seu notebook Python. A rota `/clone` será adicionada automaticamente.
            </p>
          </div>
          
          <Button onClick={handleSave} className="w-full" size="lg">
            {isSaved ? "Salvo com sucesso!" : "Salvar Configuração"}
          </Button>
        </div>
      </div>
    </div>
  );
}
