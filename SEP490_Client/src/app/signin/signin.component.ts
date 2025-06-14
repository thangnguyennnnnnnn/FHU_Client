import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { HttpClient,} from '@angular/common/http';
import { UserLogin } from '../model/userLogin';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { LoadingService } from '../service/LoadingService';
import { SendModel } from '../model/sendModel';
import { CommonService } from '../service/CommonService';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { SocketService } from '../service/SocketService';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit, AfterViewInit {

  @ViewChild('notiContent') notiContent!: ElementRef;
  
  loginForm!: FormGroup;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private httpClient: HttpClient, private router: Router, private validateService: ValidateService) {}

  private socketService =  new SocketService();
  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();

  isLogin = false;
  isNotFound = false;
  ErrorMessage = '';
  url = '';

  async ngOnInit(): Promise<void> {
    this.commonService.setLocalSotrage('page', 'dang-nhap');
    console.log('Main run...');
    this.loginForm = this.fb.group({
      username: '',
      password: '',
      errorLabel: ''
    });
    await this.loadingService.Start();
    this.url = this.router.routerState.snapshot.url;
    var loginState = localStorage.getItem('loginState');
    
    if (loginState == 'false') {
      this.isNotFound = true;
      this.ErrorMessage = 'Đã hết phiên làm việc vui lòng đăng nhập để thực hiện lại!'
    }
    this.commonService.removeLocalSotrage('loginState');
    this.loadingService.Stop();
  }

  async ngAfterViewInit() {
    var contentNoti = (this.notiContent.nativeElement as HTMLInputElement);
    var ms;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        ms = params.get('xt');
        resolve();
      });
    });

    if (ms && ms == 'okl') {
      this.validateService.printMsg('INFO', 'Đăng ký thành công! Vui lòng truy cập email để xác thực.');
    }

    if (ms && ms == 'ok') {
      this.validateService.printMsg('SUCCESS', 'Xác thực thành công! Chúc bạn có trải nghiệm thật tốt!');
    }

    if (ms && ms == 'ng') {
      this.validateService.printMsg('INFO', 'Không tìm thấy thông tin!');
    }
  }

  async signinSystem(): Promise<void> {
    this.loadingService.Start();
    var contentNoti = (this.notiContent.nativeElement as HTMLInputElement);
    
    this.commonService.clearLocalSotrage();
    const phone = this.loginForm.controls['username'].value;
    const password = this.loginForm.controls['password'].value;
    
    

    let userLogin = new UserLogin();
    userLogin.phone = phone;
    userLogin.password = password;

    const sendModel = new SendModel();
    sendModel.model = userLogin;
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'login/login-system', sendModel).subscribe({
        next: (resp) => {
          resolve(resp);
        },
        error: (error) => {
          resolve(error);
        }
      });
    });
    this.loadingService.Stop();
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.isNotFound = false;
      this.commonService.setLocalSotrage('userInfor', resp.returnObject);
      var check = this.commonService.checkStaffActive(this.router);
      if (!check) {
        this.commonService.setLocalSotrage('page', 'trang-ca-nhan');
        this.router.navigate(['trang-ca-nhan']);
        return;
      }
      this.commonService.setLocalSotrage('page', 'Home');
      this.router.navigate(['home']);
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.isNotFound = true;
      this.ErrorMessage = 'Vui lòng kiểm tra lại tài khoản và mật khẩu! Hoặc có thể do tài khoản của bạn chưa được xác thực.'
      this.validateService.printMsg('ERROR', this.ErrorMessage);
      console.log('Không tìm thấy user');
    } else {
      this.isNotFound = true;
      this.ErrorMessage = 'Đã có lỗi xảy ra! Vui lòng thử lại hoặc liên hệ với admin!'
      console.log(resp.errorMessage);
      this.validateService.printMsg('ERROR', this.ErrorMessage);
    }
  }

  gotoSignup(): void{
    this.router.navigate(['\dang-ky']);
  }
}
