import { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { CircleUser, Moon, ShoppingCart, Sun } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function MainLayout() {
  const { user } = useContext(AuthContext);
  const [modoOscuro, setModoOscuro] = useState(() => {
    const guardado = localStorage.getItem("kiosco_theme");
    return (
      guardado === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });

  const alternarTema = () => {
    setModoOscuro((prev) => {
      const nuevoEstado = !prev;
      if (nuevoEstado) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("kiosco_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("kiosco_theme", "light");
      }
      return nuevoEstado;
    });
  };

  return (
    <TooltipProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset className="h-svh min-w-0 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-3 sm:px-4">
            <SidebarTrigger />

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={alternarTema}
                aria-label={
                  modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
                title={
                  modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
                className="cursor-pointer"
              >
                {modoOscuro ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>

              <div className="flex items-center gap-2 rounded-md border px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm max-w-[150px] sm:max-w-none">
                <span className="truncate">{user?.username}</span>
                <CircleUser className="size-4 shrink-0" />
              </div>

              <Button variant="ghost" size="icon" aria-label="Carrito">
                <ShoppingCart />
              </Button>
            </div>
          </header>

          <div className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden bg-muted/40 p-3 sm:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
