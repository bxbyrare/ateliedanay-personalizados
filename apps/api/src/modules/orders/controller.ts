import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { UnauthorizedError } from "../../lib/errors.js";
import * as ordersService from "./service.js";
import type { CreateOrderInput, OrderListQuery } from "@ateliedanay/shared";

function requireUserId(req: Request): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const input = req.body as CreateOrderInput;
  const order = await ordersService.createOrder(userId, input);
  res.status(201).json({ order });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { page, limit } = req.query as unknown as OrderListQuery;
  const result = await ordersService.listOrders(userId, page, limit);
  res.status(200).json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { id } = req.params as unknown as { id: string };
  const order = await ordersService.getOrderForUser(userId, id);
  res.status(200).json({ order });
});
