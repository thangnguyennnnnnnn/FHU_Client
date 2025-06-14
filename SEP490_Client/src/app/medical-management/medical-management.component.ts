import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ValidateService } from '../service/ValidateService';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { SendModel } from '../model/sendModel';
import { SocketService } from '../service/SocketService';
import { MedicineModel } from '../model/MedicineModel';
import { MedicineImportModel } from './Model/MedicineImportModel';
import { DateTimeService } from '../service/DateTimeService';
import { FileInfo } from '../view-requet-screen/Model/FileInfo';

@Component({
  selector: 'app-medical-management',
  templateUrl: './medical-management.component.html',
  styleUrls: ['./medical-management.component.css']
})
export class MedicalManagementComponent implements OnInit, AfterViewInit {

  @ViewChild('name') name!: ElementRef;
  @ViewChild('ingredients') ingredients!: ElementRef;
  @ViewChild('uses') uses!: ElementRef;
  @ViewChild('quantity') quantity!: ElementRef;
  @ViewChild('medicineName') medicineName!: ElementRef;
  @ViewChild('medicineIngredients') medicineIngredients!: ElementRef;
  @ViewChild('medicineUses') medicineUses!: ElementRef;
  @ViewChild('medicineImg') medicineImg!: ElementRef;
  @ViewChild('medicineProducer') medicineProducer!: ElementRef;
  @ViewChild('medicineId') medicineId!: ElementRef;

  /** Report */
  @ViewChild('reportYear') reportYear!: ElementRef;
  @ViewChild('reportMonth') reportMonth!: ElementRef;
  @ViewChild('nameFile') nameFile!: ElementRef;

  /** Export */
  @ViewChild('exportMonth') exportMonth!: ElementRef;
  @ViewChild('exportYear') exportYear!: ElementRef;
  @ViewChild('reportType') reportType!: ElementRef;

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

