import { Component } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';

@Component({
  selector: 'perizie-table',
  templateUrl: './perizie-table.component.html',
  styleUrl: './perizie-table.component.css'
})
export class PerizieTableComponent {

  selectedOperator: string = "all";
  selectedDescription: string = "";
  selectedDate: string = "";

  constructor(public periziaService: PeriziaService, private router: Router, private utils: UtilsService) { }

  async ngOnInit() {
    this.selectedOperator = this.router.parseUrl(this.router.url).queryParams["operator"] || "all";
    this.selectedDate = this.router.parseUrl(this.router.url).queryParams["date"] || "";
    this.selectedDescription = this.router.parseUrl(this.router.url).queryParams["search"] || "";
    await this.periziaService.getPerizie();
  }

  async filter() {
    let url = this.utils.createUrl(this.selectedOperator, this.selectedDate, this.selectedDescription)
    await this.router.navigateByUrl(url);
    this.periziaService.getPerizie();
  }

  async removeFilter(filterType: string) {
    if (filterType === "operator") {
      this.selectedOperator = "all";
    } else if (filterType === "date") {
      this.selectedDate = "";
    } else if (filterType === "description") {
      this.selectedDescription = "";
    }

    const url = this.utils.createUrl(this.selectedOperator, this.selectedDate, this.selectedDescription);
    await this.router.navigateByUrl(url);
    this.periziaService.getPerizie();
  }

  async editPerizia(perizia: any) {
    let imagesHtml = this.utils.generatePhotosHtmlForEdit(perizia.photos);

    Swal.fire({
      title: "Modifica perizia",
      html: `
      <form id="editForm" class="container">
        <div class="form-group">
          <label for="description">Descrizione</label>
          <input type="text" class="form-control" id="description" value="${perizia.description}">
        </div>
        <div class="form-group">
          <label for="date">Data</label>
          <input type="date" class="form-control" id="date" value="${perizia.date}">
        </div>
        <div class="form-group">
          <label for="time">Ora</label>
          <input type="time" class="form-control" id="time" value="${perizia.time}">
        </div>
        <div class="row">
          ${imagesHtml}
        </div>
      </form>
    `,
      showCancelButton: true,
      confirmButtonText: "Salva",
      cancelButtonText: "Annulla",
      width: "80%"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const description = (<HTMLInputElement>document.getElementById("description")).value;
        const date = (<HTMLInputElement>document.getElementById("date")).value;
        const time = (<HTMLInputElement>document.getElementById("time")).value;

        perizia.description = description;
        perizia.date = date;
        perizia.time = time;

        await this.periziaService.edit(perizia);
        this.periziaService.getPerizie();
      }
    });
  }

}