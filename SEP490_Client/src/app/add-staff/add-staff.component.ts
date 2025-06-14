import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit , OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../service/ValidateService';
import { CommonService } from '../service/CommonService';
import { LoadingService } from '../service/LoadingService';
import { SendModel } from '../model/sendModel';
import { UserInformationModel } from '../model/userInformationModel';
import { ReciveModel } from '../model/reciveModel';
import { ConstantVariable } from '../service/ConstantVariable';
import { SpecializationModel } from '../model/SpecializationModel';
import { PositionModel } from '../model/PositionModel';
import { BuildingModel } from '../model/BuildingModel';
import { FloorModel } from '../model/FloorModel';
import { RoomModel } from '../model/RoomModel';
import { StaffModel } from '../model/StaffModel';
import { StaffDisplayModel } from './StaffDisplayModel';
import { SocketService } from '../service/SocketService';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-add-staff',
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.css']
})
export class AddStaffComponent {
  userId = '';

  // Form 1: account info
  @ViewChild('firstName') firstName!: ElementRef;
  @ViewChild('middleName') middleName!: ElementRef;
  @ViewChild('lastName') lastName!: ElementRef;
  @ViewChild('email') email!: ElementRef;
  @ViewChild('username') username!: ElementRef;
  @ViewChild('password') password!: ElementRef;
  @ViewChild('btnCreateAccount') btnCreateAccount!: ElementRef;

  // Form 2: vị trí và thông tin làm việc
  @ViewChild('roleId') roleId!: ElementRef;
  @ViewChild('facultyId') facultyId!: ElementRef;
  @ViewChild('faculty') faculty!: ElementRef;
  @ViewChild('positionId') positionId!: ElementRef;
  @ViewChild('buildingId') buildingId!: ElementRef;
  @ViewChild('floorId') floorId!: ElementRef;
  @ViewChild('roomId') roomId!: ElementRef;

  // Form 1
  baseInforAccountForm!: { [key: string]: ElementRef };
  baseInforAccountFormElements!: string[];

  // Form 2
  baseInforStaffForm!: { [key: string]: ElementRef };
  baseInforStaffFormElements!: string[];