  listMedicine: MedicineModel[] = [];
  userId = '';
  listDisplay = 0;
  popup = '';
  ngOnInit(): void {
    this.commonService.setLocalSotrage('page', 'kho-thuoc');
    this.userId = this.commonService.getUserSession();
    if (!this.userId) {
      this.router.navigate(['dang-nhap']);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadingService.Start();
    await this.loadingService.Stop();
  }

  async searchMedicine() : Promise<void> {

    (this.name.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.ingredients.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.uses.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.quantity.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    
    var name = this.name.nativeElement.value;
    var ingredients = this.ingredients.nativeElement.value;
    var uses = this.uses.nativeElement.value;
    var quantity = this.quantity.nativeElement.value;

    if (!name && !ingredients && !uses && !quantity) {
      (this.name.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      (this.ingredients.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      (this.uses.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      (this.quantity.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Vui lòng nhập ít nhất một thông tin!');
      return;
    }

    try {
      Number.parseInt(quantity)
    } catch (e) {
      (this.quantity.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Số lượng phải là một số nguyên!');
    }
    
    var params = new HttpParams();
    params = params.append('name', name);
    params = params.append('ingredients', ingredients);
    params = params.append('uses', uses);
    params = params.append('quantity', quantity);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/search-medicine', {params: params}).subscribe(
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
      this.listMedicine = resp.returnObject as MedicineModel[];
      this.listDisplay = this.listMedicine.length;
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.listMedicine = [];
      this.listDisplay = 0;
      this.validateService.printMsg('INFO', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_FORMAT_ERROR) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } 
    
  }

  checkUpdate = false;
  showPopupImport() : void {
    (document.getElementById("popup") as HTMLInputElement).classList.add("show");
    this.popup = 'import';
    this.checkUpdate = true;
  }

  close() : void {
    (document.getElementById("popup") as HTMLInputElement).classList.remove("show");

    if (this.popup == 'import') {
      (this.medicineName.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.medicineIngredients.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.medicineUses.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.medicineImg.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.medicineProducer.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.medicineName.nativeElement as HTMLInputElement).value = '';
      (this.medicineIngredients.nativeElement as HTMLInputElement).value = '';
      (this.medicineUses.nativeElement as HTMLInputElement).value = '';
      (this.medicineImg.nativeElement as HTMLInputElement).value = '';
      (this.medicineProducer.nativeElement as HTMLInputElement).value = '';
    } else if (this.popup == 'report') {
      (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.reportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.exportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.exportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
      (this.reportMonth.nativeElement as HTMLInputElement).value = '';
      (this.reportYear.nativeElement as HTMLInputElement).value = '';
      (this.exportMonth.nativeElement as HTMLInputElement).value = '';
      (this.exportYear.nativeElement as HTMLInputElement).value = '';
    }

    this.fileSelected = undefined;
  }

  close_import() : void {
    this.popup = 'request';
  }

  importFile() : void {
    (document.getElementById("medicineFile") as HTMLInputElement).click();
  }

  async uploadFile(event: Event) : Promise<void> {
    var fileSelected: File | undefined;
    
      const fileInput = event.target as HTMLInputElement;
      if (fileInput.files) {
        fileSelected = fileInput.files[0];
      }
  
      if (fileSelected) {
        const formData = new FormData();
        formData.append('file', fileSelected);
        formData.append('userId', this.userId);
        this.loadingService.Start();
        let resp = await new Promise<ReciveModel>((resolve) => {
          this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/upload-medicine', formData).subscribe(
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
          var link = 'kho-thuoc';
          this.socketService.sendMessageToSocket(this.userId, resp.errorMessage, 'SUCCESS', link, this.httpClient);
        } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
          this.validateService.printMsg('ERROR', resp.errorMessage);
        } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
          this.validateService.printMsg('ERROR', resp.errorMessage);
        } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
          this.validateService.printMsg('ERROR', resp.errorMessage);
        } else if (resp.errorCode == this.constantVariable.DUPLICATE_KEY) {
          console.error(resp.errorMessage);
          this.validateService.printMsg('ERROR', 'Dữ liệu đã tồn tại! Kiểm tra log để biết chi tiết.');
        } else if (resp.errorCode == this.constantVariable.FILE_FORMAT_ERROR) {
          this.validateService.printMsg('ERROR', resp.errorMessage);
        } else {
          console.error(resp.errorMessage);
          this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
        } 
      }
      
      (document.getElementById("medicineFile") as HTMLInputElement).value = '';
  }

  fileSelected: File | undefined;
  importFile2(event: Event) {
    
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files) {
      this.fileSelected = fileInput.files[0];
    }
  }

  async updateMedicine() : Promise<void> {

    if (this.checkUpdate) {
      return;
    }
    var medicineImport = new MedicineImportModel();
    (this.medicineName.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.medicineIngredients.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.medicineUses.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    //(this.medicineImg.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.medicineProducer.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;

    medicineImport.medicineId = this.medicineId.nativeElement.value;
    medicineImport.medicineName = this.medicineName.nativeElement.value;
    medicineImport.medicineIngredients = this.medicineIngredients.nativeElement.value;
    medicineImport.medicineUses = this.medicineUses.nativeElement.value;
    medicineImport.medicineImg = this.medicineImg.nativeElement.value;
    medicineImport.medicineProducer = this.medicineProducer.nativeElement.value;
    medicineImport.userId = this.userId;

    var check = true;
    if (!medicineImport.medicineName) {
      (this.medicineName.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      check = false;
    }
    if (!medicineImport.medicineIngredients) {
      (this.medicineIngredients.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      check = false;
    }
    if (!medicineImport.medicineUses) {
      (this.medicineUses.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      check = false;
    }
    //if (!medicineImport.medicineImg) {
    //  (this.medicineImg.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
    //  check = false;
    //}
    if (!medicineImport.medicineProducer) {
      (this.medicineProducer.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      check = false;
    }

    if (!check) {
      this.validateService.printMsg('WARNING', 'Hãy kiểm tra các thông tin bị tô đỏ!');
      return;
    }

    this.loadingService.Start();
    const formData = new FormData();
    
    formData.append('file', '');
    formData.append('model', JSON.stringify(medicineImport));
    console.log(formData);
    if (this.fileSelected){
      formData.append('file', this.fileSelected);
      formData.append('model', JSON.stringify(medicineImport));
    }
    console.log(formData);
    //var sendModel = new SendModel();
    //sendModel.model = {medicineImport, formData};
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .post<ReciveModel>(
          this.constantVariable.CONTENT_API_SERVER +
            'medicine/update-medicine',
            formData
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
      this.validateService.printMsg('SUCCESS', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.DUPLICATE_KEY) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.error(resp.errorMessage);
      this.validateService.printMsg('ERROR', 'Có lỗi xảy ra! Vui lòng liên hệ admin để giải quyết.');
    }
  }

  showPopupReport() : void {
    (document.getElementById("popup") as HTMLInputElement).classList.add("show");
    this.popup = 'report';
  }

  filename: FileInfo[] = [];
  filenameRequest: FileInfo[] = [];
  async searchMedicineReport_Request(type: number) : Promise<void> {

    (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.reportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;

    var reportMonth = this.reportMonth.nativeElement.value;
    var reportYear = this.reportYear.nativeElement.value;

    var year!: number | string;
    var month!: number | string;
    if (!reportMonth || !reportYear) {
      (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      (this.reportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Báo cáo phải có năm và tháng. Vui lòng nhập.');
      return;
    }

    try {
      year = Number.parseInt(reportYear);
      if (isNaN(year)) {
        throw new Error();
      }

      if (year < 1900) {
        (this.reportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
        this.validateService.printMsg('WARNING', 'Năm phải lớn hơn 1900');
        return;
      }
    } catch (err) {
      (this.reportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Định dạng năm không đúng.');
      return;
    }

    
    try {
      month = Number.parseInt(reportMonth);
      if (isNaN(month)) {
        throw new Error();
      }
      if (month < 0 || month > 12) {
        (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
        this.validateService.printMsg('WARNING', 'Tháng không hợp lệ.');
        return;
      }
    } catch (err) {
      (this.reportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
      this.validateService.printMsg('WARNING', 'Định dạng tháng không đúng.');
      return;
    }

    var params = new HttpParams();
    params = params.append('year', year);
    params = params.append('month', month);
    params = params.append('userId', this.userId);
    params = params.append('type', type);
    params = params.append('typeValue', '1');
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/search-report', {params: params}).subscribe(
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
      if (type == 1) {
        this.filename = resp.returnObject as FileInfo[];
      } else {
        this.filenameRequest = resp.returnObject as FileInfo[];
      }
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.validateService.printMsg('INFO', resp.errorMessage);
      this.filename = [];
      this.filenameRequest = [];
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } 

  }

  async exportReport() : Promise<void> {
    (this.exportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.exportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;

    var exportMonth = this.exportMonth.nativeElement.value;
    var exportYear = this.exportYear.nativeElement.value;
    var reportType = this.reportType.nativeElement.value;
    var year!: number | string;
    var month!: number | string;

    if (reportType != 'quantity') {
      if (!exportMonth || !exportYear) {
        (this.exportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
        (this.exportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
        this.validateService.printMsg('WARNING', 'Báo cáo phải có năm và tháng. Vui lòng nhập.');
        return;
      }
  
      
      try {
        year = Number.parseInt(exportYear);
        if (isNaN(year)) {
          throw new Error();
        }
  
        if (year < 1900) {
          (this.exportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
          this.validateService.printMsg('WARNING', 'Năm phải lớn hơn 1900');
          return;
        }
      } catch (err) {
        (this.exportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
        this.validateService.printMsg('WARNING', 'Định dạng năm không đúng.');
        return;
      }
  
      
      try {
        month = Number.parseInt(exportMonth);
        if (isNaN(month)) {
          throw new Error();
        }
        if (month < 0 || month > 12) {
          (this.exportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
          this.validateService.printMsg('WARNING', 'Tháng không hợp lệ.');
          return;
        }
      } catch (err) {
        (this.exportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
        this.validateService.printMsg('WARNING', 'Định dạng tháng không đúng.');
        return;
      }
    } else {
      year = '';
      month = '';
    }

    var params = new HttpParams();
    params = params.append('year', year);
    params = params.append('month', month);
    params = params.append('reportType', reportType);
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/export-report', {params: params}).subscribe(
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
      const reportDate = this.datetimeService.getCurrentDateTime('ddMMyyyHHmmss');
      a.href = url;
      a.download = 'BaoCao_' + reportDate + '.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      this.validateService.printMsg('SUCCESS', 'Xuất báo cáo thành công!');
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {

      this.validateService.printMsg('INFO', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.FILE_FORMAT_ERROR) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } 
  }

  typeRpChange() {
    (this.exportMonth.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;
    (this.exportYear.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_NORMAL;

    var exportMonth = this.exportMonth.nativeElement;
    var exportYear = this.exportYear.nativeElement;
    var reportType = this.reportType.nativeElement.value;

    if (reportType == 'quantity') {
      (exportMonth as HTMLInputElement).disabled = true;
      (exportYear as HTMLInputElement).disabled = true;
    } else {
      (exportMonth as HTMLInputElement).disabled = false;
      (exportYear as HTMLInputElement).disabled = false;
    }
  }

  async downloadFile(filename: string) {
    var params = new HttpParams();
    params = params.append('filename', filename);
    params = params.append('userId', this.userId);
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
      var files = filename.split("/");
      a.href = url;
      a.download = files[files.length - 1];
      a.href = url;
      a.click();
      window.URL.revokeObjectURL(url);
      this.validateService.printMsg('SUCCESS', 'Xuất báo cáo thành công!');
    } else if (resp.errorCode == this.constantVariable.FILE_EMPTY) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } 
  }

  drugImportRequestShow(): void {
    (document.getElementById("popup") as HTMLInputElement).classList.add("show");
    this.popup = 'request';
  }

  async drugImportRequest() : Promise<void> {
    var params = new HttpParams();
    params = params.append('userId', this.userId);
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient.get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/create-import-request', {params: params}).subscribe(
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
      // const byteCharacters = atob(resp.returnObject + '');
      // const byteNumbers = new Array(byteCharacters.length);
      // for (let i = 0; i < byteCharacters.length; i++) {
      //   byteNumbers[i] = byteCharacters.charCodeAt(i);
      // }
      // const byteArray = new Uint8Array(byteNumbers);
      // const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // const createTime = this.datetimeService.getCurrentDateTime('ddMMyyyHHmmss');
      // a.href = url;
      // a.download = 'NhapThuoc_' + createTime + '.xlsx';
      // a.click();
      // window.URL.revokeObjectURL(url);
      var link = 'xem-yeu-cau?thang=' + this.datetimeService.getCurrentDateTime('M') + '&nam=' + this.datetimeService.getCurrentDateTime('yyyy') + '&type=2';
      this.socketService.sendMessageToSocket('admin', 'Có đơn nhập thuốc vừa được tạo.', 'INFO', link, this.httpClient);
      this.validateService.printMsg('SUCCESS', 'Xuất yêu cầu thành công! Vui lòng đợi phản hồi từ quản trị viên.');
    } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
      this.validateService.printMsg('INFO', resp.errorMessage);
    } else if (resp.errorCode == this.constantVariable.AUTHOR_ERROR_NUMBER) {
      this.validateService.printMsg('ERROR', resp.errorMessage);
    } else {
      console.log(resp);
      this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
    } 
  }

  splitNameFile(fullname: string) {
    var files = fullname.split('/');
    return files[files.length - 1];
  }

  openPopConfirm() {
    (document.getElementById("popup") as HTMLInputElement).classList.add("show");
    this.popup = 'confirmInport';
  }

  @ViewChild('importQuantity') importQuantity!: ElementRef;
  confirmImport() {
    (document.getElementById("importQuantity") as HTMLInputElement).click();
  }

  async importQuantityFromFile(event: Event) : Promise<void> {
    var fileSelected: File | undefined;
    
      const fileInput = event.target as HTMLInputElement;
      if (fileInput.files) {
        fileSelected = fileInput.files[0];
      }
  
      if (fileSelected) {
        const formData = new FormData();
        formData.append('file', fileSelected);
        formData.append('userId', this.userId);
        this.loadingService.Start();
        let resp = await new Promise<ReciveModel>((resolve) => {
          this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'medicine/import-quantity-medicine', formData).subscribe(
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
          var link = 'kho-thuoc';
          this.socketService.sendMessageToSocket(this.userId, resp.errorMessage, 'SUCCESS', link, this.httpClient);
        } else if (resp.errorCode == this.constantVariable.ERROR_NUMBER) {
          console.error(resp.errorMessage);
          this.validateService.printMsg('ERROR', 'Đã xảy ra lỗi không mong muốn!');
        } else {
          this.validateService.printMsg('ERROR', resp.errorMessage);
        }
      }
      
      (document.getElementById("importQuantity") as HTMLInputElement).value = '';
  }

  async edit(medicine: MedicineModel) {
    this.popup = 'import';
    (document.getElementById("popup") as HTMLInputElement).classList.add("show");
    this.loadingService.Start();
    await this.loadingService.Stop();
    setTimeout(()=> {
      this.medicineName.nativeElement.value = medicine.name;
      this.medicineIngredients.nativeElement.value = medicine.drugIngredients;
      this.medicineUses.nativeElement.value = medicine.description;
      this.medicineProducer.nativeElement.value = medicine.producer;
      this.medicineId.nativeElement.value = medicine.id;
      this.checkUpdate = false;
    }, 1000)
  }
}
