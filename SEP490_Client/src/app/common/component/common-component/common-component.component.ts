import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-common-component',
  templateUrl: './common-component.component.html',
  styleUrls: ['./common-component.component.css']
})
export class CommonComponentComponent {
  @Input() label!: string;
  @Input() type: 'text' | 'select' | 'textarea' = 'text';
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() options?: { value: string; label: string }[];
  @Input() controlId = '';
  @Input() width = "'style='width: 100%'";

  isInvalid() {
    const control = this.form.get(this.controlName);
    return control?.invalid;
  }

  getErrorMessage() {
    const control = this.form.get(this.controlName);
    if (control?.errors?.['required']) 
      return 'Trường này bắt buộc';
    if (control?.errors?.['minlength']) 
      return 'Quá ngắn';
    if (control?.errors?.['formatError']) 
      return 'Không đúng định dạng';
    // ... có thể map thêm từ service hoặc enum
    return 'Không hợp lệ';
  }

}
