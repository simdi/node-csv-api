import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { Controller, HttpCode, Post, Body, Param, Get, HttpStatus, Header, Query } from '@nestjs/common';
import { TransactionService } from '../../services/transaction/transaction.service';
import { ITransaction } from '../../models/transaction.schema';
import { TransactionDTO } from '../../dto/transaction.dto';
import { CreatedDTO } from '../../dto/responses/created.dto';
import { ErrorDTO } from '../../dto/responses/error.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Transactions' })
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found records',
    type: [TransactionDTO],
  })
  async findAll(@Query() query): Promise<ITransaction[]> {
    return await this.transactionService.findAll(query);
  }

  @Get('download/csv')
  @ApiOperation({ summary: 'Download Transactions as csv' })
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  @ApiQuery({ name: 'from', required: true, example: "2020-01-01T13:56:31.664Z"  })
  @ApiQuery({ name: 'to', required: true, example: new Date().toISOString() })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found records',
  })
  @Header('Content-Type', 'application/csv')
  @Header('Content-Disposition', 'attachment; filename=transactions.csv')
  async downloadAsCSV(@Query() query): Promise<ITransaction[]> {
    return await this.transactionService.downloadAsCSV(query);
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

