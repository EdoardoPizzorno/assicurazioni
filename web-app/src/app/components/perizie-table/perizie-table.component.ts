import { Component } from '@angular/core';
import { PeriziaService } from '../../services/perizia.service';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils/utils.service';
import { LoginService } from '../../services/login.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'perizie-table',
  templateUrl: './perizie-table.component.html',
  styleUrl: './perizie-table.component.css'
})
export class PerizieTableComponent {

  selectedOperator: string = "all";
  selectedDescription: string = "";
  selectedDate: string = "";

  constructor(public periziaService: PeriziaService, public dashboard: DashboardComponent, public loginService: LoginService, public googleMapsService: GoogleMapsService, private router: Router, private utils: UtilsService) { }

  async ngOnInit() {
    this.selectedOperator = this.router.parseUrl(this.router.url).queryParams["operator"] || "all";
    this.selectedDate = this.router.parseUrl(this.router.url).queryParams["date"] || "";
    this.selectedDescription = this.router.parseUrl(this.router.url).queryParams["search"] || "";
    if (!this.periziaService.perizie)
      await this.periziaService.getPerizie();
  }

  async filter() {
    let url = this.utils.createUrl(this.selectedOperator, this.selectedDate, this.selectedDescription)
    await this.router.navigateByUrl(url);
    await this.periziaService.getPerizie();
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
    await this.periziaService.getPerizie();
  }

}