  isStep1 = false;
  isStep2 = false;
  isStep3 = false;
  ishaveInfo = false;
  socket!: WebSocket;
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private route: ActivatedRoute
  ) {}

  isSubmit = true;

  userInformation!: UserInformationModel;
  staffDisplay!: StaffDisplayModel;
  staff!: StaffModel;

  specializationModelList: SpecializationModel[] = [];
  listFaculty: SpecializationModel[] = [];
  buildingList: BuildingModel[] = [];
  listFloor: FloorModel[] = [];
  listRoom: RoomModel[] = [];
  facultyName = '';
  isD = false;
  listPosition: PositionModel[] = [];

  private socketService = new SocketService();
  private commonService = new CommonService();
  private constantVariable = new ConstantVariable();
  private loadingService = new LoadingService();
  private headerComponent = new HeaderComponent(this.httpClient, this.router, this.validateService);

  ngOnInit(): void {
    this.isStep1 = true;
    this.commonService.setLocalSotrage('page', 'them-nhan-vien');
    this.userId = this.commonService.checkAuthen(1, this.router);
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadingService.Start();
    // Khởi tạo form 1
    this.baseInforAccountFormElements = [
      'firstName',
      'middleName',
      'lastName',
      'email',
      'username',
      'password',
      'btnCreateAccount'
    ];
    this.baseInforAccountForm ={
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      email: this.email,
      username: this.username,
      password: this.password,
      btnCreateAccount: this.btnCreateAccount
    };

    (this.password.nativeElement as HTMLInputElement).disabled = true;
    
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/get-specialization')
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          },
        });
    });

    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.specializationModelList = resp.returnObject as SpecializationModel[];
    } else {
      console.error(resp.errorMessage);
      throw resp;
    }

    let resp1 = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/get-building')
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          },
        });
    });

    if (resp1.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      this.buildingList = resp1.returnObject as BuildingModel[];
    } else {
      console.error(resp1.errorMessage);
      throw resp1;
    }

    await this.loadingService.Stop();
  }

  async createAccount(): Promise<void> {
    this.validateService.clearError(this.baseInforAccountFormElements, this.baseInforAccountForm);
    
    var firstname = (this.firstName.nativeElement as HTMLInputElement).value;
    var middlename = (this.middleName.nativeElement as HTMLInputElement).value;
    var lastname = (this.lastName.nativeElement as HTMLInputElement).value;
    var email = (this.email.nativeElement as HTMLInputElement).value;
    var username = (this.username.nativeElement as HTMLInputElement).value;

    if (middlename == '') {
      middlename = ' ';
    }

    var sendModel = new SendModel();
    this.userInformation = new UserInformationModel();

    this.userInformation.firstName = firstname;
    this.userInformation.middleName = middlename;
    this.userInformation.lastName = lastname;
    this.userInformation.email = email;
    this.userInformation.username = username;
    this.userInformation.usernameEncryto = username;
    this.userInformation.password = this.commonService.generateRandomPassword(20);
    this.userInformation.userId = 'NOT YET';
    this.userInformation.address = 'NOT YET';
    this.userInformation.nationality = 'NOT YET';
    this.userInformation.phoneNumber = 'NOT YET';
    this.userInformation.birthday = 'NOT YET';
    this.userInformation.gender = 'NOT YET';
    this.userInformation.urlAvt = 'img/user.png';
    
    var emptyFlg = this.validateService.haveDataEmpty(this.userInformation, this.baseInforAccountForm, this.userId);

    this.userInformation.userId = '';
    this.userInformation.address = '';
    this.userInformation.nationality = '';
    this.userInformation.phoneNumber = '';
    this.userInformation.birthday = '';
    this.userInformation.gender = '';

    if (emptyFlg) {

      sendModel.model = this.userInformation;
      this.loadingService.Start(); 
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'signup/register-user', sendModel).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            error['errorCode'] == this.constantVariable.ERROR_NUMBER;
            resolve(error);
          }
        });
      });
      await this.loadingService.Stop();
      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.commonService.disableForm(true, this.baseInforAccountForm, this.baseInforAccountFormElements);
        this.isStep1 = false;
        this.isStep2 = true;
        this.ishaveInfo = true;
        this.userInformation = Object.assign({}, resp.returnObject) as UserInformationModel;
      } else if (resp.errorCode == this.constantVariable.DUPLICATE_KEY) {
        this.validateService.printMsg('WARNING', 'Người dùng đã tồn tại!');
      } else {
        this.validateService.printMsg('ERROR', 'Đã có lỗi xảy ra!');
      }

      if (this.isStep2) {
        this.validateService.printMsg('SUCCESS', 'Đăng ký thành công! Thực hiện các bước còn lại để đăng ký nhân viên!');
      }
    }
  }

  async createStaffInfo() : Promise<void> {
    // Khởi tạo form 2
    this.baseInforStaffFormElements = [
      'roleId',
      'facultyId',
      'faculty',
      'positionId',
      'buildingId',
      'floorId',
      'roomId'
    ];
    this.baseInforStaffForm ={
      roleId: this.roleId,
      facultyId: this.facultyId,
      faculty: this.faculty,
      positionId: this.positionId,
      buildingId: this.buildingId,
      floorId: this.floorId,
      roomId: this.roomId
    };
    this.validateService.clearError(this.baseInforStaffFormElements, this.baseInforStaffForm);
  
    this.staff = new StaffModel();
    this.staff.staffId = this.userInformation.userId;
    this.staff.roleId = (this.roleId.nativeElement as HTMLInputElement).value;
    this.staff.facultyId = (this.facultyId.nativeElement as HTMLInputElement).value;
    this.staff.positionId = (this.positionId.nativeElement as HTMLInputElement).value;
    this.staff.buildingId = (this.buildingId.nativeElement as HTMLInputElement).value;
    this.staff.floorId = (this.floorId.nativeElement as HTMLInputElement).value;
    this.staff.roomId = (this.roomId.nativeElement as HTMLInputElement).value;
    this.staff.createUserId = this.userId;

    if (!this.staff.facultyId) {
      (this.faculty.nativeElement as HTMLInputElement).style.borderColor = this.constantVariable.COLOR_ERROR;
    }
    var checkEmpty =  this.validateService.haveDataEmpty(this.staff, this.baseInforStaffForm, this.userId)

    if (checkEmpty) {
      var sendModel = new SendModel();
      sendModel.model = this.staff;
      this.loadingService.Start();
      let resp = await new Promise<ReciveModel>((resolve) => {
        this.httpClient.post<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'add-staff/register-staff', sendModel).subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            error['errorCode'] == this.constantVariable.ERROR_NUMBER;
            resolve(error);
          }
        });
      });

      if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
        this.commonService.disableForm(true, this.baseInforStaffForm, this.baseInforStaffFormElements);
        this.isStep2 = false;
        this.ishaveInfo = true;
        this.isStep3 = true;
        this.staffDisplay = new StaffDisplayModel();
        if (this.staff.roleId == '2') {
          this.staffDisplay.roleName = 'Bác sĩ';
        } else if (this.staff.roleId == '3') {
          this.staffDisplay.roleName = 'Y tá';
        } else if (this.staff.roleId == '5') {
          this.staffDisplay.roleName = 'Dược sĩ';
        } else {
          this.staffDisplay.roleName = this.staff.roleId;
        }
        this.specializationModelList.forEach((f) => {
          if (f.id == this.staff.facultyId) {
            this.staffDisplay.facultyName = f.name;
          }
        });
        this.listPosition.forEach((p) => {
          if (p.posId == this.staff.positionId) {
            this.staffDisplay.positionName = p.posName;
          }
        });
        this.buildingList.forEach((b) => {
          if (b.buildingId == this.staff.buildingId) {
            this.staffDisplay.buildingName = b.buildingName;
          }
        });
        this.listFloor.forEach((f) => {
          if (f.id == this.staff.floorId) {
            this.staffDisplay.floorName = f.floor;
          }
        });
        this.listRoom.forEach((r) => {
          if (r.id == this.staff.roomId) {
            this.staffDisplay.roomName = r.room;
          }
        });

      } else if (resp.errorCode == this.constantVariable.DB_NOTFOUND) {
        console.error(resp.errorMessage);
        this.validateService.printMsg('ERROR', 'Người dùng không tồn tại!');
      } else {
        console.error(resp.errorMessage);
        this.validateService.printMsg('ERROR', 'Đã có lỗi xảy ra!');
      }

      if (this.isStep3) {
        var link = 'trang-ca-nhan';
        this.validateService.printMsg('SUCCESS', 'Đã đăng ký thông tin thành công! Vui lòng đăng nhập và nhập thông tin cá nhân.');
        console.log(this.userInformation.usernameEncryto);
        
        this.socketService.sendMessageToSocket(this.userInformation.userId, 'Tài khoản nhân viên của bạn đã được tạo thành công! Vui lòng nhập các thông tin cá nhân để hoàn thành thủ tục.', 'INFO', link, this.httpClient);
      }
      await this.loadingService.Stop();
    }
  }

  async getPosition(): Promise<void> {
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/get-position')
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          },
        });
    });

    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var listPositionAll = resp.returnObject as PositionModel[];
      
      var role = (this.roleId.nativeElement as HTMLInputElement).value;
      var listPos: PositionModel[] = [];
      listPositionAll.forEach((p) => {
        if (p.roleId == role && p.active == 'Y') {
          listPos.push(p);
        }
      });
      this.listPosition = Object.assign([], listPos) as PositionModel[];
    } else {
      throw resp;
    }
    await this.loadingService.Stop();
  }

  searchFaculty(): void {
    var facultyName = (this.faculty.nativeElement as HTMLInputElement).value;
    if (!facultyName) {
      (this.facultyId.nativeElement as HTMLInputElement).value = '';
    }
    this.isSubmit = true;
    this.listFaculty = [];
    this.specializationModelList.forEach((f) => {
      if (f.name.includes(facultyName)) {
        this.listFaculty.push(f);
      }
    });

    if (this.listFaculty.length == 0) {
      this.isSubmit = false;
    }
  }

  apIdFocus(): void {
    this.isD = true;
  }

  apIdBlur(): void {
    this.isD = false;
  }

  getFaculty(name: string, id: string): void {
    (this.faculty.nativeElement as HTMLInputElement).value = name;
    (this.facultyId.nativeElement as HTMLInputElement).value = id;
  }

  async changeBuilding() : Promise<void> {
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/get-work-floor')
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          },
        });
    });

    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var listFloorAll = resp.returnObject as FloorModel[];
      
      var buildingId = (this.buildingId.nativeElement as HTMLInputElement).value;
      var listFl: FloorModel[] = [];
      listFloorAll.forEach((f) => {
        if (f.buildingId == buildingId) {
          listFl.push(f);
        }
      });
      this.listFloor = Object.assign([], listFl) as FloorModel[];
      console.log(this.listFloor);
      
    } else {
      throw resp;
    }
    await this.loadingService.Stop();
  }

  async changeFloor() : Promise<void> {
    this.loadingService.Start();
    let resp = await new Promise<ReciveModel>((resolve) => {
      this.httpClient
        .get<ReciveModel>(this.constantVariable.CONTENT_API_SERVER +'fhc-common/get-work-room')
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => {
            resolve(error);
          },
        });
    });

    if (resp.errorCode == this.constantVariable.SUCCESS_NUMBER) {
      var listRoomAll = resp.returnObject as RoomModel[];
      
      var floorId = (this.floorId.nativeElement as HTMLInputElement).value;
      var listR: RoomModel[] = [];
      listRoomAll.forEach((f) => {
        if (f.floorId == floorId) {
          listR.push(f);
        }
      });
      this.listRoom = Object.assign([], listR) as RoomModel[];
      console.log(this.listRoom);
      
    } else {
      throw resp;
    }
    await this.loadingService.Stop();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    console.log('Loading page .....');
    
  }

}
