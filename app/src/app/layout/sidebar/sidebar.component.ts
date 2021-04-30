import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/service/auth.service';
import { environment } from '@env';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit {

  development:boolean = false;
  version = environment.version + (!environment.production?"-dev":"");
  collapsed = false;

  constructor(private auth:AuthService) { }

  ngOnInit(): void {
    this.development = window.location.hostname !== "linksoftheanvil.satrium.de";
    console.log(window.location.hostname);
  }

  public get user$(){
    return this.auth.user$;
  }

}
