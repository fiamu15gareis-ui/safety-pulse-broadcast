export type Persona = {
  id: string;
  nombre: string;
  documento: string;
  edad: string;
  sangre: string;
  condiciones: string;
  parentesco: string;
};

export type Servicio = "bomberos" | "hospital" | "policia";

export const SERVICIOS: Record<Servicio, { nombre: string; frecuencia: string }> = {
  bomberos: { nombre: "Bomberos", frecuencia: "152.360" },
  hospital: { nombre: "Hospital", frecuencia: "149.870" },
  policia: { nombre: "Policía", frecuencia: "148.375" },
};

export type Perfil = {
  titular: Persona;
  direccion: string;
  telefono: string;
  familia: Persona[];
  servicio: Servicio;
};

const KEY = "sos-perfil-v2";

export const personaVacia = (parentesco = ""): Persona => ({
  id: Math.random().toString(36).slice(2),
  nombre: "",
  documento: "",
  edad: "",
  sangre: "",
  condiciones: "",
  parentesco,
});

export function perfilVacio(): Perfil {
  return {
    titular: personaVacia("Titular"),
    direccion: "",
    telefono: "",
    familia: [],
    servicio: "bomberos",
  };
}

export function cargarPerfil(): Perfil {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...perfilVacio(), ...JSON.parse(raw) } : perfilVacio();
  } catch {
    return perfilVacio();
  }
}

export function guardarPerfil(p: Perfil) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

/** Arma el paquete a transmitir. Sin conectividad, solo coordenadas. */
export function armarPaquete(
  perfil: Perfil,
  coords: { lat: number; lon: number } | null,
  conectado: boolean,
) {
  const pos = coords ? `${coords.lat.toFixed(5)},${coords.lon.toFixed(5)}` : "SIN_GPS";
  const servicio = SERVICIOS[perfil.servicio];
  if (!conectado) return `SOS|${servicio.frecuencia}|${pos}`;
  const personas = [perfil.titular, ...perfil.familia]
    .map((p) => `${p.nombre};${p.edad};${p.sangre};${p.condiciones}`)
    .join("/");
  return `SOS|${servicio.frecuencia}|${pos}|${perfil.telefono}|${perfil.direccion}|${personas}`;
}
