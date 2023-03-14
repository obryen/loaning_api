import { IsNotEmpty, IsBoolean, IsString } from 'class-validator';

export class LoanReqDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;
}

export class AcceptLoanOfferReqDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
  @IsNotEmpty()
  @IsString()
  readonly loanProductId: string;
  @IsNotEmpty()
  @IsBoolean()
  readonly accept: boolean;

}
export class ActiveLoanReqDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;
}

export class ActiveLoanResDto {
  readonly id: string;
  readonly activeLoan: boolean;
  readonly amountRemaining: number;
  readonly dueDate: Date;
  readonly userName: string;
}

export class PayLoanReqDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;
  @IsNotEmpty()
  readonly amount: number;
}
export class LoanResDto {
  readonly userId: string;
}
export class PayLoanResDto {
  readonly success: boolean;
  readonly remainingAmount: number
}

export class AcceptLoanOfferResDto {
  readonly walletBalance: string;
  readonly success: boolean;
}
