import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { pickBy, path } from 'ramda';
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

  async findAll(query: { page: string, limit: string }): Promise<ITransaction[]> {
    return await this.transactionModel.paginate({}, {
      page: parseInt(query.page),
      limit: parseInt(query.limit),
      sort: { 'meta.created': 'desc', 'meta.updated': 'desc' }
    });
  }

  async downloadAsCSV(query: { page: string, limit: string, from: string, to: string }): Promise<any> {
    try {
      const data = await this.transactionModel.paginate(
        {
          ...pickBy(val => val !== undefined, { 'meta.created': path(['from'], query) && {
              $gte: path(['from'], query),
              $lte: path(['to'], query)
            },
          }),
        },
        {
          page: parseInt(query.page),
          limit: parseInt(query.limit),
          sort: { 'meta.created': 'desc', 'meta.updated': 'desc' }
        }
      );
      const trimmed = await this.transform(data.docs);
      if (trimmed.length === 0) {
        throw new HttpException('No record found', HttpStatus.NOT_FOUND);
      }
  
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
    } catch (error) {
      await this.helperService.catchValidationError(error);
    }
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
