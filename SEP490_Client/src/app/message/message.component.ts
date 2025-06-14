import { Component } from '@angular/core';
import { CommonService } from '../service/CommonService';
import { AppointmentModelDB } from '../confirm-appointment/Model/AppointmentModelDB';
import { LoadingService } from '../service/LoadingService';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { SocketService } from '../service/SocketService';
import { ValidateService } from '../service/ValidateService';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent {
  constructor(
    private httpClient: HttpClient,
    private validateService: ValidateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  private socketService = new SocketService();
  private loadingService = new LoadingService();
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable();
  appointmentModelDB: AppointmentModelDB = new AppointmentModelDB();
  message: string | null = '';
  userId = '';
  isD = false;
  async ngOnInit(): Promise<void> {
    this.commonService.setLocalSotrage('page', 'the-kham-benh');
    this.loadingService.Start();
    var id;
    this.userId = this.commonService.getUserSession();
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        this.message = params.get('messageContent');
        id = params.get('id');
        resolve();
      });
    });
    if (!this.message) {
      this.message = '';
    }

    if (id) {
      let params = new HttpParams();
      params = params.append('userID', '');
      params = params.append('appoinmentId', id);
      this.loadingService.Start();
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient
          .get<ReciveModel>(
            this.constantVariable.CONTENT_API_SERVER +
              'appointment/get-appointment',
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
        this.appointmentModelDB = resp.returnObject as AppointmentModelDB;
      } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
        this.validateService.printMsg(
          'WARNING',
          'Lịch hẹn đã được hủy!'
        );
        this.isD = true;
      } else {
        throw resp;
      }
    }
    this.loadingService.Stop();
  }

  async cancel(id: string): Promise<void> {
    this.loadingService.Start();
    var user = JSON.parse(this.commonService.getLocalSotrage('userInfor'));
    var userID = user['userId'];
    let params = new HttpParams();
    params = params.append('userId', userID ? userID : '');
    params = params.append('apoinmentId', id);

    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'appointment/delete-appointment',
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
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var link = 'thong-tin-lich-kham?appoinmentId=' + id;
      this.socketService.sendMessageToSocket(
        id,
        'Lịch khám ' + id + ' đã được hủy!',
        'SUCCESS',
        link,
        this.httpClient
      );
      setTimeout(() => {
        this.router.navigate(['dang-ky-lich-kham']);
      }, 2000);
    } else {
      this.validateService.printMsg(
        'ERROR',
        'Không hủy được lịch khám! Vui lòng thử lại.'
      );
    }
    await this.loadingService.Stop();
  }
}
