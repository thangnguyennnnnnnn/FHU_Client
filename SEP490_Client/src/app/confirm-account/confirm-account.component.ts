import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../service/ValidateService';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { SocketService } from '../service/SocketService';
import { DateTimeService } from '../service/DateTimeService';
import { ReciveModel } from '../model/reciveModel';

@Component({
  selector: 'app-confirm-account',
  template: '',
})
export class ConfirmAccountComponent implements OnInit {
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private constantVariable = new ConstantVariable();
  private loadingService = new LoadingService();
  private socketService = new SocketService();

  ngOnInit(): void {
    this.confirm();
  }

  async confirm(): Promise<void> {
    var token;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        token = params.get('token');
        resolve();
      });
    });
    if (token) {
      var params = new HttpParams();
      params = params.append('token', token);
      this.loadingService.Start();
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'signup/accept-token', {params: params}).subscribe(
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
        window.location.href='dang-nhap?xt=ok';
        this.socketService.sendMessageToSocket(token,'Xác thực tài khoản thành công!','SUCCESS','trang-ca-nhan', this.httpClient);
      } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
        window.location.href='dang-nhap?xt=ng';
      } else {
        console.log(resp);
        window.location.href='error';
      }
    }
  }
}
