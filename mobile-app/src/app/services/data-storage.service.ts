import { Injectable } from '@angular/core';
import _axios from 'axios';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  private REST_API_SERVER = "http://192.168.1.11:3000/api";

  constructor(private alertController: AlertController) {

    _axios.interceptors.response.use((response: any) => {
      let token: any = response.headers["authorization"];
      let cache: any = localStorage.getItem("ASSICURAZIONI");
      if (token != undefined && token != null && cache != null) {
        let parsedCache: any = JSON.parse(cache);
        localStorage.setItem("ASSICURAZIONI", JSON.stringify({ token, currentUser: parsedCache.currentUser }));
      }
      return response;
    });

    _axios.interceptors.request.use((config: any) => {
      let cache: any = localStorage.getItem("ASSICURAZIONI");
      if (cache) {
        let parsedCache: any = JSON.parse(cache);
        if (parsedCache.token === "undefined") {
          localStorage.removeItem("ASSICURAZIONI");
        } else {
          config.headers["authorization"] = parsedCache.token;
        }
      }
      return config;
    });

  }

  public sendRequest(method: string, resource: string, params: any = {}): Promise<any> {
    resource = this.REST_API_SERVER + resource;
    switch (method.toUpperCase()) {
      case 'GET':
        return _axios.get(resource, { params });
      case 'POST':
        return _axios.post(resource, params);
      case 'PATCH':
        return _axios.patch(resource, params);
      case 'PUT':
        return _axios.put(resource, params);
      case 'DELETE':
        return _axios.delete(resource);
      default:
        return _axios.get(resource);
    }
  }

  public async error(err: any) {
    switch (err.response.status) {
      case undefined:
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Connection Refused or Server timeout',
          buttons: ['OK']
        });
        await alert.present();
        break;
      case 200:
        const alert200 = await this.alertController.create({
          header: 'Error',
          message: 'Formato dei dati non corretto',
          subHeader: err.response.data,
          buttons: ['OK']
        });
        await alert200.present();
        break;
      case 403:
        localStorage.removeItem("ASSICURAZIONI");
        window.location.href = "/login";
        break;
      case 409:
        const alert409 = await this.alertController.create({
          header: 'Error',
          message: 'Elemento già presente',
          subHeader: err.response.data,
          buttons: ['OK']
        });
        await alert409.present();
        break;
      default:
        const alertDefault = await this.alertController.create({
          header: 'Server Error: ' + err.response.status,
          message: err.response.data,
          buttons: [
            {
              text: 'OK',
              handler: () => {
                window.history.back();
              }
            }
          ]
        });
        await alertDefault.present();
        break;
    }
  }
}
