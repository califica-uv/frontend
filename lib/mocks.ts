import type {
  AuditLogEntry,
  Course,
  PendingProfessor,
  Professor,
  ProfessorDetail,
  Question,
  Report,
  Review,
  User,
} from "./types";

export const mockCourses: Course[] = [
  { id: 1, name: "Cálculo I", code: "MAT101", department: "Matemáticas" },
  { id: 2, name: "Estructuras de Datos", code: "SIS220", department: "Sistemas" },
  { id: 3, name: "Bases de Datos", code: "SIS310", department: "Sistemas" },
  { id: 4, name: "Física Mecánica", code: "FIS101", department: "Física" },
  { id: 5, name: "Economía General", code: "ECO101", department: "Economía" },
  { id: 6, name: "Álgebra Lineal", code: "MAT205", department: "Matemáticas" },
];

export const mockProfessors: Professor[] = [
  {
    id: 1,
    name: "Ana María Restrepo",
    slug: "ana-maria-restrepo",
    department: "Sistemas",
    status: "published",
    courses: [mockCourses[1], mockCourses[2]],
    averageRating: 4.6,
    reviewCount: 38,
    createdAt: "2025-01-10T12:00:00Z",
  },
  {
    id: 2,
    name: "Carlos Iván Gómez",
    slug: "carlos-ivan-gomez",
    department: "Matemáticas",
    status: "published",
    courses: [mockCourses[0], mockCourses[5]],
    averageRating: 3.9,
    reviewCount: 52,
    createdAt: "2025-02-02T12:00:00Z",
  },
  {
    id: 3,
    name: "Diana Marcela Ortiz",
    slug: "diana-marcela-ortiz",
    department: "Física",
    status: "published",
    courses: [mockCourses[3]],
    averageRating: 4.2,
    reviewCount: 21,
    createdAt: "2025-01-20T12:00:00Z",
  },
  {
    id: 4,
    name: "Julián Andrés Salazar",
    slug: "julian-andres-salazar",
    department: "Economía",
    status: "published",
    courses: [mockCourses[4]],
    averageRating: 2.8,
    reviewCount: 15,
    createdAt: "2025-03-05T12:00:00Z",
  },
  {
    id: 5,
    name: "Laura Camila Torres",
    slug: "laura-camila-torres",
    department: "Sistemas",
    status: "published",
    courses: [mockCourses[1]],
    averageRating: 4.9,
    reviewCount: 64,
    createdAt: "2025-01-15T12:00:00Z",
  },
];

export const mockReviews: Review[] = [
  {
    id: 1,
    professorId: 1,
    course: mockCourses[1],
    authorUsername: "gato_curioso42",
    rating: 5,
    difficulty: 3,
    wouldTakeAgain: true,
    body:
      "Explica muy bien los árboles balanceados y siempre trae ejemplos de entrevistas técnicas reales. Los talleres son exigentes pero el feedback llega rápido. Recomiendo llevar dudas a monitoria antes del parcial, ayuda muchísimo.",
    likeCount: 24,
    dislikeCount: 1,
    myVote: 0,
    attachments: [],
    createdAt: "2025-06-01T10:00:00Z",
  },
  {
    id: 2,
    professorId: 1,
    course: mockCourses[2],
    authorUsername: "nube_azul7",
    rating: 4,
    difficulty: 4,
    wouldTakeAgain: true,
    body:
      "El curso de bases de datos es denso pero bien estructurado. Se nota que la profesora prepara cada clase. El único punto de mejora es que los proyectos finales tienen poco tiempo de entrega.",
    likeCount: 12,
    dislikeCount: 2,
    myVote: 1,
    attachments: [],
    createdAt: "2025-05-20T10:00:00Z",
  },
  {
    id: 3,
    professorId: 2,
    course: mockCourses[0],
    authorUsername: "raton_de_biblioteca",
    rating: 3,
    difficulty: 5,
    wouldTakeAgain: false,
    body:
      "Cálculo I con él es duro: los exámenes tienen preguntas que no se parecen a lo visto en clase. Si te gusta estudiar por tu cuenta con el libro guía puede irte bien, pero el ritmo de las clases es muy rápido.",
    likeCount: 30,
    dislikeCount: 8,
    myVote: 0,
    attachments: [],
    createdAt: "2025-04-11T10:00:00Z",
  },
  {
    id: 4,
    professorId: 1,
    // Reseña sin materia: alguien vio clase hace tiempo y no recuerda/le da
    // pereza buscar el código. Debe verse limpia, sin título ni hueco.
    course: null,
    authorUsername: "buho_nocturno",
    rating: 5,
    difficulty: 2,
    wouldTakeAgain: true,
    body:
      "No recuerdo el nombre exacto de la materia porque fue hace un par de semestres, pero la profesora es una verraquera: explica con calma, resuelve dudas por correo y los talleres reflejan justo lo que evalúa en el parcial.",
    likeCount: 6,
    dislikeCount: 0,
    myVote: 0,
    attachments: [],
    createdAt: "2025-03-02T10:00:00Z",
  },
];

