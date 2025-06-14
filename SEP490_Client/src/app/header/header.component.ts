import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {HttpClient, HttpParams,} from '@angular/common/http';
import { ConstantVariable } from '../service/ConstantVariable';
import { Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { ValidateService } from '../service/ValidateService';
import { NotificationModel } from '../model/NotificationModel';
import { ReciveModel } from '../model/reciveModel';
import { SocketService } from '../service/SocketService';
import { DateTimeService } from '../service/DateTimeService';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() authentication!: string;
  @ViewChild('notiContent') notiContent!: ElementRef;

  constructor(private httpClient: HttpClient, private router: Router, private validateService: ValidateService) {};

  numberNoti = 0;
  notiList: NotificationModel[] = [];
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable()
  private dateTimeService = new DateTimeService()
  userId = '';
  userDisplay = '';
  role = 0;
  avt = '';
  preLink = this.constantVariable.CONTENT_API_CLIENT;
  test!: HTMLInputElement;
  page = '';

  async ngOnInit(): Promise<void> {
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    this.page = this.commonService.getLocalSotrage('page').replaceAll('"','');
    if (userInfo) {
      this.userId = JSON.parse(userInfo)['userId'];
      this.role = JSON.parse(userInfo)['role'];
      this.userDisplay = JSON.parse(userInfo)['lastname'];
      this.userId = JSON.parse(userInfo)['userId'];
      this.avt = JSON.parse(userInfo)['avt'];
      
      let params = new HttpParams();
      params = params.append('userId', this.userId);
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient
          .get<ReciveModel>(
            this.constantVariable.CONTENT_API_SERVER +
              'fhc-common/get-notifications',
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

      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.notiList = resp.returnObject as NotificationModel[];
        this.notiList.forEach((n) => {
          if (n.readed === '2') {
            this.numberNoti++;
          }
        })
        //this.numberNoti = this.notiList.length;
      } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
        this.notiList = [];
        this.numberNoti = 0;
      } else {
        throw resp
      }
    } else {

    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.connectWS();
    setInterval(()=> {
      this.connectWS();
    }, 60000 * 5 + 1000);
  }

  connectWS() {
    var userInfor = this.commonService.getLocalSotrage('userInfor');
    if (userInfor) {
      var user = JSON.parse(userInfor);
      let rooms = user['rooms'];
      const room2 = user['userId'];
      const url = `wss://fhc-websocket-bczybjppsq-ue.a.run.app?room=${room2}`;
      console.log();
      var socket = new WebSocket(url);
      socket.onopen = () => {
        console.log('Kết nối thành công: ' + room2 + ': ' + this.dateTimeService.getCurrentDateTime('dd/MM/yyy HH:mm:ss'));
      };
      socket.onmessage = (event) => {
        var contentNoti = (this.notiContent.nativeElement as HTMLInputElement);
        this.test = (this.notiContent.nativeElement as HTMLInputElement);
        try {
          var content = JSON.parse(event.data);
        } catch (err) {
          console.error(err);
          return;
        }
        if (content['type'] && content['msg']) {
          this.validateService.printOutMessage(content['type'], content['msg'], contentNoti);
          var notification = document.getElementById("notification") as HTMLInputElement;
          notification.classList.add("show");

          setTimeout(() => {
            notification.classList.remove("show");
            notification.classList.remove("hidden");
          }, 4000);
        } else {
          var newNoti = content as NotificationModel;
          if (newNoti) {
            console.log(newNoti);
            setTimeout(() => {
              this.notiList.unshift(newNoti);
              this.numberNoti += 1;
            }, 500);
          }

        }    
      };

      socket.onclose = () => {
        console.log('Kết nối bị đóng' + ': ' + this.dateTimeService.getCurrentDateTime('dd/MM/yyy HH:mm:ss'));
      };

      if (rooms) {
        (rooms as []).forEach((r) => {
          const url = `wss://fhc-websocket-bczybjppsq-ue.a.run.app?room=${r}`;
          var socket = new WebSocket(url);
          socket.onopen = () => {
            console.log('Kết nối thành công: ' + r + ': ' + this.dateTimeService.getCurrentDateTime('dd/MM/yyy HH:mm:ss'));
          };
          socket.onmessage = (event) => {
            var contentNoti = (this.notiContent.nativeElement as HTMLInputElement);
            try {
              var content = JSON.parse(event.data);
            } catch (err) {
              console.error(err);
              return;
            }
            if (content['type'] && content['msg']) {
              this.validateService.printOutMessage(content['type'], content['msg'], contentNoti);
              var notification = document.getElementById("notification") as HTMLInputElement;
              notification.classList.add("show");
    
              setTimeout(() => {
                notification.classList.remove("show");
                notification.classList.remove("hidden");
              }, 4000);
            } else {
              var newNoti = content as NotificationModel;
              if (newNoti) {
                console.log(newNoti);
                setTimeout(() => {
                  this.notiList.unshift(newNoti);
                  this.numberNoti += 1;
                }, 500);
              }
    
            }    
          };
    
          socket.onclose = () => {
            console.log('Kết nối bị đóng' + ': ' + this.dateTimeService.getCurrentDateTime('dd/MM/yyy HH:mm:ss'));
          };
        });
      }
    }
  }
  
  public async logout() : Promise<void>{
    // const sendModel = new SendModel();
    // sendModel.model = null;
    // //sendModel.sessionAuthor = sessionStorage.getItem('sessionAuthor');
    // console.log(sendModel);
    // let result = await new Promise<ReciveModel>((resolve) => {
    //   this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'user/logout', sendModel).subscribe(
    //     (resp) => {
    //       resolve(resp);
    //     });
    // });
    // console.log(result);
    // if (result.errorCode == this.constantVariable.SUCCESS_NUMBER) {
    //   sessionStorage.removeItem('sessionAuthor');
    //   this.router.navigate(['\home']);
    // } else {
    //   console.log(result.errorCode + ': ' + result.errorMessage);
    // }
    this.commonService.clearLocalSotrage();
    this.router.navigate(['\dang-nhap']);
  }

  gotoMyProfile() {
    this.router.navigate(['\profile']);
  }

  gotoLink(link: string, id: string) {
    this.maskReadedNoti(id);
    window.open(this.preLink+link, '_blank');
  }

  async maskReadedNoti(id: string): Promise<void> {
    let params = new HttpParams();
    params = params.append('id', id);
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'fhc-common/read-notification',
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
    
    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var noti = this.notiList.find((n) => n.notiId === id);
      if (noti) {
        noti.readed = '1';
        this.numberNoti -= 1;
      }
    } else {
      this.validateService.printMsg('ERROR', 'Có lỗi xảy ra!');
    }
  }

  getRoleName() {
    return this.commonService.getRoleNameUser(this.role);
  }

}
