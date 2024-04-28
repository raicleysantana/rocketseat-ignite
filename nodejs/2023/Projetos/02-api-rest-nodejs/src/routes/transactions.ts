import NodeCache from "node-cache";

import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export async function transactionsRoutes(app: FastifyInstance) {
	app.addHook("preHandler", async (request, reply) => {});

	app.get(
		"/",
		{
			preHandler: [checkSessionIdExists],
		},
		async (request) => {
			const { sessionId } = request.cookies;

			const transactions = await knex("transactions")
				.where("session_id", sessionId)
				.select("*");

			return {
				total: transactions.length,
				transactions,
			};
		}
	);

	app.post("/", async (request, reply) => {
		const createBodyTransactionsSchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(["credit", "debit"]),
		});

		const { title, amount, type } = createBodyTransactionsSchema.parse(
			request.body
		);

		let sessionId = request.cookies.sessionId;

		if (!sessionId) {
			sessionId = randomUUID();
			reply.cookie("sessionId", sessionId, {
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 dias
			});
		}

		const transaction = await knex("transactions").insert({
			id: crypto.randomUUID(),
			title,
			amount: type === "credit" ? amount : amount * -1,
			type,
			session_id: sessionId,
		});

		return reply.status(201).send();
	});

	app.get(
		"/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (request) => {
			const getTransactionParamsSchema = z.object({ id: z.string().uuid() });
			const { sessionId } = request.cookies;
			const { id } = getTransactionParamsSchema.parse(request.params);

			const transaction = await knex("transactions")
				.select("*")
				.where({ id: id, session_id: sessionId })
				.first();

			return { transaction };
		}
	);

	app.get(
		"/summary",
		{
			preHandler: [checkSessionIdExists],
		},
		async (request) => {
			const { sessionId } = request.cookies;

			const summary = await knex("transactions")
				.sum("amount", { as: "amount" })
				.where("session_id", sessionId)
				.first();

			return { summary };
		}
	);
}
