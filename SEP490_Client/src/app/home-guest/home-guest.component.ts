import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { ValidateService } from '../service/ValidateService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { SocketService } from '../service/SocketService';

@Component({
  selector: 'app-home-guest',
  templateUrl: './home-guest.component.html',
  styleUrls: ['./home-guest.component.css'],
})
export class HomeGuestComponent implements OnInit {
  constructor(private httpClient: HttpClient, private router: Router) {}
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private validateService = new ValidateService();
  private socketService = new SocketService();
  async ngOnInit(): Promise<void> {
    await this.loadingService.Start();
    this.commonService.setLocalSotrage('page', 'guest');
    var checkLogin = this.commonService.getUserSession();
    if (checkLogin) {
      this.router.navigate(['home']);
    }
    this.loadingService.Stop();
  }

  gotoLogin() {
    this.router.navigate(['dang-nhap']);
  }

  async sendFeedback() {
    var name = (document.getElementById('name') as HTMLInputElement).value;
    var email = (document.getElementById('email') as HTMLInputElement).value;
    var subject = (document.getElementById('subject') as HTMLInputElement)
      .value;
    var message = (document.getElementById('message') as HTMLInputElement)
      .value;

    name
      ? ((
          document.getElementById('name') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_NORMAL)
      : ((
          document.getElementById('name') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_ERROR);
    email
      ? ((
          document.getElementById('email') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_NORMAL)
      : ((
          document.getElementById('email') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_ERROR);
    subject
      ? ((
          document.getElementById('subject') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_NORMAL)
      : ((
          document.getElementById('subject') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_ERROR);
    message
      ? ((
          document.getElementById('message') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_NORMAL)
      : ((
          document.getElementById('message') as HTMLInputElement
        ).style.borderColor = this.constantVariable.COLOR_ERROR);
    if (!name || !email || !subject || !message) {
      this.validateService.printMsg(
        'WARNING',
        'Vui Lòng nhập các thông tin bên dưới!'
      );
      return;
    }

    var params = new HttpParams();
    params = params.append('name', name);
    params = params.append('email', email);
    params = params.append('subject', subject);
    params = params.append('message', message);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER + 'guest/send-feedback',
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
      this.validateService.printMsg(
        'SUCCESS',
        'Cảm ơn bạn đã đóng góp ý kiến! Chúng tôi sẽ lắng nghe và thay đổi để có thể tốt hơn.'
      );
      var link = 'feedback?id=' + resp.returnObject;
      this.socketService.sendMessageToSocket(
        'admin',
        'Vừa có một feedback mới từ người dùng.',
        'INFO',
        link,
        this.httpClient
      );
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
}
