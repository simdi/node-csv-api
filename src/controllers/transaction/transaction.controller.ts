import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, HttpCode, Post, Body, Request, Param, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { TransactionService } from '../../services/transaction/transaction.service';
import { ITransaction } from '../../models/transaction.schema';
import { TransactionDTO } from '../../dto/transaction.dto';
import { CreatedDTO } from '../../dto/responses/created.dto';
import { ErrorDTO } from '../../dto/responses/error.dto';

@ApiBearerAuth('access_token')
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Transactions' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found records',
    type: [TransactionDTO],
  })
  async findAll(): Promise<ITransaction[]> {
    return await this.transactionService.findAll();
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get a single Transaction' })
  @ApiParam({ name: 'transactionId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found record',
    type: TransactionDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
    type: ErrorDTO
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction Not Found',
    type: ErrorDTO
  })
  async findById(@Param('transactionId') id): Promise<ITransaction> {
    return await this.transactionService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction created successfully',
    type: CreatedDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
    type: ErrorDTO
  })
  async create(@Body() transaction: TransactionDTO): Promise<ITransaction> {
    return await this.transactionService.create(transaction);
  }
}

