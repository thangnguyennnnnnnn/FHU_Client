import { Faculty } from "src/app/model/Faculty";

export class AppointmentModelDB {
    userId!: string;
	fullname!: string;
    address!: string;
	phone!: string;
    fullnameNT!: string;
    addressNT!: string;
	phoneNT!: string;
    buildingId!: string;
    facultyId!: string;
    facultyName!: string;
    symptom!: string;
    examinationDate!: string;
    examinationTime!: string;
    doctorId!: string;
    doctorName!: string;
    place!: string;
    appointmentBeforId!: string;
    status!: string;
}