export type Persona = {
  id: string;
  nombre: string;
  documento: string;
  edad: string;
  sangre: string;
  condiciones: string;
  parentesco: string;
};

export type Perfil = {
  titular: Persona;
  direccion: string;
  telefono: string;
  familia: Persona[];
  frecuencia: string;
};

const KEY = "sos-perfil-v1";

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
    frecuencia: "146.520",
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
  if (!conectado) return `SOS|${pos}`;
  const personas = [perfil.titular, ...perfil.familia]
    .map((p) => `${p.nombre};${p.edad};${p.sangre};${p.condiciones}`)
    .join("/");
  return `SOS|${pos}|${perfil.telefono}|${perfil.direccion}|${personas}`;
}
