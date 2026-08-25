export class AppError extends Error {
  statusCode: number;
  fields?: Record<string, string[]>;

  constructor(statusCode: number, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado") {
    super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito") {
    super(409, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Muitas requisições, tente novamente mais tarde") {
    super(429, message);
  }
}
