import LegalPage from '../LegalPage';

export const metadata = {
  title: 'Privacy Policy | DiasporaSpot',
  description: 'Privacy policy for DiasporaSpot website visitors.',
};

const sections = [
  {
    title: 'About us',
    paragraphs: [
      <>
        DiasporaSpot is a trading name for Otoworks Ltd, which is the owner of DiasporaSpot
        registered in England and Wales as 16098332. To contact us, send an email towards:{' '}
        <a href="mailto:contact@otoworks.co.uk">contact@otoworks.co.uk</a>.
      </>,
    ],
  },
  {
    title: 'Cookies',
    paragraphs: [
      'Our website makes use of cookies and you have the right to choose which cookies you may consent towards. You may select which type of cookies you may give consent to including: Necessary, Functional and Analytical cookies.',
      'Our service providers use cookies and those cookies may be stored on your computer when you visit our website.',
      'We make use of Google Analytics to analyse our website usage. Google Analytics may gather information about our website through cookies.',
      'We may make use of Google Ad Sense to publish advertisements on our website. Google Adsense makes use of cookies to determine what sort of adverts tailors to you as the user.',
    ],
  },
  {
    title: 'How we use your personal data',
    paragraphs: [
      'We collect your information as soon as you visit our website. We may collect such data via cookies, via forms and via tracking software.',
      'We use your information to monitor and understanding our audience and usage of our website. This information will also be used for improvement and maintenance of the site.',
    ],
  },
  {
    title: 'Sharing your personal data to third parties',
    paragraphs: [
      'DiasporaSpot does not sell your personal information.',
      'We may share your personal data to third party services for analytics as mentioned in section 2.3.',
      'We may share your personal data under official request by law.',
      'We may share your personal data under the condition of a business transfer. A business transfer is acquisition of a busines by another business. This means the transfer of products, assets as well as data.',
      'Our website may make use of third party payment processing services. Any payment details will be processed via the third party payment processing services and as such under their privacy policy.',
    ],
  },
  {
    title: 'Retaining your personal data',
    paragraphs: [
      'We retain usage data for a certain period of time on the basis of your last visit.',
      'We shall not retain your personal data a certain period of time longer than necessary, unless retention is necessary for compliance with an obligation that is deemed legal.',
    ],
  },
  {
    title: 'Your rights',
    paragraphs: [
      'You have the right to the following: Right to access, Right to rectification, Right to erasure, Right to data portability, Right to object to processing, Right to restrict processing and Right to withdraw consent. To follow this process contact us via email: contact@otoworks.co.uk. A proof of your ID will be needed to confirm your identity.',
    ],
  },
  {
    title: 'Amendments',
    paragraphs: [
      'Our privacy policy may undergo updates in the future and this will be reflected here.',
      'If you continue to use our website after such changes, that entails your acceptance of our privacy policy.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      activePath="/privacy-policy"
      eyebrow="Privacy Policy"
      intro="This privacy policy is applicable where we act as a data controller for the personal data of our website visitors."
      sections={sections}
      title="Privacy Policy"
    />
  );
}
