import { MintedNftBiddingDocument } from 'src/database/entities/minted-nft-bidding';

export const getBidAcceptanceEmailTemplateString = (
  bid: MintedNftBiddingDocument,
  FRONTEND_URL,
  ownerWalletAddress,
) => {
  const redirectUrl = `${FRONTEND_URL}/nft-detail?nftId=${bid.mintedNftId}&bid-accepted=true&bidId=${bid._id}&ownerWalletAddress=${ownerWalletAddress}&name=${bid.bidderName}&price=${bid.biddingPrice}&email=${bid.bidderEmail}`;

  return `
    <div>
      <p> Click the link below to proceed </p>
      <a href=${redirectUrl}>Click Here</a>
    </div>
  `;
};
