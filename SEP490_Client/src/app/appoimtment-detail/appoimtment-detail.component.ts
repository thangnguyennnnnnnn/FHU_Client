import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { CommonService } from '../service/CommonService';
import { AppointmentModelDB } from '../confirm-appointment/Model/AppointmentModelDB';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { SocketService } from '../service/SocketService';

@Component({
  selector: 'app-appoimtment-detail',
  templateUrl: './appoimtment-detail.component.html',
  styleUrls: ['./appoimtment-detail.component.css'],
})
export class AppoimtmentDetailComponent implements OnInit, AfterViewInit {
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private socketService = new SocketService();
  private loadingService = new LoadingService();
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable();

  isAuthor = true;
  user = '';
  URL = '';
  paramShareAP: AppointmentModelDB = new AppointmentModelDB();
  @ViewChild('qrCode') qrCode!: ElementRef;
  @ViewChild('nameFileQR') nameFileQR!: ElementRef;

  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'lich-kham')
    var user = this.commonService.getLocalSotrage('userInfor');
    if (user)
    this.user = JSON.parse(user)['userId'];
  }

  async ngAfterViewInit(): Promise<void> {
    
    var user = JSON.parse(this.commonService.getLocalSotrage('userInfor'));
    var appoinmentId;
    var userID;
    if (user) {

      await new Promise<void>((resolve) => {
        this.route.queryParamMap.subscribe((params) => {
          console.log(params);
          appoinmentId = params.get('appoinmentId');
          resolve();
        });
      });
      
      this.URL = this.constantVariable.CONTENT_API_CLIENT + 'phieu-chuan-doan?appoinmentId=' + appoinmentId;
      (this.qrCode.nativeElement as HTMLInputElement).value = this.URL;
      (this.nameFileQR.nativeElement as HTMLInputElement).value = 'Lịch Hẹn - ' +appoinmentId;

      userID = user['userId'];
      let params = new HttpParams();
      if (user['role'] == 4) {
        params = params.append('userID', userID);
      } else {
        params = params.append('userID', '');
      }
      params = params.append('appoinmentId', appoinmentId ? appoinmentId : '');
      this.loadingService.Start();
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient
          .get<ReciveModel>(
            this.constantVariable.CONTENT_API_SERVER +'appointment/get-appointment',
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
        this.paramShareAP = resp.returnObject as AppointmentModelDB;
      } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) { 
        this.isAuthor = false;
        this.validateService.printMsg(
          'WARNING',
          'Lịch hẹn không tồn tại với bạn!',
        );
      } else {
        throw resp;
      }
    } else {
      this.router.navigate(['dang-nhap']);
    }
  }

  goToDiagnosticCard(url: string) : void {
    window.open(url, '_blank');
  }
}
