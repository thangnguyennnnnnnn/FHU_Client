import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { CommonService } from '../service/CommonService';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { HttpClient } from '@angular/common/http';
import { SendModel } from '../model/sendModel';
import { ReciveModel } from '../model/reciveModel';
import { DateTimeService } from '../service/DateTimeService';
import { ValidateService } from '../service/ValidateService';
import { UserInformationModel } from '../model/userInformationModel';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  
  @ViewChild('notiContent') notiContent!: ElementRef;

  signupForm!: FormGroup;

  constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router, private validateService: ValidateService) {}
  
  isSubmitted = false;
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private socket!: WebSocket;
  elementRefs!: { [key: string]: ElementRef };
  listElement = [
      'yourName',
      'yourEmail',
      'yourUsername',
      'yourPassword'
    ];

  async ngOnInit(): Promise<void> {
    this.commonService.setLocalSotrage('page', 'dang-ky');
    this.loadingService.Start(); 
    this.signupForm = this.fb.group({
      yourName: ['', Validators.required],
      yourEmail: ['', Validators.required],
      yourUsername: ['', Validators.required],
      yourPassword: ['', Validators.required],
      errorLabel: ''
    });
    var room='signup';
    const url = `wss://fhc-websocket-bczybjppsq-ue.a.run.app?room=${room}`;
    this.socket = new WebSocket(url);
    this.socket.onopen = () => {
      console.log('Kết nối thành công.');
    };
    this.socket.onmessage = (event) => {
        var contentNoti = (this.notiContent.nativeElement as HTMLInputElement);
          
        var content = JSON.parse(event.data);
        this.validateService.printOutMessage(content['type'], content['msg'], contentNoti);
    };
    
    this.socket.onclose = () => {
      console.log('Kết nối bị đóng.');
    };
    await this.loadingService.Stop();
  }

  async register(): Promise<void> {
    this.isSubmitted = true;
    if (this.signupForm.invalid) {
      return;
    }

    //this.validateService.clearError(this.listElement, this.elementRefs);
    
    var yourName = this.signupForm.controls['yourName'].value;
    var yourEmail = this.signupForm.controls['yourEmail'].value;
    var yourUsername = this.signupForm.controls['yourUsername'].value;
    var yourPassword = this.signupForm.controls['yourPassword'].value;

    const sendModel = new SendModel();
    var userInformation = new UserInformationModel();

    yourName = yourName.replaceAll('  ', ' ');
    var fullname = yourName.split(' ');
    if (fullname.length >= 3) {
      userInformation.firstName = fullname[0];
      for (let index = 1; index < fullname.length - 1; index++) {
        userInformation.middleName += ' ' + fullname[index];
      }
      userInformation.middleName = userInformation.middleName.trim();
      userInformation.lastName = fullname[fullname.length - 1];
    } else if (fullname.length <= 1) {
      this.validateService.printMsg('WARNING', 'Tên phải có tối thiểu 2 chữ cái.');
      this.signupForm.get('yourName')?.setErrors({formatError: true});
      return;
    } else {
      userInformation.firstName = fullname[0];
      userInformation.middleName = ' ';
      userInformation.lastName = fullname[1];
    }

    var emptyFlg;
    userInformation.email = yourEmail;
    userInformation.username = yourUsername;
    userInformation.password = yourPassword;
    userInformation.userId = 'Đang cập nhật...';
    userInformation.address = 'Đang cập nhật...';
    userInformation.nationality = 'Đang cập nhật...';
    userInformation.phoneNumber = 'Đang cập nhật...';
    userInformation.birthday = 'Đang cập nhật...';
    userInformation.gender = 'Đang cập nhật...';
    userInformation.urlAvt = 'img/user.png';
  
    emptyFlg = this.validateService.haveDataEmpty(userInformation, this.elementRefs, 'signup');
    
    userInformation.userId = '';
    userInformation.address = '';
    userInformation.nationality = '';
    userInformation.phoneNumber = '';
    userInformation.birthday = '';
    userInformation.gender = '';

    if (emptyFlg) {
      this.loadingService.Start(); 
      sendModel.model = userInformation;
  
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'jpa-regist-user/jpa-regist', sendModel).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            error['errorCode'] == this.constantVariable.ERROR_NUMBER;
            resolve(error);
          }
        });
      });
      
      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.commonService.setLocalSotrage('argLogin', resp.returnObject);
        window.location.href='dang-nhap?xt=okl';
      } else if (resp.errorCode == this.constantVariable.DUPLICATE_KEY) {
        this.validateService.printMsg('WARNING', 'Người dùng đã tồn tại!');
      } else {
        this.validateService.printMsg('ERROR', 'Đã có lỗi xảy ra!');
      }
    }
    
    await this.loadingService.Stop();
  }
}
