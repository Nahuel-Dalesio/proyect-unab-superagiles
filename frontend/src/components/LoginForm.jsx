import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KwikEMartLogo } from "@/components/KwikEMartLogo";

export function LoginForm({ className, ...props }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Simulación de envío o lógica auth
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      setErrorMessage("Email o contraseña incorrectos");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div
        className={cn(
          "flex flex-col w-full max-w-[768px]",
          className,
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

            {/* Lado Derecho: Formulario alineado a frontend_v2 */}
            <div className="h-full flex items-center justify-center p-6 md:p-8">
              <form
                className="w-full max-w-[360px] flex flex-col gap-6"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold text-foreground">
                    Iniciar Sesión
                  </h1>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="email@ejemplo.com"
                    required
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
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="text-sm text-red-600">{errorMessage}</div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/85 shadow-lg shadow-accent/40"
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
