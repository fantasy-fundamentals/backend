import { BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { FILE_TYPE } from 'src/utils/misc/enum';
import { v4 as uuidv4 } from 'uuid';
export class S3StorageService {
  constructor(
    @Inject('S3') private readonly S3: S3,
    private readonly configService: ConfigService,
  ) {}

  async uploadPublicFile(type: string, user: any, file: any) {
    try {
      if (!file) {
        throw new BadRequestException('File not attached');
      }

      let path = '';

      switch (type) {
        case FILE_TYPE.COIN_IMAGE:
          let coinKey = uuidv4();
          path = `coins/${FILE_TYPE.COIN_IMAGE}/${coinKey}`;
          break;
        case FILE_TYPE.SITE_LOGO:
          let siteKey = uuidv4();
          path = `site-logo/${FILE_TYPE.SITE_LOGO}/${siteKey}`;
          break;
        case FILE_TYPE.BANNER_IMAGE:
          let bannerKey = uuidv4();
          path = `Banners/${FILE_TYPE.BANNER_IMAGE}/${bannerKey}`;
          break;
        case FILE_TYPE.PRESS_RELEASE:
          let pressKey = uuidv4();
          path = `native-token/${FILE_TYPE.PRESS_RELEASE}/${pressKey}`;
          break;
        case FILE_TYPE.TOKEN_FONTS:
          let key1 = uuidv4();
          path = `token-fonts/${FILE_TYPE.TOKEN_FONTS}/${key1}`;
          break;
        case FILE_TYPE.PROFILE_PICTURE:
          path = `users/${user._id}/${FILE_TYPE.PROFILE_PICTURE}`;
          break;
        case FILE_TYPE.CHATS:
          let key2 = uuidv4();
          path = `users/${user._id}/${FILE_TYPE.CHATS}/${key2}`;
          break;

        case FILE_TYPE.NFT_TOKENS:
          let key3 = uuidv4();
          path = `nftTokens/${FILE_TYPE.NFT_TOKENS}/${key3}`;
          break;
        case FILE_TYPE.DIRECT_WIRE:
          let key4 = uuidv4();
          path = `users/${user._id}/${FILE_TYPE.DIRECT_WIRE}/${key4}`;
          break;

        case FILE_TYPE.MARKETPLACE:
          let key5 = uuidv4();
          path = `marketplace/${FILE_TYPE.MARKETPLACE}/${key5}`;
          break;

        case FILE_TYPE.NEWS:
          let key6 = uuidv4();
          path = `${FILE_TYPE.NEWS}/${key6}`;
          break;

        case FILE_TYPE.NFT:
          let key7 = uuidv4();
          path = `nft/${FILE_TYPE.NFT}/${key7}`;
          break;

        default:
          break;
      }

      const uploadResult = await this.S3.upload({
        Bucket: this.configService.get('BUCKET_NAME'),
        Body: file.buffer,
        Key: path,
        ContentType: file.mimetype,
      }).promise();

      return {
        url:
          'https://d2pm667mw7y58b.cloudfront.net/' +
          uploadResult.Location.split('com/')[1],
        key: uploadResult.Key,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async uplaodNftVideo(file: any, name) {
    try {
      if (!file) {
        throw new BadRequestException('File not attached');
      }

      const uploadResult = await this.S3.upload({
        Bucket: this.configService.get('BUCKET_NAME'),
        Key: String(`nft_videos/${name}.mp4`),
        Body: file,
        ContentType: 'video/mp4',
        ContentDisposition: 'inline',
      }).promise();

      return {
        url:
          'https://d2pm667mw7y58b.cloudfront.net/' +
          uploadResult.Location.split('com/')[1],
        key: uploadResult.Key,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
