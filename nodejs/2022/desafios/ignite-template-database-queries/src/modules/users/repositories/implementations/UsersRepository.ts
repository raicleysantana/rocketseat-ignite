import { getRepository, Repository } from "typeorm";

import { IFindUserWithGamesDTO, IFindUserByFullNameDTO } from "../../dtos";
import { User } from "../../entities/User";
import { IUsersRepository } from "../IUsersRepository";

export class UsersRepository implements IUsersRepository {
	private repository: Repository<User>;

	constructor() {
		this.repository = getRepository(User);
	}

	async findUserWithGamesById({
		user_id,
	}: IFindUserWithGamesDTO): Promise<User> {
		// Complete usando ORM

		const response = await this.repository.findOne({
			where: {
				id: user_id,
			},
		});

		if (!response) {
			throw new Error("User not found");
		}

		return response;
	}

	async findAllUsersOrderedByFirstName(): Promise<User[]> {
		return this.repository.query(`SELECT * FROM users ORDER BY first_name`); // Complete usando raw query
	}

	async findUserByFullName({
		first_name,
		last_name,
	}: IFindUserByFullNameDTO): Promise<User[] | undefined> {
		return this.repository.query(
			`SELECT * FROM users WHERE first_name = '${first_name}' AND last_name = '${last_name}'`
		); // Complete usando raw query
	}
}
