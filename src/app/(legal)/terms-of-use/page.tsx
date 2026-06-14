import LegalPage from '../LegalPage';

export const metadata = {
  title: 'Terms of Use | DiasporaSpot',
  description: 'Terms and conditions governing the use of DiasporaSpot.',
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
    title: 'Acceptable use',
    paragraphs: [
      'You can use this website in accordance with these terms of use.',
      'You should ensure your computer or mobile device has the necessary specifications needed to access and use our website.',
      'You must not misuse our website. You must not disrupt or attempt to circumvent our system in any way. If there are any forms in the website, you should use them to submit a genuine enquiry.',
    ],
  },
  {
    title: 'License and intellectual property',
    paragraphs: [
      'Otoworks Ltd owns the intellectual property rights in this website and material on the website, except for any images subject to copyright law.',
      'Our website can be used for private purpose and in accordance to these terms of use:',
    ],
    items: ['Read material.', 'Print material.', 'Download material.'],
  },
  {
    title: 'Our website shall not be used to',
    items: [
      'Republish the material.',
      'Sell, rent or sub-license any material.',
      'Reproduce, duplicate or copy for commercial purpose.',
      'Redistribute material from this website, except for content specifically made available for distribution.',
    ],
  },
  {
    title: 'Site uptime',
    paragraphs: [
      'DiasporaSpot ensures the website is operational all day. Diaspora Spot is not liable in any way for any occasional technical issues that may result in some down time.',
      'DiasporaSpot will always try to give a warning in advance of maintenance issues, however there is no obligation on our part to provide this sort of notice.',
    ],
  },
  {
    title: 'Third party links',
    paragraphs: [
      'Our website may contain links to third party websites. Any third party links on our website does not condone the endorsement of such sites.',
      'Any party willing to link our website is allowed to do so under these conditions:',
    ],
    items: [
      'You do not misrepresent your relationship with the website.',
      'You are not trying to implicate our endorsement to any products or services of third parties without prior written agreement.',
      'You do not link our website to another website that contains offensive, xenophbic, controversial content or any content that infringes any intellectual rights or rights of a third party.',
      'You shall indemnify us for any loss or damage suffered on this website as a result for breaching any of those terms as a result of linking our website.',
    ],
  },
  {
    title: 'Disclaimer and warranties',
    paragraphs: [
      'DiasporaSpot takes the necessary steps to ensure accuracy and certainty in the information in this website. However there is no guarantee that all material is and will be up to date.',
      'DiasporaSpot declares that all material provided on our website is without any warranty of any kind. You shall use the material on our website at your own discretion.',
    ],
  },
  {
    title: 'Limitations of liability',
    paragraphs: [
      'DiasporaSpot does not accept liability for any loss or damage that you suffer as a result of using our website.',
      'If you continue to use our website after such changes, that entails your acceptance of our privacy policy.',
      'DiasporaSpot is not liable in any means for any decisions taken on the basis of the material in our website.',
    ],
  },
  {
    title: 'Law and jurisdiction',
    paragraphs: [
      'Our terms and conditions are governed by the laws of England and Wales and any disputes will be subject exclusively under the courts of England and Wales.',
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <LegalPage
      activePath="/terms-of-use"
      eyebrow="Terms of Use"
      intro="These terms govern the use of our website and any subdomain registered under our company."
      sections={sections}
      title="Terms of Use"
    />
  );
}
