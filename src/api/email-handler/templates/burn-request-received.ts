export const getBurnRequestReceivedEmailTemplateString = (FRONTEND_URL) => {
  return `
    <div>
      <p> Received one new burn request. Click the link below to check the details. </p>
      <a href=${FRONTEND_URL}>Click Here</a>
    </div>
  `;
};
