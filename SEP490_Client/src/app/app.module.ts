import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoadingComponent } from './loading/loading.component';
import { HeaderComponent } from './header/header.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { FptHospitalManagementComponent } from './fpt-hospital-management/fpt-hospital-management.component';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { MessageMenuComponent } from './message-menu/message-menu.component';
import { ErrorComponent } from './error/error.component';
import { ProfileComponent } from './profile/profile.component';
import { AddAppointmentComponent } from './add-appointment/add-appointment.component';
import { ValidateService } from './service/ValidateService';
import { AppointmentsComponent } from './appointments/appointments.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
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
import { ImportMedicineComponent } from './import-medicine/import-medicine.component';
import { MedicineCardComponent } from './medicine-card/medicine-card.component';
import { ViewRequetScreenComponent } from './view-requet-screen/view-requet-screen.component';
import { DownloadComponent } from './download/download.component';
import { HomeGuestComponent } from './home-guest/home-guest.component';
import { ViewFeedbackComponent } from './view-feedback/view-feedback.component';
import { ManagementWorkingTimeComponent } from './management-working-time/management-working-time.component';
import { MessageComponent } from './message/message.component';
import { ConfirmAccountComponent } from './confirm-account/confirm-account.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    HeaderComponent,
    SigninComponent,
    SignupComponent,
    HomeComponent,
    FptHospitalManagementComponent,
    LeftMenuComponent,
    MessageBoxComponent,
    MessageMenuComponent,
    ErrorComponent,
    ProfileComponent,
    AddAppointmentComponent,
    AppointmentsComponent,
    EditProfileComponent,
    AppFooterComponent,
    ConfirmAppointmentComponent,
    ProfileScreenComponent,
    SuccessRegisterAppointmentComponent,
    AppoimtmentCardComponent,
    AppoimtmentDetailComponent,
    AppoimtmentCardSearchComponent,
    ScanQrCodeComponent,
    ViewStaffListComponent,
    AddStaffComponent,
    DiagnosticCardComponent,
    UpdateDiagnosticCardComponent,
    MedicalManagementComponent,
    ImportMedicineComponent,
    MedicineCardComponent,
    ViewRequetScreenComponent,
    DownloadComponent,
    HomeGuestComponent,
    ViewFeedbackComponent,
    ManagementWorkingTimeComponent,
    MessageComponent,
    ConfirmAccountComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [ValidateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
