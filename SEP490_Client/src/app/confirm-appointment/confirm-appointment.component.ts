import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { CommonService } from '../service/CommonService';
import { FormBuilder } from '@angular/forms'
import { HttpClient, HttpParams } from '@angular/common/http';
import { SendModel } from '../model/sendModel';
import { ReciveModel } from '../model/reciveModel';
import { AppoinmentModel } from '../model/appoinmentModel';
import { DateTimeService } from '../service/DateTimeService';
import { ValidateService } from '../service/ValidateService';
import { SpecializationModel } from '../model/SpecializationModel';
import { DoctorDisplayModel } from './Model/DoctorDisplayModel';
import { Faculty } from '../model/Faculty';
import { AppointmentModelDB } from './Model/AppointmentModelDB';
import { SocketService } from '../service/SocketService';
import { BuildingModel } from '../model/BuildingModel';
@Component({
  selector: 'app-confirm-appointment',
  templateUrl: './confirm-appointment.component.html',
  styleUrls: ['./confirm-appointment.component.css']
})
export class ConfirmAppointmentComponent implements OnInit , AfterViewInit {
  @ViewChild('fullname') fullname!: ElementRef;
  @ViewChild('phone') phone!: ElementRef;
  @ViewChild('address') address!: ElementRef;
  @ViewChild('fullnameNT') fullnameNT!: ElementRef;
  @ViewChild('phoneNT') phoneNT!: ElementRef;
  @ViewChild('addressNT') addressNT!: ElementRef;
  @ViewChild('buildingId') buildingId!: ElementRef;            
  @ViewChild('facultyId') facultyId!: ElementRef;
  @ViewChild('symptom') symptom!: ElementRef;
  @ViewChild('examinationDate') examinationDate!: ElementRef;
  @ViewChild('examinationTime') examinationTime!: ElementRef;
  @ViewChild('doctorId') doctorId!: ElementRef;

  @ViewChild('qrCode') qrCode!: ElementRef;

  constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router, private validateService: ValidateService) {}
  
  private socketService = new SocketService();
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();

  user ='';
  isConfirm = false;
  isBuildingSelected = false;
  finalCheckFlg = false;
  currentDate: string = this.getCurrentDate();
  haveDoctor = false;
  isInfoDoctor = false;
  isOK = false;
  isQRCheck = false;
  appointmentModel!: AppoinmentModel;
  specializationModelList: SpecializationModel[] = [];
  appointmentModelDB!: AppointmentModelDB;
  doctorDisplayList: DoctorDisplayModel[] = [];
  buildingList: BuildingModel[] = []
  DoctorDisplay!: DoctorDisplayModel;
  facultyList: Faculty[] = [];
  elementRefs!: { [key: string]: ElementRef }; 
  listElement = [
    'fullname',
    'phone',
    'address',
    'buildingId',
    'facultyId',
    'symptom',
    'examinationDate',
    'examinationTime',
    'fullnameNT',
    'addressNT',
    'phoneNT',
    'doctorId'

  ];

  async ngOnInit(): Promise<void> {
    this.loadingService.Start(); 
    var checkLogin = this.commonService.checkLocalStorage();
    this.user = JSON.parse(this.commonService.getLocalSotrage('userInfor'))['userId'];
    if (checkLogin) {
      this.appointmentModel = JSON.parse(this.commonService.getLocalSotrage('appointment')); 
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/get-specialization').subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          }
        });
      });

      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.specializationModelList = resp.returnObject as SpecializationModel[];
      } else {
        console.error(resp.errorMessage);
        throw resp;
      }

      let resp1 = await new Promise<ReciveModel>((resolve) => {
        this.httpClient
          .get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/get-building')
          .subscribe({
            next: (resp) => {
              resolve(resp);
            },
            error: (error) => {
              resolve(error);
            },
          });
      });
  
      if (resp1.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.buildingList = resp1.returnObject as BuildingModel[];
      } else {
        console.error(resp1.errorMessage);
        throw resp1;
      }

    } else {
      this.commonService.setLocalSotrage('loginState',false);
      this.router.navigate(['/dang-nhap']);
    } 
    await this.loadingService.Stop();
  }

  ngAfterViewInit(): void {
    var checkLogin = this.commonService.checkLocalStorage();
    if (checkLogin) {
      this.elementRefs= {
        fullname: this.fullname,
        phone: this.phone,
        address: this.address,
        fullnameNT: this.fullnameNT,
        phoneNT: this.phoneNT,
        addressNT: this.addressNT,
        facultyId: this.facultyId,
        buildingId: this.buildingId,
        symptom: this.symptom,
        examinationDate: this.examinationDate,
        examinationTime: this.examinationTime,
        doctorId: this.doctorId
      };
      (this.fullname.nativeElement as HTMLInputElement).value = this.appointmentModel.fullname;
      (this.phone.nativeElement as HTMLInputElement).value = this.appointmentModel.phone;
      (this.address.nativeElement as HTMLInputElement).value = this.appointmentModel.address;
      (this.fullnameNT.nativeElement as HTMLInputElement).value = this.appointmentModel.fullnameNT;
      (this.phoneNT.nativeElement as HTMLInputElement).value = this.appointmentModel.phoneNT;
      (this.addressNT.nativeElement as HTMLInputElement).value = this.appointmentModel.addressNT;
      this.currentDate = this.getCurrentDate();
    } else {
      this.commonService.setLocalSotrage('loginState',false);
      this.router.navigate(['/dang-nhap']);
    }
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  medicalExaminationTimeChangeCheck() : void {
    this.elementRefs= {
      fullname: this.fullname,
      phone: this.phone,
      address: this.address,
      fullnameNT: this.fullnameNT,
      phoneNT: this.phoneNT,
      addressNT: this.addressNT,
      facultyId: this.facultyId,
      buildingId: this.buildingId,
      symptom: this.symptom,
      examinationDate: this.examinationDate,
      examinationTime: this.examinationTime,
      doctorId: this.doctorId
    };
    var examinationTime = (this.examinationTime.nativeElement as HTMLInputElement).value;

    if (examinationTime != '') {
      this.medicalExaminationTimeChange();
    }
  }

  async medicalExaminationTimeChange() : Promise<void> {
    this.elementRefs= {
      fullname: this.fullname,
      phone: this.phone,
      address: this.address,
      fullnameNT: this.fullnameNT,
      phoneNT: this.phoneNT,
      addressNT: this.addressNT,
      facultyId: this.facultyId,
      buildingId: this.buildingId,
      symptom: this.symptom,
      examinationDate: this.examinationDate,
      examinationTime: this.examinationTime,
      doctorId: this.doctorId
    };
    this.loadingService.Start();

    this.isOK = false;
    var checkFlg = true;
    this.validateService.clearError(this.listElement,this.elementRefs);

    var facultyId = (this.facultyId.nativeElement as HTMLInputElement).value;
    if (facultyId == '') {
      this.validateService.printMsg('ERROR', 'Vui lòng chọn hình thức khám!');
      (this.elementRefs['facultyId'].nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      checkFlg = false;
      this.finalCheckFlg = false;
    }

    var examinationDate = (this.examinationDate.nativeElement as HTMLInputElement).value;
    if (!examinationDate) {
      this.validateService.printMsg('ERROR', 'Vui lòng chọn ngày!');
      (this.elementRefs['examinationDate'].nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      checkFlg = false;
      this.finalCheckFlg = false;
    }

    var buildingId = (this.buildingId.nativeElement as HTMLInputElement).value;
    if (!buildingId) {
      this.validateService.printMsg('ERROR', 'Vui lòng nơi khám!');
      (this.elementRefs['buildingId'].nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      checkFlg = false;
      this.finalCheckFlg = false;
    }

    if (checkFlg) {
      var examinationTime = (this.examinationTime.nativeElement as HTMLInputElement).value;
      if (examinationTime != '') {
        let params = new HttpParams();
        params = params.append('medicalExaminationTime', examinationTime);
        params = params.append('medicalExaminationDay', examinationDate);
        params = params.append('specializationId', facultyId);
        params = params.append('buildingId', buildingId);
        let resp = await new Promise<ReciveModel>((resolve) => {
          this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'appointment/get-doctors', {params: params}).subscribe({
            next: (resp) => {
              resolve(resp);
            },
            error: (error) => {
              resolve(error);
            }
          });
        });
  
        if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
          this.validateService.printMsg('WARNING', 'Các bác sĩ trong khung giờ này đều bận! Vui lòng chọn một khung giờ khác.');
          this.doctorDisplayList = [];
          this.haveDoctor = false;
          this.isInfoDoctor = false;
          this.finalCheckFlg = false;
        } else if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
          this.doctorDisplayList = resp.returnObject as DoctorDisplayModel[];
          this.haveDoctor = true;
          this.finalCheckFlg = true;
        } else {
          throw resp;
        }
      } else {
        this.doctorDisplayList = [];
        this.haveDoctor = false;
        this.isInfoDoctor = false;
        this.finalCheckFlg = false;
      }
    } else {
      this.haveDoctor = false;
      this.isInfoDoctor = false;
      this.finalCheckFlg = false;
    }
    await this.loadingService.Stop();
  }

  async doctorChange() : Promise<void>  {
    this.elementRefs= {
      fullname: this.fullname,
      phone: this.phone,
      address: this.address,
      fullnameNT: this.fullnameNT,
      phoneNT: this.phoneNT,
      addressNT: this.addressNT,
      facultyId: this.facultyId,
      buildingId: this.buildingId,
      symptom: this.symptom,
      examinationDate: this.examinationDate,
      examinationTime: this.examinationTime,
      doctorId: this.doctorId
    };
    this.loadingService.Start();
    this.isOK = false;

    var doctor = (this.doctorId.nativeElement as HTMLInputElement).value;

    if (doctor == '') {
      this.validateService.printMsg('ERROR', 'Vui lòng chọn bác sĩ!');
      this.isInfoDoctor = false;
      this.finalCheckFlg = false;
      //(this.elementRefs['doctor'].nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
    } else {
      var appointmentModelDB = this.settDataDB();
      var user = JSON.parse(this.commonService.getLocalSotrage('userInfor'));
      appointmentModelDB.userId = user['userId'];
      appointmentModelDB.appointmentBeforId
        = (this.DoctorDisplay ==null || this.DoctorDisplay.appointmentId == null) ? '' : this.DoctorDisplay.appointmentId;
      var  sendModel = new SendModel();
      sendModel.model = appointmentModelDB;
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'appointment/get-doctor-info', sendModel).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          }
        });
      });

      if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
        this.validateService.printMsg('WARNING', 'Không tìm thấy thông tin chi tiết của bác sĩ. Tuy nhiên bạn vẫn có thể đặt lịch hẹn.');
        this.isInfoDoctor = false;
        this.finalCheckFlg = false;
      } else if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.DoctorDisplay = resp.returnObject as DoctorDisplayModel;
        this.facultyList = this.DoctorDisplay.facultys;
        this.isInfoDoctor = true;
        this.finalCheckFlg = true;
      } else if (resp.errorCode == this.constantVariable.DUPLICATE_KEY) {
        this.validateService.printMsg('WARNING', resp.errorMessage);
        this.isInfoDoctor = false;
        this.finalCheckFlg = false;
      }else {
        throw resp;
      }
    }
    await this.loadingService.Stop();
  }

  confirm() : void {
    this.elementRefs= {
      fullname: this.fullname,
      phone: this.phone,
      address: this.address,
      fullnameNT: this.fullnameNT,
      phoneNT: this.phoneNT,
      addressNT: this.addressNT,
      facultyId: this.facultyId,
      buildingId: this.buildingId,
      symptom: this.symptom,
      examinationDate: this.examinationDate,
      examinationTime: this.examinationTime,
      doctorId: this.doctorId
    };
    this.isOK = false;
    this.validateService.clearError(this.listElement , this.elementRefs)
    this.appointmentModelDB = this.settDataDB();
    var emptyFlg = this.validateService.haveDataEmpty(this.appointmentModelDB, this.elementRefs, this.user);

    //if (this.finalCheckFlg) {
      
      if (emptyFlg) {
        this.isConfirm = true;

        this.validateService.printMsg('SUCCESS', 'Vui lòng kiểm tra thông tin thẻ khám! Nếu mọi thông tin đã đúng vui lòng nhấn nút đăng ký!');
        this.isOK = true;
      }
       
    //} else {
    //  this.validateService.printMsg(this.user, 'Các thông tin chưa chính xác hoặc thiếu! Vui Lòng kiểm tra lại!', 'WARNING');
      
    //}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async registerAppointment() : Promise<void> {
    this.loadingService.Start();
    const sendModel = new SendModel();

    var appointmentModelDB = this.settDataDB();
    var user = JSON.parse(this.commonService.getLocalSotrage('userInfor'));
    appointmentModelDB.userId = user['userId'];
    appointmentModelDB.appointmentBeforId;

    sendModel.model = appointmentModelDB;
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'appointment/register-appointment', sendModel).subscribe({
        next: (resp) => {
          resolve(resp);
        },
        error: (error) => {
          resolve(error);
        }
      });
    });

    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.commonService.setLocalSotrage('paramShareAP', resp.returnObject as AppointmentModelDB);
      window.location.href='/dang-ky-kham-benh-thanh-cong';
    } else if (resp.errorCode == this.constantVariable.ERROR_UPDATE) {
      this.validateService.printMsg('WARNING', resp.errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await this.loadingService.Stop();
      setTimeout(() => {this.router.navigate(['xac-nhan-dat-lich'])}, 3000);
      return;
    }else {
      throw resp;
    }

    await this.loadingService.Stop();
  }

  settDataDB() : AppointmentModelDB {
     var appointmentModelDB = new AppointmentModelDB();
      appointmentModelDB.fullname = (this.fullname.nativeElement as HTMLInputElement).value;
      appointmentModelDB.phone = (this.phone.nativeElement as HTMLInputElement).value;
      appointmentModelDB.address = (this.address.nativeElement as HTMLInputElement).value;
      appointmentModelDB.buildingId = (this.buildingId.nativeElement as HTMLInputElement).value;

      appointmentModelDB.facultyId = this.facultyId ? (this.facultyId.nativeElement as HTMLInputElement).value : '';
      appointmentModelDB.facultyName = '';
      this.specializationModelList.forEach(spec => {
        if (spec.id == appointmentModelDB.facultyId){
          appointmentModelDB.facultyName = spec.name;
        }
      });

      appointmentModelDB.symptom = this.symptom ?
        (this.symptom.nativeElement as HTMLInputElement).value == '' ? 'Không' : (this.symptom.nativeElement as HTMLInputElement).value : '';
      appointmentModelDB.examinationDate = this.examinationDate ? (this.examinationDate.nativeElement as HTMLInputElement).value : '';
      appointmentModelDB.examinationTime = this.examinationTime ? (this.examinationTime.nativeElement as HTMLInputElement).value : '';

      appointmentModelDB.doctorId = this.doctorId ? (this.doctorId.nativeElement as HTMLInputElement).value : '';
      appointmentModelDB.doctorName = '';
      this.doctorDisplayList.forEach(doc => {
        if (doc.userId == appointmentModelDB.doctorId){
          appointmentModelDB.doctorName = doc.fullname;
        }
      });
      
      appointmentModelDB.fullnameNT = (this.fullnameNT.nativeElement as HTMLInputElement).value;
      appointmentModelDB.phoneNT = (this.phoneNT.nativeElement as HTMLInputElement).value;
      appointmentModelDB.addressNT = (this.addressNT.nativeElement as HTMLInputElement).value;

      return appointmentModelDB;
  }

  changeBuilding() : void {
    this.elementRefs= {
      fullname: this.fullname,
      phone: this.phone,
      address: this.address,
      fullnameNT: this.fullnameNT,
      phoneNT: this.phoneNT,
      addressNT: this.addressNT,
      facultyId: this.facultyId,
      buildingId: this.buildingId,
      symptom: this.symptom,
      examinationDate: this.examinationDate,
      examinationTime: this.examinationTime,
      doctorId: this.doctorId
    };
    var building = (this.buildingId.nativeElement as HTMLInputElement).value;
    this.doctorDisplayList = [];
    if (building) {
      this.isBuildingSelected = true;
      //this.medicalExaminationTimeChange();
    } else {
      this.validateService.printMsg('WARNING', 'Bạn chưa chọn nơi khám!');
      this.isBuildingSelected = false;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  async beforeUnloadHandler(event: Event) {

    var params = new HttpParams();
    params = params.append('userId', '');
    params = params.append('apoinmentId', this.DoctorDisplay.appointmentId);
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'appointment/delete-appointment', {params: params}).subscribe({
        next: (resp) => {
          resolve(resp);
        },
        error: (error) => {
          resolve(error);
        }
      });
    });
  }
}
