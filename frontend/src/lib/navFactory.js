export function createNav(viewerType) {
  if (viewerType === "student") {
    return [
      { label: "Mis Cursos", href: "/courses", active: true },
      { label: "Progreso", href: "/progreso" },
      { label: "Perfil", href: "/perfil" },
    ];
  }

  if (viewerType === "admin") {
    return [
      { label: "Cursos", href: "/courses", active: true },
      { label: "Estudiantes", href: "/estudiantes" },
      { label: "Métricas", href: "/metricas" },
      { label: "Configuración de Perfil", href: "/configuracion" },
    ];
  }

  return [];
}
