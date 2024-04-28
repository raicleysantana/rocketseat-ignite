import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("transactions", (table) => {
		table.uuid("id").primary();
		table.text("title").notNullable();
        table.enum('type',['credit','debit']),
		table.dateTime("created_at").defaultTo(knex.fn.now()).notNullable();
		table.decimal("amount", 10, 2).notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("transactions");
}
