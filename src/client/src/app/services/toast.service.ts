import { inject, Injectable } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly alerts = inject(TuiAlertService);

  showSuccess(message: string, title = 'Success', timeout = 3000) {
    this.alerts.open(message, {
      label: title,
      appearance: 'success',
      autoClose: timeout,
    }).subscribe();
  }

  showError(message: string, title = 'Error', timeout = 5000) {
    this.alerts.open(message, {
      label: title,
      appearance: 'error',
      autoClose: timeout,
    }).subscribe();
  }
}
