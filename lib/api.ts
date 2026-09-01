import type {
  Answer,
  AuditLogEntry,
  Course,
  CreateCourseInput,
  CreateProfessorInput,
  CreateReviewInput,
  PendingProfessor,
  PresignResponse,
  Professor,
  ProfessorDetail,
  ProfessorsQuery,
  Question,
  Report,
  Review,
  User,
} from "./types";
import {
  mockAuditLog,
  mockCourses,
  mockCurrentUser,
  mockPendingProfessors,
  mockProfessorDetails,
  mockProfessors,
  mockQuestions,
  mockReports,
  mockReviews,
} from "./mocks";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// ---------- snake_case <-> camelCase ----------
// El backend (Go) serializa en snake_case; el frontend trabaja en camelCase.
// Este es el ÚNICO punto de conversión: recorre objetos y arrays anidados,
// nunca toca strings/números sueltos ni instancias de File/Date/Blob.

function isConvertiblePlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Date) return false;
  if (typeof File !== "undefined" && value instanceof File) return false;
  if (typeof Blob !== "undefined" && value instanceof Blob) return false;
  return true;
}

function camelToSnakeKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
}

export function toSnakeCase<T>(value: T): unknown {
  if (Array.isArray(value)) return value.map((item) => toSnakeCase(item));
  if (isConvertiblePlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [camelToSnakeKey(key), toSnakeCase(val)])
    );
  }
  return value;
}

export function toCamelCase<T>(value: T): unknown {
  if (Array.isArray(value)) return value.map((item) => toCamelCase(item));
  if (isConvertiblePlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [snakeToCamelKey(key), toCamelCase(val)])
    );
  }
  return value;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(toSnakeCase(options.body)) : undefined,
  });

  if (!res.ok) {
    let code = "UNKNOWN_ERROR";
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      code = body.code ?? code;
      message = body.message ?? message;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) return undefined as T;

  const raw = await res.json();
  return toCamelCase(raw) as T;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------- Auth ----------

export function loginWithGoogleUrl(): string {
  return `${API_URL}/auth/google`;
}

export async function logout(): Promise<void> {
  if (USE_MOCKS) return delay(undefined);
  return request<void>("/auth/logout", { method: "POST" });
}

// GET /auth/me responde 200 SIEMPRE, con {authenticated, user}. No hay que
// tratar el "no logueado" como un error HTTP: viene con authenticated:false.
export async function getMe(): Promise<User | null> {
  if (USE_MOCKS) return delay(mockCurrentUser);
  const body = await request<{ authenticated: boolean; user: User | null }>("/auth/me");
  return body.authenticated ? (body.user ?? null) : null;
}

export async function setUsername(username: string): Promise<User> {
  if (USE_MOCKS) return delay({ ...mockCurrentUser, username });
  return request<User>("/auth/username", {
    method: "POST",
    body: { username },
  });
}

export async function checkUsernameAvailable(
  username: string
): Promise<{ available: boolean; reason?: string }> {
  if (USE_MOCKS) {
    const taken = ["admin", "moderador", "anonimo", "buho_nocturno"];
    return delay({
      available: !taken.includes(username.toLowerCase()),
      reason: taken.includes(username.toLowerCase())
        ? "Ese seudónimo ya está en uso."
        : undefined,
    });
  }
  return request(`/auth/username/available?u=${encodeURIComponent(username)}`);
}

// ---------- Courses ----------

export async function getCourses(q?: string): Promise<Course[]> {
  if (USE_MOCKS) {
    const filtered = q
      ? mockCourses.filter(
          (c) =>
            c.name.toLowerCase().includes(q.toLowerCase()) ||
            (c.code ?? "").toLowerCase().includes(q.toLowerCase())
        )
      : mockCourses;
    return delay(filtered, 200);
  }
  const params = q ? `?q=${encodeURIComponent(q)}` : "";
  return request<Course[]>(`/courses${params}`);
}

// Idempotente en el backend: si ya existe una materia con el mismo nombre
// normalizado (sin tildes/mayúsculas), la reusa en vez de duplicarla.
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  if (USE_MOCKS) {
    const existing = mockCourses.find(
      (c) => c.name.trim().toLowerCase() === input.name.trim().toLowerCase()
    );
    if (existing) return delay(existing, 150);
    const created: Course = {
      id: Math.max(0, ...mockCourses.map((c) => c.id)) + 1,
      name: input.name,
      code: input.code,
      department: input.department,
    };
    mockCourses.push(created);
    return delay(created, 150);
  }
  return request<Course>("/courses", { method: "POST", body: input });
}

