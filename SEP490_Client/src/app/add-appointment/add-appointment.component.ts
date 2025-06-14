import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../service/LoadingService';
import { ConstantVariable } from '../service/ConstantVariable';
import { CommonService } from '../service/CommonService';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppoinmentModel } from '../model/appoinmentModel';
import { DateTimeService } from '../service/DateTimeService';
import { ValidateService } from '../service/ValidateService';
import { DoctorModel } from '../model/DoctorModel';

export interface ComboboxC {
  id: string;
  name: string;
  provide: string;
}
export interface ComboboxP {
  id: string;
  name: string;
  district: string;
}
export interface ComboboxD {
  id: string;
  name: string;
  ward: string;
}
export interface ComboboxW {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.css'],
})
export class AddAppointmentComponent implements OnInit, AfterViewInit {
  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private validateService: ValidateService,
    private cdr: ChangeDetectorRef
  ) {}
  private loadingService = new LoadingService();
  private constantVariable = new ConstantVariable();
  private commonService = new CommonService();
  private dateTimeService = new DateTimeService();

  @ViewChild('fullname') fullname!: ElementRef;
  @ViewChild('phone') phone!: ElementRef;
  @ViewChild('fullnameNT') fullnameNT!: ElementRef;
  @ViewChild('phoneNT') phoneNT!: ElementRef;
  

  //@ViewChild('address') address!: ElementRef;
  @ViewChild('country') country!: ElementRef;
  @ViewChild('provide') provide!: ElementRef;
  @ViewChild('district') district!: ElementRef;
  @ViewChild('ward') ward!: ElementRef;

  //@ViewChild('addressNT') addressNT!: ElementRef;
  @ViewChild('country2') country2!: ElementRef;
  @ViewChild('provide2') provide2!: ElementRef;
  @ViewChild('district2') district2!: ElementRef;
  @ViewChild('ward2') ward2!: ElementRef;

  listDoctor: DoctorModel[] = [];
  haveNotiMessage!: Boolean;
  elementRefs!: { [key: string]: ElementRef };

  item = '';
  listCountry: ComboboxC[] = [];
  listProvide: ComboboxP[] = [];
  listDistrict: ComboboxD[] = [];
  listWard: ComboboxW[] = [];

  listCountry2: ComboboxC[] = [];
  listProvide2: ComboboxP[] = [];
  listDistrict2: ComboboxD[] = [];
  listWard2: ComboboxW[] = [];

  async ngOnInit(): Promise<void> {
    this.loadingService.Start();
    this.commonService.setLocalSotrage('page', 'dang-ky-lich-kham')
    var checkLogin = this.commonService.checkLocalStorage();
    if (checkLogin) {
      //console.log(this.commonService.getLocalSotrage('userInfor'));
    } else {
      this.commonService.setLocalSotrage('loginState', false);
      this.router.navigate(['/dang-nhap']);
    }

    this.haveNotiMessage = false;
    await this.loadingService.Stop();
  }

  async ngAfterViewInit(): Promise<void> {
    this.listCountry = [];
    this.listProvide = [];
    this.listDistrict = [];
    this.listWard = [];

    this.listCountry = this.constantVariable.PROVIDE as [];
    this.listCountry2 = this.constantVariable.PROVIDE as [];
    this.item = this.listCountry[0].id;
    this.cdr.detectChanges();
  }

  addAppoinment(): void {

    this.elementRefs = {
      fullname: this.fullname,
      phone: this.phone,
      fullnameNT: this.fullnameNT,
      phoneNT: this.phoneNT,
    };
    var listElement = [
      'fullname',
      'phone',
      'address',
      'fullnameNT',
      'phoneNT',
      'addressNT',
    ];

    this.validateService.clearError(listElement, this.elementRefs);

    var fullname = (this.fullname.nativeElement as HTMLInputElement).value;
    var phone = (this.phone.nativeElement as HTMLInputElement).value;
    var fullnameNT = (this.fullnameNT.nativeElement as HTMLInputElement).value;
    var phoneNT = (this.phoneNT.nativeElement as HTMLInputElement).value;
    
    //var address = (this.address.nativeElement as HTMLInputElement).value;
    var country = (this.country.nativeElement as HTMLInputElement).value;
    var provide = (this.provide.nativeElement as HTMLInputElement).value;
    var district = (this.district.nativeElement as HTMLInputElement).value;
    var ward = (this.ward.nativeElement as HTMLInputElement).value;

    //var addressNT = (this.addressNT.nativeElement as HTMLInputElement).value;
    var country2 = (this.country2.nativeElement as HTMLInputElement).value;
    var provide2 = (this.provide2.nativeElement as HTMLInputElement).value;
    var district2 = (this.district2.nativeElement as HTMLInputElement).value;
    var ward2 = (this.ward2.nativeElement as HTMLInputElement).value;

    var addressItem = {
      country: country,
      provide: provide,
      district: district,
      ward: ward,
      country2: country2,
      provide2: provide2,
      district2: district2,
      ward2: ward2,
    }
    var addressElement = {
      country: this.country,
      provide: this.provide,
      district: this.district,
      ward: this.ward,
      country2: this.country2,
      provide2: this.provide2,
      district2: this.district2,
      ward2: this.ward2,
    };
    var listElement2 = [
      'country',
      'provide',
      'district',
      'ward',
      'country2',
      'provide2',
      'district2',
      'ward2'
    ];
    var userInfo = this.commonService.getLocalSotrage('userInfor');
    var user = '';
    if (userInfo != '') {
      user = JSON.parse(userInfo)['userId'];
      console.log('User: ' + user);
    }

    const appointmentModel = new AppoinmentModel();

    appointmentModel.userId = user;
    appointmentModel.fullname = fullname;
    appointmentModel.phone = phone;
    appointmentModel.address = this.getAddress(ward,district,provide,country, 1);
    appointmentModel.fullnameNT = fullnameNT;
    appointmentModel.phoneNT = phoneNT;
    appointmentModel.addressNT = this.getAddress(ward2,district2,provide2,country2, 2);

    var emptyFlg = this.validateService.haveDataEmpty(
      appointmentModel,
      this.elementRefs,
      user
    );

    this.validateService.clearError(listElement2, addressElement);
    var emptyFlg2 = this.validateService.haveDataEmpty(
      addressItem,
      addressElement,
      user
    );
    
    if (emptyFlg && emptyFlg2) {
      var phoneCheck1 = this.validateService.isPhoneNumberValid(
        phone,
        user,
        'phone',
        this.elementRefs
      );
      var phoneCheck2 = this.validateService.isPhoneNumberValid(
        phoneNT,
        user,
        'phoneNT',
        this.elementRefs
      );
      if (phoneCheck1 && phoneCheck2) {
        this.commonService.setLocalSotrage('appointment', appointmentModel);
        this.router.navigate(['/xac-nhan-dat-lich']);
      }
    }
  }

  changeEvent() {
    console.log('test');
  }

  countryChange(op: number) {
    if (op == 1) {
      var country = (this.country.nativeElement as HTMLInputElement).value;
      var flg = false;
      this.listCountry.forEach((c) => {
        if (c['id'] == country) {
          flg = true;
          this.listProvide = c['provide'] as unknown as ComboboxP[];
        }
      });
      if (!flg) {
        this.listProvide = [];
        this.listDistrict = [];
        this.listWard = [];
      }
    } else {
      var country = (this.country2.nativeElement as HTMLInputElement).value;
      var flg = false;
      this.listCountry2.forEach((c) => {
        if (c['id'] == country) {
          flg = true;
          this.listProvide2 = c['provide'] as unknown as ComboboxP[];
        }
      });
      if (!flg) {
        this.listProvide2 = [];
        this.listDistrict2 = [];
        this.listWard2 = [];
      }
    }
  }

  provideChange(op: number) {
    if (op == 1) {
      var provide = (this.provide.nativeElement as HTMLInputElement).value;
      var flg = false;
      this.listProvide.forEach((p) => {
        if (p['id'] == provide) {
          flg = true;
          this.listDistrict = p['district'] as unknown as ComboboxD[];
        }
      });
      if (!flg) {
        this.listDistrict = [];
        this.listWard = [];
      }
    } else {
      var provide = (this.provide2.nativeElement as HTMLInputElement).value;
      var flg = false;
      this.listProvide2.forEach((p) => {
        if (p['id'] == provide) {
          flg = true;
          this.listDistrict2 = p['district'] as unknown as ComboboxD[];
        }
      });
      if (!flg) {
        this.listDistrict2 = [];
        this.listWard2 = [];
      }
    }
  }

  districtChange(op: number) {
    if (op == 1) {
      var district = (this.district.nativeElement as HTMLInputElement).value;
      var flg = false;
      this.listDistrict.forEach((w) => {
        if (w['id'] == district) {
          flg = true;
          this.listWard = w['ward'] as unknown as ComboboxD[];
        }
      });
      if (!flg) {
        this.listWard = [];
      }
    } else {
      var district = (this.district2.nativeElement as HTMLInputElement).value;
      var flg = false;
      this.listDistrict2.forEach((w) => {
        if (w['id'] == district) {
          flg = true;
          this.listWard2 = w['ward'] as unknown as ComboboxD[];
        }
      });
      if (!flg) {
        this.listWard2 = [];
      }
    }
  }

  getAddress(ward: string, district: string, provide: string,country: string, op: number) {
    var address = '';
    if (op == 1) {
      address += this.listWard.find((w) => w.id === ward)?.name;
      address += ', ';
      address += this.listDistrict.find((d) => d.id === district)?.name;
      address += ', ';
      address += this.listProvide.find((p) => p.id === provide)?.name;
      address += ', ';
      address += this.listCountry.find((c) => c.id === country)?.name;
    } else {
      address += this.listWard2.find((w) => w.id === ward)?.name;
      address += ', ';
      address += this.listDistrict2.find((d) => d.id === district)?.name;
      address += ', ';
      address += this.listProvide2.find((p) => p.id === provide)?.name;
      address += ', ';
      address += this.listCountry2.find((c) => c.id === country)?.name;
    }
    return address;
  }
}