export const mockQuestions: Question[] = [
  {
    id: 1,
    professorId: 1,
    authorUsername: "cafe_con_leche",
    body: "¿Es muy exigente con las entregas o da plazos extra si uno le explica?",
    answerCount: 2,
    createdAt: "2025-07-10T14:00:00Z",
    answers: [
      {
        id: 1,
        questionId: 1,
        authorUsername: "gato_curioso42",
        body: "Da un día extra si le escribes antes de que venza, pero si le escribes después de la hora no te contesta. Mejor avisar con tiempo.",
        likeCount: 14,
        dislikeCount: 0,
        myVote: 0,
        createdAt: "2025-07-10T16:30:00Z",
      },
      {
        id: 2,
        questionId: 1,
        authorUsername: "nube_azul7",
        body: "En mi semestre sí fue flexible con un compañero que tuvo una emergencia, pero en general espera que cumplas las fechas.",
        likeCount: 5,
        dislikeCount: 1,
        myVote: 0,
        createdAt: "2025-07-11T09:00:00Z",
      },
    ],
  },
  {
    id: 2,
    professorId: 1,
    authorUsername: "raton_de_biblioteca",
    body: "¿Sirve ir a las monitorías o es lo mismo que la clase?",
    answerCount: 1,
    createdAt: "2025-07-15T11:00:00Z",
    answers: [
      {
        id: 3,
        questionId: 2,
        authorUsername: "buho_nocturno",
        body: "Sí sirve, ahí resuelve ejercicios tipo parcial que no alcanza a hacer en clase.",
        likeCount: 8,
        dislikeCount: 0,
        myVote: 1,
        createdAt: "2025-07-15T15:00:00Z",
      },
    ],
  },
  {
    id: 3,
    professorId: 1,
    authorUsername: "tinto_a_las_5",
    body: "¿El parcial final es acumulativo o solo del último corte?",
    answerCount: 0,
    createdAt: "2025-08-20T08:00:00Z",
    answers: [],
  },
];

export const mockProfessorDetails: Record<string, ProfessorDetail> =
  Object.fromEntries(
    mockProfessors.map((p) => [
      p.slug,
      {
        ...p,
        ratingBreakdown: { 1: 2, 2: 3, 3: 6, 4: 12, 5: 15 },
        ratingByCourse: p.courses.map((c, i) => ({
          course: c,
          averageRating: p.averageRating - i * 0.3,
          reviewCount: Math.max(3, p.reviewCount - i * 10),
        })),
        reviewsWithoutCourseCount: p.id === 1 ? 1 : 0,
      },
    ])
  );

export const mockPendingProfessors: PendingProfessor[] = [
  {
    id: 1,
    name: "Ricardo Alonso Peña",
    slug: "ricardo-alonso-pena",
    department: "Química",
    courses: [{ id: 7, name: "Química Orgánica", code: "QUI210", department: "Química" }],
    voteCount: 2,
    votesNeeded: 3,
    hasVoted: false,
    proposedAt: "2025-08-01T10:00:00Z",
  },
  {
    id: 2,
    name: "Sofía Elena Vargas",
    slug: "sofia-elena-vargas",
    department: "Sistemas",
    courses: [mockCourses[1]],
    voteCount: 1,
    votesNeeded: 3,
    hasVoted: false,
    proposedAt: "2025-08-10T10:00:00Z",
  },
  {
    id: 3,
    name: "Mauricio Andrés Léon",
    slug: "mauricio-andres-leon",
    department: "Filosofía",
    // Proponer profesor ya no exige materias: esta propuesta no trae ninguna.
    courses: [],
    voteCount: 0,
    votesNeeded: 3,
    hasVoted: false,
    proposedAt: "2025-08-20T10:00:00Z",
  },
];

export const mockCurrentUser: User = {
  id: 1,
  username: "buho_nocturno",
  role: "student",
  createdAt: "2025-01-01T00:00:00Z",
};

export const mockAdminUser: User = {
  id: 999,
  username: "admin_uv",
  role: "admin",
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockReports: Report[] = [
  {
    id: 1,
    reviewId: 3,
    reason: "Contiene lenguaje ofensivo hacia el profesor.",
    createdAt: "2025-08-15T10:00:00Z",
  },
];

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 1,
    adminUsername: "admin_uv",
    action: "delete_review",
    targetType: "review",
    targetId: "99",
    reason: "Insultos personales sin sustancia académica.",
    createdAt: "2025-08-14T09:30:00Z",
  },
];
