export class MedicineModel {
    id!: string;
    name!: string;
    description!: string;
    quantity!: number;
    isActive!: string;
    drugIngredients!: string;
    urlImage!: string;
    producer!: string;
    unit!: string;
    note = 'Không';
}