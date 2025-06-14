import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../service/ValidateService';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { SocketService } from '../service/SocketService';
import { DateTimeService } from '../service/DateTimeService';
import { ReciveModel } from '../model/reciveModel';
@Component({
  selector: 'app-download',
  template: '',
})
export class DownloadComponent implements OnInit {

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private datetimeService = new DateTimeService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private loadingService = new LoadingService();
  private socketService = new SocketService();

  ngOnInit(): void {
    this.downloadFile();
  }

  async downloadFile(): Promise<void> {
    var file: string | null = null;
    var userId = this.commonService.getUserSession();
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        file = params.get('file');
        resolve();
      });
    });
    if (file) {
      var params = new HttpParams();
      params = params.append('filename', file ? file : '');
      params = params.append('userId', userId);
      this.loadingService.Start();
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/download-report', {params: params}).subscribe(
          {
            next: (resp) => {
              resolve(resp);
            },
            error: (error) => {
              error['errorCode'] == this.constantVariable.ERROR_NUMBER;
              resolve(error);
            },
          });
      });
      await this.loadingService.Stop();
      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        const byteCharacters = atob(resp.returnObject + '');
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        var f = file as String;
        var files = f.split("/");
        a.href = url;
        a.download = files[files.length - 1];
        a.click();
        window.URL.revokeObjectURL(url);
        this.router.navigate(['kho-thuoc'])
      } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
        this.validateService.printMsg('ERROR', resp.errorMessage);
      } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
        this.validateService.printMsg('ERROR', resp.errorMessage);
      } else {
        console.log(resp);
        this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
      }
    }
  }
}
