// Tipos espejo de los DTOs del backend (internal/dto).
// Nunca incluyen email, real_name, google_sub ni author_id — barrera de anonimato.
// El backend serializa snake_case y usa ids numéricos; la conversión a
// camelCase ocurre en lib/api.ts (ver toCamelCase/toSnakeCase).

export type UserRole = "student" | "admin";

export interface User {
  id: number;
  username: string | null;
  role: UserRole;
  createdAt: string;
}

export type ProfessorStatus = "pending" | "published";

export interface Course {
  id: number;
  name: string;
  code?: string | null;
  department?: string | null;
}

export interface CourseAverage {
  course: Course;
  averageRating: number;
  reviewCount: number;
}

export interface Professor {
  id: number;
  name: string;
  slug: string;
  department?: string;
  status: ProfessorStatus;
  courses: Course[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProfessorDetail extends Professor {
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  courseAverages: CourseAverage[];
  // Reseñas que no tienen materia asociada, agregadas aparte.
  reviewsWithoutCourseCount?: number;
}

export interface PendingProfessor {
  id: number;
  name: string;
  slug: string;
  department?: string;
  courses: Course[];
  voteCount: number;
  votesNeeded: number;
  hasVoted: boolean;
  proposedAt: string;
}

export interface Attachment {
  id: number;
  url: string;
  mime: string;
  width: number | null;
  height: number | null;
}

export interface Review {
  id: number;
  professorId: number;
  // La materia es opcional: la reseña puede publicarse sin ella.
  course: Course | null;
  authorUsername: string;
  rating: number;
  difficulty: number;
  wouldTakeAgain: boolean;
  body: string;
  likeCount: number;
  dislikeCount: number;
  myVote: 1 | -1 | 0;
  attachments: Attachment[];
  createdAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  authorUsername: string;
  body: string;
  likeCount: number;
  dislikeCount: number;
  myVote: 1 | -1 | 0;
  createdAt: string;
}

export interface Question {
  id: number;
  professorId: number;
  authorUsername: string;
  body: string;
  answerCount: number;
  createdAt: string;
  answers: Answer[];
}

export interface AuditLogEntry {
  id: number;
  adminUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
}

export interface Report {
  id: number;
  reviewId: number;
  reason: string;
  createdAt: string;
}

export interface PresignResponse {
  uploadUrl: string;
  r2Key: string;
  publicUrl: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProfessorInput {
  name: string;
  // Solo el nombre es obligatorio al proponer un profesor.
  department?: string;
  // Proponer profesor ya no exige materias.
  courseIds: number[];
}

export interface CreateReviewInput {
  // Opcional: la materia funciona como título libre de la reseña.
  courseId?: number | null;
  rating: number;
  difficulty: number;
  wouldTakeAgain: boolean;
  body: string;
  attachmentKeys?: string[];
}

export interface CreateCourseInput {
  name: string;
  code?: string;
  department?: string;
}

export interface UsernameInput {
  username: string;
}

export interface ProfessorsQuery {
  q?: string;
  department?: string;
  course?: number;
  sort?: "rating" | "reviews" | "name";
}
