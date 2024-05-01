import { Component, OnInit } from '@angular/core';
import { PeriziaService } from 'src/app/services/perizia.service';

@Component({
  selector: 'app-my-perizie',
  templateUrl: './my-perizie.page.html',
  styleUrls: ['./my-perizie.page.scss'],
})
export class MyPeriziePage implements OnInit {

  constructor(private periziaService: PeriziaService) { }

  async ngOnInit() {
    if (!this.periziaService.perizie)
      await this.periziaService.getPerizie();
  }

}
