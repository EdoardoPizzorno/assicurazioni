import { Injectable } from '@angular/core';
import { DataStorageService } from './data-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UtilsService } from './utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class PeriziaService {

  perizie: any;
  operators: any[] = [];

  headQuarter: any = {
    coords: {
      lat: 44.5558401,
      lng: 7.7358973
    }
  }

  constructor(private dataStorage: DataStorageService, private router: Router, private utils: UtilsService, private activatedRoute: ActivatedRoute) { }

  getPerizie(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/perizie" + window.location.search)
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          this.perizie = response.data;
          await this.getOperators();
          resolve();
        });
    });
  }

  getOperators(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("GET", "/operators").catch(this.dataStorage.error).then((response) => {
        this.operators = response.data;
        resolve(this.operators);
      });
    });
  }

  edit(perizia: any): Promise<void> {
    console.log(perizia)
    return new Promise((resolve, reject) => {
      this.dataStorage.sendRequest("PATCH", "/perizia/" + perizia._id, {perizia})
        .catch(error => {
          this.dataStorage.error(error);
          reject(error);
        })
        .then(async (response) => {
          Swal.fire("Perizia modificata", "", "success");
          await this.getPerizie();
          resolve();
        });
    });
  }

  openInfo(perizia: any) {
    let imagesHtml = this.utils.generatePhotosHtml(perizia.photos);

    Swal.fire({
      title: perizia.description,
      html: `
        <b>Data:</b> ${perizia.date} alle ${perizia.time}<br>
        <b>Descrizione:</b> ${perizia.description}<br>
        <b>Creata da:</b> <span class="${this.utils.checkOperatorDeleted(perizia.operator.username)}"> ${perizia.operator.username} </span> <br>
        <div class="row container">
          ${imagesHtml}
        </div>
      `,
      width: "60%"
    });

  }

}
