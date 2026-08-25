export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 72, // argon2/bcrypt-safe upper bound
} as const;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const CUSTOMIZATION_FIELD_TYPES = ["text", "textarea", "select", "number", "date"] as const;

export const ORDER_STATUSES = [
  "aguardando_pagamento",
  "pagamento_aprovado",
  "em_producao",
  "enviado",
  "entregue",
  "cancelado",
] as const;

export const CART_ITEM_MAX_QUANTITY = 20;
export const CUSTOMIZATION_VALUE_MAX_LENGTH = 500;
