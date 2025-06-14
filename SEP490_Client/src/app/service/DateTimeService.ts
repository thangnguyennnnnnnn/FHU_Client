import { ValidateService } from "./ValidateService";
import { format } from 'date-fns';

export class DateTimeService {

    validateService = new ValidateService();

    getCurrentDateTime(formater: string) {
        const currentDate = new Date();
        return format(currentDate, formater);
    }

    formatDateVN(date: string) {
        var day = date.substr(0,2);
        var month = date.substr(2,2);
        var year = date.substr(4,4);
        return day + '/' + month + '/' +year;
    }

    formatDateDDMMYYYY(date: string) {
        var validate = this.validateService.checkFormatDateTime(date, '');
        if (validate == 'dateFormatError') {
            return validate;
        }
        if (date != '') {
            var elemDate = date.split('/');
            return elemDate[0] + elemDate[1] + elemDate[2];
        } else {
            return '';
        }
    }

    formatTimeHHMMSS(timeInput: string) {
        var validate = this.validateService.checkFormatDateTime('', timeInput);
        if (validate == 'timeFormatError') {
            return validate;
        }
        if (timeInput != '') {
            var time = timeInput.split(' ');
            var timeValue = time[0];
            var timeSession = time[1];
            var hour = parseInt(timeValue.split(':')[0]);
            var minute = parseInt(timeValue.split(':')[1]);
            if (timeSession == 'PM') {
                hour = hour + 12;
            }
            var rtHour = hour.toString();
            if (hour.toString().length == 1) {
                rtHour = '0' + hour.toString();
            }
            var rtMinute = minute.toString();
            if (minute.toString().length == 1) {
                rtMinute = '0' + minute.toString();
            }
            
            return rtHour + rtMinute + '00';
        } else {
            return '';
        }
    }

    getCurrentDate(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
}