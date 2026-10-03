import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Package, ShoppingCart } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { ROLES } from "@/utils/roles";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
    label: "Productos",
    path: "/productos",
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
    <Sidebar>
      <SidebarHeader className="h-14 justify-center border-b px-4">
        <span className="font-medium">Kwik-E-Mart</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                      <span>{label}</span>
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
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}