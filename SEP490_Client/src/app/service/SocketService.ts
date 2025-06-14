import { CommonService } from "./CommonService";
import { HttpClient } from "@angular/common/http";
import { ConstantVariable } from "./ConstantVariable";
import { SendModel } from "../model/sendModel";
import { NotificationModel } from "../model/NotificationModel";
import { DateTimeService } from "./DateTimeService";
import { ReciveModel } from "../model/reciveModel";

export class SocketService {

  private constantVariable = new ConstantVariable();
  private dateTimeService = new DateTimeService();
  
  commonService =  new CommonService();
  selfMsg = this.commonService.getLocalSotrage('userInfor');
  async sendMessageToSocket(room: string | string[], msg: string, type: string, link: string, httpClient : HttpClient) : Promise<void> {
    
    var self = '';
    if (this.selfMsg) {
      self = JSON.parse(this.selfMsg)['userId'];
    }
    if (type == 'ERROR') {
      console.error(msg);
    } else {
      console.log(msg);
    }
    if(typeof room === 'string') {
      const url = `wss://fhc-websocket-bczybjppsq-ue.a.run.app?room=${room}`;
      var socket!: WebSocket;
      await new Promise<void>((resolve) => {
        socket = new WebSocket(url);
        resolve();
      });
      socket.onopen = async () => {
        console.log('Kết nối thành công.');

        if (httpClient) {
          let resp = await new Promise<ReciveModel>((resolve) => {
              var sendModel = new SendModel();
              var notification = new NotificationModel();
              notification.notiId = 'NEW';
              notification.reciveRoom = room;
              notification.content = msg;
              notification.time = this.dateTimeService.getCurrentDateTime('dd/MM/yyyy HH:mm:ss');
              notification.link = !link ? '' : link;
  
              sendModel.model = notification;
              httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/create-noti', sendModel)
              .subscribe({
                next: (resp) => {
                  resolve(resp);
                },
                error: (error) => {
                  resolve(error);
                },
              });
          });
  
          //if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
            var jsonMsg = JSON.stringify(resp.returnObject);
            socket.send(jsonMsg);
          //}
        }

        var message = {
          type: type,
          msg: msg
        }
        var jsonMsg = JSON.stringify(message);
        socket.send(jsonMsg);
        socket.close();
      };
      socket.onmessage = (event) => {
          console.log('Sending...');
      };
    
      socket.onclose = () => {
        console.log('Kết nối bị đóng.');
      };

    } else {
      
      room.forEach(async (r) => {
        const url = `wss://fhc-websocket-bczybjppsq-ue.a.run.app?room=${r}`;
        var socket1!: WebSocket;
        await new Promise<void>((resolve) => {
          socket1 = new WebSocket(url);
          resolve();
        })
        socket1.onopen = async () => {
          console.log('Kết nối thành công.');

          if (httpClient) {
            let resp = await new Promise<ReciveModel>((resolve) => {
                var sendModel = new SendModel();
                var notification = new NotificationModel();
                notification.notiId = 'NEW';
                notification.reciveRoom = r;
                notification.content = msg;
                notification.time = this.dateTimeService.getCurrentDateTime('dd/MM/yyyy HH:mm:ss');
                notification.link = !link ? '' : link;
  
                sendModel.model = notification;
                httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/create-noti', sendModel)
                .subscribe({
                  next: (resp) => {
                    resolve(resp);
                  },
                  error: (error) => {
                    resolve(error);
                  },
                });
            });
  
            //if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
              var jsonMsg = JSON.stringify(resp.returnObject);
              socket1.send(jsonMsg);
            //}
          }

          var message = {
            type: type,
            msg: msg
          }
          var jsonMsg = JSON.stringify(message);
          socket1.send(jsonMsg);
          socket1.close();
        };
        socket1.onmessage = (event) => {
            const data = event.data instanceof Blob ? event.data.text() : event.data;
            console.log(data);
            //var socket.close();
        };
      
        socket1.onclose = () => {
          console.log('Kết nối bị đóng.');
        };

      });
    }
  }
}