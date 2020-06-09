import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionController } from './controllers/transaction/transaction.controller';
import { TransactionService } from './services/transaction/transaction.service';
import { TransactionSchema } from './models/transaction.schema';

const { MONGO_HOST, MONGO_DB, MONGO_PORT } = process.env;
const url = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;

@Module({
  imports: [
    MongooseModule.forRoot(url, { useNewUrlParser: true }),
    MongooseModule.forFeature([{ 'name': 'Transaction', schema: TransactionSchema }]),
  ],
  controllers: [AppController, TransactionController],
  providers: [AppService, TransactionService],
})
export class AppModule {}
