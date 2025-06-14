import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, AfterViewInit , OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { EmployeeSearchModel } from './Model/EmployeeSearchModel';
@Component({
  selector: 'app-view-staff-list',
  templateUrl: './view-staff-list.component.html',
  styleUrls: ['./view-staff-list.component.css']
})
export class ViewStaffListComponent implements OnInit, AfterViewInit {

  @ViewChild('staffName') staffName!: ElementRef;
  @ViewChild('faculty') faculty!: ElementRef;
  @ViewChild('staffId') staffId!: ElementRef;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private loadingService = new LoadingService();

  staffNameInput = '';
  isInputstaffName = false;

  userId = '';
  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'danh-sach-nhan-vien');
    this.userId = this.commonService.getUserSession();
    if (!this.userId) {
      this.router.navigate(['dang-nhap']);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadingService.Start();
    await this.loadingService.Stop();
  }

  employeeSearchModelList: EmployeeSearchModel[] = [];
  isDisplay = false;
  async search() {
    var staffId = this.staffId.nativeElement.value;
    var staffName = this.staffName.nativeElement.value;
    var faculty = this.faculty.nativeElement.value;

    var params = new HttpParams();
    params = params.append('staffId', staffId);
    params = params.append('staffName', staffName);
    params = params.append('faculty', faculty);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'employee/search', {params: params}).subscribe(
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
      this.employeeSearchModelList = resp.returnObject as EmployeeSearchModel[];
      this.isDisplay = true;
    } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
      this.isDisplay = false;
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } else {
      this.isDisplay = false;
      if (resp.errorMessage) {
        this.validateService.printMsg('ERROR', resp.errorMessage);
      } else {
        this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
      }
    } 
  }

  close() : void {
    (document.getElementById("popup") as HTMLInputElement).classList.remove("show");
  }

  employeeSearchModel: EmployeeSearchModel = new EmployeeSearchModel();
  showPopupReport(e: EmployeeSearchModel) : void {
    this.employeeSearchModel = e;
    (document.getElementById("popup") as HTMLInputElement).classList.add("show");
  }

} 

