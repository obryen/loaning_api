import { Injectable, } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(
  ) { }

  async sendDeclineNotification(): Promise<boolean> {
    console.log(`Sorry to see you decline, you are welcome to apply at any time!`);
    return true;
  }
  async sendFailedToQualifyNotification(): Promise<boolean> {
    console.log(`Sorry but you do not qualify at this time`);
    return true;
  }
  async sendLoanDisbursementNotification(userName: string): Promise<boolean> {
    console.log(`Loan has been successfully disbursed to your wallet ${userName}`);
    return true;
  }
  async sendLoanPaymentNotification(userName: string, remainingAmount: number): Promise<boolean> {
    if (remainingAmount <= 0) {
      console.log(`Thank you, Loan has been fully paid.`);
    } else {
      console.log(`Thank you ${userName}, loan has been partially paid, please pay the remaining ${remainingAmount} soon.`);
    }

    return true;
  }

}
