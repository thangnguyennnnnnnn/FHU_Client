import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-component',
  templateUrl: './input-component.component.html',
  styleUrls: ['./input-component.component.css']
})
export class InputComponentComponent {
  @Input() label!: string;
  @Input() type: 'text' | 'select' | 'password' | 'textarea' = 'text';
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() options?: { value: string; label: string }[];
  @Input() controlId = '';
  @Input() width = "'style='width: 100%'";

  isInvalid() {
    const control = this.form.get(this.controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage() {
    const control = this.form.get(this.controlName);
    if (control?.errors?.['required']) 
      return 'Trường này bắt buộc';
    if (control?.errors?.['minlength']) 
      return 'Quá ngắn';
    if (control?.errors?.['formatError']) 
      return 'Không đúng định dạng';
    if (control?.errors?.['invalidEmail']) 
      return 'Email Không đúng định dạng';
    // ... có thể map thêm từ service hoặc enum
    return 'Không hợp lệ';
  }

}
