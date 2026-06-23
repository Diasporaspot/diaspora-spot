import LegalPage from '../LegalPage';

export const metadata = {
  title: 'Privacy Policy | DiasporaSpot',
  description: 'Privacy policy for DiasporaSpot website visitors.',
};

const sections = [
  {
    title: '1. About us',
    clauses: [
      {
        number: '1.1',
        content: (
          <>
        DiasporaSpot is a trading name for Otoworks Ltd, which is the owner of DiasporaSpot
        registered in England and Wales as 16098332. To contact us, send an email towards:{' '}
        <a href="mailto:contact@otoworks.co.uk">contact@otoworks.co.uk</a>.
          </>
        ),
      },
    ],
  },
  {
    title: '2. Cookies',
    clauses: [
      {
        number: '2.1',
        content:
          'Our website makes use of cookies and you have the right to choose which cookies you may consent towards. You may select which type of cookies you may give consent to including: Necessary, Functional, Analytical and Advertising cookies.',
      },
      {
        number: '2.2',
        content:
          'Our service providers use cookies and those cookies may be stored on your computer when you visit our website.',
      },
      {
        number: '2.3',
        content:
          'We make use of Google Analytics to analyse our website usage. Google Analytics may gather information about our website through cookies.',
      },
      {
        number: '2.4',
        content:
          'We may make use of Google Ad Sense to publish advertisements on our website. Google Adsense makes use of cookies to determine what sort of adverts tailors to you as the user.',
      },
    ],
  },
  {
    title: '3. How we use your personal data',
    clauses: [
      {
        number: '3.1',
        content:
          'We collect your information as soon as you visit our website. We may collect such data via cookies, via forms and via tracking software.',
      },
      {
        number: '3.2',
        content:
          'We use your information to monitor and understanding our audience and usage of our website. This information will also be used for improvement and maintenance of the site.',
      },
      {
        number: '3.3',
        content:
          'When you register for a workshop, we use your name and email address to manage your registration and send confirmation, reminders and other communications about that workshop.',
      },
    ],
  },
  {
    title: '4. Sharing your personal data to third parties',
    clauses: [
      { number: '4.1', content: 'DiasporaSpot does not sell your personal information.' },
      {
        number: '4.2',
        content:
          'We may share your personal data to third party services for analytics as mentioned in section 2.3.',
      },
      {
        number: '4.3',
        content: 'We may share your personal data under official request by law.',
      },
      {
        number: '4.4',
        content:
          'We may share your personal data under the condition of a business transfer. A business transfer is acquisition of a busines by another business. This means the transfer of products, assets as well as data.',
      },
      {
        number: '4.5',
        content:
          'Our website may make use of third party payment processing services. Any payment details will be processed via the third party payment processing services and as such under their privacy policy.',
      },
      {
        number: '4.6',
        content:
          'We use MailerLite to store workshop registration details and deliver workshop emails. MailerLite processes your name and email address on our behalf for these purposes.',
      },
    ],
  },
  {
    title: '5. Retaining your personal data',
    clauses: [
      {
        number: '5.1',
        content: 'We retain usage data for a certain period of time on the basis of your last visit.',
      },
      {
        number: '5.2',
        content:
          'We shall not retain your personal data a certain period of time longer than necessary, unless retention is necessary for compliance with an obligation that is deemed legal.',
      },
    ],
  },
  {
    title: '6. Your rights',
    clauses: [
      {
        number: '6.1',
        content: (
          <>
            You have the right to the following: Right to access, Right to rectification, Right to
            erasure, Right to data portability, Right to object to processing, Right to restrict
            processing and Right to withdraw consent. To follow this process contact us via email:{' '}
            <a href="mailto:contact@otoworks.co.uk">contact@otoworks.co.uk</a>. A proof of your ID
            will be needed to confirm your identity.
          </>
        ),
      },
    ],
  },
  {
    title: '7. Amendments',
    clauses: [
      {
        number: '7.1',
        content: 'Our privacy policy may undergo updates in the future and this will be reflected here.',
      },
      {
        number: '7.2',
        content:
          'If you continue to use our website after such changes, that entails your acceptance of our privacy policy.',
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      activePath="/privacy-policy"
      eyebrow="Privacy Policy"
      intro="This privacy policy is applicable where we act as a data controller for the personal data of our website visitors."
      leadParagraphs={[
        'This privacy policy is applicable where we act as a data controller for the personal data of our website visitors.',
        'Our website makes use of cookies. We will ask you to consent to the use of cookies upon your first visit to our website.',
        'Within this document, we refer to the user of the website as “you” or “your”. Within this document, we refer to the owner of the website as any of the following: “DiasporaSpot”, “our”, “we” and “Otoworks Ltd”.',
      ]}
      sections={sections}
      title="Privacy Policy"
    />
  );
}
