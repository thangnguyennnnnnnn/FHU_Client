import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { CrytoService } from '../service/CrytoService';
import { ReciveModel } from '../model/reciveModel';
import { AppointmentModelDB } from '../confirm-appointment/Model/AppointmentModelDB';
import { ConstantVariable } from '../service/ConstantVariable';
import { SocketService } from '../service/SocketService';

@Component({
  selector: 'app-appoimtment-card',
  templateUrl: './appoimtment-card.component.html',
  styleUrls: ['./appoimtment-card.component.css']
})
export class AppoimtmentCardComponent implements OnInit , AfterViewInit {

  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private socketService = new SocketService();
  private cryto = new CrytoService();

  constructor(private httpClient: HttpClient, private router: Router, private validateService: ValidateService,private route: ActivatedRoute) {}

  @ViewChild('Fullname') Fullname!: ElementRef;
  @ViewChild('Phone') Phone!: ElementRef;
  @ViewChild('Phone2') Phone2!: ElementRef;
  @ViewChild('Address') Address!: ElementRef;
  @ViewChild('Faculty') Faculty!: ElementRef;
  @ViewChild('Date') Date!: ElementRef;
  @ViewChild('Time') Time!: ElementRef;
  @ViewChild('Doctor') Doctor!: ElementRef;

  @ViewChild('qrCode') qrCode!: ElementRef;
  @ViewChild('nameFileQR') nameFileQR!: ElementRef;
  @ViewChild('QRcode') QRcode!: ElementRef;
  @ViewChild('status') status!: ElementRef;
  
  apList!: AppointmentModelDB[];
  apListDisplay!: AppointmentModelDB[];
  apListLength = 0;
  haveQR = false;
  userID = '';
  async ngOnInit(): Promise<void> {
    this.commonService.setLocalSotrage('page', 'the-kham-benh');
    var user = JSON.parse(this.commonService.getLocalSotrage('userInfor'));
    this.userID = user['userId'];
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadingService.Start(); 
    var apID;

    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe(params => {
        console.log(params);
        apID = params.get('appoinmentId');
        resolve();
      });
    });
    let params = new HttpParams();
    if (!apID) {
      params = params.append('appoinmentId', '');
    } else {
      params = params.append('appoinmentId', apID);
    }

    if (this.commonService.getLocalSotrage('userInfor')) {
      
      params = params.append('userID', this.userID ? this.userID : '');
      
      let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'appointment/get-appointment-card', {params: params}).subscribe({
        next: (resp) => {
          resolve(resp);
        },
        error: (error) => {
          resolve(error);
        }
        });
      });
      
      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.apList = resp.returnObject as AppointmentModelDB[];
        this.apListDisplay = Object.assign([], this.apList);
        this.apListLength = this.apListDisplay.length;
      } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
        this.apListDisplay = [];
        this.apList = [];
        this.apListLength = this.apListDisplay.length;
        this.validateService.printMsg('INFO','Bạn chưa đăng ký lịch khám tại FHC. Bạn có thể đăng ký rồi thử lại.');
      } else {
        throw resp;
      }
    } else {
      this.router.navigate(['dang-nhap']);
    }

    await this.loadingService.Stop();
  }

  changeStatus() {
    var stt = (this.status.nativeElement as HTMLInputElement).value;
    if (stt) {
      this.apListDisplay = this.apList.filter((a) => a.status === stt);
      if (this.apListDisplay.length == 0) {
        this.validateService.printMsg('INFO','Không tìm thấy dữ liệu.');
      } else {
        this.apListLength = this.apListDisplay.length;
      }
    } else {
      this.apListDisplay = this.apList.filter((a) => true);
      if (this.apListDisplay.length == 0) {
        this.validateService.printMsg('INFO','Không tìm thấy dữ liệu.');
      } else {
        this.apListLength = this.apListDisplay.length;
      }
    }
  }

  viewQRCode(id: string) {
    console.log(id);
    this.haveQR = true;
    var URL = this.constantVariable.CONTENT_API_CLIENT + 'tim-kiem-lich-kham?appoinmentId=' + id;
    (this.qrCode.nativeElement as HTMLInputElement).value = URL;
    (this.nameFileQR.nativeElement as HTMLInputElement).value = id;
    this.QRcode.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async cancel(id: string) : Promise<void> {
    this.loadingService.Start();
    var user = JSON.parse(this.commonService.getLocalSotrage('userInfor'));
    var userID = user['userId'];
    let params = new HttpParams();
    params = params.append('userId', userID ? userID : '');
    params = params.append('apoinmentId', id);

    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'appointment/delete-appointment', {params: params}).subscribe({
        next: (resp) => {
          resolve(resp);
        },
        error: (error) => {
          resolve(error);
        }
      });
    });
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var apTemp = this.apListDisplay.find((a) => a.appointmentBeforId === id);
      if (apTemp) {
        var index = this.apListDisplay.indexOf(apTemp);
        this.apListDisplay.splice(index, 1);
      }
      var link = 'thong-tin-lich-kham?appoinmentId='+id;
      this.socketService.sendMessageToSocket(id,'Lịch khám ' + id + ' đã được hủy!', 'SUCCESS',link, this.httpClient);
    } else {
      this.validateService.printMsg('ERROR','Không hủy được lịch khám! Vui lòng thử lại.');
    }
    await this.loadingService.Stop(); 
  }
}