// ---------- Professors ----------

export async function getProfessors(
  query: ProfessorsQuery = {}
): Promise<Professor[]> {
  if (USE_MOCKS) {
    let list = [...mockProfessors];
    if (query.q) {
      const q = query.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (query.department) {
      list = list.filter((p) => p.department === query.department);
    }
    if (query.course) {
      list = list.filter((p) => p.courses.some((c) => c.id === query.course));
    }
    if (query.sort === "rating") list.sort((a, b) => b.averageRating - a.averageRating);
    if (query.sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount);
    if (query.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return delay(list);
  }
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.department) params.set("department", query.department);
  if (query.course) params.set("course", String(query.course));
  if (query.sort) params.set("sort", query.sort);
  const qs = params.toString();
  return request<Professor[]>(`/professors${qs ? `?${qs}` : ""}`);
}

export async function getProfessorBySlug(
  slug: string
): Promise<ProfessorDetail | null> {
  if (USE_MOCKS) return delay(mockProfessorDetails[slug] ?? null);
  try {
    return await request<ProfessorDetail>(`/professors/${slug}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createProfessor(
  input: CreateProfessorInput
): Promise<PendingProfessor> {
  if (USE_MOCKS) {
    return delay({
      id: Math.max(0, ...mockPendingProfessors.map((p) => p.id)) + 1,
      name: input.name,
      slug: input.name.toLowerCase().replace(/\s+/g, "-"),
      department: input.department,
      courses: mockCourses.filter((c) => input.courseIds.includes(c.id)),
      voteCount: 0,
      votesNeeded: 3,
      hasVoted: false,
      proposedAt: new Date().toISOString(),
    });
  }
  return request<PendingProfessor>("/professors", {
    method: "POST",
    body: input,
  });
}

export async function getPendingProfessors(): Promise<PendingProfessor[]> {
  if (USE_MOCKS) return delay(mockPendingProfessors);
  return request<PendingProfessor[]>("/professors/pending");
}

export async function voteProfessor(id: number): Promise<PendingProfessor> {
  if (USE_MOCKS) {
    const p = mockPendingProfessors.find((x) => x.id === id);
    if (!p) throw new ApiError(404, "NOT_FOUND", "Propuesta no encontrada");
    return delay({ ...p, voteCount: p.voteCount + 1, hasVoted: true });
  }
  return request<PendingProfessor>(`/professors/${id}/vote`, { method: "POST" });
}

// ---------- Reviews ----------

export async function getProfessorReviews(
  professorId: number,
  courseId?: number
): Promise<Review[]> {
  if (USE_MOCKS) {
    let list = mockReviews.filter((r) => r.professorId === professorId);
    if (courseId) list = list.filter((r) => r.course?.id === courseId);
    return delay(list);
  }
  const params = courseId ? `?course=${encodeURIComponent(courseId)}` : "";
  return request<Review[]>(`/professors/${professorId}/reviews${params}`);
}

export async function createReview(
  professorId: number,
  input: CreateReviewInput
): Promise<Review> {
  if (USE_MOCKS) {
    return delay({
      id: Math.max(0, ...mockReviews.map((r) => r.id)) + 1,
      professorId,
      course: mockCourses.find((c) => c.id === input.courseId) ?? null,
      authorUsername: mockCurrentUser.username ?? "anonimo",
      rating: input.rating,
      difficulty: input.difficulty,
      wouldTakeAgain: input.wouldTakeAgain,
      body: input.body,
      likeCount: 0,
      dislikeCount: 0,
      myVote: 0,
      attachments: [],
      createdAt: new Date().toISOString(),
    });
  }
  return request<Review>(`/professors/${professorId}/reviews`, {
    method: "POST",
    body: input,
  });
}

export async function voteReview(
  reviewId: number,
  value: 1 | -1
): Promise<{ likeCount: number; dislikeCount: number; myVote: 1 | -1 | 0 }> {
  if (USE_MOCKS) {
    const r = mockReviews.find((x) => x.id === reviewId);
    if (!r) throw new ApiError(404, "NOT_FOUND", "Reseña no encontrada");
    return delay({ likeCount: r.likeCount, dislikeCount: r.dislikeCount, myVote: value });
  }
  return request(`/reviews/${reviewId}/vote`, {
    method: "POST",
    body: { value },
  });
}

export async function reportReview(reviewId: number, reason: string): Promise<void> {
  if (USE_MOCKS) return delay(undefined);
  return request<void>(`/reviews/${reviewId}/report`, {
    method: "POST",
    body: { reason },
  });
}

// ---------- Questions & Answers ----------

export async function getProfessorQuestions(professorId: number): Promise<Question[]> {
  if (USE_MOCKS) {
    return delay(
      mockQuestions
        .filter((q) => q.professorId === professorId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }
  return request<Question[]>(`/professors/${professorId}/questions`);
}

export async function createQuestion(
  professorId: number,
  body: string
): Promise<Question> {
  if (USE_MOCKS) {
    const created: Question = {
      id: Math.max(0, ...mockQuestions.map((q) => q.id)) + 1,
      professorId,
      authorUsername: mockCurrentUser.username ?? "anonimo",
      body,
      answerCount: 0,
      createdAt: new Date().toISOString(),
      answers: [],
    };
    mockQuestions.unshift(created);
    return delay(created);
  }
  return request<Question>(`/professors/${professorId}/questions`, {
    method: "POST",
    body: { body },
  });
}

export async function createAnswer(questionId: number, body: string): Promise<Answer> {
  if (USE_MOCKS) {
    const question = mockQuestions.find((q) => q.id === questionId);
    const created: Answer = {
      id: Math.max(0, ...mockQuestions.flatMap((q) => q.answers.map((a) => a.id))) + 1,
      questionId,
      authorUsername: mockCurrentUser.username ?? "anonimo",
      body,
      likeCount: 0,
      dislikeCount: 0,
      myVote: 0,
      createdAt: new Date().toISOString(),
    };
    if (question) {
      question.answers.push(created);
      question.answerCount += 1;
    }
    return delay(created);
  }
  return request<Answer>(`/questions/${questionId}/answers`, {
    method: "POST",
    body: { body },
  });
}

export async function voteAnswer(
  answerId: number,
  value: 1 | -1
): Promise<{ likeCount: number; dislikeCount: number; myVote: 1 | -1 | 0 }> {
  if (USE_MOCKS) {
    const answer = mockQuestions.flatMap((q) => q.answers).find((a) => a.id === answerId);
    if (!answer) throw new ApiError(404, "NOT_FOUND", "Respuesta no encontrada");
    return delay({ likeCount: answer.likeCount, dislikeCount: answer.dislikeCount, myVote: value });
  }
  return request(`/answers/${answerId}/vote`, {
    method: "POST",
    body: { value },
  });
}

export async function reportQuestion(questionId: number, reason: string): Promise<void> {
  if (USE_MOCKS) return delay(undefined);
  return request<void>(`/questions/${questionId}/report`, {
    method: "POST",
    body: { reason },
  });
}

export async function reportAnswer(answerId: number, reason: string): Promise<void> {
  if (USE_MOCKS) return delay(undefined);
  return request<void>(`/answers/${answerId}/report`, {
    method: "POST",
    body: { reason },
  });
}

// ---------- Uploads ----------

export async function presignUpload(file: File): Promise<PresignResponse> {
  if (USE_MOCKS) {
    return delay({
      uploadUrl: "about:blank",
      r2Key: `mock/${Date.now()}-${file.name}`,
      publicUrl: URL.createObjectURL(file),
    });
  }
  return request<PresignResponse>("/uploads/presign", {
    method: "POST",
    body: { mime: file.type, size: file.size },
  });
}

export async function uploadToR2(presign: PresignResponse, file: File): Promise<void> {
  if (USE_MOCKS) return delay(undefined, 500);
  const res = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("No se pudo subir la imagen a almacenamiento.");
}

// ---------- Admin ----------

export async function adminDeleteReview(id: number, reason: string): Promise<void> {
  if (USE_MOCKS) return delay(undefined);
  return request<void>(`/admin/reviews/${id}`, {
    method: "DELETE",
    body: { reason },
  });
}

export async function adminDeleteProfessor(id: number, reason: string): Promise<void> {
  if (USE_MOCKS) return delay(undefined);
  return request<void>(`/admin/professors/${id}`, {
    method: "DELETE",
    body: { reason },
  });
}

// El baneo opera por username (no por id): es lo que preserva el anonimato,
// el admin nunca necesita saber a qué id numérico corresponde una persona.
export async function adminBanUser(username: string, reason: string): Promise<void> {
  if (USE_MOCKS) return delay(undefined);
  return request<void>(`/admin/users/${encodeURIComponent(username)}/ban`, {
    method: "POST",
    body: { reason },
  });
}

export async function getAdminReports(): Promise<Report[]> {
  if (USE_MOCKS) return delay(mockReports);
  return request<Report[]>("/admin/reports");
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  if (USE_MOCKS) return delay(mockAuditLog);
  return request<AuditLogEntry[]>("/admin/audit-log");
}
