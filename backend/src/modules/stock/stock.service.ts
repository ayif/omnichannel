import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { Stock } from '../../database/entities/stock.entity';
import {
  StockMovement,
  StockMovementSource,
} from '../../database/entities/stock-movement.entity';
import { NotificationSeverity, NotificationType } from '../../database/entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Stok fisik disimpan satu tempat (database pusat). Setiap perubahan stok
 * dilakukan dalam satu transaksi DB dengan row-level lock untuk mencegah
 * race condition / oversell saat ada order dari beberapa channel bersamaan.
 */
@Injectable()
export class StockService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getCurrentStock(productId: string): Promise<number> {
    const stock = await this.dataSource.manager.findOne(Stock, { where: { productId } });
    return stock?.jumlahStok ?? 0;
  }

  async applyMovement(
    productId: string,
    jumlahPerubahan: number,
    sumber: StockMovementSource,
  ): Promise<Stock> {
    const { stock, jumlahLama, product } = await this.dataSource.transaction(async (manager) => {
      let stock = await manager.findOne(Stock, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!stock) {
        stock = manager.create(Stock, { productId, jumlahStok: 0 });
      }
      const jumlahLama = stock.jumlahStok;

      const jumlahBaru = jumlahLama + jumlahPerubahan;
      if (jumlahBaru < 0) {
        throw new BadRequestException(
          `Stok tidak cukup untuk product ${productId} (tersedia: ${stock.jumlahStok}, diminta: ${-jumlahPerubahan})`,
        );
      }

      stock.jumlahStok = jumlahBaru;
      await manager.save(stock);

      const movement = manager.create(StockMovement, {
        productId,
        jumlahPerubahan,
        sumber,
      });
      await manager.save(movement);

      const product = await manager.findOne(Product, { where: { id: productId } });

      return { stock, jumlahLama, product };
    });

    if (product) {
      await this.handleStockThresholdNotification(product, jumlahLama, stock.jumlahStok);
    }

    return stock;
  }

  private async handleStockThresholdNotification(
    product: Product,
    jumlahLama: number,
    jumlahBaru: number,
  ): Promise<void> {
    const minimum = product.stokMinimum;
    const dulunyaAman = jumlahLama > minimum;
    const sekarangMenipis = jumlahBaru <= minimum;

    if (dulunyaAman && sekarangMenipis) {
      await this.notificationsService.notifyIfAbsent({
        type: NotificationType.STOCK_LOW,
        severity: jumlahBaru <= 0 ? NotificationSeverity.CRITICAL : NotificationSeverity.WARNING,
        entityType: 'product',
        entityId: product.id,
        title: `Stok menipis: ${product.namaProduk}`,
        message: `Tersisa ${jumlahBaru} unit (minimum ${minimum})`,
      });
    } else if (!dulunyaAman && !sekarangMenipis) {
      await this.notificationsService.resolve(NotificationType.STOCK_LOW, product.id);
    }
  }
}
