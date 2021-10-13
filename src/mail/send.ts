import nodemailer from 'nodemailer';

export async function sendMail(to: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'iusby27bg3on4yqv@ethereal.email', // generated ethereal user
      pass: 'J5a1wFeC4cb14e5WEG', // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: 'Change password', // Subject line
    html, // html body
  });

  console.log('Message sent: %s', info.messageId);

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
