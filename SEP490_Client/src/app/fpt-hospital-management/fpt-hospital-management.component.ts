import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { HttpClient, HttpParams,} from '@angular/common/http';
import { ConstantVariable } from '../service/ConstantVariable';
import { LoadingService } from '../service/LoadingService';
import { CommonService } from '../service/CommonService';
import { Router } from '@angular/router';
import { ReciveModel } from '../model/reciveModel';
import { ValidateService } from '../service/ValidateService';
import { DateTimeService } from '../service/DateTimeService';
@Component({
  selector: 'app-fpt-hospital-management',
  templateUrl: './fpt-hospital-management.component.html',
  styleUrls: ['./fpt-hospital-management.component.css']
})
export class FptHospitalManagementComponent implements OnInit, AfterViewInit {

  @ViewChild('reportMonth') month!: ElementRef;
  @ViewChild('reportYear') year!: ElementRef;
  @ViewChild('reportType') reportType!: ElementRef;

  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private datetimeService = new DateTimeService();

  constructor(private fb: FormBuilder, private httpClient: HttpClient,private router: Router, private validateService: ValidateService, ) {}

  currentMonth = this.getCurrentMonth();
  currentYear = this.getCurrentYear();
  userId = '';
  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'fpt-hospital-management');
    this.userId = this.commonService.checkAuthen(1, this.router);
    this.loadingService.Start();
    this.loadingService.Stop();
  }

  ngAfterViewInit(): void {
    this.currentMonth = this.getCurrentMonth();
    this.currentYear = this.getCurrentYear();
  }

  async createReport(): Promise<void> {
    var month = this.month.nativeElement.value;
    var year = this.year.nativeElement.value;
    var type = this.reportType.nativeElement.value;
    var params = new HttpParams();
    params = params.append('month', month);
    params = params.append('year', year);
    params = params.append('type', type);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'admin/create-report', {params: params}).subscribe(
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
      const byteCharacters = atob(resp.returnObject + '');
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const reportDate = this.datetimeService.getCurrentDateTime('ddMMyyyHHmmss');
      a.href = url;
      a.download = 'BaoCao_' + reportDate + '.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      this.validateService.printMsg('SUCCESS', 'Xuất báo cáo thành công!');
    } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } else {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } 
    
  }

  getCurrentMonth(): string {
    const today = new Date();
    const month = today.getMonth() + 1;
    return `${month.toString().padStart(2, '0')}`;
  }

  getCurrentYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    return `${year}`;
  }
}
