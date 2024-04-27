import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageUserPage } from './manage-user.page';

describe('ManageUserPage', () => {
  let component: ManageUserPage;
  let fixture: ComponentFixture<ManageUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
