import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { UserInformationModel } from '../model/userInformationModel';
import { ReciveModel } from '../model/reciveModel';
import { SendModel } from '../model/sendModel';
import { EducationInfoModel } from '../model/EducationInfoModel';
import { DateTimeService } from '../service/DateTimeService';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{

  constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router) {}

  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private dateTimeService = new DateTimeService();
  
  userProfile = new UserInformationModel();
  educationInfoList!: [EducationInfoModel];
  roleName = '';
  haveProfile = true;


  async ngOnInit(): Promise<void> {
    this.loadingService.Start();
    console.log('Main profile run...');  
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
      if (reciveModel.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.userProfile = reciveModel.returnObject as UserInformationModel;
        this.userProfile.birthday = this.dateTimeService.formatDateVN(this.userProfile.birthday);
        this.educationInfoList = this.userProfile.educationInfoList;
        console.log(this.userProfile);
      } else if (reciveModel.errorCode == this.constantVariable.DB_NOTFOUND) {
        this.haveProfile = false;
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
