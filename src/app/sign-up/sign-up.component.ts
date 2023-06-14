import { Component, OnInit } from '@angular/core';

import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input'; 

@Component({
  selector: 'sign-up-component',
  templateUrl: 'sign-up.component.html',
  styleUrls: ['sign-up.component.css'],
})
export class SignUpComponent {
    signUp = new FormGroup({
    email : new FormControl('', [Validators.required, Validators.email]),
    
    passwort: new FormGroup(
      {
        password : new FormControl('', [Validators.required,Validators.minLength(8),]),
        passwordConfirm : new FormControl('', [Validators.required, Validators.minLength(8)]),
      },
      passwordMatchValidator as ValidatorFn

      
    )

  });
}

function passwordMatchValidator(g: FormGroup) {
  
  const x = (g.get('passwordConfirm')?.value !== null)&&(g.get('password')?.value === g.get('passwordConfirm')?.value) ? null : {'missmatch': true};
 
  return x;
}  

