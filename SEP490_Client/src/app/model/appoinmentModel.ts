export class AppoinmentModel {

    userId!: string
    
    fullname!: string
    
    phone!: string
    
    address!: string
    
    fullnameNT!: string
    
    phoneNT!: string

    addressNT!: string

    examinationType!: string;

    examinationDate!: string;

    examinationTime!: string;

    doctor!: string;

    initNew() {
        this.userId = 'New';
        this.fullname = 'New';
        this.phone = 'New';
        this.address = 'New';
        this.fullnameNT = 'New';
        this.phoneNT = 'New';
        this.addressNT = 'New';
        this.examinationType = 'New';
        this.examinationDate = 'New';
        this.examinationTime = 'New';
        this.doctor = 'New';
    }

}