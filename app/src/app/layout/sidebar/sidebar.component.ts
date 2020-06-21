import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/service/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit {

  collapsed = false;

  constructor(private auth:AuthService) { }

  ngOnInit(): void {
  }

  public get user$(){
    return this.auth.user$;
  }

}
