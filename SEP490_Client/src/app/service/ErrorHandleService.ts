import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from "./CommonService";

@Injectable()
export class ErrorHandleService implements ErrorHandler {
    constructor(private router: Router,private injector: Injector){};
    private commonService = new CommonService();
    handleError(error: any): void {
        let router = this.injector.get(Router);
        console.log('URL: ' + router.url);
        this.commonService.clearLocalSotrage();
        if (error instanceof HttpErrorResponse) {
            //Backend returns unsuccessful response codes such as 404, 500 etc.				  
            console.error('Backend returned status code: ', error.status);
            console.error('Response body:', error.message); 
            localStorage.setItem('error', error.message);
            this.router.navigate(['/error']);
        } else {
            //A client-side or network error occurred.	          
            console.error('An error occurred:', error.message);
            console.error('An error occurred:', error);
            localStorage.setItem('error', error.message);
            this.router.navigate(['/error']);    
        }   
    }

}