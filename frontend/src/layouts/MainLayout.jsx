import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { CircleUser, ShoppingCart } from "lucide-react";
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

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
            <SidebarTrigger />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                <span>{user?.username}</span>
                <CircleUser className="size-4" />
              </div>
              <Button variant="ghost" size="icon" aria-label="Carrito">
                <ShoppingCart />
              </Button>
            </div>
          </header>

          <div className="flex-1 bg-muted/40 p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}