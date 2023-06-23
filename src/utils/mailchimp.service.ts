import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
// const client = require('mailchimp-marketing');

@Injectable()
export class MailChimpService {
  constructor(private readonly config: ConfigService) {
    // client.setConfig({
    //   apiKey: this.config.mailChimpApiKey,
    //   server: this.config.mailChimpRegion,
    // });
  }

  async exportToMailChimp(email) {
    // try {
    //   const response = await client.lists.addListMember(
    //     this.config.mailChimpListID,
    //     {
    //       email_address: email,
    //       status: 'subscribed',
    //     },
    //   );
    // } catch (error) {
    //   throw new BadRequestException(error.response.body.detail);
    // }
  }
}
