import { AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { ErrorComponent } from './error/error.component';
import { CommonService } from './service/CommonService';
import { ValidateService } from './service/ValidateService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private commonService = new CommonService();

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('App run...');
    this.commonService.removeLocalSotrage('error');
    console.log('App end...');
  }

  async ngAfterViewInit(): Promise<void> {
    setTimeout(()=> {
      var userInfor = this.commonService.getLocalSotrage('userInfor');
      var page = this.commonService.getLocalSotrage('page').replaceAll('"','');
      console.log(page);
      
      if (page != 'dang-nhap' && page != 'dang-ky' && page != 'error' && page != 'guest') {
        if (!userInfor) {
          this.router.navigate(['']);
        }
        var check = this.commonService.checkStaffActive(this.router);
        if (!check) {
          this.commonService.setLocalSotrage('page', 'trang-ca-nhan');
          this.router.navigate(['trang-ca-nhan']);
          return;
        }
      }

    }, 1000);
  }

}
