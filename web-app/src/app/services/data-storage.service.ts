import { Injectable } from '@angular/core';
import _axios from "axios";
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  private REST_API_SERVER = "https://assicurazioni.onrender.com/api";

  constructor() {

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

  public error(err: any) {
    switch (err.response.status) {
      case undefined:
        Swal.fire({
          icon: 'error',
          title: 'Connection Refused or Server timeout'
        });
        break;
      case 200:
        Swal.fire({
          icon: 'error',
          title: 'Formato dei dati non corretto',
          text: err.response.data
        });
        break;
      case 403:
        localStorage.removeItem("ASSICURAZIONI");
        window.location.href = "/login";
        break;
      case 409:
        Swal.fire({
          icon: 'error',
          title: 'Elemento già presente',
          text: err.response.data
        });
        break;
      default:
        Swal.fire({
          icon: 'error',
          title: 'Server Error: ' + err.response.status,
          text: err.response.data
        }).then(() => window.history.back());
        break;
    }
  }

}