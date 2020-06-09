import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExportToCsv } from 'export-to-csv';
import { ITransaction } from '../../models/transaction.schema';
import { TransactionDTO } from '../../dto/transaction.dto';
import { HelperService } from '../../shared/helpers/helper';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<ITransaction>,
    private readonly helperService: HelperService
  ) {}

  async create(transaction: TransactionDTO): Promise<any> {
    try {
      const newTransaction = new this.transactionModel(transaction);
      const savedTransaction = await newTransaction.save();
      return { id: savedTransaction._id };
    } catch (error) {
      await this.helperService.catchValidationError(error);
    }
  }

  async findAll(): Promise<ITransaction[]> {
    return await this.transactionModel.find();
  }

  async downloadAsCSV(): Promise<any> {
    const data = await this.transactionModel.find();
    const trimmed = await this.transform(data);

    const options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'transactions',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
   
    const csvExporter = new ExportToCsv(options);
    return csvExporter.generateCsv(trimmed, true);
  }

  async findById(id: string): Promise<ITransaction> {
    try {
      const findById = await this.transactionModel.findById(id);
      if (!findById) {
        throw new HttpException('Invalid transaction id', HttpStatus.BAD_REQUEST);
      }
      return findById;
    } catch (error) {
      await this.helperService.catchValidationError(error);
    }
  }

  async transform(data: ITransaction[]): Promise<any> {
    return data.map(transaction => {
      return {
        name: transaction.name,
        owner: transaction.owner,
        uuid: transaction.uuid,
        created: transaction.meta.created,
        updated: transaction.meta.updated,
        price: transaction.price
      };
    });
  }
}
