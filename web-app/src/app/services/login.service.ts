import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OAUTH_CREDENTIALS } from './env';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  loginError: boolean = false;

  constructor(private dataStorage: DataStorageService, private router: Router) { }

  login(email: string, password: string) {
    this.dataStorage.sendRequest('POST', '/login', { email, password })
      .then((response: any) => {
        if (response.status == 200) {
          this.redirectToDashboard(response);
        }
      })
      .catch((error: any) => {
        if (error.response.status == 401) {
          this.loginError = true;
        }
      });
  }

  googleLogin() {
    /*global google*/
    const OAuth2 = JSON.parse(OAUTH_CREDENTIALS);
    window.google.accounts.id.initialize({
      "client_id": OAuth2.client_id,
      "callback": function (response: any) {
        if (response.credential !== "") {
          let token = response.credential
          localStorage.setItem("token", token)
          this.dataStorage.sendRequest("POST", "/google-login")
            .catch(this.dataStorage.error)
            .then((response: any) => {
              if (response.status == 200) {
                this.redirectToDashboard(response);
              }
            });
        } else Swal.fire("Errore", "Errore durante il login con Google", "error")
      }
    })
    window.google.accounts.id.renderButton(
      document.getElementById("googleDiv"), // qualunque tag DIV della pagina
      {
        "theme": "outline",
        "size": "large",
        "type": "standard",
        "text": "continue_with",
        "shape": "rectangular",
        "logo_alignment": "center"
      }
    );
    window.google.accounts.id.prompt();
  }

  async checkToken() {
    let cache: any = localStorage.getItem("ASSICURAZIONI");
    if (cache) {
      let parsedCache: any = JSON.parse(cache);
      if (parsedCache.token === "undefined") {
        localStorage.removeItem("ASSICURAZIONI");
      }
    }
  }

  redirectToDashboard(response: any) {
    let currentUser: any = {
      _id: response.data._id,
      user_picture: response.data.user_picture,
      username: response.data.username
    }
    localStorage.setItem("ASSICURAZIONI", JSON.stringify({ token: response.headers.authorization, currentUser: currentUser }));
    this.router.navigateByUrl('/dashboard');
  }

}
