import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Package, ShoppingCart, Store } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/utils/roles";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Para sumar una opción: agregar un objeto acá. Los roles filtran qué ve cada usuario.
// Solo UX: la seguridad real está en el backend (authorizeRoles).
const MENU_ITEMS = [
  {
    label: "Caja",
    path: "/caja",
    icon: ShoppingCart,
    roles: [ROLES.ADMIN, ROLES.ENCARGADO, ROLES.CAJERO],
  },
  {
    label: "Inventario",
    path: "/inventario",
    icon: Package,
    roles: [ROLES.ADMIN, ROLES.ENCARGADO, ROLES.CAJERO],
  },
];

// Azul del mockup para el ítem activo
const ACTIVO =
  "data-[active=true]:bg-sky-700 data-[active=true]:text-white data-[active=true]:hover:bg-sky-800 data-[active=true]:hover:text-white";

export default function AppSidebar() {
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();

  const itemsVisibles = MENU_ITEMS.filter((item) =>
    item.roles.includes(user?.rol)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b px-4 group-data-[collapsible=icon]:px-4 bg-card">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-left">
          <Store className="size-5 shrink-0" />
          <span className="font-semibold truncate group-data-[collapsible=icon]:hidden">
            Kwik-E-Mart
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-card">
        <SidebarGroup>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {itemsVisibles.map(({ label, path, icon: Icon }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={label}
                    isActive={pathname.startsWith(path)}
                    className={ACTIVO}
                  >
                    <Link to={path}>
                      <Icon />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar sesión" onClick={logout}>
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">
                Cerrar sesión
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}