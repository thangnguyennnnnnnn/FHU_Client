import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { CommonService } from '../service/CommonService';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit{
  constructor( private router: Router, private validateService: ValidateService) {}
  private loadingService = new LoadingService();
  private commonService = new CommonService();

  @ViewChild('notiContent') notiContent!: ElementRef;
  url = '';
  async ngOnInit(): Promise<void> {
    this.commonService.setLocalSotrage('page', 'error');
    await this.loadingService.Start();
    var contentNoti = (this.notiContent.nativeElement as HTMLInputElement);
    console.error('Lỗi xảy ra tại: ' + this.router.routerState.snapshot.url);
    this.loadingService.Stop();
    this.validateService.printOutMessage('ERROR', 'Có lỗi xảy ra! Vui lòng liên hệ admin để được giải quyết!', contentNoti);
    var notification = document.getElementById("notification") as HTMLInputElement;
    notification.classList.add("show");
  
    setTimeout(() => {
      notification.classList.remove("show");
      notification.classList.remove("hidden");
    }, 4000);
  }

}
