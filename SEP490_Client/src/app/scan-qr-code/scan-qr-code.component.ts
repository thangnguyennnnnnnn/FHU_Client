import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { CommonService } from '../service/CommonService';

@Component({
  selector: 'app-scan-qr-code',
  templateUrl: './scan-qr-code.component.html',
  styleUrls: ['./scan-qr-code.component.css']
})
export class ScanQrCodeComponent  implements OnInit {

  private loadingService = new LoadingService();
  private commonService = new CommonService();
  unHide = false;

  async ngOnInit(): Promise<void> {
    this.commonService.setLocalSotrage('page', 'quet-ma-qr');
    this.loadingService.Start();
    this.loadingService.Stop();
  }

  unHideNote() : void {
    this.unHide = true;
  }
}
