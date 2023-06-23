export const getSupportNewTicketReceivedEmailTemplateString = (
  FRONTEND_URL,
) => {
  return `
      <div>
        <p> Received one new ticket in support. Click the link below to check the details. </p>
        <a href=${FRONTEND_URL}>Click Here</a>
      </div>
    `;
};
