import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ValidateService } from '../service/ValidateService';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { SendModel } from '../model/sendModel';
import { SocketService } from '../service/SocketService';
import { MedicineModel } from '../model/MedicineModel';
import { DateTimeService } from '../service/DateTimeService';
import { PrescriptionReturnModel } from './Model/PrescriptionReturnModel';
import { PrescriptionCardModel } from './Model/PrescriptionCardModel';
import { MedicineModel2 } from './Model/MedicineModel2';
@Component({
  selector: 'app-medicine-card',
  templateUrl: './medicine-card.component.html',
  styleUrls: ['./medicine-card.component.css']
})
export class MedicineCardComponent implements OnInit, AfterViewInit{

  @ViewChild('quantity') quantity!: ElementRef;
  @ViewChild('totalQuantity') totalQuantity!: ElementRef;

  @ViewChild('appoinmentId') appoinmentId!: ElementRef;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private datetimeService = new DateTimeService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private socketService = new SocketService();

  prescriptionReturnModel: PrescriptionReturnModel = new PrescriptionReturnModel();
  prescriptionCardModel: PrescriptionCardModel = new PrescriptionCardModel();
  medicineModelList: MedicineModel2[] = [];
  medicineModelListDisplay: MedicineModel2[] = [];
  userId = '';
  username = '';
  role = '';
  isShowResult = false;
  async ngOnInit(): Promise<void> {
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    this.username = JSON.parse(userInfo)['userDisp'];
    this.role = JSON.parse(userInfo)['role'];
    this.commonService.setLocalSotrage('page', 'xem-don-thuoc');
    this.userId = this.commonService.getUserSession();
    this.loadingService.Start();
    if (!this.userId) {
      this.router.navigate(['dang-nhap']);
    }
    var appointmentId = null;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        appointmentId = params.get('appointmentId');
        resolve();
      });
    });
    if (appointmentId) {
      await this.searchPrescriptionCard(appointmentId);
    }
    await this.loadingService.Stop();
  }

  async ngAfterViewInit(): Promise<void> {
    
  }

  updateQuantity(medicineId: string) {
    var quantity = this.quantity.nativeElement.value;

    if (quantity < 0) {
      this.validateService.printMsg(
        'ERROR',
        'Số lượng không được là số âm.',
      );
      return;
    }
    var medicine = this.medicineModelList.find((m) => m.medicineId == medicineId);
    console.log(medicine);

    if (medicine) {
      var totalQuantity = medicine.totalQuantity;

      if (quantity > totalQuantity) {
        this.validateService.printMsg(
          'ERROR',
          'Số lượng không đủ vui lòng nhập thêm thuốc.',
        );
        medicine.totalQuantityDisplay = totalQuantity;
        return;
      }
      medicine.totalQuantityDisplay = totalQuantity - quantity;
      medicine.quantity = quantity;
    }
  }

  async updateCard() : Promise<void> {
    
    if (!this.isShowResult) {
      this.validateService.printMsg(
        'WARNING',
        'Không có đơn thuốc nào được chọn.',
      );
      return;
    }
    var formData = new FormData();
    formData.append('medicineModelList',JSON.stringify(this.medicineModelList));
    formData.append('userId',this.userId);

    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .post<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'prescription/update-prescription-card',
            formData
        )
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          },
        });
    });
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var link = 'xem-don-thuoc?appointmentId='+this.prescriptionCardModel.appoinmentId;
      this.socketService.sendMessageToSocket(this.prescriptionCardModel.appoinmentId,'Đơn thuốc đã hoàn thành', 'SUCCESS', link, this.httpClient);
      this.validateService.printMsg(
        'SUCCESS',
        'Đơn thuốc đã hoàn thành'
      );
    } else if (resp.errorCode == this.constantVariable.NO_CHANGE_ERROR) {
      this.validateService.printMsg(
        'WARNING',
        resp.errorMessage
      );
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg(
        'WARNING',
        resp.errorMessage
      );
    } else {
      console.error(resp.errorMessage);
      this.validateService.printMsg(
        'ERROR',
        'Đã có lỗi xảy ra! Vui lòng thử lại hoặc liên hệ quản trị viên.'
      );
    }
    await this.loadingService.Stop();
  }

  async searchPrescriptionCard(appoinmentId: string) {
    let params = new HttpParams();
    params = params.append('userId', '');
    params = params.append('appointmentId', appoinmentId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'prescription/get-prescription',
          { params: params }
        )
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          },
        });
    });
    await this.loadingService.Stop();
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.prescriptionReturnModel = resp.returnObject as PrescriptionReturnModel;
      this.prescriptionCardModel = Object.assign(PrescriptionCardModel,this.prescriptionReturnModel.prescriptionCardModel);
      this.medicineModelList = Object.assign([], this.prescriptionReturnModel.medicineModelList) as MedicineModel2[];
      this.medicineModelListDisplay = Object.assign([], this.prescriptionReturnModel.medicineModelList) as MedicineModel2[];
      this.isShowResult = true;
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.validateService.printMsg(
        'WARNING',
        resp.errorMessage,
      );
      this.isShowResult = false;
    } else {
      console.error(resp.errorMessage);
      this.validateService.printMsg(
        'ERROR',
        'Đã có lỗi xảy ra! Vui lòng thử lại hoặc liên hệ quản trị viên.',
      );
      this.isShowResult = false;
    }
  }

  search() {
    var appoinmentId = this.appoinmentId.nativeElement.value;
    if (appoinmentId) {
      this.searchPrescriptionCard(appoinmentId);
    }
  }
}
