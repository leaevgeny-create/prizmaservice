import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ActType } from '@prisma/client';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import * as dayjs from 'dayjs';

@Injectable()
export class DocumentGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async generateKS2(acceptanceId: string): Promise<string> {
    const acceptance = await this.prisma.workAcceptance.findUniqueOrThrow({
      where: { id: acceptanceId },
      include: {
        items: true,
        order: {
          include: {
            object: true,
            customer: { include: { profile: true } },
            executor: { include: { profile: true } },
          },
        },
      },
    });

    const actNumber = await this.generateActNumber('KS2');

    const data = {
      actNumber,
      actDate: dayjs().format('DD.MM.YYYY'),
      objectName: acceptance.order.object.name,
      objectAddress: acceptance.order.object.address,
      customerName: this.formatName(acceptance.order.customer.profile),
      executorName: this.formatName(acceptance.order.executor?.profile),
      aggregatorName: 'ООО «Призма Сервис»',
      inn: '7700000000',
      periodFrom: dayjs(acceptance.order.startDate).format('DD.MM.YYYY'),
      periodTo: dayjs(acceptance.order.endDate).format('DD.MM.YYYY'),
      items: acceptance.items.map((item, i) => ({
        number: i + 1,
        description: item.description,
        unit: item.unit,
        planned: item.planned,
        actual: item.actual,
      })),
      totalAmount: acceptance.items
        .reduce((sum, item) => sum + Number(item.actual), 0)
        .toFixed(2),
    };

    const html = this.renderKS2Template(data);
    const pdfBuffer = await this.htmlToPdf(html);
    const fileName = `acts/KS2_${actNumber}_${acceptanceId}.pdf`;
    const url = await this.storage.upload(fileName, pdfBuffer, 'application/pdf');

    // Создаём запись акта в БД
    await this.prisma.act.create({
      data: {
        acceptanceId,
        type: ActType.KS2,
        number: actNumber,
        date: new Date(),
        periodFrom: acceptance.order.startDate,
        periodTo: acceptance.order.endDate,
        amount: data.items.reduce((s, i) => s + Number(i.actual), 0),
        vatAmount: 0,
        totalAmount: data.items.reduce((s, i) => s + Number(i.actual), 0),
        documentUrl: url,
      },
    });

