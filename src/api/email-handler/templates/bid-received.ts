import { MintedNftBiddingDocument } from 'src/database/entities/minted-nft-bidding';

export const getBidReceivedForMintedNftEmailTemplateString = (
  bid: MintedNftBiddingDocument,
  FRONTEND_URL,
) => {
  const redirectUrl = `${FRONTEND_URL}/nft-detail?nftId=${bid.mintedNftId}`;

  return `
    <div>
      <p> You have received a new bid for one of the NFTs you minted. Click the link below to check the details. </p>
      <a href=${redirectUrl}>Click Here</a>
    </div>
  `;
};
