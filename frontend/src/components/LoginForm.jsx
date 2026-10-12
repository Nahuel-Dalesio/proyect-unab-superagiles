import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KwikEMartLogo } from "@/components/KwikEMartLogo";
import { AuthContext } from "@/context/AuthContext";
import { loginRequest } from "@/service/auth.service";

export function LoginForm({ className, ...props }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Por favor ingresá tu usuario y contraseña.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const data = await loginRequest(username.trim(), password);

      if (!data?.user?.rol || !data?.token) {
        setErrorMessage("Respuesta inválida del servidor. Contactá al administrador.");
        return;
      }

      login(data.user, data.token);
      navigate("/caja");
    } catch (error) {
      setErrorMessage(
        error.status
          ? error.message
          : "Error de conexión con el servidor. Verificá que el backend esté corriendo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div
        className={cn(
          "flex flex-col w-full max-w-[768px]",
          className
        )}
        {...props}
      >
        <Card className="overflow-hidden relative h-auto md:h-[447px] w-full">
          <CardContent className="grid md:grid-cols-2 h-full p-0">
            {/* Lado Izquierdo: Banner de marca Kwik-E-Mart */}
            <div className="bg-accent flex flex-col justify-center items-center gap-y-4 h-full p-8 text-center shadow-card">
              <KwikEMartLogo className="w-48 h-auto drop-shadow-lg" />
              <h2 className="text-lg font-semibold text-white mt-2">
                Sistema Integral de Gestión
              </h2>
              <p className="text-xs text-sky-100 opacity-90 max-w-xs">
                Punto de Venta e Inventario Springfield. Acceso centralizado
                para administradores y cajeros.
              </p>
            </div>

            {/* Lado Derecho: Formulario conectado al Backend */}
            <div className="h-full flex p-6 md:p-8">
              <form
                className="w-full max-w-[360px] flex flex-col gap-4"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-foreground mt-6">
                    Iniciar Sesión
                  </h1>
                </div>

                <div className="flex flex-col gap-6 mt-10">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      className="border border-border bg-input"
                      id="username"
                      type="text"
                      name="username"
                      placeholder="Ej: admin o cajero1"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Contraseña</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm text-muted-foreground underline-offset-2 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <Input
                      className="border border-border bg-input text-input-placeholder"
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-sm font-medium text-destructive mt-2">
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/85 shadow-lg mt-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LoginForm;
