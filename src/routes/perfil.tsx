import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cargarPerfil, guardarPerfil, personaVacia, type Perfil, type Persona } from "@/lib/sos";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mis datos — SOS Radio" },
      { name: "description", content: "Cargá tu información personal y la de tu grupo familiar." },
      { property: "og:title", content: "Mis datos — SOS Radio" },
      { property: "og:description", content: "Información personal y familiar para emergencias." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerfilPage,
});

function Campo({ label, value, onChange, ph }: { label: string; value: string; onChange: (v: string) => void; ph?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input className="field" value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function PersonaForm({ p, onChange, onRemove }: { p: Persona; onChange: (p: Persona) => void; onRemove?: () => void }) {
  const set = (k: keyof Persona) => (v: string) => onChange({ ...p, [k]: v });
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{p.parentesco || "Familiar"}</span>
        {onRemove && <button onClick={onRemove} className="text-xs text-destructive">Quitar</button>}
      </div>
      {onRemove && <Campo label="Parentesco" value={p.parentesco} onChange={set("parentesco")} ph="Hijo/a, pareja…" />}
      <Campo label="Nombre completo" value={p.nombre} onChange={set("nombre")} />
      <div className="grid grid-cols-3 gap-2">
        <Campo label="DNI" value={p.documento} onChange={set("documento")} />
        <Campo label="Edad" value={p.edad} onChange={set("edad")} />
        <Campo label="Sangre" value={p.sangre} onChange={set("sangre")} ph="0+" />
      </div>
      <Campo label="Condiciones / medicación" value={p.condiciones} onChange={set("condiciones")} ph="Diabetes, movilidad reducida…" />
    </div>
  );
}

function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [ok, setOk] = useState(false);
  useEffect(() => setPerfil(cargarPerfil()), []);
  if (!perfil) return null;

  const upd = (p: Partial<Perfil>) => { setOk(false); setPerfil({ ...perfil, ...p }); };

  return (
    <main className="mx-auto max-w-md space-y-5 px-5 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground">← SOS</Link>
        <h1 className="font-display text-2xl tracking-wide">MIS DATOS</h1>
        <span className="w-10" />
      </header>

      <PersonaForm p={perfil.titular} onChange={(titular) => upd({ titular })} />

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Campo label="Dirección" value={perfil.direccion} onChange={(direccion) => upd({ direccion })} />
        <Campo label="Teléfono de contacto" value={perfil.telefono} onChange={(telefono) => upd({ telefono })} />
        <Campo label="Frecuencia de transmisión (MHz)" value={perfil.frecuencia} onChange={(frecuencia) => upd({ frecuencia })} />
      </div>

      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Grupo familiar</h2>
      {perfil.familia.map((f, i) => (
        <PersonaForm
          key={f.id}
          p={f}
          onChange={(np) => upd({ familia: perfil.familia.map((x, j) => (j === i ? np : x)) })}
          onRemove={() => upd({ familia: perfil.familia.filter((_, j) => j !== i) })}
        />
      ))}
      <button onClick={() => upd({ familia: [...perfil.familia, personaVacia()] })} className="w-full rounded-xl border border-dashed border-border py-3 text-sm">
        + Agregar familiar
      </button>

      <div className="fixed inset-x-0 bottom-0 bg-background/90 p-4 backdrop-blur">
        <button
          onClick={() => { guardarPerfil(perfil); setOk(true); }}
          className="mx-auto block w-full max-w-md rounded-xl bg-primary py-4 font-semibold text-primary-foreground"
        >
          {ok ? "✓ Guardado en el dispositivo" : "Guardar"}
        </button>
      </div>
    </main>
  );
}
