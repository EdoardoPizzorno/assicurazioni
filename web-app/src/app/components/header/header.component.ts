import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  currentUser: any = {
    _id: "",
    user_picture: ""
  }

  constructor() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      this.currentUser.user_picture = parsedCache.currentUser.user_picture;
      this.currentUser._id = parsedCache.currentUser._id;
    }
  }

  logout() {
    localStorage.removeItem("ASSICURAZIONI");
    window.location.href = "/login";
  }

}
