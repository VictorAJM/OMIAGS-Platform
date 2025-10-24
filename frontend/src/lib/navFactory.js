export function createNav(viewerType) {
  if (viewerType === "student") {
    return [
      { label: "Mis Cursos", href: "/cursos", active: true },
      { label: "Progreso", href: "/progreso" },
      { label: "Perfil", href: "/perfil" },
    ];
  }

  if (viewerType === "admin") {
    return [
      { label: "Cursos", href: "/adminCursos", active: true },
      { label: "Estudiantes", href: "/adminEstudiantes" },
      { label: "Métricas", href: "/adminMetricas" },
      { label: "Configuración de Perfil", href: "/adminPerfil" },
    ];
  }

  return [];
}
