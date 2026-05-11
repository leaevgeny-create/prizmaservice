import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { DefectsService } from './defects.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class DefectsController {
  constructor(private readonly defectsService: DefectsService) {}

  @Post('objects/:objectId/defects')
  create(@Param('objectId') objectId: string, @Body() dto: any) {
    return this.defectsService.create(objectId, dto);
  }

  @Get('objects/:objectId/defects')
  findByObject(@Param('objectId') objectId: string) {
    return this.defectsService.findByObject(objectId);
  }

  @Get('defects/:id')
  findOne(@Param('id') id: string) {
    return this.defectsService.findOne(id);
  }

  @Post('defects/:id/submit')
  submit(@Param('id') id: string) {
    return this.defectsService.submit(id);
  }

  @Post('defects/:id/approve')
  approve(@Param('id') id: string) {
    return this.defectsService.approve(id);
  }

  @Post('defects/:id/reject')
  reject(@Param('id') id: string, @Body() dto: { comment: string }) {
    return this.defectsService.reject(id, dto.comment);
  }

  @Post('defects/:id/windows')
  createWindow(@Param('id') id: string, @Body() dto: any) {
    return this.defectsService.createWindowBlock(id, dto);
  }

  @Patch('defects/windows/:windowId')
  updateWindow(@Param('windowId') windowId: string, @Body() dto: any) {
    return this.defectsService.updateWindowBlock(windowId, dto);
  }
}
