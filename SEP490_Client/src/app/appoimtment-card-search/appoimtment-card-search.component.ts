import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { CommonService } from '../service/CommonService';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SendModel } from '../model/sendModel';
import { ReciveModel } from '../model/reciveModel';
import { DateTimeService } from '../service/DateTimeService';
import { ValidateService } from '../service/ValidateService';
import { SpecializationModel } from '../model/SpecializationModel';
import { AppointmentModelDB } from '../confirm-appointment/Model/AppointmentModelDB';
import { SocketService } from '../service/SocketService';

@Component({
  selector: 'app-appoimtment-card-search',
  templateUrl: './appoimtment-card-search.component.html',
  styleUrls: ['./appoimtment-card-search.component.css'],
})
export class AppoimtmentCardSearchComponent implements OnInit, AfterViewInit {
  /**
   * Item màn hình
   */
  @ViewChild('appointmentId') appointmentId!: ElementRef;
  @ViewChild('appointmentTime') appointmentTime!: ElementRef;
  @ViewChild('appointmentDate') appointmentDate!: ElementRef;
  @ViewChild('patientName') patientName!: ElementRef;
  @ViewChild('facultyId') facultyId!: ElementRef;

  @ViewChild('faculty') faculty!: ElementRef;
  facultyName = '';
  isSubmit = true;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private socketService = new SocketService();
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private dateTimeService = new DateTimeService();

