import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AcceptLoanOfferReqDto, AcceptLoanOfferResDto, LoanReqDto, PayLoanReqDto } from './dto/loan.dto';
import { LoanService } from './loan.service';
import { LoanProduct } from './models/loan-products.entity';
import { UserLoan } from './models/users-loans.entity';

@Controller('loans')
@ApiTags('')
export class LoanController {
  constructor(private readonly loanService: LoanService) { }

  @Get(':id/request_loan_products')
  @ApiOperation({ summary: 'Request loan' })
  @ApiResponse({ status: 201, description: 'Successfully action' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Param('id') userId: string): Promise<LoanProduct[]> {
    return await this.loanService.fetchLoanProducts(userId);
  }

  @Get(':id/user')
  async getActiveLoanDetails(@Param('id') userId: string): Promise<UserLoan> {
    return await this.loanService.checkIfUserHasExistingLoan(userId);
  }


  @Post('accept_loan_offer')
  @ApiOperation({ summary: 'accept of refuse loan offer' })
  @ApiResponse({ status: 201, description: 'Successfully action' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async login(@Body() acceptOfferReqeust: AcceptLoanOfferReqDto): Promise<AcceptLoanOfferResDto> {
    return await this.loanService.acceptOrDeclineLoanOffer(acceptOfferReqeust);
  }

  @Patch('pay_loan')
  @ApiOperation({ summary: 'pay for existing loan' })
  @ApiResponse({ status: 201, description: 'Payment successfull' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async passwordReset(@Body() payloanRequest: PayLoanReqDto) {
    return await this.loanService.payLoan(payloanRequest);
  }

}
