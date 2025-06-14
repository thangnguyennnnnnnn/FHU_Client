import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { SocketService } from '../service/SocketService';
import { ConstantVariable } from '../service/ConstantVariable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ReciveModel } from '../model/reciveModel';
import { DiagnosticDisplayModel } from '../diagnostic-card/Model/DiagnosticDisplayModel';
import { SendModel } from '../model/sendModel';
import { ValidateService } from '../service/ValidateService';
import { MedicineModel } from '../model/MedicineModel';

@Component({
  selector: 'app-update-diagnostic-card',
  templateUrl: './update-diagnostic-card.component.html',
  styleUrls: ['./update-diagnostic-card.component.css'],
})
export class UpdateDiagnosticCardComponent {
  @ViewChild('appointmentId') appointmentId!: ElementRef;
  @ViewChild('name') name!: ElementRef;
  @ViewChild('phone') phone!: ElementRef;
  @ViewChild('diagnosticResult') diagnosticResult!: ElementRef;
  @ViewChild('dayOfReview') dayOfReview!: ElementRef;
  @ViewChild('diagnosticStatus') diagnosticStatus!: ElementRef;

  @ViewChild('medicineName') medicineName!: ElementRef;
  @ViewChild('appoinmentId') appoinmentId!: ElementRef;

