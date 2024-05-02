import { Component } from '@angular/core';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  currentUser: any = {
    _id: "",
    user_picture: "",
    username: ""
  }

  constructor(public loginService: LoginService) {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      this.currentUser.user_picture = parsedCache.currentUser.user_picture;
      this.currentUser._id = parsedCache.currentUser._id;
      this.currentUser.username = parsedCache.currentUser.username;
    }
  }

  openToggleButton() {
    const navbar = document.getElementById('navbarNav')!;
    if (navbar.classList.contains('show')) {
      navbar.classList.remove('show');
    } else {
      navbar.classList.add('show');
    }

  }

}
