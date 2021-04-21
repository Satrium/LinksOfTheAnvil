import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/service/auth.service';
import { environment } from '@env';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit {

  version = environment.global.version + (!environment.production?"-dev":"");
  collapsed = false;

  constructor(private auth:AuthService) { }

  ngOnInit(): void {
    console.log("Environment",environment)
  }

  public get user$(){
    return this.auth.user$;
  }

}
