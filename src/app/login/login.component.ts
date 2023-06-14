import { Component} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';

@Component({
  selector: 'login-component',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
})
export class LoginComponent {
    login = new FormGroup({
    email : new FormControl('', [Validators.required, Validators.email]),
    
    passwort: new FormGroup(
      {
        password : new FormControl('', [Validators.required,Validators.minLength(8),]),
        passwordConfirm : new FormControl('', [Validators.required, Validators.minLength(8)]),
      },
      passwordMatchValidator as ValidatorFn

      
    ),

  });
}

function passwordMatchValidator(g: FormGroup) {
  
  const x = (g.get('passwordConfirm')?.value !== null)&&(g.get('password')?.value === g.get('passwordConfirm')?.value) ? null : {'missmatch': true};
 
  return x;
}  
