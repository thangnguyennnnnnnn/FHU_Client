import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { SocketService } from '../service/SocketService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { DiagnosticDisplayModel } from './Model/DiagnosticDisplayModel';
import { ValidateService } from '../service/ValidateService';

@Component({
  selector: 'app-diagnostic-card',
  templateUrl: './diagnostic-card.component.html',
  styleUrls: ['./diagnostic-card.component.css']
})
export class DiagnosticCardComponent implements OnInit, AfterViewInit {

  @ViewChild('appointmentId') appointmentId!: ElementRef;
  @ViewChild('name') name!: ElementRef;
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

  diagnosticDisplayList: DiagnosticDisplayModel[] = [];
  isAuthor = true;
  userId = '';
  userDisplay = '';
  role = 0;
  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'phieu-chuan-doan');
    var user = this.commonService.getLocalSotrage('userInfor');
    if (user) {
      this.userId = JSON.parse(user)['userId'];
      this.role = JSON.parse(user)['role'];
      this.userDisplay = JSON.parse(user)['userDisp'];
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadingService.Start();
    var appoinmentId;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        appoinmentId = params.get('appoinmentId');
        resolve();
      });
    });
    await this.loadingService.Stop();
    if (appoinmentId) {
      (this.appointmentId.nativeElement as HTMLInputElement).value =
        appoinmentId;
      this.searchDiagnosticCard();
    }
    // if (this.userId && this.role == 4) {
    //   this.searchDiagnosticCard();
    // }
  }

  async searchDiagnosticCard() : Promise<void> {
    var appointmentId = (this.appointmentId.nativeElement as HTMLInputElement).value;
    var name = (this.name.nativeElement as HTMLInputElement).value;

    if (!appointmentId && !name) {
      this.validateService.printMsg('WARNING', 'Vui lòng điền ít nhất 1 thông tin!');
      (this.appointmentId.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      (this.name.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      return;
    } else {
      (this.appointmentId.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.name.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    }

    let params = new HttpParams();
    if (this.role == 4) {
      params = params.append('userId', this.userId);
    } else {
      params = params.append('userId', '');
    }
    params = params.append('appointmentId', appointmentId ? appointmentId : '');
    params = params.append('name', name ? name : '');

    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +'diagnostic/get-diagnostic-cards',
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
      this.diagnosticDisplayList = resp.returnObject as DiagnosticDisplayModel[];
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) { 
      this.diagnosticDisplayList = [];
      this.isAuthor = false;
      this.validateService.printMsg(
        'WARNING',
        resp.errorMessage + ' Hoặc bạn không có quyền xem thông tin này.',
      );
    } else {
      console.error(resp.errorMessage);
      this.validateService.printMsg(
        'ERROR',
        'Đã có lỗi xảy ra! Vui lòng thử lại hoặc liên hệ quản trị viên.',
      );
    }
  }

  goToUpdateDiagnosticCard(appointmentId: string) : void {
    var url = this.constantVariable.CONTENT_API_CLIENT + 'cap-nhat-phieu-chuan-doan?appointmentId=' + appointmentId;
    window.open(url, '_blank');
  }

  goToMedicineCard(appointmentId: string) : void {
    var url = this.constantVariable.CONTENT_API_CLIENT + 'xem-don-thuoc?appointmentId=' + appointmentId;
    window.open(url, '_blank');
  }

  getStatus(keySearch: string): string {
    let status = 'Đang khám';
    switch (keySearch) {
      case this.constantVariable.DIAGNOSTIC_STATUS['Đang khám']:
        status = 'Đang khám';
        break;
      case this.constantVariable.DIAGNOSTIC_STATUS['Ổn định - Không vấn đề']:
        status = 'Ổn định - Không vấn đề';
        break;
      case this.constantVariable.DIAGNOSTIC_STATUS['Uống thuốc theo chỉ định']:
        status = 'Uống thuốc theo chỉ định';
        break;
      case this.constantVariable.DIAGNOSTIC_STATUS['Nhập viện điều trị']:
        status = 'Nhập viện điều trị';
        break; 
      case this.constantVariable.DIAGNOSTIC_STATUS['Đợi khám']:
        status = 'Đợi khám';
        break;
      default:
        status = 'Lỗi';
        break;
    }

    return status;
  }
}
