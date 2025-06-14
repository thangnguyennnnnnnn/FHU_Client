import { MedicineModel2 } from "./MedicineModel2";
import { PrescriptionCardModel } from "./PrescriptionCardModel";

export class PrescriptionReturnModel {
    prescriptionCardModel!: PrescriptionCardModel;
    medicineModelList!: MedicineModel2[];
}