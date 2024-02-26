const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

// Middleware

function checkExistsUserAccount(request, response, next) {
	const { username } = request.headers;

	const user = users.find((user) => user.username === username);

	if (!user) return response.status(400).json({ error: "User not found" });

	request.user = user;

	return next();
}

const users = [];

// Routes
app.get("/user", checkExistsUserAccount, (request, response) => {
	const { user } = request;

	return response.json(user);
});

app.post("/users", (request, response) => {
	const { username, name } = request.body;

	const usersAlreadyExists = users.find((user) => users.username === username);

	if (usersAlreadyExists) {
		return response.status(400).json({ error: "User already exists!" });
	}

	users.push({
		id: uuidv4(),
		name,
		todos: [],
		username,
	});

	return response.status(201).send();
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
	const { user } = request;

	return response.json(user.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
	const { title, deadline } = request.body;

	const { user } = request;

	const todos = {
		id: uuidv4(),
		created_at: new Date(),
		deadline: new Date(deadline),
		done: false,
		title,
	};

	user.todos.push(todos);

	return response.status(201).send();
});

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { title, deadline } = request.body;
	const { user } = request;

	const todo = user.todos.find((todo) => todo.id === id);

	if (!todo) return response.status(404).json({ error: "Todo not found!" });

	todo.title = title;
	todo.deadline = deadline;

	return response.status(201).send();
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { user } = request;

	const todo = user.todos.find((todo) => todo.id === id);

	if (!todo) return response.status(404).json({ error: "Todo not found!" });

	todo.done = true;

	return response.status(201).send();
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { user } = request;

	const todoIndex = user.todos.findIndex((todo) => todo.id === id);

	if (todoIndex === -1)
		return response.status(404).json({ error: "Todo not found!" });

	user.todos.splice(todoIndex, 1);

	return response.status(200).json();
});

app.listen(3333);
