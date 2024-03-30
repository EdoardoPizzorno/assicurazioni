import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  logout() {
    localStorage.removeItem("ASSICURAZIONI_TOKEN");
    window.location.href = "/login";
  }

}
