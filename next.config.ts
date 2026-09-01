import type { NextConfig } from "next";

// El backend vive en otro dominio (Render). Si el navegador le hablara
// directamente, la cookie de sesión sería una cookie de terceros y Safari,
// Firefox y Chrome en incógnito la bloquearían: el usuario iniciaría sesión
// y la API lo seguiría viendo como anónimo.
//
// Con este rewrite el navegador solo habla con el dominio del frontend y es
// Vercel quien reenvía a Render por detrás, así que la cookie se guarda como
// propia del sitio. Requiere que NEXT_PUBLIC_API_URL sea la ruta relativa
// "/api/v1" y que BACKEND_ORIGIN apunte al servicio de Render.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_ORIGIN) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_ORIGIN.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
