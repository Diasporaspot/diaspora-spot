import LegalPage from '../LegalPage';

export const metadata = {
  title: 'Terms of Use | DiasporaSpot',
  description: 'Terms and conditions governing the use of DiasporaSpot.',
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
    title: '2. Acceptable use',
    clauses: [
      {
        number: '2.1',
        content: 'You can use this website in accordance with these terms of use.',
      },
      {
        number: '2.2',
        content:
          'You should ensure your computer or mobile device has the necessary specifications needed to access and use our website.',
      },
      {
        number: '2.3',
        content:
          'You must not misuse our website. You must not disrupt or attempt to circumvent our system in any way. If there are any forms in the website, you should use them to submit a genuine enquiry.',
      },
    ],
  },
  {
    title: '3. License and intellectual property',
    clauses: [
      {
        number: '3.1',
        content:
          'Otoworks Ltd owns the intellectual property rights in this website and material on the website, except for any images subject to copyright law.',
      },
      {
        number: '3.2',
        content: 'Our website can be used for private purpose and in accordance to these terms of use:',
        items: [
          { content: 'Read material.' },
          { content: 'Print material.' },
          { content: 'Download material.' },
        ],
      },
      {
        number: '3.3',
        content: 'Our website shall not be used to:',
        items: [
          { content: 'Republish the material.' },
          { content: 'Sell, rent or sub-license any material.' },
          { content: 'Reproduce, duplicate or copy for commercial purpose.' },
          {
            content:
              'Redistribute material from this website, except for content specifically made available for distribution.',
          },
        ],
      },
    ],
  },
  {
    title: '4. Site uptime',
    clauses: [
      {
        number: '4.1',
        content:
          'DiasporaSpot ensures the website is operational all day. Diaspora Spot is not liable in any way for any occasional technical issues that may result in some down time.',
      },
      {
        number: '4.2',
        content:
          'DiasporaSpot will always try to give a warning in advance of maintenance issues, however there is no obligation on our part to provide this sort of notice.',
      },
    ],
  },
  {
    title: '5. Third party links',
    clauses: [
      {
        number: '5.1',
        content:
          'Our website may contain links to third party websites. Any third party links on our website does not condone the endorsement of such sites.',
      },
      {
        number: '5.2',
        content: 'Any party willing to link our website is allowed to do so under these conditions:',
        items: [
          {
            number: '5.2.2',
            content: 'You do not misrepresent your relationship with the website.',
          },
          {
            number: '5.2.3',
            content:
              'You are not trying to implicate our endorsement to any products or services of third parties without prior written agreement.',
          },
          {
            number: '5.2.4',
            content:
              'You do not link our website to another website that contains offensive, xenophbic, controversial content or any content that infringes any intellectual rights or rights of a third party.',
          },
          {
            number: '5.2.5',
            content:
              'You shall indemnify us for any loss or damage suffered on this website as a result for breaching any of those terms as a result of linking our website.',
          },
        ],
      },
    ],
  },
  {
    title: '6. Disclaimer and warranties',
    clauses: [
      {
        number: '6.1',
        content:
          'DiasporaSpot takes the necessary steps to ensure accuracy and certainty in the information in this website. However there is no guarantee that all material is and will be up to date.',
      },
      {
        number: '6.2',
        content:
          'DiasporaSpot declares that all material provided on our website is without any warranty of any kind. You shall use the material on our website at your own discretion.',
      },
    ],
  },
  {
    title: '7. Limitations of liability',
    clauses: [
      {
        number: '7.1',
        content:
          'DiasporaSpot does not accept liability for any loss or damage that you suffer as a result of using our website.',
      },
      {
        number: '7.2',
        content:
          'If you continue to use our website after such changes, that entails your acceptance of our privacy policy.',
      },
      {
        number: '7.3',
        content:
          'DiasporaSpot is not liable in any means for any decisions taken on the basis of the material in our website.',
      },
    ],
  },
  {
    title: '8. Law and jurisdiction',
    clauses: [
      {
        number: '8.1',
        content:
          'Our terms and conditions are governed by the laws of England and Wales and any disputes will be subject exclusively under the courts of England and Wales.',
      },
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <LegalPage
      activePath="/terms-of-use"
      eyebrow="Terms of Use"
      intro="These terms govern the use of our website and any subdomain registered under our company."
      leadParagraphs={[
        'These are the following terms that govern the use of our website and any subdomain registered under our company. If you do not accept these terms, please do not use this website. Your continued use of this website means you do accept these terms.',
        'Within this document, we refer to the user of the website as “you”. Within this document, we refer to the owner of the website as any of the following: “DiasporaSpot”, “our”, “we” and “Otoworks Ltd”.',
      ]}
      sections={sections}
      title="Terms of Use"
    />
  );
}
