import { ElementRef } from "@angular/core";
import { SocketService } from '../service/SocketService'
import { ConstantVariable } from "./ConstantVariable";
export class ValidateService {

  constantVariable = new ConstantVariable();
  haveDataEmpty(obj: object, elementRefs: { [key: string]: ElementRef }, room: string) {
      var errorList: string[] = [];
      var rtn = true;
      Object.keys(obj).forEach(key => {
          const value = obj[key as keyof typeof obj];
            if (!value) {
              console.log('Error Input: ' + key);
              errorList.push(key);
            }
      });
      if (errorList.length > 0) {
          errorList.forEach((e) => {
            console.error(elementRefs[e] + ' Empty value!');
            if (elementRefs[e]) {
              (elementRefs[e].nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
            }
          });
          var ss = new SocketService();
          this.printMsg('ERROR', 'Vui lòng nhập đầy đủ các thông tin!');
          rtn = false;
      }
      return rtn;
  }

  checkFormatDateTime(date: string, time: string) {
    try {
      if (date != '') {
        console.log('Validate: ' + date);
        var fmDate = date.split('/');
        var day =   parseInt(fmDate[0]);
        var month = parseInt(fmDate[1]);
        var year =  parseInt(fmDate[2]);

        if (fmDate.length != 3) {
          console.error('Data is not a date: ' + date);
          return 'dateFormatError';
        }
        
        if (day.toString().length > 2 || day < 0 || day > 31) {
          console.error('Day invalid: ' + day);
          return 'dateFormatError';
        }

        if (month.toString().length > 2 || month < 0 || month > 12) {
          console.error('Month invalid: ' + month);
          return 'dateFormatError';
        }
  
        if (year.toString().length > 4 || year < 0) {
          console.error('Year invalid: ' + year);
          return 'dateFormatError';
        }

      }

      if (time != '') {
        console.log('Validate: ' + time);
        var fmTime = time.split(' ');
        if (fmTime.length != 2) {
          console.error('Time invalid: ' + time);
          return 'timeFormatError';
        } else {
          var timeValue = fmTime[0];
          var timeSession = fmTime[1];
          var hour = parseInt(timeValue.split(':')[0]);
          var minute = parseInt(timeValue.split(':')[1]);
          if (timeSession == 'PM' || timeSession == 'AM') {
            //return 'formatCorrect';
          } else {
            console.error(timeSession);
            return 'timeFormatError';
          }

          if (hour.toString().length > 2 || hour > 23 || hour < 0) {
            console.error('Hour invalid: ' + hour);
            return 'timeFormatError';
          }

          if (minute.toString().length > 2 || minute > 59 || minute < 0) {
            console.error('Minute invalid: ' + minute);
            return 'timeFormatError';
          }
        }
      }

      return 'formatCorrect';
    } catch (error) {
      console.error(error);
      return 'timeFormatError';
    }
  }

  isEmailValid(email: string): boolean {
    const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isPhoneNumberValid(phoneNumber: string, room: string, item: string, elementRefs: { [key: string]: ElementRef }): boolean {
    const phoneRegex: RegExp = /^\d{10,}$/;
    var check = phoneRegex.test(phoneNumber);
    var socketService = new SocketService();
    if (!check) {
      (elementRefs[item].nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.printMsg('ERROR', 'Số điện thoại không hợp lệ!');
    }
    return check;
  }

  printOutMessage(type: string, msg: string, contentNoti: HTMLInputElement) {
    var typeMsg: string;
    var iconMsg: string;

    switch(type) {
      case 'ERROR':
        typeMsg = 'alert-danger';
        iconMsg = 'bi-exclamation-octagon';
        break;
      case 'WARNING':
        typeMsg = 'alert-warning';
        iconMsg = 'bi-exclamation-triangle';
        break;
      case 'SUCCESS':
        typeMsg = 'alert-success';
        iconMsg = 'bi-check-circle';
        break;
      case 'INFO':
          typeMsg = 'alert-info';
          iconMsg = 'bi-check-circle';
          break;
      default:
        typeMsg = '';
        iconMsg = '';
        break;
    }

    if (typeMsg) {
          contentNoti.innerHTML = `<div class="mg-top-20px alert `+ typeMsg +` alert-dismissible fade show" role="alert">
              <i class="bi `+ iconMsg +` me-1"></i>`
              + msg +
              `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
    } else {
      contentNoti.innerHTML = '';
    }
  }

  clearError(listElement: string[], elementRefs: { [key: string]: ElementRef }) {
    listElement.forEach((e) => {
      if (elementRefs[e]){
        var element = (elementRefs[e].nativeElement as HTMLInputElement);
        element.style.borderColor = '#eaeaea';
      }
    });
  }

  printMsg(type: string, msg: string) {
    var notification = document.getElementById("notification") as HTMLInputElement;
    this.printOutMessage(type, msg, notification);
    notification.classList.add("show");
  
    setTimeout(() => {
      notification.classList.remove("show");
      notification.classList.remove("hidden");
    }, 4000);
  }

}