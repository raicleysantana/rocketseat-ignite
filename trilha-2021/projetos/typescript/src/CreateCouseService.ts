interface Course {
	name: string;
	duration: number;
	educator: string;
}

class CreateCourseService {
	execute(data: Course) {
		console.log(data.name, data.duration, data.educator);
	}
}

export default new CreateCourseService();
