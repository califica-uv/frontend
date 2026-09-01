// Datos académicos reales de la Universidad del Valle, tomados de
// univalle.edu.co y de los sitios de cada facultad (septiembre de 2026).
//
// Se usan como SUGERENCIAS, nunca como lista cerrada: el campo de
// departamento es libre y opcional, así que si alguien pertenece a una
// unidad que no está aquí puede escribirla igual. Ampliar esta lista no
// requiere tocar el backend.

/** Las 10 facultades de la Universidad del Valle. */
export const UNIVALLE_FACULTIES = [
  "Facultad de Artes Integradas",
  "Facultad de Ciencias de la Administración",
  "Facultad de Ciencias Naturales y Exactas",
  "Facultad de Ciencias Sociales y Económicas",
  "Facultad de Derecho y Ciencia Política",
  "Facultad de Educación y Pedagogía",
  "Facultad de Humanidades",
  "Facultad de Ingeniería",
  "Facultad de Psicología",
  "Facultad de Salud",
] as const;

/**
 * Escuelas y departamentos académicos. Es lo que un estudiante suele decir
 * cuando le preguntan de dónde es un profe ("es de Sistemas", "de Matemáticas"),
 * mucho más que el nombre de la facultad.
 *
 * Ingeniería, Ciencias y Humanidades están completas según el sitio de cada
 * facultad. Salud está parcial: su página devolvió una lista mezclada con
 * unidades de otras facultades, así que aquí solo quedaron las verificables.
 */
export const UNIVALLE_SCHOOLS = [
  // Ingeniería
  "Escuela de Estadística",
  "Escuela de Ingeniería Civil y Geomática",
  "Escuela de Ingeniería de Alimentos",
  "Escuela de Ingeniería de Materiales",
  "Escuela de Ingeniería de Recursos Naturales y del Ambiente",
  "Escuela de Ingeniería de Sistemas y Computación",
  "Escuela de Ingeniería Eléctrica y Electrónica",
  "Escuela de Ingeniería Industrial",
  "Escuela de Ingeniería Mecánica",
  "Escuela de Ingeniería Química",
  // Ciencias Naturales y Exactas
  "Departamento de Biología",
  "Departamento de Física",
  "Departamento de Matemáticas",
  "Departamento de Química",
  // Humanidades
  "Escuela de Ciencias del Lenguaje",
  "Escuela de Estudios Literarios",
  "Escuela de Filosofía",
  "Escuela de Geografía",
  "Escuela de Historia",
  "Escuela de Trabajo Social y Desarrollo Humano",
  // Salud
  "Escuela de Bacteriología y Laboratorio Clínico",
  "Escuela de Enfermería",
  "Escuela de Medicina",
  "Escuela de Odontología",
  "Escuela de Rehabilitación Humana",
  "Escuela de Salud Pública",
  // Artes Integradas
  "Departamento de Artes Escénicas",
  "Departamento de Artes Visuales y Estética",
] as const;

/** Sugerencias para el campo de departamento: escuelas primero, luego facultades. */
export const DEPARTMENT_SUGGESTIONS: string[] = [
  ...UNIVALLE_SCHOOLS,
  ...UNIVALLE_FACULTIES,
];

/** Sedes de la Universidad del Valle. Cali es la sede principal. */
export const UNIVALLE_CAMPUSES = [
  "Cali",
  "Buga",
  "Caicedonia",
  "Cartago",
  "Norte del Cauca",
  "Pacífico",
  "Palmira",
  "Tuluá",
  "Yumbo",
  "Zarzal",
] as const;
