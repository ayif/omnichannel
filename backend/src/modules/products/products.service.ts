import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';

export interface ProductDto {
  id: string;
  sku: string;
  namaProduk: string;
  kategori: string;
  hargaDasar: number;
  jumlahStok: number;
  stokMinimum: number;
  gambarUrl: string | null;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<ProductDto[]> {
    const products = await this.productRepo.find({
      relations: { stock: true },
      order: { namaProduk: 'ASC' },
    });

    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      namaProduk: p.namaProduk,
      kategori: p.kategori,
      hargaDasar: Number(p.hargaDasar),
      jumlahStok: p.stock?.jumlahStok ?? 0,
      stokMinimum: p.stokMinimum,
      gambarUrl: p.gambarUrl,
    }));
  }
}
