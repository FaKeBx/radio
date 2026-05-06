import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 max-w-7xl mx-auto overflow-x-auto">
        <div className="flex items-center w-full">
          <Link href="/" className="mr-4 md:mr-6 flex items-center space-x-2 shrink-0">
            <span className="font-bold sm:inline-block">
              RadioVoice
            </span>
          </Link>
          <nav className="flex items-center space-x-4 md:space-x-6 text-sm font-medium whitespace-nowrap">
            <Link
              href="/marketplace"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Marketplace
            </Link>
            <Link
              href="/record"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Gravar Voz
            </Link>
            <Link
              href="/studio"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Estúdio
            </Link>
            <Link
              href="/settings"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Configurações
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}
