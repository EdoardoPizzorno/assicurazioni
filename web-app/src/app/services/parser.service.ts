import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParserService {

  constructor() { }

  parseDate(date: string) {
    let aux = date.split("T")
    let dateObj = { date: "", time: "" }
    dateObj["date"] = aux[0]
    dateObj["time"] = aux[1].split(".")[0]
    return dateObj
  }

}