    return url;
  }

  async generateKS3(ks2ActId: string): Promise<string> {
    const ks2 = await this.prisma.act.findUniqueOrThrow({
      where: { id: ks2ActId },
      include: {
        acceptance: {
          include: {
            order: {
              include: {
                object: true,
                customer: { include: { profile: true } },
                executor: { include: { profile: true } },
              },
            },
          },
        },
      },
    });

    const actNumber = await this.generateActNumber('KS3');
    const vatRate = 0.20;
    const amount = Number(ks2.totalAmount);
    const vatAmount = amount * vatRate;
    const totalAmount = amount + vatAmount;

    const data = {
      actNumber,
      ks2Number: ks2.number,
      actDate: dayjs().format('DD.MM.YYYY'),
      objectName: ks2.acceptance.order.object.name,
      customerName: this.formatName(ks2.acceptance.order.customer.profile),
      executorName: this.formatName(ks2.acceptance.order.executor?.profile),
      aggregatorName: 'ООО «Призма Сервис»',
      amount: amount.toFixed(2),
      vatRate: '20%',
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };

    const html = this.renderKS3Template(data);
    const pdfBuffer = await this.htmlToPdf(html);
    const fileName = `acts/KS3_${actNumber}.pdf`;
    const url = await this.storage.upload(fileName, pdfBuffer, 'application/pdf');

    await this.prisma.act.create({
      data: {
        acceptanceId: ks2.acceptanceId,
        type: ActType.KS3,
        number: actNumber,
        date: new Date(),
        periodFrom: ks2.acceptance.order.startDate,
        periodTo: ks2.acceptance.order.endDate,
        amount,
        vatAmount,
        totalAmount,
        documentUrl: url,
      },
    });

    return url;
  }

  async generateWorkOrder(workOrderId: string): Promise<string> {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: workOrderId },
      include: {
        signatures: { include: { user: { include: { profile: true } } } },
        order: { include: { object: true } },
      },
    });

    const data = {
      number: workOrder.number,
      type: workOrder.type,
      workDescription: workOrder.workDescription,
      location: workOrder.location,
      objectName: workOrder.order.object.name,
      objectAddress: workOrder.order.object.address,
      validFrom: dayjs(workOrder.validFrom).format('DD.MM.YYYY HH:mm'),
      validTo: dayjs(workOrder.validTo).format('DD.MM.YYYY HH:mm'),
      signatures: workOrder.signatures.map((s) => ({
        role: s.role,
        name: this.formatName(s.user.profile),
        signedAt: dayjs(s.signedAt).format('DD.MM.YYYY HH:mm'),
      })),
    };

    const html = this.renderWorkOrderTemplate(data);
    const pdfBuffer = await this.htmlToPdf(html);
    const fileName = `work-orders/WO_${workOrder.number}.pdf`;
    const url = await this.storage.upload(fileName, pdfBuffer, 'application/pdf');

    return url;
  }

  private formatName(profile: any): string {
    if (!profile) return 'Не указано';
    return [profile.lastName, profile.firstName, profile.middleName].filter(Boolean).join(' ');
  }

  private async generateActNumber(type: 'KS2' | 'KS3'): Promise<string> {
    const count = await this.prisma.act.count({ where: { type: type as ActType } });
    const year = new Date().getFullYear();
    return `${type}-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const buffer = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(buffer);
    } finally {
      await browser.close();
    }
  }

  private renderKS2Template(data: any): string {
    const template = Handlebars.compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12px; margin: 20mm; }
    .header { text-align: center; margin-bottom: 20px; }
    h1 { font-size: 14px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .footer { margin-top: 30px; }
    .sign-row { display: flex; justify-content: space-between; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <p>Унифицированная форма № КС-2</p>
    <h1>АКТ О ПРИЁМКЕ ВЫПОЛНЕННЫХ РАБОТ № {{actNumber}}</h1>
    <p>от {{actDate}}</p>
  </div>
  <p><strong>Объект:</strong> {{objectName}}, {{objectAddress}}</p>
  <p><strong>Заказчик (через агрегатора):</strong> {{aggregatorName}}</p>
  <p><strong>Подрядчик:</strong> {{executorName}}</p>
  <p><strong>Период выполнения работ:</strong> с {{periodFrom}} по {{periodTo}}</p>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Наименование работ</th>
        <th>Ед. изм.</th>
        <th>По договору</th>
        <th>Фактически</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{number}}</td>
        <td>{{description}}</td>
        <td>{{unit}}</td>
        <td>{{planned}}</td>
        <td>{{actual}}</td>
      </tr>
      {{/each}}
      <tr>
        <td colspan="4"><strong>Итого:</strong></td>
        <td><strong>{{totalAmount}} руб.</strong></td>
      </tr>
    </tbody>
  </table>
  <div class="footer">
    <p>Работы сдал: _________________________ {{executorName}}</p>
    <p>Работы принял (от лица {{aggregatorName}}): _________________________ </p>
    <p>М.П.</p>
  </div>
</body>
</html>
    `);
    return template(data);
  }

  private renderKS3Template(data: any): string {
    const template = Handlebars.compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12px; margin: 20mm; }
    .header { text-align: center; margin-bottom: 20px; }
    h1 { font-size: 14px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 4px 6px; }
    th { background: #f0f0f0; }
  </style>
</head>
<body>
  <div class="header">
    <p>Унифицированная форма № КС-3</p>
    <h1>СПРАВКА О СТОИМОСТИ ВЫПОЛНЕННЫХ РАБОТ И ЗАТРАТ № {{actNumber}}</h1>
    <p>от {{actDate}}</p>
  </div>
  <p><strong>Объект:</strong> {{objectName}}</p>
  <p><strong>Заказчик:</strong> {{aggregatorName}}</p>
  <p><strong>Подрядчик:</strong> {{executorName}}</p>
  <p><strong>На основании:</strong> Акт КС-2 № {{ks2Number}}</p>
  <table>
    <thead>
      <tr><th>Стоимость работ</th><th>НДС ({{vatRate}})</th><th>Итого с НДС</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>{{amount}} руб.</td>
        <td>{{vatAmount}} руб.</td>
        <td><strong>{{totalAmount}} руб.</strong></td>
      </tr>
    </tbody>
  </table>
  <p>Заказчик: _________________________ / {{customerName}}</p>
  <p>Подрядчик: _________________________ / {{executorName}}</p>
  <p>Агрегатор: _________________________ / {{aggregatorName}} М.П.</p>
</body>
</html>
    `);
    return template(data);
  }

  private renderWorkOrderTemplate(data: any): string {
    const template = Handlebars.compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20mm; }
    h1 { font-size: 14px; text-align: center; }
    .field { margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #000; padding: 4px 6px; }
  </style>
</head>
<body>
  <h1>НАРЯД-ДОПУСК № {{number}}</h1>
  <div class="field"><strong>Вид работ:</strong> {{type}}</div>
  <div class="field"><strong>Объект:</strong> {{objectName}} — {{objectAddress}}</div>
  <div class="field"><strong>Место производства работ:</strong> {{location}}</div>
  <div class="field"><strong>Описание работ:</strong> {{workDescription}}</div>
  <div class="field"><strong>Действителен:</strong> с {{validFrom}} по {{validTo}}</div>
  <table>
    <thead><tr><th>Роль</th><th>ФИО</th><th>Дата подписи</th></tr></thead>
    <tbody>
      {{#each signatures}}
      <tr><td>{{role}}</td><td>{{name}}</td><td>{{signedAt}}</td></tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>
    `);
    return template(data);
  }
}
