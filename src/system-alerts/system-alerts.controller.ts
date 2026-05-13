import { Controller, Get } from '@nestjs/common';

import { SystemAlertsService } from './system-alerts.service';

@Controller('system-alerts')
export class SystemAlertsController {
  constructor(private readonly systemAlertsService: SystemAlertsService) {}

  @Get()
  getAlerts() {
    return this.systemAlertsService.getAlerts();
  }
}
