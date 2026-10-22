import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const items = [
  { label: "DNI", value: "dni" },
  { label: "CUIT", value: "cuit" },
];

export default function RegistroCliente() {
  return (
    <div className="flex flex-col gap-4 py-1 pb-4">
      <div className="flex justify-between gap-2">
        <div className="w-full">
          <Label className="mb-1 block">Nombre</Label>
          <Input className="border border-border bg-input" />
        </div>
        <div className="w-full">
          <Label className="mb-1 block">Apellido</Label>
          <Input className="border border-border bg-input" />
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className="w-full max-w-[151px] shrink-0">
          <Select>
            <SelectTrigger className="w-full border border-border bg-input">
              <SelectValue placeholder="Documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Documentos</SelectLabel>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-0">
          <Input
            className="border border-border bg-input"
            placeholder="Ej: 12131415"
          />
        </div>
        <div className="flex gap-2 items-center max-w-[151px] shrink-0">
          <Checkbox
            id="registrar-cliente"
            className="border-border data-checked:bg-accent data-checked:border-accent"
          />
          <Label htmlFor="registrar-cliente" className="whitespace-nowrap cursor-pointer">
            Registrar Cliente
          </Label>
        </div>
      </div>
    </div>
  );
}