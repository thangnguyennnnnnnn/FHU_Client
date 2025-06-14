import { ElementRef } from "@angular/core";
import { CrytoService } from "../service/CrytoService";
import { Router } from "@angular/router";
import { SocketService } from "./SocketService";

export class CommonService {

    private crytoService = new CrytoService();
    setLocalSotrage(key:string, object:Object) {
        const setjson=JSON.stringify(object);
        // var enKey = '';
        // if (key == 'userInfo') {
        //     var obList = object as []
        //     var ob = obList.shift();
        //     if (ob) {
        //         //TODO: Chưa giải quyết được key user
        //         enKey = ob['userAuthen']['user'];
        //         localStorage.setItem('user', enKey);
        //     }
        // }
        localStorage.setItem(key, this.crytoService.encrypt(setjson, 'enKey'));
        
    }

    getLocalSotrage(key: string) {
        var objectJson:string | null;
        objectJson = localStorage.getItem(key);
        if (objectJson) {
        //    var enKey = localStorage.getItem('user');
        //    if (enKey){
                return this.crytoService.decrypt(objectJson, 'enKey');
        //    } else {
        //        return '';
        //    }
        //} else {
        //    return '';
        } else {
            return '';
        }
    }

    removeLocalSotrage(key: string) {
        localStorage.removeItem(key);
    }

    clearLocalSotrage() {
        localStorage.clear();
    }

    checkLocalStorage() {
        var objectJson:string | null;
        objectJson = this.getLocalSotrage('userInfor');
        if (objectJson) {
            return objectJson;
        } else {
            return null;
        }
    }

    setEmptyForm(listElement: string[], elementRefs: { [key: string]: ElementRef }) {
        listElement.forEach((e) => {
            (elementRefs[e].nativeElement as HTMLInputElement).value = '';
        });
    }

    checkAuthen(role: number, router: Router, check = true) {
        var checkLogin = this.checkLocalStorage();
        var user = JSON.parse(this.getLocalSotrage('userInfor'));
        if (!user || user['role'] != role) {
            if (check) {
                console.error('Bạn không có quyền truy thực hiện chức năng này! Nếu sai sót vui lòng liên hệ admin');
                router.navigate(['error']);
            }
            return '';
        }

        if (!checkLogin) {
            this.setLocalSotrage('loginState',false);
            router.navigate(['/dang-nhap']);
            return '';
        }

        return user['userId'];
    }

    getUserSession() : string {
        try {
            var user = JSON.parse(this.getLocalSotrage('userInfor'));
        } catch (error) {
            return '';
        }
        return user['userId'];
    }

    disableForm(isDisabled: boolean,form: { [key: string]: ElementRef }, formElement: string[]) {
        formElement.forEach((e) => {
            if (form[e]){
            var element = (form[e].nativeElement as HTMLInputElement);
            element.disabled = true;
          }
        });
    
    }

    generateRandomPassword(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getRoleNameUser(role: number) {
        switch (role) {
            case 1:
                return 'Quản trị viên';
            case 2:
                return 'Bác sĩ';
            case 3:
                return 'Y tá';
            case 4:
                return 'Bệnh nhân';
            case 5:
                return 'Dược sĩ';
            default:
                return 'Không xác định';
        }
    }

    getRoleUser() {
        var user = this.getLocalSotrage('userInfor');
        //if (user) {
        var role = JSON.parse(user)['role'];
        //}
        return role;
    }

    checkStaffActive(router: Router) {
        
      var user = this.getLocalSotrage('userInfor');
      if (user) {
        var staffActive = JSON.parse(user)['isStaffActive'];
        var isPasswordChanged = JSON.parse(user)['isPasswordChanged'];
        var role = JSON.parse(user)['role'];
        if (role != 4 && isPasswordChanged == null) {
            //setTimeout(()=> {
            //    socketService.sendMessageToSocket(JSON.parse(user)['userId'], 'Mật khẩu nhân viên của bạn chưa được thay đổi! Hãy đổi một mật khẩu mới để có thể kích hoạt tài khoản!', 'WARNING');
            //}, 2000)
          //router.navigate(['trang-ca-nhan']);
          return false;
        } else if (role != 4 && staffActive == 'N') {
            //setTimeout(()=> {
            //    socketService.sendMessageToSocket(JSON.parse(user)['userId'], 'Vui lòng nhập đầy đủ thông tin nhân viên!', 'WARNING');
            //}, 2000)
            //router.navigate(['trang-ca-nhan']);
            return false;
        }
        return true;
      } else {
          return false;
      }
    }

}