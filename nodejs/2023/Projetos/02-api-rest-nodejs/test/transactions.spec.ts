import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe("Transactions routes", () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		execSync("npm run knex migrate:rollback --all");
		execSync("npm run knex migrate:latest");
	});

	it("O usuário consegue criar um nova transação", async () => {
		await request(app.server)
			.post("/transactions")
			.send({
				title: "new transaction",
				amount: 500,
				type: "credit",
			})
			.expect(201);
	});

	it("should be able to list all transactions", async () => {
		const createTransactionResponse = await request(app.server)
			.post("/transactions")
			.send({
				title: "New transaction",
				amount: 500,
				type: "credit",
			});

		const cookies = createTransactionResponse.get("Set-Cookie");

		if (!cookies) throw new Error("No Set-Cookie found on response!");

		const listTransactionResponse = await request(app.server)
			.get("/transactions")
			.set("Cookie", cookies)
			.expect(200);

		expect(listTransactionResponse.body.transactions).toEqual([
			expect.objectContaining({
				title: "New transaction",
				amount: 500,
			}),
		]);
	});

	it("should be able to get specific transactions", async () => {
		const createTransactionResponse = await request(app.server)
			.post("/transactions")
			.send({
				title: "New transaction",
				amount: 500,
				type: "credit",
			});

		const cookies = createTransactionResponse.get("Set-Cookie");

		if (!cookies) throw new Error("No Set-Cookie found on response!");

		const listTransactionResponse = await request(app.server)
			.get("/transactions")
			.set("Cookie", cookies)
			.expect(200);

		const transactionId = listTransactionResponse.body.transactions[0].id;

		const getTransactionResponse = await request(app.server)
			.get(`/transactions/${transactionId}`)
			.set("Cookie", cookies)
			.expect(200);

		expect(getTransactionResponse.body.transaction).toEqual(
			expect.objectContaining({
				title: "New transaction",
				amount: 500,
			})
		);
	});

	it("should be able to get the summary", async () => {
		const createTransactionResponse = await request(app.server)
			.post("/transactions")
			.send({
				title: "Credit transaction",
				amount: 5000,
				type: "credit",
			});

		const cookies = createTransactionResponse.get("Set-Cookie");

		if (!cookies) throw new Error("No Set-Cookie found on response!");

		const createTransactionResponse2 = await request(app.server)
			.post("/transactions")
			.set("Cookie", cookies)
			.send({
				title: "Debit Transaction",
				amount: 2000,
				type: "debit",
			});

		const summaryResponse = await request(app.server)
			.get("/transactions/summary")
			.set("Cookie", cookies)
			.expect(200);

		expect(summaryResponse.body.summary).toEqual({
			amount:  3000,
		});
	});
});
