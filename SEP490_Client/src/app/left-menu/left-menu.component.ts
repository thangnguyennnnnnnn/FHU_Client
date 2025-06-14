import { Component, Input } from '@angular/core';
import { CommonService } from '../service/CommonService';
import { ConstantVariable } from '../service/ConstantVariable';
import { MenuObjectModel } from '../model/menuObjectModel';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent {
  @Input('receivedValue') receivedValue!: string;
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable()

  constructor(private httpClient: HttpClient, private router: Router) {}
  
  public role!: number;
  ngOnInit(): void {
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    if (userInfo != '') { 
      console.log('Role: ' + JSON.parse(userInfo)['role']);
      this.role = JSON.parse(userInfo)['role'];
      // var listMenu = JSON.parse(userInfo)[1] as [];
      // listMenu.forEach((e) => {
      //   var menuObjectModel: MenuObjectModel;
      //   menuObjectModel = e;
      //   menuObjectModel.active = '';
      //   this.listMenuDisp.push(e);
      // });
      // console.log(this.listMenuDisp);
      // console.log(this.receivedValue);
      
      // if (this.listMenuDisp.length > 0) {
      //   this.listMenuDisp[0].active = 'active';
      // }
    }
  }

  public logout() : void {
    this.commonService.clearLocalSotrage();
    this.router.navigate(['\dang-nhap']);
  }
}
