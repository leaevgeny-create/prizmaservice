import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get('objects/:objectId/materials')
  findByObject(@Param('objectId') objectId: string) {
    return this.materialsService.findByObject(objectId);
  }

  @Post('materials/movements')
  createMovement(@Body() dto: any) {
    return this.materialsService.createMovement(dto);
  }

  @Get('materials/:stockId/movements')
  findMovements(@Param('stockId') stockId: string) {
    return this.materialsService.findMovements(stockId);
  }
}
