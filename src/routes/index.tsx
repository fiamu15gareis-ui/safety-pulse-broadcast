import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { armarPaquete, cargarPerfil, type Perfil } from "@/lib/sos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOS Radio — Botón de emergencia" },
      { name: "description", content: "Envía tus datos y ubicación a servicios de emergencia por radio." },
      { property: "og:title", content: "SOS Radio — Botón de emergencia" },
      { property: "og:description", content: "Transmite tu ubicación y datos familiares en una catástrofe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Emergencia,
});

type Estado = "listo" | "ubicando" | "enviando" | "enviado";

function Emergencia() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [online, setOnline] = useState(true);
  const [estado, setEstado] = useState<Estado>("listo");
  const [paquete, setPaquete] = useState("");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    setPerfil(cargarPerfil());
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const add = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString()} · ${m}`, ...l]);

  const disparar = () => {
    if (!perfil) return;
    setEstado("ubicando");
    setLog([]);
    add("Obteniendo coordenadas GPS…");
    const seguir = (coords: { lat: number; lon: number } | null) => {
      const pkt = armarPaquete(perfil, coords, online);
      setPaquete(pkt);
      setEstado("enviando");
      add(online ? "Con conectividad: paquete completo" : "Sin conectividad: solo coordenadas");
      add("Conectando con transmisor (Bluetooth, simulado)…");
      setTimeout(() => add(`Transmitiendo en ${perfil.frecuencia} MHz…`), 900);
      setTimeout(() => {
        add(`Enviado (${pkt.length} bytes)`);
        setEstado("enviado");
      }, 2000);
    };
    if (!navigator.geolocation) return seguir(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        add(`GPS: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`);
        seguir({ lat: p.coords.latitude, lon: p.coords.longitude });
      },
      () => {
        add("GPS no disponible");
        seguir(null);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const activo = estado === "ubicando" || estado === "enviando";
  const sinDatos = perfil && !perfil.titular.nombre;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide">SOS RADIO</h1>
        <Link to="/perfil" className="rounded-full border border-border px-4 py-2 text-sm">
          Mis datos
        </Link>
      </header>

      <div className="mt-4 flex gap-2 text-xs">
        <span className={`chip ${online ? "chip-ok" : "chip-warn"}`}>
          {online ? "● Con conectividad" : "● Sin señal"}
        </span>
        <span className="chip">📻 {perfil?.frecuencia ?? "—"} MHz</span>
      </div>

      {sinDatos && (
        <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Todavía no cargaste tus datos.{" "}
          <Link to="/perfil" className="text-primary underline">Completalos ahora</Link>.
        </p>
      )}

      <div className="flex flex-1 items-center justify-center py-10">
        <button
          onClick={disparar}
          disabled={activo}
          className={`sos-button ${activo ? "sos-active" : ""}`}
          aria-label="Botón de emergencia"
        >
          <span className="font-display text-6xl">SOS</span>
          <span className="mt-1 text-sm opacity-90">
            {estado === "listo" && "Presioná para transmitir"}
            {estado === "ubicando" && "Ubicando…"}
            {estado === "enviando" && "Transmitiendo…"}
            {estado === "enviado" && "Enviado · tocar para repetir"}
          </span>
        </button>
      </div>

      {paquete && (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Paquete</h2>
          <code className="mt-2 block break-all font-mono text-xs text-primary">{paquete}</code>
          <ul className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
            {log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
