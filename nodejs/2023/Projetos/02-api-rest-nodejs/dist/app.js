"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"));

// src/routes/transactions.ts
var import_node_cache = __toESM(require("node-cache"));

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: import_zod.z.string()
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables! ", _env.error.format());
  throw new Error("Invalid environment variables!");
}
var env = _env.data;

// src/database.ts
var config2 = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./database/migrations"
  }
};
var knex = (0, import_knex.knex)(config2);

// src/routes/transactions.ts
var import_zod2 = require("zod");
var import_crypto = require("crypto");

// src/middlewares/check-session-id-exists.ts
async function checkSessionIdExists(request, replay) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return replay.status(401).send({
      error: "Unautorized"
    });
  }
}

// src/routes/transactions.ts
var cache = new import_node_cache.default({ stdTTL: 100, checkperiod: 120 });
async function transactionsRoutes(app2) {
  app2.addHook("preHandler", async (request, reply) => {
  });
  app2.get(
    "/",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const transactions = await knex("transactions").where("session_id", sessionId).select("*");
      return {
        total: transactions.length,
        transactions
      };
    }
  );
  app2.post("/", async (request, reply) => {
    const createBodyTransactionsSchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    const { title, amount, type } = createBodyTransactionsSchema.parse(
      request.body
    );
    let sessionId = request.cookies.sessionId;
    if (!sessionId) {
      sessionId = (0, import_crypto.randomUUID)();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7
        // 7 dias
      });
    }
    const transaction = await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      type,
      session_id: sessionId
    });
    return reply.status(201).send();
  });
  app2.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const getTransactionParamsSchema = import_zod2.z.object({ id: import_zod2.z.string().uuid() });
      const { sessionId } = request.cookies;
      const { id } = getTransactionParamsSchema.parse(request.params);
      const transaction = await knex("transactions").select("*").where({ id, session_id: sessionId }).first();
      return { transaction };
    }
  );
  app2.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const summary = await knex("transactions").sum("amount", { as: "amount" }).where("session_id", sessionId).first();
      return { summary };
    }
  );
}

// src/app.ts
var import_cookie = __toESM(require("@fastify/cookie"));
var app = (0, import_fastify.default)();
app.register(import_cookie.default);
app.register(transactionsRoutes, {
  prefix: "transactions"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
