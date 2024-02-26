import { Request, Response } from "express";
import CreateCouseService from "./CreateCouseService";

export function createCouse(request: Request, response: Response) {
	CreateCouseService.execute({
		name: "NodeJs",
		duration: 10,
		educator: "Cley",
	});

	return response.send();
}
    