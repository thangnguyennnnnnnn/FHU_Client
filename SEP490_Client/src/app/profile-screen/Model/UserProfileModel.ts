import { UserInformationModel } from "src/app/model/userInformationModel";

export class UserProfileModel extends UserInformationModel {

    positionId!:string;
	positionName!:string;
	facultyId!:string;
	facultyName!:string;
	roleId!:string;
	roleName!:string;
}