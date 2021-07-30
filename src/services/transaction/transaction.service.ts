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
  ) { }

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
          ...pickBy(val => val !== undefined, {
            'meta.created': path(['from'], query) && {
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

  private generateSummaryHTMl(logo: string | null, support: string | null) {
    let reconciliationTypeTR = '';
    this.reconciliation.reconciliationTypes.forEach(reconciliationType => {
      reconciliationTypeTR += `
      <tr>
        <td></td>
        <td> ${reconciliationType.displayName} </td>
      `;
      reconciliationTypeTR += `<td> ${reconciliationType.configurationTypes.reduce((count, configType) => {
        count += configType.configurations.reduce((acc, curr) => {
          if (curr.isVisible) {
            acc += 1;
          }
          return acc;
        }, 0);
        return count;
      }, 0)} </td>`;

      reconciliationTypeTR += '<td>';
      if (reconciliationType.name === ReconciliationTypeName.InTenant) {
        reconciliationTypeTR += 'These configurations exist only in your tenant.';
      }
      if (reconciliationType.name === ReconciliationTypeName.MissingFromBaseline) {
        reconciliationTypeTR += 'These configurations are baseline configurations excluded from this tenant.';
      }
      if (reconciliationType.name === ReconciliationTypeName.Conflict) {
        reconciliationTypeTR += 'These configurations exist in both your tenant and the baseline, but have different property values.';
      }
      if (reconciliationType.name === ReconciliationTypeName.MatchingBaseline) {
        reconciliationTypeTR += 'These are configurations in your tenant that match the baseline.';
      }
      reconciliationTypeTR += '</td>';
      reconciliationTypeTR += '</tr>'
    });

    return `
      <table id="summary" border="2" bgcolor="red">
        <tr>
          <td></td>
          <td colspan="9"> <img height="100px" width="100px" src="https://cdn.quasar.dev/logo-v2/svg/logo.svg"> </td>
        </tr>
        <tr>
          <td colspan="10"></td>
        </tr>
        <tr>
          <td></td>
          <td colspan="9"> Reconciliation Report Prepared for: ${this.tenant.name}</td>
        </tr>
        <tr>
          <td colspan="9"></td>
        </tr>
        <tr >
          <td></td>
          <td style="background: #D3D3D3">Configuration Type</td>
          <td style="background: #D3D3D3">Count</td>
          <td colspan="5" style="background: #D3D3D3">Definition</td>
        </tr>
        ${reconciliationTypeTR}
        <tr>
          <td colspan="9"></td>
        </tr>
        <tr>
          <td></td>
          <td colspan="2" style="background: #D3D3D3">Security Configurations</td>
        </tr>
        <tr>
          <td></td>
          <td>Data Loss Prevention</td>
          <td>DLP</td>
        </tr>
        <tr>
          <td></td>
          <td>Security Auditing</td>
          <td>SA</td>
        </tr>
        <tr>
          <td></td>
          <td>Authentication</td>
          <td>AU</td>
        </tr>
        <tr>
          <td></td>
          <td>Device Security</td>
          <td>DS</td>
        </tr>
        <tr>
          <td></td>
          <td>Data Retention</td>
          <td>DR</td>
        </tr>
        <tr>
          <td></td>
          <td>User Privileges</td>
          <td>UP</td>
        </tr>
        <tr>
          <td colspan="9"></td>
        </tr>
        <tr>
          <td></td>
          <td colspan="9">${support}</td>
        </tr>
        <tr>
          <td colspan="9"></td>
        </tr>
      </table>
    `;
  }

  private generateReconciliationTypeHTMl(reconciliationType: ReconciliationType, logo: string | null) {
    let table = `
    <table id="summary">
      <tr>
        <td></td>
        <td colspan="9"> <img height="100px" width="100px" src="https://cdn.quasar.dev/logo-v2/svg/logo.svg"> </td>
      </tr>
      <tr>
        <td colspan="10"></td>
      </tr>
      <tr>
        <td></td>
        <td colspan="9" style="background: #D3D3D3">${reconciliationType.displayName}</td>
      </tr>`;

    if (reconciliationType.name === ReconciliationTypeName.InTenant) {
      reconciliationType.configurationTypes.forEach((configurationType: ConfigurationType) => {
        table += `
            <tr>
              <td></td>
              <td>${configurationType.name}</td>
            </tr>
          `;
        configurationType.configurations.forEach((configuration: Configuration) => {
          table += `
              <tr>
                <td></td>
                <td>${configuration.name}</td>
              </tr>
            `;
        });
        table += `
            <tr>
              <td colspan="10"></td>
            </tr>
          `;
      });
    } else {
      reconciliationType.configurationTypes.forEach((configurationType: ConfigurationType) => {
        table += `
            <tr>
              <td></td>
              <td></td>
        `;

        if (reconciliationType.name == ReconciliationTypeName.Conflict) {
          table += `
              <td>Baseline</td>
              <td>Tenant</td>
          `;
        }

        table += `
            <td>What it Does</td>
            <td>Why Use it</td>
            <td>User Impact</td>
            <td>Learn More</td>
            <td colspan="2">Security</td>
          </tr>
          <tr>
            <td></td>
            <td>${configurationType.name}</td>
          </tr>
        `;

        configurationType.configurations.forEach((configuration: Configuration) => {
          console.log({ configuration: configuration.description });
          const splitDescription = configuration.description ? configuration.description.split('\n') : [];
          const whatItDoesIndex = splitDescription.indexOf('**What does this do?**');
          const whyUseItIndex = splitDescription.indexOf('**Why should you use this?**');
          const userImpactIndex = splitDescription.indexOf('**What is the end-user impact?**');
          const learnMoreIndex = splitDescription.indexOf('**Learn more**');

          table += `
            <tr>
              <td></td>
              <td>${configuration.name}</td>
          `;

          if (reconciliationType.name == ReconciliationTypeName.Conflict) {
            table += `
                <td>${configuration.baselineContent ? 'TRUE' : 'FALSE'}</td>
                <td>${configuration.description ? 'TRUE' : 'FALSE'} </td>
            `;
          }
          table += `
              <td>${whatItDoesIndex > -1 ? splitDescription[whatItDoesIndex + 1] : ''}</td>
              <td>${whyUseItIndex > -1 ? splitDescription[whyUseItIndex + 1] : ''}</td>
              <td>${userImpactIndex > -1 ? splitDescription[userImpactIndex + 1] : ''}</td>
              <td>${learnMoreIndex > -1 ? splitDescription[learnMoreIndex + 1] : ''}</td>
              <td>${configuration.hide}</td>
            </tr>
          `;
        });
        table += `
          <tr>
            <td colspan="10"></td>
          </tr>
        `;
      });
    }

    table += `
        <tr>
          <td colspan="10"></td>
        </tr>
      </table>
    `;

    return table;
  }

  exportReconcileReport() {
    // const summary = this.generateSummaryHTMl(param.logo, param.support);
    // console.log({ summary });
    // const summaryTable = new DOMParser().parseFromString(summary, 'text/html');
    // console.log({ summaryTable });

    // const ws = XLSX.utils.table_to_sheet(summaryTable);
    // XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    // this.reconciliation.reconciliationTypes.forEach((reconciliationType: ReconciliationType) => {
    //   const reconciliationTypeWb = new DOMParser().parseFromString(this.generateReconciliationTypeHTMl(reconciliationType, param.logo), 'text/html');
    //   const ws2 = XLSX.utils.table_to_sheet(reconciliationTypeWb);
    //   XLSX.utils.book_append_sheet(wb, ws2, reconciliationType.name);
    // });
    // console.log({ wb });

    // // const fiinalWb = XLSX.read(wb, { type: 'string',  });
    // const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
  }

  async downloadAsXlSX(query: { page: string, limit: string, from: string, to: string }): Promise<any> {
    try {
      const data = await this.transactionModel.paginate(
        {
          ...pickBy(val => val !== undefined, {
            'meta.created': path(['from'], query) && {
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
