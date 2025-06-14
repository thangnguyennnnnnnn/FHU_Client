import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { CommonService } from '../service/CommonService';
import { AppointmentModelDB } from '../confirm-appointment/Model/AppointmentModelDB';
import { CrytoService } from '../service/CrytoService';
import { ConstantVariable } from '../service/ConstantVariable';

@Component({
  selector: 'app-success-register-appointment',
  templateUrl: './success-register-appointment.component.html',
  styleUrls: ['./success-register-appointment.component.css']
})
export class SuccessRegisterAppointmentComponent implements OnInit , AfterViewInit {

  @ViewChild('cfFullname') cfFullname!: ElementRef;
  @ViewChild('cfPhone') cfPhone!: ElementRef;
  @ViewChild('cfPhone2') cfPhone2!: ElementRef;
  @ViewChild('cfAddress') cfAddress!: ElementRef;
  @ViewChild('cfFaculty') cfFaculty!: ElementRef;
  @ViewChild('cfDate') cfDate!: ElementRef;
  @ViewChild('cfTime') cfTime!: ElementRef;
  @ViewChild('cfDoctor') cfDoctor!: ElementRef;

  @ViewChild('qrCode') qrCode!: ElementRef;
  @ViewChild('nameFileQR') nameFileQR!: ElementRef;
  
  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  
  URL = '';
  paramShareAP!: AppointmentModelDB;
  async ngAfterViewInit(): Promise<void> {
    (this.qrCode.nativeElement as HTMLInputElement).value = this.URL; 
    (this.nameFileQR.nativeElement as HTMLInputElement).value = 'Lịch Hẹn - ' + this.paramShareAP.appointmentBeforId + ' - Thành công.';
  }

  async ngOnInit(): Promise<void> {
    this.loadingService.Start(); 
    if  (this.commonService.getLocalSotrage('paramShareAP'))  {
      this.paramShareAP = JSON.parse(this.commonService.getLocalSotrage('paramShareAP'))  as AppointmentModelDB;
      console.log(this.paramShareAP);
      
      this.URL = this.constantVariable.CONTENT_API_CLIENT + 'tim-kiem-lich-kham?appoinmentId=' 
        + this.paramShareAP.appointmentBeforId;
        console.log(this.URL);

    } else {
      //
    }
    await this.loadingService.Stop();
  }
}
