import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-background text-foreground p-8 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Bem-vindo ao <span className="text-primary">RadioVoice</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-[600px] mb-8">
        Uma plataforma onde locutores podem clonar suas vozes e usuários de rádio podem criar áudios incríveis com as vozes disponíveis no Marketplace.
      </p>
      
      <div className="flex gap-4 flex-col sm:flex-row">
        <Link href="/marketplace">
          <Button size="lg" className="w-full sm:w-auto">Explorar Marketplace</Button>
        </Link>
        <Link href="/record">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">Sou Locutor: Gravar Voz</Button>
        </Link>
      </div>
    </div>
  );
}
