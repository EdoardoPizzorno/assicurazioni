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
      let token = response.headers["authorization"];
      if (token != undefined && token != null)
        localStorage.setItem("ASSICURAZIONI_TOKEN", token);
      return response;
    });

    _axios.interceptors.request.use((config: any) => {
      let token = localStorage.getItem("ASSICURAZIONI_TOKEN");
      if (token) {
        if (token === "undefined") {
          localStorage.removeItem("ASSICURAZIONI_TOKEN");
        } else {
          config.headers["authorization"] = token;
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
        localStorage.removeItem("ASSICURAZIONI_TOKEN");
        window.location.href = "/login";
      });
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Server Error: ' + err.response.status,
        text: err.response.data
      });
    }
  }

}