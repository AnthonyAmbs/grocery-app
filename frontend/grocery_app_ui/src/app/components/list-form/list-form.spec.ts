import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListForm } from './list-form';

describe('ListForm', () => {
  let component: ListForm;
  let fixture: ComponentFixture<ListForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
