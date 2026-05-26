import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="block w-8 h-[2px] bg-coral" />
          <span className="font-heading text-lg leading-none">
            Happy Property <span className="text-coral">Decks</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-coral transition">
            Projekte
          </Link>
          <span className="text-muted-foreground hidden sm:inline">
            {user.email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
