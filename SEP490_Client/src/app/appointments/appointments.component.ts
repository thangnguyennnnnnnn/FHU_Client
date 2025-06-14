import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { CommonService } from '../service/CommonService';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { SendModel } from '../model/sendModel';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { AppointmentModelDB } from '../confirm-appointment/Model/AppointmentModelDB';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {

  constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router, private validateService: ValidateService) {}
  
  private loadingService = new LoadingService();
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable();

  appoinmentList: AppointmentModelDB[] = [];
  appoinmentIdConfirm!: string;
  isNoData = true;
  
  async ngOnInit(): Promise<void> {
    this.loadingService.Start(); 
    var userID;
    this.commonService.setLocalSotrage('page', 'lich-kham');

    if (this.commonService.getLocalSotrage('userInfor')) {
      var user = JSON.parse(this.commonService.getLocalSotrage('userInfor'));
      userID = user['userId'];

      let params = new HttpParams();
      params = params.append('userID', userID ? userID : '');
      
      let reciveModel = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'patient/getAppointments', {params: params}).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          }
        });
      });

      if (reciveModel.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.appoinmentList = reciveModel.returnObject as AppointmentModelDB[];
        console.log(this.appoinmentList);
      } else if (reciveModel.errorCode == this.constantVariable.DB_NOTFOUND) {
				this.appoinmentList = [];
        this.isNoData = false;
			} else {
        console.error(reciveModel.errorMessage);
        this.router.navigate(['/error']);
      }

    } else {
      this.router.navigate(['dang-nhap']);
    }
    await this.loadingService.Stop();
  }

  async deleteAppoinment(appoinmentId: String): Promise<void> {
    console.log('Delete: ' + appoinmentId);
    
    this.loadingService.Start(); 
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    if (userInfo != '') {
      var user = JSON.parse(userInfo)[0]['userAuthen']['userId'];
      const sendModel = new SendModel();
      sendModel.model = appoinmentId;
      let reciveModel = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'patient/deleteAppointment', sendModel).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          }
        });
      });
      console.log(reciveModel.errorCode);
      
      if (reciveModel.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.router.navigate(['/appointments']).then(() => {
          window.location.reload();
        });;
      } else {
        console.error(reciveModel.errorMessage);
        //(document.getElementsByClassName('modal-backdrop')[0] as HTMLElement).style.display = 'none';
        this.router.navigate(['/error']);
      } 
    } else {
      console.error('Key error!');
      this.router.navigate(['/error']);
    }
    await this.loadingService.Stop();
  }

  confirmDelete(appoinmentId: string) {
    //TODO
    console.log('Confirm Delete: ' +appoinmentId);
    this.appoinmentIdConfirm = appoinmentId;
  }

  getDetail(appoinmentId: string): void {
    window.location.href = '/thong-tin-lich-kham?appoinmentId='+appoinmentId;
  }

}
