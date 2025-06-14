import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { CommonService } from '../service/CommonService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) {};
  
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();

  isLogin = false;
  role = 0;
  async ngOnInit(): Promise<void> {
    await this.loadingService.Start(); 
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    this.role = JSON.parse(userInfo)['role'];
    this.commonService.setLocalSotrage('page', 'Home');
    var checkLogin = this.commonService.checkLocalStorage();
    if (checkLogin) {
      //console.log(this.commonService.getLocalSotrage('userInfor'));   
    } else {
      this.commonService.setLocalSotrage('loginState',false);
      this.router.navigate(['/dang-nhap']);
    }
    this.loadingService.Stop();
  }
}
