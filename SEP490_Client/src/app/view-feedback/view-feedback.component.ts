import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LoadingService } from '../service/LoadingService';
import { CommonService } from '../service/CommonService';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { FeedbackModel } from './Model/FeedbackModel';
import { DateTimeService } from '../service/DateTimeService';

@Component({
  selector: 'app-view-feedback',
  templateUrl: './view-feedback.component.html',
  styleUrls: ['./view-feedback.component.css'],
})
export class ViewFeedbackComponent implements OnInit, AfterViewInit {
  @ViewChild('date') date!: ElementRef;
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private loadingService = new LoadingService();
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable();
  private dateTimeService = new DateTimeService();

  userId = '';
  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'feedback');
    this.userId = this.commonService.getUserSession();
    if (!this.userId) {
      this.router.navigate(['dang-nhap']);
    }
  }

  feedbackModel = new FeedbackModel();
  feedbackList: FeedbackModel[] = [];
  async ngAfterViewInit(): Promise<void> {
    var id;
    await new Promise<void>((resolve) => {
      this.route.queryParamMap.subscribe((params) => {
        console.log(params);
        id = params.get('id');
        resolve();
      });
    });
    this.loadingService.Start();
    if (id) {
      var date = this.dateTimeService.getCurrentDateTime('yyyy-MM-dd');

      var params = new HttpParams();
      params = params.append('id', id ? id : '');
      params = params.append('date', date);
      params = params.append('userId', this.userId);
      
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient
          .get<ReciveModel>(
            this.constantVariable.CONTENT_API_SERVER + 'admin/get-feedback',
            { params: params }
          )
          .subscribe({
            next: (resp) => {
              resolve(resp);
            },
            error: (error) => {
              error['errorCode'] == this.constantVariable.ERROR_NUMBER;
              resolve(error);
            },
          });
      });
      
      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.feedbackList = resp.returnObject as FeedbackModel[];
        if (id) {
          this.showPopupReport(this.feedbackList[0]);
        }
      } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
        this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
      } else {
        if (resp.errorMessage) {
          this.validateService.printMsg('ERROR', resp.errorMessage);
        } else {
          this.validateService.printMsg(
            'ERROR',
            'Đã xảy ra lỗi không mong muốn!'
          );
        }
      }
    }
    await this.loadingService.Stop();
  }

  close(): void {
    (document.getElementById('popup') as HTMLInputElement).classList.remove(
      'show'
    );
  }

  showPopupReport(fb: FeedbackModel): void {
    this.feedbackModel = fb;
    (document.getElementById('popup') as HTMLInputElement).classList.add(
      'show'
    );
  }

  async search() {
    var date = this.date.nativeElement.value;

    var params = new HttpParams();
    params = params.append('id', '');
    params = params.append('date', date);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER + 'admin/get-feedback',
          { params: params }
        )
        .subscribe({
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
      this.feedbackList = resp.returnObject as FeedbackModel[];
    } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } else {
      if (resp.errorMessage) {
        this.validateService.printMsg('INFO', resp.errorMessage);
      } else {
        this.validateService.printMsg(
          'ERROR',
          'Đã xảy ra lỗi không mong muốn!'
        );
      }
    }
  }
}
