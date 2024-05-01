import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPeriziePage } from './my-perizie.page';

describe('MyPeriziePage', () => {
  let component: MyPeriziePage;
  let fixture: ComponentFixture<MyPeriziePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPeriziePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
