import { MiaQuery } from '@agencycoda/mia-core';
import { MiaField, MiaFormConfig, MiaFormModalComponent, MiaFormModalConfig } from '@agencycoda/mia-form';
import { MiaTableComponent, MiaTableConfig } from '@agencycoda/mia-table';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { Client } from '../entities/client';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, OnDestroy {

  @ViewChild('table') table!: MiaTableComponent;

  destroy$: Subject<boolean> = new Subject<boolean>();

  tableConfig: MiaTableConfig = new MiaTableConfig();

  query: MiaQuery = new MiaQuery();

  constructor(
    protected clientServices: ClientService,
    protected dialog: MatDialog
  ) { }
  
  ngOnInit(): void {
    this.query.itemPerPage = 10;
    this.query.pageCurrent = 1;
    this.setTable();
  }

  setTable() {
    this.tableConfig.id = 'table';
    this.tableConfig.columns = [
      { key: 'firstname', type: 'string', title: 'First Name', field_key: 'firstname' },
      { key: 'lastname', type: 'string', title: 'Last name', field_key: 'lastname' },
      { key: 'email', type: 'string', title: 'Email', field_key: 'email' },
      { key: 'more', type: 'more', title: '', extra: {
        actions: [
          { icon: 'create', title: 'Edit', key: 'edit' },
          { icon: 'delete', title: 'Remove', key: 'remove' },
        ]
      } },
    ];
    this.tableConfig.loadingColor = 'red';
    this.tableConfig.hasEmptyScreen = true;
    this.tableConfig.emptyScreenTitle = 'You do not have any item loaded yet';
    this.tableConfig.query = this.query;
    this.tableConfig.service = this.clientServices;

    this.tableConfig.onClick.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if(result.key === 'edit')
        this.addOrEdit(result.item);
      if(result.key === 'remove')
        this.delete(result.item);
    });
    
  }

  delete(client: Client) {
    return this.dialog.open(ConfirmDeleteComponent, {
      width: '320px',
      panelClass: 'modal-full-width-mobile',
      autoFocus: false,
      data: client
    }).afterClosed().pipe(takeUntil(this.destroy$)).subscribe((reload: boolean) => {
      if(reload)
        this.clientServices.remove(client.id).finally(() => this.table.loadItems());
    });
  }

  addOrEdit(client?: Client) {
    let data = new MiaFormModalConfig();
    data.item = client ? client : {id: 0};
    data.service = this.clientServices;
    data.titleNew = 'Create Client';
    data.titleEdit = 'Edit Client';
    let config = new MiaFormConfig();
    config.hasSubmit = false;
    config.fields = [
      { key: 'firstname', type: MiaField.TYPE_STRING, label: 'First Name', validators:
      [Validators.required] },
      { key: 'lastname', type: MiaField.TYPE_STRING, label: 'Last name', validators:
      [Validators.required] },
      { key: 'email', type: MiaField.TYPE_STRING, label: 'Email', validators:
      [Validators.required, Validators.email] },
    ];
    config.errorMessages = [
      { key: 'required', message: 'The "%label%" is required.' },
      { key: 'email', message: 'The "%label%" is invalid.' }
    ];
    data.config = config;
    return this.dialog.open(MiaFormModalComponent, {
      width: '520px',
      panelClass: 'modal-full-width-mobile',
      data: data
    }).afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: Client) => {
      if(!client && result)
        this.table.loadItems();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
