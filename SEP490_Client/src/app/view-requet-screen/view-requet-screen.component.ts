import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ValidateService } from '../service/ValidateService';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { SocketService } from '../service/SocketService';
import { DateTimeService } from '../service/DateTimeService';
import { ReciveModel } from '../model/reciveModel';
import { FileInfo } from './Model/FileInfo';
import { WorkingTime } from './Model/WorkingTime';
@Component({
  selector: 'app-view-requet-screen',
  templateUrl: './view-requet-screen.component.html',
  styleUrls: ['./view-requet-screen.component.css'],
})
export class ViewRequetScreenComponent implements OnInit, AfterViewInit {
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

  @ViewChild('reportYear') reportYear!: ElementRef;
  @ViewChild('reportMonth') reportMonth!: ElementRef;
  @ViewChild('type') type!: ElementRef;
  filename: string[] = [];
  filenameRequest: FileInfo[] = [];
  filenameRequestD: FileInfo[] = [];
  workingTime: WorkingTime[] = [];
  userId = '';
  role = 0;
  ngOnInit(): void {
    this.loadingService.Start();
    this.commonService.setLocalSotrage('page', 'xem-yeu-cau');
    this.userId = this.commonService.getUserSession();
    this.role = this.commonService.getRoleUser();
    if (!this.userId) {
      this.router.navigate(['dang-nhap']);
    }
    this.loadingService.Stop();
  }

  async ngAfterViewInit(): Promise<void> {
    var year;
    var month;
    var type;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        year = params.get('nam');
        month = params.get('thang');
        type = params.get('type');
        resolve();
      });
    });
    if (year && month) {
      this.reportMonth.nativeElement.value = month;
      this.reportYear.nativeElement.value = year;
      this.type.nativeElement.value = type;
      this.searchMedicineReport_Request(2);
    }
  }

  async searchMedicineReport_Request(type: number): Promise<void> {
    (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor =
      this.constantVariable.COLOR_NORMAL;
    (this.reportYear.nativeElement as HTMLInputElement).style.borderColor =
      this.constantVariable.COLOR_NORMAL;

    var reportMonth = this.reportMonth.nativeElement.value;
    var reportYear = this.reportYear.nativeElement.value;

    var year!: number | string;
    var month!: number | string;
    if (!reportMonth || !reportYear) {
      (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor =
        this.constantVariable.COLOR_ERROR;
      (this.reportYear.nativeElement as HTMLInputElement).style.borderColor =
        this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg(
        'WARNING',
        'Báo cáo phải có năm và tháng. Vui lòng nhập.'
      );
      return;
    }

    try {
      year = Number.parseInt(reportYear);
      if (isNaN(year)) {
        throw new Error();
      }

      if (year < 1900) {
        (this.reportYear.nativeElement as HTMLInputElement).style.borderColor =
          this.constantVariable.COLOR_ERROR;
        this.validateService.printMsg('WARNING', 'Năm phải lớn hơn 1900');
        return;
      }
    } catch (err) {
      (this.reportYear.nativeElement as HTMLInputElement).style.borderColor =
        this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Định dạng năm không đúng.');
      return;
    }

    try {
      month = Number.parseInt(reportMonth);
      if (isNaN(month)) {
        throw new Error();
      }
      if (month < 0 || month > 12) {
        (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor =
          this.constantVariable.COLOR_ERROR;
        this.validateService.printMsg('WARNING', 'Tháng không hợp lệ.');
        return;
      }
    } catch (err) {
      (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor =
        this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Định dạng tháng không đúng.');
      return;
    }

    var typeValue = this.type.nativeElement.value;
    var params = new HttpParams();
    params = params.append('year', year);
    params = params.append('month', month);
    params = params.append('userId', this.userId);
    params = params.append('type', type);
    params = params.append('typeValue', typeValue);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER + 'medicine/search-report',
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
      if (typeValue == '3') {
        this.filenameRequest = Object.assign(
          [],
          resp.returnObject as []
        )[0] as FileInfo[];
        this.workingTime = Object.assign(
          [],
          resp.returnObject as []
        )[1] as WorkingTime[];
      } else {
        this.filenameRequestD = Object.assign(
          [],
          resp.returnObject
        ) as FileInfo[];
        this.filenameRequest = Object.assign(
          [],
          resp.returnObject
        ) as FileInfo[];
      }
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.validateService.printMsg('INFO', resp.errorMessage);
      this.filenameRequest = [];
      this.filenameRequestD = [];
      this.workingTime = [];
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    }
  }

  async downloadFile(filename: string) {
    var params = new HttpParams();
    params = params.append('filename', filename);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER + 'medicine/download-report',
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
      const byteCharacters = atob(resp.returnObject + '');
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      var files = filename.split('/');
      a.href = url;
      a.download = files[files.length - 1];
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    }
  }

  async approveRequest(
    filename: string,
    createId: string,
    type = '2'
  ): Promise<void> {
    var params = new HttpParams();
    params = params.append('filename', filename);
    params = params.append('userId', this.userId);
    params = params.append('type', type);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER + 'medicine/approve-request',
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
      if (type == '3') {
        var link = 'lich-lam-viec?id=' + resp.returnObject;
        this.socketService.sendMessageToSocket(
          createId,
          'Đơn yêu cầu nghỉ phép đã được phê duyệt.',
          'INFO',
          link,
          this.httpClient
        );
        this.validateService.printMsg('SUCCESS', 'Yều cầu duyệt thành công!');
        this.searchMedicineReport_Request(2);
        return;
      }
      var link = 'tai-xuong?file=' + filename;
      this.socketService.sendMessageToSocket(
        createId,
        'Đơn yêu cầu đã được phê duyệt.',
        'INFO',
        link,
        this.httpClient
      );
      this.validateService.printMsg('SUCCESS', 'Yều cầu duyệt thành công!');
      this.searchMedicineReport_Request(2);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    }
  }

  filterType() {
    // this.loadingService.Start();
    // var type = this.type.nativeElement.value;
    // this.filenameRequest = Object.assign([],this.filenameRequestD.filter((f) => f.approved == type));
    // this.loadingService.Stop();
  }

  item = new WorkingTime();
  detail(f: FileInfo) {
    var a = this.workingTime.find((w) => f.createDate == w.createTime);
    console.log(f);
    console.log(this.workingTime);
    console.log(a);
    if (a) {
      this.item = a;
    }
    (document.getElementById('popup') as HTMLInputElement).classList.add(
      'show'
    );
  }

  close(): void {
    (document.getElementById('popup') as HTMLInputElement).classList.remove(
      'show'
    );
  }
}