  specializationModelList: SpecializationModel[] = [];
  listFaculty!: SpecializationModel[];
  listAppointmentModel!: AppointmentModelDB[];
  appointmentModelDB!: AppointmentModelDB;
  isDisplayAPMD = false;
  isBtnConfirmDisabled = true;
  changID = '';
  isD = false;
  user = '';
  checkAuthor = '';
  role = 0;
  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'tim-kiem-lich-kham');
    this.user = this.commonService.getUserSession();
    this.role = this.commonService.getRoleUser();
    if (this.commonService.checkAuthen(3, this.router, false)) {
      this.checkAuthor = this.commonService.checkAuthen(3, this.router, false);
    }
    if (this.commonService.checkAuthen(2, this.router, false)) {
      this.checkAuthor = this.commonService.checkAuthen(2, this.router, false);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadingService.Start();
    if (!this.checkAuthor) {
      console.error(
        'Bạn không có quyền truy thực hiện chức năng này! Nếu sai sót vui lòng liên hệ admin'
      );
      this.validateService.printMsg(
        'ERROR',
        'Chức năng này không dành cho bạn!'
      );
      this.loadingService.Stop();
      return;
    }

    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'fhc-common/get-specialization'
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
      this.specializationModelList = resp.returnObject as SpecializationModel[];
    } else {
      throw resp;
    }

    var appoinmentId;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        appoinmentId = params.get('appoinmentId');
        resolve();
      });
    });

    if (appoinmentId) {
      (this.appointmentId.nativeElement as HTMLInputElement).value =
        appoinmentId;
      this.searchAppoinment();
    }

    await this.loadingService.Stop();
  }

  apIdFocus(): void {
    this.isD = true;
  }

  apIdBlur(): void {
    this.isD = false;
  }

  getFaculty(name: string, id: string): void {
    (this.faculty.nativeElement as HTMLInputElement).value = name;
    (this.facultyId.nativeElement as HTMLInputElement).value = id;
  }

  searchFaculty(): void {
    var facultyName = (this.faculty.nativeElement as HTMLInputElement).value;
    if (!facultyName) {
      (this.facultyId.nativeElement as HTMLInputElement).value = '';
    }
    this.isSubmit = true;
    this.listFaculty = [];
    this.specializationModelList.forEach((f) => {
      if (f.name.includes(facultyName)) {
        this.listFaculty.push(f);
      }
    });

    if (this.listFaculty.length == 0) {
      this.isSubmit = false;
    }
  }

  async searchAppoinment(): Promise<void> {
    var userInfor = this.commonService.getLocalSotrage('userInfor');
    if (userInfor) {
      var user = JSON.parse(userInfor);
      if (this.checkAuthor) {
        var userId = user['userId'];
        var appointmentId = (
          this.appointmentId.nativeElement as HTMLInputElement
        ).value;
        var appointmentTime = (
          this.appointmentTime.nativeElement as HTMLInputElement
        ).value;
        var appointmentDate = (
          this.appointmentDate.nativeElement as HTMLInputElement
        ).value;
        var patientName = (this.patientName.nativeElement as HTMLInputElement)
          .value;
        var facultyId = (this.facultyId.nativeElement as HTMLInputElement)
          .value;
        var faculty = (this.faculty.nativeElement as HTMLInputElement).value;

        if (
          !appointmentId &&
          !appointmentTime &&
          !appointmentDate &&
          !patientName &&
          !facultyId &&
          !faculty
        ) {
          this.validateService.printMsg(
            'WARNING',
            'Vui lòng nhập ít nhất 1 thông tin!'
          );
          this.listAppointmentModel = [];
          return;
        }

        if (!this.isSubmit) {
          this.validateService.printMsg(
            'WARNING',
            'Không tìm thấy loại khám bệnh đã nhập!'
          );
          (this.faculty.nativeElement as HTMLInputElement).style.borderColor =
            this.constantVariable.COLOR_ERROR;
          return;
        } else {
          (this.faculty.nativeElement as HTMLInputElement).style.borderColor =
            this.constantVariable.COLOR_NORMAL;
        }

        let params = new HttpParams();
        params = params.append('userId', userId ? userId : '');
        params = params.append('appointmentId', appointmentId);
        params = params.append('appointmentTime', appointmentTime);
        params = params.append('appointmentDate', appointmentDate);
        params = params.append('patientName', patientName);
        params = params.append('facultyId', facultyId);
        params = params.append('faculty', faculty);

        this.loadingService.Start();
        let resp = await new Promise<ReciveModel>((resolve) => {
          this.httpClient
            .get<ReciveModel>(
              this.constantVariable.CONTENT_API_SERVER +
                'apointment-card/search-apointments',
              { params: params }
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
          this.listAppointmentModel = resp.returnObject as AppointmentModelDB[];
          console.log(this.listAppointmentModel);
        } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
          this.listAppointmentModel = [];
          this.validateService.printMsg('INFO', 'Không tìm thấy thông tin!');
        } else if (
          resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER
        ) {
          console.error(resp.errorMessage);
          this.validateService.printMsg(
            'ERROR',
            'Bạn không có quyền thực hiện chức năng này!'
          );
        } else {
          throw resp;
        }
        await this.loadingService.Stop();
      } else {
        console.error(
          'Bạn không có quyền truy thực hiện chức năng này! Nếu sai sót vui lòng liên hệ admin'
        );
        this.validateService.printMsg(
          'ERROR',
          'Bạn không có quyền truy thực hiện chức năng này! Nếu sai sót vui lòng liên hệ admin'
        );
      }
    } else {
      this.commonService.clearLocalSotrage();
      this.router.navigate(['dang-nhap']);
    }
  }

  createUserId = '';
  viewAppointmentDetail(appointmentBeforId: string): void {
    var rtnJson = Object.assign(
      {},
      this.getAppointmentDetail(appointmentBeforId)
    );

    if (rtnJson) {
      this.appointmentModelDB = Object.assign(
        {},
        rtnJson['object'] as AppointmentModelDB
      );
      this.isDisplayAPMD = true;
      if (this.appointmentModelDB.status == 'Tạo thành công') {
        this.isBtnConfirmDisabled = false;
      } else {
        this.isBtnConfirmDisabled = true;
      }
      this.changID = this.appointmentModelDB.appointmentBeforId;
      this.createUserId = this.appointmentModelDB.userId;
    } else {
      this.validateService.printMsg(
        'INFO',
        'Xin lỗi, không tìm thấy thông tin tương ứng. Vui lòng thử lại!'
      );
    }
  }

  openCancelPopup() {
    (document.getElementById('popup') as HTMLInputElement).classList.add(
      'show'
    );
  }

  @ViewChild('reason') reason!: ElementRef;
  cancel(appointmentModelDB: AppointmentModelDB) {
    var reason = this.reason.nativeElement.value;
    this.commonService.setLocalSotrage('ap', JSON.stringify(appointmentModelDB));
    this.socketService.sendMessageToSocket(
      appointmentModelDB.userId,
      'Bác sĩ có lời nhắn đến bạn!',
      'INFO',
      'message?id=' + appointmentModelDB.appointmentBeforId + '&messageContent=' + reason,
      this.httpClient
    );
    this.validateService.printMsg('INFO','Gửi thành công! Vui lòng chờ xác nhận từ bệnh nhân, để có thể đảm bảo, bạn có thể liên lạc trực tiếp với bệnh nhân thông qua số điện thoại.');
    this.close();
  }

  getAppointmentDetail(appointmentBeforId: string) {
    var isBreak = false;
    for (let i = 0; i < this.listAppointmentModel.length; i++) {
      if (
        this.listAppointmentModel[i].appointmentBeforId == appointmentBeforId
      ) {
        return { object: this.listAppointmentModel[i], index: i };
      }
    }
    return null;
  }

  async changeStatusAP(changID: string): Promise<void> {
    var userInfor = this.commonService.getLocalSotrage('userInfor');
    if (!userInfor) {
      this.commonService.clearLocalSotrage();
      this.router.navigate(['dang-nhap']);
      return;
    }
    if (this.isBtnConfirmDisabled) {
      this.validateService.printMsg('WARNING', 'Sống đừng có mất dại nha con!');
      return;
    }
    var user = JSON.parse(userInfor);
    if (user['role'] != 3) {
      console.error(
        'Bạn không có quyền truy thực hiện chức năng này! Nếu sai sót vui lòng liên hệ admin'
      );
      this.validateService.printMsg(
        'ERROR',
        'Bạn không có quyền truy thực hiện chức năng này! Nếu sai sót vui lòng liên hệ admin'
      );
      return;
    }
    var rtnJson = Object.assign({}, this.getAppointmentDetail(changID));
    if (rtnJson) {
      var appointmentModel = rtnJson['object'] as AppointmentModelDB;
      appointmentModel.status = '1';
      var index = rtnJson['index'];
      var sendModel = new SendModel();
      var sendOb: Object[] = [];
      sendOb.push(appointmentModel);
      sendOb.push(user['userId']);
      sendModel.model = sendOb;
      this.loadingService.Start();
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient
          .post<ReciveModel>(
            this.constantVariable.CONTENT_API_SERVER +
              'apointment-card/update-apointment',
            sendModel
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
        this.listAppointmentModel[index] = Object.assign(
          {},
          resp.returnObject as AppointmentModelDB
        );
        this.appointmentModelDB = Object.assign(
          {},
          resp.returnObject as AppointmentModelDB
        );
        this.isDisplayAPMD = true;
        this.isBtnConfirmDisabled = true;
        this.validateService.printMsg(
          'SUCCESS',
          'Xác nhận thành công! Vui lòng di chuyển đến địa điểm khám!'
        );
        var link =
          'thong-tin-lich-kham?appoinmentId=' +
          this.appointmentModelDB.appointmentBeforId;
        this.socketService.sendMessageToSocket(
          this.appointmentModelDB.userId,
          'Lịch hẹn của bạn đã xác nhận thành công! Vui lòng di chuyển đến địa điểm khám!',
          'INFO',
          link,
          this.httpClient
        );
        this.socketService.sendMessageToSocket(
          this.appointmentModelDB.doctorId,
          'Lịch hẹn đã được xác nhận! Bệnh nhân đang di chuyến đến địa điểm khám!',
          'INFO',
          link,
          this.httpClient
        );
      } else {
        throw resp;
      }
      await this.loadingService.Stop();
    } else {
      this.validateService.printMsg(
        'INFO',
        'Xin lỗi, không tìm thấy thông tin tương ứng. Vui lòng thử lại!'
      );
    }
  }

  close(): void {
    (document.getElementById('popup') as HTMLInputElement).classList.remove(
      'show'
    );
  }
}
