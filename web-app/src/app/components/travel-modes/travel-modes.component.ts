import { Component } from '@angular/core';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'travel-modes',
  templateUrl: './travel-modes.component.html',
  styleUrl: './travel-modes.component.css'
})
export class TravelModesComponent {

  constructor(public googleMapsService: GoogleMapsService) { }

}
