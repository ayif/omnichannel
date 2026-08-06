import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Stock } from '../../database/entities/stock.entity';
import {
  StockMovement,
  StockMovementSource,
} from '../../database/entities/stock-movement.entity';

/**
 * Stok fisik disimpan satu tempat (database pusat). Setiap perubahan stok
 * dilakukan dalam satu transaksi DB dengan row-level lock untuk mencegah
 * race condition / oversell saat ada order dari beberapa channel bersamaan.
 */
@Injectable()
export class StockService {
  constructor(private readonly dataSource: DataSource) {}

  async getCurrentStock(productId: string): Promise<number> {
    const stock = await this.dataSource.manager.findOne(Stock, { where: { productId } });
    return stock?.jumlahStok ?? 0;
  }

  async applyMovement(
    productId: string,
    jumlahPerubahan: number,
    sumber: StockMovementSource,
  ): Promise<Stock> {
    return this.dataSource.transaction(async (manager) => {
      let stock = await manager.findOne(Stock, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!stock) {
        stock = manager.create(Stock, { productId, jumlahStok: 0 });
      }

      const jumlahBaru = stock.jumlahStok + jumlahPerubahan;
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

      return stock;
    });
  }
}
