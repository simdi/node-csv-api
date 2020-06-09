import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITransaction } from '../../models/transaction.schema';
import { TransactionDTO } from '../../dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<ITransaction>,
    // private readonly helperService: HelperService
  ) {}

  async create(transaction: TransactionDTO): Promise<any> {
    try {
      const newTransaction = new this.transactionModel(transaction);
      const savedTransaction = await newTransaction.save();
      return { id: savedTransaction._id };
    } catch (error) {
      // await this.helperService.catchValidationError(error);
    }
  }

  async findAll(): Promise<ITransaction[]> {
    return await this.transactionModel.find();
  }

  async findById(id: string): Promise<ITransaction> {
    try {
      const findById = await this.transactionModel.findById(id);
      if (!findById) {
        throw new HttpException('Invalid transaction id', HttpStatus.BAD_REQUEST);
      }
      return findById;
    } catch (error) {
      // await this.helperService.catchValidationError(error);
    }
  }
}
