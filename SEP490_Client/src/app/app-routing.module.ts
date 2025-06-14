import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent} from './signin/signin.component';
import { SignupComponent} from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { FptHospitalManagementComponent } from './fpt-hospital-management/fpt-hospital-management.component';
import { ErrorComponent } from './error/error.component';
import { ErrorHandleService } from './service/ErrorHandleService';
import { AddAppointmentComponent } from './add-appointment/add-appointment.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ConfirmAppointmentComponent } from './confirm-appointment/confirm-appointment.component';
import { ProfileScreenComponent } from './profile-screen/profile-screen.component';
import { SuccessRegisterAppointmentComponent } from './success-register-appointment/success-register-appointment.component';
import { AppoimtmentCardComponent } from './appoimtment-card/appoimtment-card.component';
import { AppoimtmentDetailComponent } from './appoimtment-detail/appoimtment-detail.component';
import { AppoimtmentCardSearchComponent } from './appoimtment-card-search/appoimtment-card-search.component';
import { ScanQrCodeComponent } from './scan-qr-code/scan-qr-code.component';
import { ViewStaffListComponent } from './view-staff-list/view-staff-list.component';
import { AddStaffComponent } from './add-staff/add-staff.component';
import { DiagnosticCardComponent } from './diagnostic-card/diagnostic-card.component';
import { UpdateDiagnosticCardComponent } from './update-diagnostic-card/update-diagnostic-card.component';
import { MedicalManagementComponent } from './medical-management/medical-management.component';
import { MedicineCardComponent } from './medicine-card/medicine-card.component';
import { ViewRequetScreenComponent } from './view-requet-screen/view-requet-screen.component';
import { DownloadComponent } from './download/download.component';
import { HomeGuestComponent } from './home-guest/home-guest.component';
import { ViewFeedbackComponent } from './view-feedback/view-feedback.component';
import { ManagementWorkingTimeComponent } from './management-working-time/management-working-time.component';
import { MessageComponent } from './message/message.component';
import { ConfirmAccountComponent } from './confirm-account/confirm-account.component';

const routes: Routes = [
  {path: '', component: HomeGuestComponent,},
  {path: 'guest', component: HomeGuestComponent,},
  {path: 'error', component: ErrorComponent,},
  {path: 'home', component: HomeComponent,},
  {path: 'dang-nhap', component: SigninComponent,},
  {path: 'dang-ky', component: SignupComponent,},
  {path: 'fpt-hospital-management', component: FptHospitalManagementComponent,},
  {path: 'profile', component: ProfileComponent,},
  {path: 'my-infomation', component: ProfileComponent,},
  {path: 'dang-ky-lich-kham', component: AddAppointmentComponent,},
  {path: 'xac-nhan-dat-lich', component: ConfirmAppointmentComponent,},
  {path: 'lich-kham', component: AppointmentsComponent,},
  {path: 'edit-profile', component: EditProfileComponent,},
  {path: 'trang-ca-nhan', component: ProfileScreenComponent,},
  {path: 'dang-ky-kham-benh-thanh-cong', component: SuccessRegisterAppointmentComponent,},
  {path: 'the-kham-benh', component: AppoimtmentCardComponent,},
  {path: 'thong-tin-lich-kham', component: AppoimtmentDetailComponent,},
  {path: 'tim-kiem-lich-kham', component: AppoimtmentCardSearchComponent,},
  {path: 'quet-ma-qr', component: ScanQrCodeComponent,},
  {path: 'danh-sach-nhan-vien', component: ViewStaffListComponent,},
  {path: 'them-nhan-vien', component: AddStaffComponent,},
  {path: 'phieu-chuan-doan', component: DiagnosticCardComponent,},
  {path: 'cap-nhat-phieu-chuan-doan', component: UpdateDiagnosticCardComponent,},
  {path: 'kho-thuoc', component: MedicalManagementComponent,},
  {path: 'xem-don-thuoc', component: MedicineCardComponent,},
  {path: 'xem-yeu-cau', component: ViewRequetScreenComponent,},
  {path: 'tai-xuong', component: DownloadComponent,},
  {path: 'feedback', component: ViewFeedbackComponent,},
  {path: 'lich-lam-viec', component: ManagementWorkingTimeComponent,},
  {path: 'message', component: MessageComponent,},
  {path: 'xac-thuc-tai-khoan', component: ConfirmAccountComponent,}
];

@NgModule({
  imports: [RouterModule.forRoot(routes), FormsModule, ReactiveFormsModule],
  exports: [RouterModule],
  providers: [
    ErrorHandleService,
    {provide: ErrorHandler, useClass: ErrorHandleService}, 
  ]
})
export class AppRoutingModule { }
