import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Client } from '../entities/client';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent implements OnInit {

  constructor(
    protected dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    protected clientServices: ClientService,
    protected dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Client
  ) { }

  ngOnInit(): void {
  }

}
