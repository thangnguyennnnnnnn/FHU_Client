import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { CommonService } from '../service/CommonService';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { HttpClient, HttpParams } from '@angular/common/http';
import { DateTimeService } from '../service/DateTimeService';
import { ValidateService } from '../service/ValidateService';
import { ReciveModel } from '../model/reciveModel';
import { UserInformationModel } from '../model/userInformationModel';
import { UserProfileModel } from './Model/UserProfileModel';
import { ProfileUpdateModel } from './Model/ProfileUpdateModel';
import { SendModel } from '../model/sendModel';
import { SocketService } from '../service/SocketService';

@Component({
  selector: 'app-profile-screen',
  templateUrl: './profile-screen.component.html',
  styleUrls: ['./profile-screen.component.css']
})
export class ProfileScreenComponent implements OnInit, AfterViewInit{
  @ViewChild('firstName') firstName!: ElementRef;
  @ViewChild('middleName') middleName!: ElementRef;
  @ViewChild('lastName') lastName!: ElementRef;
  @ViewChild('birthDate') birthDate!: ElementRef;
  @ViewChild('gender') gender!: ElementRef;
  @ViewChild('nationality') nationality!: ElementRef;
  @ViewChild('address') address!: ElementRef;
  @ViewChild('phone') phone!: ElementRef;
  @ViewChild('email') email!: ElementRef;
  @ViewChild('avatar') avatar!: ElementRef;
  @ViewChild('imgAvatar') imgAvatar!: ElementRef;
  @ViewChild('imgAvatarD') imgAvatarD!: ElementRef;

  @ViewChild('oldPassword') oldPassword!: ElementRef;
  @ViewChild('newPassword') newPassword!: ElementRef;
  @ViewChild('newPasswordConfirm') newPasswordConfirm!: ElementRef;

  elementRefs!: { [key: string]: ElementRef };
  listElement = [
    'firstName',
    'middleName',
    'lastName',
    'birthDate',
    'gender',
    'nationality',
    'address',
    'phone',
    'email'
  ];

  constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router, private validateService: ValidateService) {}
  
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private socketService = new SocketService();

  profile!: UserProfileModel;
  userId = '';
  isStaffUpdated = true;
  async ngOnInit(): Promise<void> {
    //this.loadingService.Start();
    var checkLogin = this.commonService.checkLocalStorage();
    if (!checkLogin) {
      this.router.navigate(['home']);
    }
    var user = this.commonService.getLocalSotrage('userInfor');
    var staffActive = JSON.parse(user)['isStaffActive'];
    var isPasswordChanged = JSON.parse(user)['isPasswordChanged'];
    var role = JSON.parse(user)['role'];
    if (role != 4 && isPasswordChanged == null) {
      this.isStaffUpdated = false;
    } else if (role != 4 && staffActive == 'N') {
      this.isStaffUpdated = false;
    }
    this.profile = new UserProfileModel();
    //await this.loadingService.Stop();
  }

  async ngAfterViewInit(): Promise<void> {
    this.userId = this.commonService.getUserSession();
    if (!this.userId) {
      this.router.navigate(['home']);
    }
    this.elementRefs = {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      birthDate: this.birthDate,
      gender: this.gender,
      nationality: this.nationality,
      address: this.address,
      phone: this.phone,
      email: this.email,
    };
    let params = new HttpParams();
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'user/getProfile', {params: params}).subscribe({
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
      this.profile = resp.returnObject as UserProfileModel;
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.profile = new UserProfileModel();
    } else {
      throw resp;
    }
    await this.loadingService.Stop();
    
  }

  getData() {
    this.validateService.clearError(this.listElement, this.elementRefs);
    var profile = new ProfileUpdateModel();
    profile.userId = this.userId;
    profile.firstName = (this.firstName.nativeElement as HTMLInputElement).value;
    profile.middleName = (this.middleName.nativeElement as HTMLInputElement).value;
    profile.lastName = (this.lastName.nativeElement as HTMLInputElement).value;
    profile.birthDate = (this.birthDate.nativeElement as HTMLInputElement).value;
    profile.gender = (this.gender.nativeElement as HTMLInputElement).value;
    profile.nationality = (this.nationality.nativeElement as HTMLInputElement).value;
    profile.address = (this.address.nativeElement as HTMLInputElement).value;
    profile.phone = (this.phone.nativeElement as HTMLInputElement).value;
    profile.email = (this.email.nativeElement as HTMLInputElement).value;
    return profile;
  }

  async updadeProfile() : Promise<void> {
    var profile = this.getData();

    var checkEmpty = this.validateService.haveDataEmpty(profile, this.elementRefs, this.userId);
    if (!checkEmpty) {
      return;
    }

    var sendmodel = new SendModel();
    sendmodel.model = profile;
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'user/update-profile', sendmodel).subscribe({
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
      this.profile.firstName = profile.firstName;
      this.profile.middleName = profile.middleName;
      this.profile.lastName = profile.lastName;
      this.profile.birthday = profile.birthDate;
      this.profile.gender = profile.gender;
      this.profile.nationality = profile.nationality;
      this.profile.address = profile.address;
      this.profile.phoneNumber = profile.phone;
      this.profile.email = profile.email;
      this.socketService.sendMessageToSocket(this.userId, 'Chúc mừng bạn! Thông tin đã được cập nhật thành công', 'SUCCESS', 'trang-ca-nhan', this.httpClient);
      var u = this.commonService.getLocalSotrage('userInfor');
      var user = JSON.parse(u);
      user['isStaffActive'] = 'Y';
      user['lastname']  = this.profile.firstName + ' ' + this.profile.middleName + ' ' + this.profile.lastName;
      this.commonService.setLocalSotrage('userInfor', user);
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.profile = new UserProfileModel();
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    }
    await this.loadingService.Stop();
  }

  openUploadFile() {
    this.avatar.nativeElement.click();
  }

  isBtnuploadDisable = true;
  fileSelected: File | undefined;
  showNewAvt(event: Event) {
    this.isBtnuploadDisable = true;
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files) {
      this.fileSelected = fileInput.files[0];
    }

    if (this.fileSelected) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imgAvatar.nativeElement.src = e.target.result;
        this.isBtnuploadDisable = false;
      };

      reader.readAsDataURL(this.fileSelected);
    }
  }

  async uploadAvata() : Promise<void> {
    this.loadingService.Start();
    if (this.fileSelected) {
      const formData = new FormData();
      formData.append('file', this.fileSelected);
      formData.append('userId', this.userId);
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'user/upload-avata', formData).subscribe(
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

      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        console.log(resp);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imgAvatarD.nativeElement.src = e.target.result;
        };
        reader.readAsDataURL(this.fileSelected);
        var link = 'trang-ca-nhan';
        this.socketService.sendMessageToSocket(this.userId, resp.errorMessage, 'SUCCESS', link, this.httpClient);
        var u = this.commonService.getLocalSotrage('userInfor');
        var user = JSON.parse(u);
        user['avt'] = resp.returnObject;
        this.commonService.setLocalSotrage('userInfor', user);
      } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
        this.validateService.printMsg('ERROR', resp.errorMessage);
      } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
        this.validateService.printMsg('ERROR', resp.errorMessage);
      } else {
        this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
      }
      await this.loadingService.Stop();
    }
  }

  async changePassword() : Promise<void> {
    (
      this.oldPassword.nativeElement as HTMLInputElement
    ).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (
      this.newPassword.nativeElement as HTMLInputElement
    ).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (
      this.newPasswordConfirm.nativeElement as HTMLInputElement
    ).style.borderColor = this.constantVariable.COLOR_NORMAL;

    var isEmpty = false;
    var password = this.oldPassword.nativeElement.value;
    if (!password) {
      isEmpty = true;
      (this.oldPassword.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
    }

    var newPassword = this.newPassword.nativeElement.value;
    if (!newPassword) {
      isEmpty = true;
      (this.newPassword.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
    }

    var newPasswordConfirm = this.newPasswordConfirm.nativeElement.value;
    if (!newPasswordConfirm) {
      isEmpty = true;
      (this.newPasswordConfirm.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
    }

    if (isEmpty) {
      this.validateService.printMsg('WARNING', 'Các thông tin không được trống!');
      return;
    }

    var checkLength = false;
    if (newPassword.length < 10) {
      checkLength = true;
      (this.newPassword.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
    }

    if (checkLength) {
      this.validateService.printMsg('WARNING', 'Mật khẩu mới quá ngắn! Hãy chọn 1 mật khẩu có tối thiểu 10 ký tự.');
      return;
    }

    if (newPassword != newPasswordConfirm) {
      (this.newPasswordConfirm.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      (this.newPassword.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Mật khẩu xác nhận chưa chính xác.');
      return;
    }

    var changePasswordModel = {
      userId: this.userId,
      password: password,
      newPassword: newPassword,
      newPasswordConfirm: newPasswordConfirm
    }

    var sendmodel = new SendModel();
    sendmodel.model = changePasswordModel;
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'user/change-password', sendmodel).subscribe({
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
      this.socketService.sendMessageToSocket(this.userId, 'Chúc mừng bạn! Mật khẩu đã được cập nhật thành công!', 'SUCCESS', 'trang-ca-nhan', this.httpClient);
      var u = this.commonService.getLocalSotrage('userInfor');
      var user = JSON.parse(u);
      user['isPasswordChanged'] = 'OK';
      this.commonService.setLocalSotrage('userInfor', user);
      this.oldPassword.nativeElement.value = '';
      this.newPassword.nativeElement.value = '';
      this.newPasswordConfirm.nativeElement.value = '';
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.profile = new UserProfileModel();
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      this.validateService.printMsg('ERROR', 'Đã có lỗi xảy ra!');
    }
    await this.loadingService.Stop();
  }

  confirmPassword() {
    (
      this.oldPassword.nativeElement as HTMLInputElement
    ).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (
      this.newPassword.nativeElement as HTMLInputElement
    ).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (
      this.newPasswordConfirm.nativeElement as HTMLInputElement
    ).style.borderColor = this.constantVariable.COLOR_NORMAL;
    var newPassword = this.newPassword.nativeElement.value;
    var newPasswordConfirm = this.newPasswordConfirm.nativeElement.value;

    if (newPassword && newPassword.length > 10 && newPassword != newPasswordConfirm) {
      (this.newPasswordConfirm.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      (this.newPassword.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Mật khẩu xác nhận chưa giống nhau! Vui lòng kiểm tra lại!');
    }
  }
}
