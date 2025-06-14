import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { CommonService } from '../service/CommonService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { DateTimeService } from '../service/DateTimeService';
import { SocketService } from '../service/SocketService';
import { WorkingTimeModel } from './Model/WorkingTimeModel';

@Component({
  selector: 'app-management-working-time',
  templateUrl: './management-working-time.component.html',
  styleUrls: ['./management-working-time.component.css'],
})
export class ManagementWorkingTimeComponent implements OnInit, AfterViewInit {
  @ViewChild('date') date!: ElementRef;
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private datetimeService = new DateTimeService();
  private loadingService = new LoadingService();
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable();
  private dateTimeService = new DateTimeService();
  private socketService = new SocketService();

  currentDate: string = this.getCurrentDate();
  userId = '';
  role = 0;
  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'lich-lam-viec');
    this.userId = this.commonService.getUserSession();
    this.role = this.commonService.getRoleUser();
    if (!this.userId) {
      this.router.navigate(['dang-nhap']);
    }
  }

  workingTimeModel = new WorkingTimeModel();
  workingTimeList: WorkingTimeModel[] = [];
  async ngAfterViewInit(): Promise<void> {
    this.loadingService.Start();
    this.currentDate = this.getCurrentDate();
    var id;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        id = params.get('id');
        resolve();
      });
    });
    if (id) {
      var params = new HttpParams();
      params = params.append('id', id);
      params = params.append('date', '');
      params = params.append('userId', this.userId);
      this.loadingService.Start();
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient
          .get<ReciveModel>(
            this.constantVariable.CONTENT_API_SERVER +
              'employee/get-working-time',
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
      await this.loadingService.Stop();
      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.workingTimeModel = (
          Object.assign([], resp.returnObject) as WorkingTimeModel[]
        )[0];
        this.workingTimeList = Object.assign(
          [],
          resp.returnObject
        ) as WorkingTimeModel[];
      } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
        this.validateService.printMsg(
          'ERROR',
          'Đã xảy ra lỗi không mong muốn!'
        );
      } else {
        if (resp.errorMessage) {
          this.validateService.printMsg('ERROR', resp.errorMessage);
        } else {
          this.validateService.printMsg(
            'ERROR',
            'Đã xảy ra lỗi không mong muốn!'
          );
        }
      }

      this.popup = 'detail';
      (document.getElementById('popup') as HTMLInputElement).classList.add(
        'show'
      );
    }
    this.loadingService.Stop();
  }

  close(): void {
    this.popup = '';
    (document.getElementById('popup') as HTMLInputElement).classList.remove(
      'show'
    );
  }

  popup = '';
  showPopupReport(
    type: string,
    workingTimeModel: WorkingTimeModel | null
  ): void {
    this.popup = type;
    if (workingTimeModel) {
      this.workingTimeModel = Object.assign({}, workingTimeModel);
    }
    (document.getElementById('popup') as HTMLInputElement).classList.add(
      'show'
    );
  }

  async search() {
    var date = this.date.nativeElement.value;
    (this.date.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    if (!date) {
      this.validateService.printMsg('WARNING', 'Vui Lòng chọn ngày nghỉ!');
      (this.date.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      return;
    }
    var params = new HttpParams();
    params = params.append('id', '');
    params = params.append('date', date);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'employee/get-working-time',
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
    await this.loadingService.Stop();
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.workingTimeList = Object.assign(
        [],
        resp.returnObject
      ) as WorkingTimeModel[];
    } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } else {
      if (resp.errorMessage) {
        this.validateService.printMsg('ERROR', resp.errorMessage);
      } else {
        this.validateService.printMsg(
          'ERROR',
          'Đã xảy ra lỗi không mong muốn!'
        );
      }
    }
  }

  @ViewChild('onDate') onDate!: ElementRef;
  @ViewChild('reason') reason!: ElementRef;
  async register() {
    var onDate = this.onDate.nativeElement.value;
    var reason = this.reason.nativeElement.value;

    onDate
      ? ((this.onDate.nativeElement as HTMLInputElement).style.borderColor =
          this.constantVariable.COLOR_NORMAL)
      : ((this.onDate.nativeElement as HTMLInputElement).style.borderColor =
          this.constantVariable.COLOR_ERROR);
    reason
      ? ((this.reason.nativeElement as HTMLInputElement).style.borderColor =
          this.constantVariable.COLOR_NORMAL)
      : ((this.reason.nativeElement as HTMLInputElement).style.borderColor =
          this.constantVariable.COLOR_ERROR);

    if (!onDate || !reason) {
      this.validateService.printMsg(
        'WARNING',
        'Thông tin ngày nghỉ chưa được nhập!'
      );
      return;
    }

    var params = new HttpParams();
    params = params.append('onDate', onDate);
    params = params.append('reason', reason);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'employee/register-working-time',
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
    console.log(resp);
    
    await this.loadingService.Stop();
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var link = 'xem-yeu-cau?thang=' + this.datetimeService.getCurrentDateTime('M') + '&nam=' + this.datetimeService.getCurrentDateTime('yyyy') + '&type=3';
      this.close();
      this.socketService.sendMessageToSocket(
        'admin',
        'Có một yêu cầu nghỉ phép đang chờ bạn xác nhận.',
        'INFO',
        link,
        this.httpClient
      );
      this.validateService.printMsg(
        'SUCCESS',
        'Đã tạo yêu cầu thành công, vui lòng chờ xác nhận từ ADMIN.'
      );
      this.date.nativeElement.value = onDate;
      this.search();
      // setTimeout(() => {
      //   window.location.href = link;
      // }, 1200);
    } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } else {
      if (resp.errorMessage) {
        this.validateService.printMsg('INFO', resp.errorMessage);
      } else {
        this.validateService.printMsg(
          'ERROR',
          'Đã xảy ra lỗi không mong muốn!'
        );
      }
    }
  }

  async search_2() {
    window.open('tim-kiem-lich-kham', '_blank');
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate() + 2;
    return `${year}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
  }
}
