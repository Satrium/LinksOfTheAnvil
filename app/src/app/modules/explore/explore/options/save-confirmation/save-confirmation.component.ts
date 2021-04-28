import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Preset } from '@global/graph.config';

@Component({
  selector: 'app-save-confirmation',
  templateUrl: './save-confirmation.component.html',
  styleUrls: ['./save-confirmation.component.sass']
})
export class SaveConfirmationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SaveConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Preset) {}

  ngOnInit(): void {
  }

}