  @ViewChild('note') note!: ElementRef;
  @ViewChild('numberDay') numberDay!: ElementRef;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private validateService: ValidateService
  ) {}

  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private socketService = new SocketService();
  private constantVariable = new ConstantVariable();

  listMedicine: MedicineModel[] = [];
  diagnosticDisplay!: DiagnosticDisplayModel;
  isUpdateBtnDisabled = false;
  userId = '';
  role = 0;
  isAddMedicines = false;
  listDisplay = 0;
  ngOnInit(): void {
    this.userId = this.commonService.checkAuthen(2, this.router);
  }

  async ngAfterViewInit(): Promise<void> {
    var appointmentId;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        appointmentId = params.get('appointmentId');
        resolve();
      });
    });
    let params = new HttpParams();

    params = params.append('userId', '');
    params = params.append('appointmentId', appointmentId ? appointmentId : '');
    params = params.append('name', '');

    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'diagnostic/get-diagnostic-cards',
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
      var diagnosticDisplayList = resp.returnObject as DiagnosticDisplayModel[];
      this.diagnosticDisplay = Object.assign(diagnosticDisplayList[0]);
      (this.appointmentId.nativeElement as HTMLInputElement).value =
        this.diagnosticDisplay.appointmentId;
      (this.name.nativeElement as HTMLInputElement).value =
        this.diagnosticDisplay.fullname;
      (this.phone.nativeElement as HTMLInputElement).value =
        this.diagnosticDisplay.phone;
      (this.diagnosticResult.nativeElement as HTMLInputElement).value =
        this.diagnosticDisplay.diagnosticResult;
      (this.dayOfReview.nativeElement as HTMLInputElement).value =
        this.diagnosticDisplay.dayOfReview;
      (this.diagnosticStatus.nativeElement as HTMLInputElement).value =
        this.diagnosticDisplay.diagnosticStatus;
      if (
        this.diagnosticDisplay.diagnosticStatus !=
        this.constantVariable.DIAGNOSTIC_STATUS['Đợi khám']
      ) {
        this.isUpdateBtnDisabled = true;
      } else {
        this.isUpdateBtnDisabled = false;
      }
      if (this.diagnosticDisplay.diagnosticStatus == '2') {
        this.isAddMedicines = true;
      }
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.validateService.printMsg(
        'WARNING',
        resp.errorMessage,
      );
    } else {
      console.error(resp.errorMessage);
      this.validateService.printMsg(
        'ERROR',
        'Đã có lỗi xảy ra! Vui lòng thử lại hoặc liên hệ quản trị viên.',
      );
    }
  }

  async updateDiagnostic(): Promise<void> {

    var diagnosticStatusClone = Object.assign({}, this.diagnosticDisplay) as DiagnosticDisplayModel;

    // Kiểm tra xem đã bắt đầu khám chưa
    if ((this.diagnosticStatus.nativeElement as HTMLInputElement).value == '8') {
      this.validateService.printMsg(
        'WARNING',
        'Trạng thái khám đang ở <strong>ĐỢI KHÁM</strong> vui lòng chuyển đổi sang <strong>ĐANG KHÁM</strong> hoặc một trạng thái khác và thực hiện lại.',
      );
      (
        this.diagnosticStatus.nativeElement as HTMLInputElement
      ).style.borderColor = this.constantVariable.COLOR_ERROR;
      return;
    } else {
      (
        this.diagnosticStatus.nativeElement as HTMLInputElement
      ).style.borderColor = this.constantVariable.COLOR_NORMAL;
    }

    // Kiểm tra xem trạng thái có thay đổi không
    if (
      diagnosticStatusClone.diagnosticStatus ==
      (this.diagnosticStatus.nativeElement as HTMLInputElement).value
    ) {
      this.validateService.printMsg(
        'WARNING',
        'Trạng thái khám chưa thay đổi! Vui lòng chuyển trạng thái.',
      );
      (
        this.diagnosticStatus.nativeElement as HTMLInputElement
      ).style.borderColor = this.constantVariable.COLOR_ERROR;
      return;
    } else {
      diagnosticStatusClone.diagnosticStatus =
        (this.diagnosticStatus.nativeElement as HTMLInputElement).value;
      (
        this.diagnosticStatus.nativeElement as HTMLInputElement
      ).style.borderColor = this.constantVariable.COLOR_NORMAL;
    }

    // Kiểm tra kết quả khám có thay đổi
    var result = (this.diagnosticResult.nativeElement as HTMLInputElement)
      .value;
    if (result != 'Đang cập nhập...' && result != '') {
      (
        this.diagnosticResult.nativeElement as HTMLInputElement
      ).style.borderColor = this.constantVariable.COLOR_NORMAL;
      diagnosticStatusClone.diagnosticResult = result;
    } else {
      this.validateService.printMsg(
        'WARNING',
        'Kết quả chuẩn đoán chưa được điền!',
      );
      (
        this.diagnosticResult.nativeElement as HTMLInputElement
      ).style.borderColor = this.constantVariable.COLOR_ERROR;
      return;
    }
    diagnosticStatusClone.dayOfReview = (
      this.dayOfReview.nativeElement as HTMLInputElement
      ).value
      ? (this.dayOfReview.nativeElement as HTMLInputElement).value
      : '';
    
    diagnosticStatusClone.diagnosticDoctorId = this.userId;
    
    this.loadingService.Start();
    var sendModel = new SendModel();
    sendModel.model =  diagnosticStatusClone;
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .post<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'diagnostic/update-diagnostic-card',sendModel
        )
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            error['errorCode'] == this.constantVariable.ERROR_NUMBER;
            resolve(error);
          },
        });
    });

    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.diagnosticDisplay = Object.assign({}, resp.returnObject) as DiagnosticDisplayModel;
      if (this.diagnosticDisplay.diagnosticStatus == '2') {
        this.isAddMedicines = true;
      } else {
        this.isAddMedicines = false;
      }
      this.validateService.printMsg(
        'SUCCESS',
        'Cập nhật thành công!',
      );
      var link = 'thong-tin-lich-kham?appoinmentId=' + this.diagnosticDisplay.appointmentId;
      this.socketService.sendMessageToSocket(
        this.diagnosticDisplay.appointmentId,
        'Lịch khám '+ this.diagnosticDisplay.appointmentId + ' đã được cập nhật trạng thái mới!',
        'SUCCESS',
        link,
        this.httpClient
      );
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      console.error(resp.errorMessage);
      this.validateService.printMsg(
        'INFO',
        'Không tìm thấy thông tin!',
      );
    } else if (
      resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER
    ) {
      console.error(resp.errorMessage);
      this.validateService.printMsg(
        'WARNING',
        'Bạn không có quyền thực hiện chức năng này!',
      );
    } else {
      console.error(resp.errorMessage);
      this.validateService.printMsg(
        'ERROR',
        'Đã có lỗi xảy ra! Vui lòng thử lại hoặc liện hệ quản trị viên.',
      );
    }
    await this.loadingService.Stop();
  }

  checkStatus() {
    var diagnosticStatus = this.diagnosticStatus.nativeElement.value;

    if (this.diagnosticDisplay.diagnosticStatus != '8') {
      if (this.diagnosticDisplay.diagnosticStatus != '0') {
        if (diagnosticStatus == '8' || diagnosticStatus == '0') {
          this.validateService.printMsg('WARNING', 'Trạng thái hiện tại không hợp lệ so với trạng thái trước đó!');
          this.diagnosticStatus.nativeElement.value = this.diagnosticDisplay.diagnosticStatus;
        }
      }
    }

    if (this.diagnosticDisplay.diagnosticStatus == '0') {
      if (diagnosticStatus == '8'){
        this.validateService.printMsg('WARNING', 'Trạng thái hiện tại không hợp lệ so với trạng thái trước đó!');
          this.diagnosticStatus.nativeElement.value = this.diagnosticDisplay.diagnosticStatus;
      }
    }
  }

  openPopup(id: string) {
    (document.getElementById("popup") as HTMLInputElement).classList.add("show");
    this.appoinmentId.nativeElement.value = id;
  }

  close() {
    (document.getElementById("popup") as HTMLInputElement).classList.remove("show");
  }

  async searchMedicine() : Promise<void> {
    (this.medicineName.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    
    var medicineName = this.medicineName.nativeElement.value;

    if (!medicineName) {
      (this.medicineName.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Vui lòng nhập tên thuốc!');
      return;
    }
    
    var params = new HttpParams();
    params = params.append('name', medicineName);
    params = params.append('ingredients', '');
    params = params.append('uses', '');
    params = params.append('quantity', '');
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/search-medicine', {params: params}).subscribe(
        {
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            error['errorCode'] == this.constantVariable.ERROR_NUMBER;
            resolve(error);
          },
        });
    });
    await this.loadingService.Stop();
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.listMedicine = resp.returnObject as MedicineModel[];
      this.listDisplay = this.listMedicine.length;
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.listMedicine = [];
      this.listDisplay = 0;
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_FORMAT_ERROR) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } 
  }

  prescriptionList: MedicineModel[] = [];
  prescriptionListSize = 0;
  addToPrescription(medicineModel: MedicineModel) {
    if (this.prescriptionList.find((m) => m.id == medicineModel.id)) {
      this.validateService.printMsg('WARNING', 'Đã tồn tại trong đơn!');
    } else {
      this.prescriptionList.push(medicineModel);
      this.prescriptionListSize = this.prescriptionList.length;
    }
  }

  getNote(prescriptionList: MedicineModel[]) {
    prescriptionList.forEach((m) => {
      m.note = (document.getElementById('medicine_' + m.id) as HTMLInputElement).value;
    })
  }

  removeMedicine(medicineModel: MedicineModel) {
    var index = this.prescriptionList.indexOf(medicineModel);
    if (index !== -1) {
      this.prescriptionList.splice(index, 1);
    }
    this.prescriptionListSize = this.prescriptionList.length;
  }

  async createPrescription(prescriptionList: MedicineModel[]) {
    if (prescriptionList.length == 0) {
      this.prescriptionListSize = this.prescriptionList.length;
      this.validateService.printMsg('ERROR', 'Có lỗi xảy ra!');
      return;
    }

    this.getNote(prescriptionList);
    console.log(prescriptionList);
    var note = this.note.nativeElement.value;
    if (!note) {
      (this.note.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Hãy thêm ghi chú cho bệnh nhân!');
      return;
    } else {
      (this.note.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    }

    var numberDay = this.numberDay.nativeElement.value;
    if (!numberDay) {
      (this.numberDay.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Số ngày uống thuốc chưa được thiết lập!');
      return;
    } else {
      (this.numberDay.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    }

    var formData = new FormData();
    formData.append('prescriptionList', JSON.stringify(prescriptionList));
    formData.append('note', note);
    formData.append('numberDay', numberDay);
    formData.append('userId', this.userId);
    formData.append('appoinmentId', this.diagnosticDisplay.appointmentId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'prescription/create-prescription', formData).subscribe(
        {
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            error['errorCode'] == this.constantVariable.ERROR_NUMBER;
            resolve(error);
          },
        });
    });
    await this.loadingService.Stop();
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var link = 'xem-don-thuoc?appointmentId=' + this.diagnosticDisplay.appointmentId;
      this.socketService.sendMessageToSocket(this.userId,'Đơn thuốc đã tạo thành công', 'SUCCESS', link, this.httpClient);
      this.socketService.sendMessageToSocket(this.diagnosticDisplay.appointmentId,'Đơn thuốc đã tạo thành công', 'SUCCESS', link, this.httpClient);
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_FORMAT_ERROR) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } 
  }
 }
