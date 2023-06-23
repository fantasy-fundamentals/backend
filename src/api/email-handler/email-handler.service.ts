import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import * as SendGrid from '@sendgrid/mail';
import { string } from 'joi';
import {
  getVerify2faEmailTemplate,
  FnSending2FARequiredParams,
} from './templates/two-factor-authentication-code-verification-email-template';
import { MintedNftBiddingDocument } from 'src/database/entities/minted-nft-bidding';
import { getBidAcceptanceEmailTemplateString } from './templates/bid-acceptance';
import { getBidReceivedForMintedNftEmailTemplateString } from './templates/bid-received';
import { getBurnRequestReceivedEmailTemplateString } from './templates/burn-request-received';
import { getSupportNewTicketReceivedEmailTemplateString } from './templates/support-new-ticket-received';

@Injectable()
export class EmailHandlerService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.sendGridKey);
  }

  async sendEmail(mail: SendGrid.MailDataRequired) {
    try {
      const transport = await SendGrid.send(mail);
      return transport;
    } catch (err) {
      throw err;
    }
  }

  async sendGeneric(html: string, to: string, subject: string): Promise<any> {
    const fromEmail = this.configService.fromEmail;
    const msg = {
      to,
      from: `${fromEmail}`,
      subject: `${subject}`,
      html: `${html}`,
    };
    let result = await SendGrid.send(msg);
    return 'Email Sent Successfully';
  }

  async sendBurnRequestReceivedEmail() {
    const FRONTEND_URL = 'https://admin.theduh.com/burn-nfts?page=0&limit=10';
    return await this.sendGeneric(
      getBurnRequestReceivedEmailTemplateString(FRONTEND_URL),
      this.configService.fromEmail,
      'Burn request received',
    );
  }

  async sendSupportNewTicketReceivedEmail() {
    const FRONTEND_URL = 'https://admin.theduh.com/reported-bugs';
    return await this.sendGeneric(
      getSupportNewTicketReceivedEmailTemplateString(FRONTEND_URL),
      this.configService.fromEmail,
      'New ticket received',
    );
  }

  async sendBidAcceptanceEmailToUser(
    bid: MintedNftBiddingDocument,
    ownerWalletAddress: string,
  ): Promise<any> {
    const FRONTEND_URL = this.configService.frontendUrl;
    return await this.sendGeneric(
      getBidAcceptanceEmailTemplateString(
        bid,
        FRONTEND_URL,
        ownerWalletAddress,
      ),
      bid.bidderEmail,
      'Good news! Your bid has been accepted',
    );
  }

  async sendBidReceivedEmailToSeller(
    bid: MintedNftBiddingDocument,
    sellerEmail: string,
  ): Promise<any> {
    const FRONTEND_URL = this.configService.frontendUrl;
    return await this.sendGeneric(
      getBidReceivedForMintedNftEmailTemplateString(bid, FRONTEND_URL),
      sellerEmail,
      'Bid received for a minted nft',
    );
  }

  async send2FaVerificationEmail(
    params: FnSending2FARequiredParams,
  ): Promise<string> {
    const emailSentResponseMessage =
      'Two factor sent successfully to your email';
    const emailFailedResponseMessage = 'Failed to send email';

    const mailOptions: SendGrid.MailDataRequired = {
      to: params.to,
      from: this.configService.fromEmail,
      subject: 'Two factor Authentication',
      html: `${getVerify2faEmailTemplate(params.name, params.secret)}`,
    };

    await SendGrid.send(mailOptions);
    return emailSentResponseMessage;
  }
}
