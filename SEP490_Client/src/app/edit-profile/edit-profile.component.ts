import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { DateTimeService } from '../service/DateTimeService';
import { SendModel } from '../model/sendModel';
import { ReciveModel } from '../model/reciveModel';
import { UserInformationModel } from '../model/userInformationModel';
import { EducationInfoModel } from '../model/EducationInfoModel';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router) {}

  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private dateTimeService = new DateTimeService();

  @ViewChild('lastname') lastname!: ElementRef;
  @ViewChild('middleName') middleName!: ElementRef;
  @ViewChild('firstName') firstName!: ElementRef;
  @ViewChild('birthday') birthday!: ElementRef;
  @ViewChild('genderNam') gender!: ElementRef;
  @ViewChild('address') address!: ElementRef;
  @ViewChild('phoneNumber') phoneNumber!: ElementRef;
  @ViewChild('email') email!: ElementRef;

  userProfile = new UserInformationModel();
  educationInfoList!: [EducationInfoModel];
  roleName = '';
  haveProfile = true;

  async ngOnInit(): Promise<void> {
    this.loadingService.Start();
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    if (userInfo != '') {
      var user = JSON.parse(userInfo)[0]['userAuthen']['userId'];
      const sendModel = new SendModel();
      sendModel.model = user;
      let reciveModel = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'user/getProfile', sendModel).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          }
        });
      });
      console.log(reciveModel);   
      if (reciveModel.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.userProfile = reciveModel.returnObject as UserInformationModel;
        this.userProfile.birthday = this.dateTimeService.formatDateVN(this.userProfile.birthday);
        this.educationInfoList = this.userProfile.educationInfoList;
        console.log(this.userProfile);
      } else if (reciveModel.errorCode == this.constantVariable.DB_NOTFOUND) {
        this.userProfile == new UserInformationModel();
      } else {
        console.error(reciveModel.errorMessage);
        this.router.navigate(['\error']);
      } 

      (this.lastname.nativeElement as HTMLInputElement).value = this.userProfile.lastName;
      (this.middleName.nativeElement as HTMLInputElement).value = this.userProfile.middleName;
      (this.firstName.nativeElement as HTMLInputElement).value = this.userProfile.firstName;
      (this.birthday.nativeElement as HTMLInputElement).value = this.userProfile.birthday;
      if (this.userProfile.gender == 'Nữ') {
        (document.getElementById('female') as HTMLInputElement).checked = true;
      } else {
        (document.getElementById('male') as HTMLInputElement).checked = true;
      }
      (this.address.nativeElement as HTMLInputElement).value = this.userProfile.address;
      (this.phoneNumber.nativeElement as HTMLInputElement).value = this.userProfile.phoneNumber;
      (this.email.nativeElement as HTMLInputElement).value = this.userProfile.email;

    } else {
      console.error('Key error!');
      this.router.navigate(['\error']);
    }
    await this.loadingService.Stop();
  }
  async updateProfile(): Promise<void> {
    this.loadingService.Start();
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    if (userInfo != '') {
      var user = JSON.parse(userInfo)[0]['userAuthen']['userId'];
      const sendModel = new SendModel();
      let userInformationModel = new UserInformationModel();
      userInformationModel.userId = user;
      userInformationModel.lastName = (this.lastname.nativeElement as HTMLInputElement).value;
      userInformationModel.middleName = (this.middleName.nativeElement as HTMLInputElement).value;
      userInformationModel.firstName = (this.firstName.nativeElement as HTMLInputElement).value;
      userInformationModel.birthday = this.dateTimeService.formatDateDDMMYYYY((this.birthday.nativeElement as HTMLInputElement).value);
      userInformationModel.gender = (this.gender.nativeElement as HTMLInputElement).checked ? 'Nam' : 'Nữ';
      userInformationModel.address = (this.address.nativeElement as HTMLInputElement).value;
      userInformationModel.phoneNumber = (this.phoneNumber.nativeElement as HTMLInputElement).value;
      userInformationModel.email = (this.email.nativeElement as HTMLInputElement).value;

      sendModel.model = userInformationModel;
      let reciveModel = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'user/update-profile', sendModel).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          }
        });
      });
      console.log(reciveModel);   
      if (reciveModel.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        console.log('Thanh Cong');
        this.router.navigate(['\profile']);
      } else if (reciveModel.errorCode == this.constantVariable.DB_NOTFOUND) {
        console.log('Not found');
      } else {
        console.error(reciveModel.errorMessage);
        this.router.navigate(['\error']);
      } 
    } else {
      console.error('Key error!');
      this.router.navigate(['\error']);
    }
    await this.loadingService.Stop();
  }
}
