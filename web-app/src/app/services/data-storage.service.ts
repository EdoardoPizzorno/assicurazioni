import { Injectable } from '@angular/core';
import _axios from "axios";
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  private REST_API_SERVER = "http://localhost:3000/api";

  constructor() {

    _axios.interceptors.response.use((response: any) => {
      let token: any = response.headers["authorization"];
      let cache: any = localStorage.getItem("ASSICURAZIONI");
      if (token != undefined && token != null && cache != null) {
        let parsedCache: any = JSON.parse(cache);
        localStorage.setItem("ASSICURAZIONI", JSON.stringify({ token, currentUser: parsedCache.currentUser}));
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
        return _axios.post(resource, { "body": params });
      case 'PATCH':
        return _axios.patch(resource, { "body": params });
      case 'PUT':
        return _axios.put(resource, params);
      case 'DELETE':
        return _axios.delete(resource);
      default:
        return _axios.get(resource);
    }
  }

  public error(err: any) {
    if (!err.response)
      Swal.fire({
        icon: 'error',
        title: 'Connection Refused or Server timeout'
      });
    else if (err.response.status == 200)
      Swal.fire({
        icon: 'error',
        title: 'Formato dei dati non corretto',
        text: err.response.data
      });
    else if (err.response.status == 403) {
      Swal.fire({
        icon: 'error',
        title: 'Sessione scaduta',
        text: 'Effettua nuovamente il login'
      }).then(() => {
        localStorage.removeItem("ASSICURAZIONI");
        window.location.href = "/login";
      });
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Server Error: ' + err.response.status,
        text: err.response.data
      }).then(() => window.history.back());
    }
  }

}