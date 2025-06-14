import { EducationInfoModel } from "./EducationInfoModel";

export class UserInformationModel {

    userId:string  = '';

	username: string = '';

	usernameEncryto: string = 'NOT_YET';

	password: string = '';
	
	firstName:string  = '';
	
	middleName:string  = '';

	lastName:string  = '';
	
	address:string  = '';
	
	email: string  = '';

	nationality: string = '';

    phoneNumber: string  = '';

	birthday: string  = '';

	gender: string  = '';

	urlAvt: string = '';

	educationInfoList!: [EducationInfoModel];

}