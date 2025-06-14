import { Faculty } from "src/app/model/Faculty";

export class DoctorDisplayModel {
    userId!: string;
	fullname!: string;
    birthdate!: string;
	phone!: string;
	email!: string;
	roleId!: string;
    facultys!: Faculty[];
	appointmentId!: string;
	urlAvata!: string;
}