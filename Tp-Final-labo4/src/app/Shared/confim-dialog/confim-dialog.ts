import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confim-dialog',
  standalone: true ,
  imports: [CommonModule],
  templateUrl: './confim-dialog.html',
  styleUrl: './confim-dialog.css',
})
export class ConfimDialog {

  @Input() title: string = "Confirmar acción";
  @Input() description: string = "¿Estás seguro?";
  @Input() confirmText: string = "Confirmar";
  @Input() cancelText: string | null = "Cancelar";

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  dialog!: HTMLDialogElement;

  ngAfterViewInit() {
    this.dialog = document.getElementById("genericConfirmDialog") as HTMLDialogElement;
  }

  open() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }

  confirm() {
    this.onConfirm.emit();
    this.close();
  }

  cancel() {
    this.onCancel.emit();
    this.close();
  }
}


