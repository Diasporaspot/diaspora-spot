import type { Article, Event, Guide, Workshop } from './types';

export const articles: Article[] = [
  {
    _id: 'article-find-job-uk-foreigner',
    _type: 'article',
    status: 'published',
    title: 'How to Find a Job in the UK as a Foreigner',
    slug: 'how-to-find-a-job-in-the-uk-as-a-foreigner',
    excerpt:
      'Learn how to find a job, apply from abroad, work on a student visa, and get a UK work visa with sponsorship.',
    category: 'Career',
    coverImage: {
      alt: 'Professional preparing job application notes on a laptop',
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80&auto=format&fit=crop',
    },
    author: 'DiasporaSpot Career Desk',
    publishedAt: '2026-06-03',
    readTime: '11 min read',
    featured: true,
    seo: {
      title: 'How to Find a Job in the UK as a Foreigner | DiasporaSpot',
      description:
        'Looking for work in the UK as a foreigner? Learn how to find a job, apply from abroad, work on a student visa, and get a UK work visa with sponsorship.',
    },
    internalNotes: [
      'Primary keyword: finding a job in the UK as a foreigner.',
      'Secondary keywords: UK jobs for foreigners, UK visa sponsorship, working in UK on student visa, how to apply for a job in UK from Nigeria, UK Skilled Worker visa.',
      'Internal links should point to CV review, interview preparation, and portfolio guidance once those service pages are live.',
      'External links should point to official GOV.UK Skilled Worker visa, licensed sponsor register, and student visa work conditions pages.',
    ],
    body: [
      {
        _type: 'paragraph',
        text:
          'Every year, thousands of people move to the UK hoping to build a better career and life. For many, it starts with excitement then it quickly turns into confusion when things do not work out the way they expected. You might have the right qualifications and experience, yet still struggle to land a single interview or you could even be completely ghosted by companies. But do not worry as this does not necessarily happen because you are not good enough but because the UK job market works differently than your home country.',
      },
      {
        _type: 'paragraph',
        children: [
          {
            text:
              'At DiasporaSpot, we understand how frustrating that can feel. Whether you are a student, a recent graduate, a professional relocating from Nigeria, Ghana, or another country, or someone who has already lived here for years and wants a stronger career - ',
          },
          { text: 'this guide is for you.', marks: ['strong'] },
        ],
      },
      {
        _type: 'heading',
        text: 'Why the UK?',
      },
      {
        _type: 'paragraph',
        children: [
          {
            text:
              'The UK hires people from all over the world in areas like healthcare, technology, education, finance and social care. Whether you need a visa depends on where you are from and your current status in the UK. Most people from outside the UK will need either the right visa already in place or an employer willing to sponsor them through the ',
          },
          { text: 'Skilled Worker visa', href: 'https://www.gov.uk/skilled-worker-visa' },
          { text: '.' },
        ],
      },
      {
        _type: 'paragraph',
        children: [
          {
            text: 'Employers make decisions based on how you present yourself before they even speak to you.',
            marks: ['strong'],
          },
          { text: ' Your CV, your application and your interview all carry more weight here than in many other countries.' },
        ],
      },
      {
        _type: 'heading',
        text: 'What Do UK Employers Look For?',
      },
      {
        _type: 'paragraph',
        text:
          'Experience and qualifications matter but UK employers also look at a few other things that many international candidates do not expect.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Clarity',
      },
      {
        _type: 'paragraph',
        text:
          'In interviews you will often be asked direct questions in that situation. Should you give a quick answer or an elaborate answer and explain with a story?',
      },
      {
        _type: 'paragraph',
        text:
          'In most cases a clear answer with a short relevant story works best as employers want to understand your thinking without feeling like they have to pull the answers from you.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Relevance and Cultural Fit',
      },
      {
        _type: 'paragraph',
        text:
          'Does your application feel like it was written for this specific job or does it look like a copy and paste? Tailoring just a few lines can make a big difference.',
      },
      {
        _type: 'paragraph',
        text:
          'Building a good working relationship with the people around you is just as important as getting your work done. Employers look for people that can collaborate, communicate clearly and fit into the team.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Initiative',
      },
      {
        _type: 'paragraph',
        text:
          'Have you taken the time to research the company before applying? Will you simply copy and paste the same application or rewrite part of it before applying for the role?',
      },
      {
        _type: 'paragraph',
        text:
          'Even small signs of effort on your part can set you apart from other candidates. These qualities do not come from qualifications alone. They come from how you present yourself at every stage and it all starts with your CV.',
      },
      {
        _type: 'heading',
        text: 'What Should You Know Before Applying for a Job in the UK?',
      },
      {
        _type: 'paragraph',
        children: [
          {
            text:
              'The most common reason good candidates do not hear back is not their experience, it is how they present it.',
            marks: ['strong'],
          },
          {
            text:
              ' A CV that is too long, poorly laid out or written for a different country will not get through the initial screening no matter what is on it.',
          },
        ],
      },
      {
        _type: 'heading',
        level: 3,
        text: 'What is an ATS?',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Many UK employers use ' },
          { text: 'Applicant Tracking Systems (ATS)', marks: ['strong'] },
          {
            text:
              ', software that scans CVs for keywords before a real person ever reads them. If your CV does not use similar wording to the job description, it may be filtered out automatically. Knowing how to pass UK ATS screening is one of the fastest ways to improve your chances of getting noticed.',
          },
        ],
      },
      {
        _type: 'paragraph',
        children: [
          {
            text:
              'The UK also enforces strict anti-discrimination laws. Because of this, companies use blind screening which means you must follow a ',
          },
          { text: 'strict UK CV format without a photo', marks: ['strong'] },
          { text: ', date of birth or marital status. This keeps the process fair.' },
        ],
      },
      {
        _type: 'paragraph',
        text:
          'The same applies to interviews. UK job interviews have a specific format and going in without preparing puts you at a disadvantage. For anyone in a creative or technical field, how your portfolio looks matters just as much as the work inside it.',
      },
      {
        _type: 'paragraph',
        text: 'A good UK CV should be:',
      },
      {
        _type: 'list',
        items: [
          'No longer than two pages',
          'Written in clear, simple language focused on what you achieved',
          'Free from photos, date of birth or marital status',
          'Tailored to each job you apply for',
        ],
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'For example: ' },
          { text: 'Instead of:', marks: ['strong'] },
          { text: ' "Responsible for customer service." ' },
          { text: 'Write:', marks: ['strong'] },
          { text: ' "Handled customer enquiries and helped improve satisfaction through faster responses."' },
        ],
      },
      {
        _type: 'paragraph',
        text: 'That small change shows results, not just responsibilities.',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'DiasporaSpot runs workshops covering ' },
          { text: 'CV review', href: '/workshops' },
          { text: ', ' },
          { text: 'interview preparation', href: '/workshops' },
          { text: ' and ' },
          { text: 'portfolio guidance', href: '/workshops' },
          { text: ' all designed for diaspora professionals looking for jobs in the UK.' },
        ],
      },
      {
        _type: 'heading',
        text: 'How to Find a Job in the UK as a Foreigner',
      },
      {
        _type: 'paragraph',
        text:
          'Once you understand how the system works, the next step is knowing where to look. There are three main ways people find work in the UK. The one that works best depends on your situation, your industry and who you know.',
      },
      {
        _type: 'heading',
        level: 3,
        text: '1. Job Boards and Hiring Platforms',
      },
      {
        _type: 'paragraph',
        children: [
          {
            text:
              'Sites like Indeed UK, Reed, Totaljobs and LinkedIn are usually where most people start. On LinkedIn and Indeed you can filter for jobs that offer ',
          },
          { text: 'visa sponsorship', marks: ['strong'] },
          { text: ', which can save you a lot of time if you need it.' },
        ],
      },
      {
        _type: 'paragraph',
        text: 'Useful platforms:',
      },
      {
        _type: 'list',
        items: [
          [
            { text: 'Indeed UK', href: 'https://uk.indeed.com' },
            { text: ' - Good for entry-level and mid-level jobs' },
          ],
          [
            { text: 'LinkedIn', href: 'https://www.linkedin.com/jobs' },
            {
              text:
                ' - Essential for professional roles and being found by recruiters. You can filter searches to find UK tech jobs for foreigners here',
            },
          ],
          [
            { text: 'Reed', href: 'https://www.reed.co.uk' },
            { text: ' and Totaljobs - Widely used by UK employers across many industries' },
          ],
          [
            { text: 'Relocate.me', href: 'https://relocate.me' },
            { text: ' and Expat Jobs - Focused on candidates moving from abroad' },
          ],
          [
            { text: 'NHS Jobs', href: 'https://www.jobs.nhs.uk' },
            {
              text:
                ' - The main place to find healthcare roles in the UK, including NHS jobs with visa sponsorship for international applicants',
            },
          ],
        ],
      },
      {
        _type: 'heading',
        level: 3,
        text: '2. Applying Directly to Companies',
      },
      {
        _type: 'paragraph',
        text:
          "Going directly to a company's website means your application lands with them rather than competing in a pile with hundreds of others from a job board. But make sure you do your research first. Understand what the company does and what they care about. A personalized cover letter that shows you know the company will instantly make a hiring manager notice you.",
      },
      {
        _type: 'heading',
        level: 3,
        text: '3. Referrals and Networking',
      },
      {
        _type: 'paragraph',
        children: [
          {
            text:
              'A recommendation from someone already working at a company is still the most effective way to secure a job.',
            marks: ['strong'],
          },
          {
            text:
              ' It skips the early screening and comes with a level of trust that a CV alone cannot give you. Diaspora communities, alumni groups, LinkedIn and industry events are all good places to build those connections. Tell people what kind of work you are looking for and you will be amazed how many life changing opportunities come through casual conversation with others.',
          },
        ],
      },
      {
        _type: 'heading',
        text: 'How to Apply for a Job in the UK from Nigeria and Other Countries',
      },
      {
        _type: 'paragraph',
        text:
          'Applying from outside the UK is very common now and most employers are used to it especially for skilled and sponsored roles.',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Be clear about where you are applying from.', marks: ['strong'] },
          {
            text:
              ' Say upfront that you are based abroad and whether you need sponsorship. Employers who are open to international candidates will appreciate the honesty.',
          },
        ],
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Do not overlook LinkedIn.', marks: ['strong'] },
          {
            text:
              ' UK recruiters search for candidates internationally. A complete and professional profile means you can be found even when you are not actively applying.',
          },
        ],
      },
      {
        _type: 'paragraph',
        children: [
          { text: "If you need help getting your application materials ready for the UK market, DiasporaSpot's " },
          { text: 'CV review service', href: '/workshops' },
          { text: ' is built specifically for diaspora professionals applying from abroad.' },
        ],
      },
      {
        _type: 'heading',
        text: 'How to Get a Job in the UK with Visa Sponsorship',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Most sponsored workers in the UK come through the ' },
          { text: 'Skilled Worker visa', href: 'https://www.gov.uk/skilled-worker-visa' },
          { text: '. To get sponsored you need a job offer from an employer with a ' },
          { text: 'UK sponsor licence', marks: ['strong'] },
          { text: ' and the role needs to meet the minimum salary for that type of work.' },
        ],
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'The UK government has a public ' },
          {
            text: 'register of licensed sponsors',
            href:
              'https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers',
          },
          {
            text:
              ' that you can search before applying. This helps you focus on companies that are actually set up to hire international workers.',
          },
        ],
      },
      {
        _type: 'paragraph',
        text: 'Industries most likely to offer sponsorship:',
      },
      {
        _type: 'list',
        items: [
          'Healthcare and social care',
          'Technology and software engineering',
          'Finance and accounting',
          'Education',
          'Engineering and architecture',
        ],
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'These roles are competitive.', marks: ['strong'] },
          {
            text:
              ' You are up against candidates from all over the world. A strong CV, a well prepared interview and a clear application will make the difference.',
          },
        ],
      },
      {
        _type: 'heading',
        text: 'Can I Work in the UK on a Student Visa?',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Yes. If you are on a ' },
          { text: 'Student visa', href: 'https://www.gov.uk/student-visa/work' },
          { text: ' at a UK university you can work up to ' },
          { text: '20 hours per week during term time', marks: ['strong'] },
          { text: ' and full time during holidays.' },
        ],
      },
      {
        _type: 'paragraph',
        children: [
          {
            text:
              'Common student jobs include retail, hospitality, customer service, admin and healthcare support. These roles fit around your studies, pay at least the ',
          },
          { text: 'National Living Wage', href: 'https://www.gov.uk/national-minimum-wage-rates' },
          {
            text:
              ' of GBP 12.71 per hour for ages 21 and over, and build UK work experience that helps when you start looking for full-time work after graduation.',
          },
        ],
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Many students also use this time to understand how ' },
          { text: 'switching from a Student visa to a Skilled Worker visa', marks: ['strong'] },
          { text: ' works so they have a long-term plan in place before they graduate.' },
        ],
      },
      {
        _type: 'table',
        columns: ['Feature', 'Student Visa', 'Skilled Worker Visa'],
        rows: [
          ['Work Limit', 'Up to 20 hours/week (term time)', 'Full-time, no limit'],
          ['Sponsorship Needed', 'No', 'Yes - from a licensed employer'],
          ['How Long', 'While studying only', 'Tied to your job contract'],
          ['Path to Settlement', 'No - must switch visas later', 'Yes - usually after 5 years'],
        ],
      },
      {
        _type: 'heading',
        text: 'Common Mistakes to Avoid',
      },
      {
        _type: 'paragraph',
        text:
          'Most international candidates who struggle are not lacking experience, they just do not know how UK recruitment works. Here are the most common mistakes.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Sending the Same CV to Every Job',
      },
      {
        _type: 'paragraph',
        text:
          'A good CV is not enough if it looks like everyone else\'s. UK employers can quickly tell when a CV has not been tailored which is why generic applications are usually ignored even if you are qualified.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Applying to Companies That Do Not Offer Sponsorship',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Not every employer can sponsor a visa. Check the ' },
          {
            text: 'licensed sponsor register',
            href:
              'https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers',
          },
          { text: ' before you spend time on an application.' },
        ],
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Leaving LinkedIn Incomplete',
      },
      {
        _type: 'paragraph',
        text:
          'Recruiters search LinkedIn to find candidates especially for international hires. If your profile is empty or out of date you are easy to miss.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Not Researching the Company',
      },
      {
        _type: 'paragraph',
        text:
          'Candidates who know the company always come across better in cover letters and in interviews.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Only Using Job Boards',
      },
      {
        _type: 'paragraph',
        text:
          'A lot of good jobs are filled through referrals and direct applications before they even get posted online.',
      },
      {
        _type: 'heading',
        text: 'Frequently Asked Questions',
      },
      {
        _type: 'faq',
        items: [
          {
            question: 'Can I get a job in the UK without a degree?',
            answer: [
              {
                text:
                  'Yes, you absolutely can. Many roles in areas like retail, social care, logistics, hospitality, security and construction do not require a degree. In these cases experience, reliability and vocational certifications matter more than a piece of paper.',
              },
            ],
          },
          {
            question: 'How long does it take to find a job in the UK?',
            answer: [
              {
                text:
                  'It depends on your industry and how actively you are applying but it is a process that requires patience. Some people find work in a few weeks but for some especially if you need sponsorship the process from application through to arriving in the UK can take up to six months.',
              },
            ],
          },
          {
            question: 'Do I need a UK address to apply?',
            answer: [
              {
                text:
                  'No, you do not. Many UK employers are happy to hire from abroad. Just be honest about where you are and when you would be available to start.',
              },
            ],
          },
          {
            question: 'Does knowing someone in the UK help?',
            answer: [
              {
                text:
                  'Yes, almost always. A referral or introduction from someone already there can move your application straight to a hiring manager\'s desk. If you know people in the UK, reach out to them before you start applying.',
              },
            ],
          },
          {
            question: 'What is the difference between a Student visa and a Skilled Worker visa?',
            answer: [
              { text: 'Think of a ' },
              { text: 'Student visa', href: 'https://www.gov.uk/student-visa/work' },
              {
                text:
                  ' as a temporary permission slip that lets you work part time while you study, usually up to ',
              },
              { text: '20 hours a week', marks: ['strong'] },
              { text: '. A ' },
              { text: 'Skilled Worker visa', href: 'https://www.gov.uk/skilled-worker-visa' },
              {
                text:
                  ' is a full work visa tied to a specific job and employer. It requires an official job offer, a specific salary tier and an employer who is licensed to sponsor you.',
              },
            ],
          },
        ],
      },
      {
        _type: 'heading',
        text: 'Start With the Right Foundation',
      },
      {
        _type: 'paragraph',
        text:
          'Finding a job in the UK is very possible but it rewards preparation, not guesswork. Get the basics right and you improve your chances. Get the strategy right and you start seeing results.',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'DiasporaSpot is here to help you do both, from workshops on ' },
          { text: 'CV review', href: '/workshops' },
          { text: ' that gets you noticed to the ' },
          { text: 'interview preparation', href: '/workshops' },
          { text: ' sessions that help you walk in confident.' },
        ],
      },
    ],
  },
  {
    _id: 'article-money-home-smart-way',
    _type: 'article',
    status: 'published',
    title: 'Sending Money Home Without Losing Too Much to Fees',
    slug: 'sending-money-home-the-smart-way',
    excerpt:
      'A plain-English guide to comparing transfer fees, exchange rates, delivery speed, and safety before sending money across borders.',
    category: 'Money',
    coverImage: {
      alt: 'Person using a card payment terminal',
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80&auto=format&fit=crop',
    },
    author: 'DiasporaSpot Money Desk',
    publishedAt: '2026-06-05',
    readTime: '9 min read',
    featured: true,
    seo: {
      title: 'Sending Money Home Without Losing Too Much to Fees | DiasporaSpot',
      description:
        'Learn how to compare money transfer apps, exchange rates, transfer fees, delivery options, and safety before sending money home.',
    },
    internalNotes: [
      'Primary keyword: sending money home from abroad.',
      'Secondary keywords: best way to send money home, money transfer fees, exchange rate markup, diaspora remittances.',
      'Avoid naming one provider as best unless this becomes a reviewed/updated comparison article.',
    ],
    body: [
      {
        _type: 'paragraph',
        text:
          'Sending money home can feel simple until you realise the amount you send is not always the amount your family receives. A transfer app may say zero fees, but the exchange rate may be weaker. Another service may charge a fee but give a better rate. The smart move is to compare the full cost, not just the number on the button.',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'For many people in the diaspora, remittances are not optional. They support parents, siblings, school fees, rent, health bills and emergencies. That is why even a small difference in fees can matter when you send money regularly.' },
        ],
      },
      {
        _type: 'heading',
        text: 'What Does a Money Transfer Really Cost?',
      },
      {
        _type: 'paragraph',
        text:
          'Most people look at the transfer fee first, but that is only one part of the cost. The real cost includes the exchange rate, the delivery method, cash-out charges, and sometimes bank receiving fees.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'The visible fee',
      },
      {
        _type: 'paragraph',
        text:
          'This is the amount the app or bank tells you it will charge for the transfer. It is easy to compare, but it does not tell the full story.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'The exchange rate markup',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'The exchange rate markup is where many providers make money. Compare the provider rate against a neutral market rate from a source like ' },
          { text: 'Google Finance', href: 'https://www.google.com/finance' },
          { text: ' or your bank. If the difference is large, the service may be more expensive than it looks.' },
        ],
      },
      {
        _type: 'heading',
        level: 3,
        text: 'The receiving cost',
      },
      {
        _type: 'paragraph',
        text:
          'Ask how your recipient will receive the money. Bank deposit, mobile wallet, cash pickup and card deposit can all have different delivery times and costs.',
      },
      {
        _type: 'list',
        items: [
          'Check the exact amount your recipient will receive before confirming.',
          'Compare the exchange rate, not only the stated transfer fee.',
          'Ask whether the recipient will pay a cash-out or withdrawal fee.',
          'Keep receipts or screenshots for every transfer.',
        ],
      },
      {
        _type: 'heading',
        text: 'A Simple Way to Compare Transfer Options',
      },
      {
        _type: 'table',
        columns: ['Question', 'Why it matters', 'What to check'],
        rows: [
          ['What is the fee?', 'Shows the visible cost', 'Flat fee, percentage fee, promo fee'],
          ['What is the exchange rate?', 'Shows hidden markup', 'Compare with a market rate'],
          ['How fast is delivery?', 'Important for emergencies', 'Instant, same day, 1-3 days'],
          ['How will they receive it?', 'Affects convenience', 'Bank, wallet, cash pickup'],
        ],
      },
      {
        _type: 'heading',
        text: 'When Speed Matters More Than Price',
      },
      {
        _type: 'paragraph',
        text:
          'Sometimes the best transfer is not the cheapest one. If you are paying for urgent medical care, emergency travel or a deadline bill, speed and reliability may matter more than saving a small amount.',
      },
      {
        _type: 'paragraph',
        text:
          'For planned transfers, compare two or three services before sending. For emergencies, use the provider that has already worked reliably for your route.',
      },
      {
        _type: 'heading',
        text: 'Common Mistakes to Avoid',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Assuming zero fee means free',
      },
      {
        _type: 'paragraph',
        text:
          'A zero-fee transfer can still be expensive if the exchange rate is poor. Always compare the final receiving amount.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Sending large amounts without testing first',
      },
      {
        _type: 'paragraph',
        text:
          'If you are using a provider for the first time, send a small amount first. Confirm that the money arrives, the recipient can access it, and the details are correct.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Ignoring fraud warnings',
      },
      {
        _type: 'paragraph',
        text:
          'Never send money to someone pressuring you, pretending to be a relative, or asking you to bypass normal checks. If a request feels strange, call the person directly before sending.',
      },
      {
        _type: 'heading',
        text: 'Frequently Asked Questions',
      },
      {
        _type: 'faq',
        items: [
          {
            question: 'Is a bank always safer than a transfer app?',
            answer: [
              {
                text:
                  'Not always. Banks can be reliable but expensive. Regulated transfer apps can also be safe. What matters is whether the provider is licensed, transparent, and reliable for your route.',
              },
            ],
          },
          {
            question: 'Should I send money in one large transfer or smaller transfers?',
            answer: [
              {
                text:
                  'For regular support, smaller scheduled transfers can help with budgeting. For large one-off payments, compare rates carefully because small differences become more important.',
              },
            ],
          },
          {
            question: 'What should I do if money does not arrive?',
            answer: [
              {
                text:
                  'Save the receipt, check the recipient details, contact the provider immediately, and avoid sending another payment until the first one is traced.',
              },
            ],
          },
        ],
      },
      {
        _type: 'heading',
        text: 'Build a Transfer Habit That Works',
      },
      {
        _type: 'paragraph',
        text:
          'The best approach is simple: know your route, compare before big transfers, keep records, and use services your recipient can actually access. Sending money home should feel supportive, not stressful.',
      },
    ],
  },
  {
    _id: 'article-renting-flat-without-scams',
    _type: 'article',
    status: 'published',
    title: 'Renting a flat without getting scammed',
    slug: 'renting-a-flat-without-getting-scammed',
    excerpt:
      'Red flags, verification steps, and payment rules to help you avoid common rental scams in a new country.',
    category: 'Housing',
    coverImage: {
      alt: 'Bright apartment living room',
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&q=80&auto=format&fit=crop',
    },
    author: 'DiasporaSpot Housing Desk',
    publishedAt: '2026-06-07',
    readTime: '10 min read',
    featured: false,
    seo: {
      title: 'Renting a flat without getting scammed | DiasporaSpot',
      description:
        'Learn the checks to make before paying for a rental in a new country.',
    },
    internalNotes: [
      'Primary keyword: renting a flat without getting scammed.',
      'This article should link to country-specific housing guides once available.',
      'Keep legal language general; local tenancy laws differ by country and city.',
    ],
    body: [
      {
        _type: 'paragraph',
        text:
          'Finding a place to live in a new country is one of the first big challenges. You are tired, you need an address, and everyone keeps telling you good flats disappear quickly. That pressure is exactly why rental scams work.',
      },
      {
        _type: 'paragraph',
        text:
          'A real landlord or agent may move fast, but they should still be willing to prove who they are, show the property properly, and give you a clear paper trail before you pay.',
      },
      {
        _type: 'heading',
        text: 'Why Newcomers Are Easy Targets',
      },
      {
        _type: 'paragraph',
        text:
          'Scammers know that people relocating from abroad may not understand local rental rules. They also know you may be arranging accommodation before you arrive, which makes it easier to fake photos, documents and urgency.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'The urgent deposit trick',
      },
      {
        _type: 'paragraph',
        text:
          'You are told the flat has many interested people and you must send a deposit immediately to hold it. The listing may disappear as soon as the money is sent.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'The fake agent trick',
      },
      {
        _type: 'paragraph',
        text:
          'Someone pretends to be an agent and sends copied photos from another listing. They may use a real company name but communicate from a personal email or messaging app.',
      },
      {
        _type: 'heading',
        text: 'Checks to Make Before Paying Anything',
      },
      {
        _type: 'paragraph',
        text:
          'Before sending money, slow the process down and collect evidence. A genuine rental process should be boring and traceable. If everything depends on trust, screenshots and pressure, step back.',
      },
      {
        _type: 'list',
        items: [
          'Search the address and compare it with the listing photos.',
          'Reverse-search images to see if they appear on another listing.',
          'Confirm the agent or landlord identity through official channels.',
          'Ask for a video viewing if you cannot visit in person.',
          'Read the contract before sending a deposit.',
          'Avoid cash, crypto, gift cards or informal payment requests.',
        ],
      },
      {
        _type: 'heading',
        text: 'What a Safer Rental Process Looks Like',
      },
      {
        _type: 'table',
        columns: ['Step', 'Safe sign', 'Warning sign'],
        rows: [
          ['Viewing', 'In-person or live video viewing', 'Only old photos, no live viewing'],
          ['Identity', 'Agent can be verified publicly', 'Personal account, no traceable office'],
          ['Contract', 'Written agreement before payment', 'Deposit requested before documents'],
          ['Payment', 'Traceable bank transfer', 'Cash, crypto, gift cards, urgent transfer'],
        ],
      },
      {
        _type: 'heading',
        text: 'Questions to Ask the Landlord or Agent',
      },
      {
        _type: 'paragraph',
        text:
          'Good questions make scammers uncomfortable and genuine agents clearer. Ask direct questions and keep the answers in writing.',
      },
      {
        _type: 'list',
        items: [
          'Who owns or manages the property?',
          'What is included in the rent?',
          'How much is the deposit and where will it be protected?',
          'What documents do you need from me?',
          'When can I receive the contract?',
          'Are bills, council tax or service charges included?',
        ],
      },
      {
        _type: 'heading',
        text: 'Common Red Flags',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'The rent is far below the market',
      },
      {
        _type: 'paragraph',
        text:
          'A cheap flat in a popular area can be real, but if the price looks too good and the landlord is rushing you, treat it as suspicious.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'They refuse a viewing',
      },
      {
        _type: 'paragraph',
        text:
          'If you cannot view in person, ask for a live video viewing where they show the street, front door, rooms and current date. Pre-recorded videos are easier to fake.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'They ask for unusual payment methods',
      },
      {
        _type: 'paragraph',
        text:
          'A legitimate rental payment should be traceable. If someone asks for gift cards, crypto or a transfer to a name that does not match the landlord or agency, do not send it.',
      },
      {
        _type: 'heading',
        text: 'Frequently Asked Questions',
      },
      {
        _type: 'faq',
        items: [
          {
            question: 'Should I pay a deposit before seeing the flat?',
            answer: [
              {
                text:
                  'Avoid it if possible. If you are relocating and cannot view in person, ask someone trusted to view for you or request a detailed live video viewing before making any payment.',
              },
            ],
          },
          {
            question: 'What if the agent says many people are interested?',
            answer: [
              {
                text:
                  'That can be true, but pressure should not replace verification. A genuine agent can still provide documents and answer basic questions.',
              },
            ],
          },
          {
            question: 'Is it safe to rent a room from social media?',
            answer: [
              {
                text:
                  'It can be, but be extra careful. Meet safely, verify the address, confirm who lives there, and do not send money to someone you cannot identify.',
              },
            ],
          },
        ],
      },
      {
        _type: 'heading',
        text: 'Slow Down Before You Send Money',
      },
      {
        _type: 'paragraph',
        text:
          'The goal is not to be afraid of every listing. The goal is to move carefully enough that you can spot pressure, missing documents and fake details before they cost you money.',
      },
    ],
  },
  {
    _id: 'article-skilled-worker-visa',
    _type: 'article',
    status: 'published',
    title: 'The skilled worker visa, in plain English',
    slug: 'the-skilled-worker-visa-in-plain-english',
    excerpt:
      'A simple, non-legal overview of how sponsored work visas usually work and what applicants should prepare.',
    category: 'Visas',
    coverImage: {
      alt: 'Traveler holding passport at an airport',
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=80&auto=format&fit=crop',
    },
    author: 'DiasporaSpot Guides Team',
    publishedAt: '2026-06-09',
    readTime: '11 min read',
    featured: false,
    seo: {
      title: 'The skilled worker visa, in plain English | DiasporaSpot',
      description:
        'Understand the basic moving parts of sponsored skilled worker visas.',
    },
    internalNotes: [
      'Primary keyword: Skilled Worker visa explained.',
      'Keep references general and point users to official GOV.UK pages for final checks.',
      'This is not legal advice; include disclaimer language when legal template exists.',
    ],
    body: [
      {
        _type: 'paragraph',
        text:
          'The Skilled Worker visa is one of the main routes people use to move to the UK for work. It is not simply a job search visa. In most cases, you need a qualifying job offer from an employer that is licensed to sponsor workers.',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'This guide explains the moving parts in plain English. For final rules, always check the official ' },
          { text: 'GOV.UK Skilled Worker visa page', href: 'https://www.gov.uk/skilled-worker-visa' },
          { text: ' because immigration rules can change.' },
        ],
      },
      {
        _type: 'heading',
        text: 'What You Usually Need',
      },
      {
        _type: 'list',
        items: [
          'A job offer from a UK employer with a sponsor licence.',
          'A role that is eligible under the visa rules.',
          'A salary that meets the required threshold for that role.',
          'A Certificate of Sponsorship from the employer.',
          'Proof of identity, English language ability and funds if required.',
        ],
      },
      {
        _type: 'heading',
        text: 'The Terms People Confuse',
      },
      {
        _type: 'table',
        columns: ['Term', 'Plain-English meaning'],
        rows: [
          ['Sponsor licence', 'Permission for an employer to sponsor overseas workers'],
          ['Certificate of Sponsorship', 'A digital reference number linked to your job offer'],
          ['Eligible occupation', 'A job type that appears under the visa rules'],
          ['Salary threshold', 'The minimum salary your offer must meet'],
        ],
      },
      {
        _type: 'heading',
        text: 'How the Process Usually Works',
      },
      {
        _type: 'heading',
        level: 3,
        text: '1. You find a sponsoring employer',
      },
      {
        _type: 'paragraph',
        children: [
          { text: 'Before applying, check whether the employer appears on the official ' },
          {
            text: 'register of licensed sponsors',
            href:
              'https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers',
          },
          { text: '. This helps you avoid spending time on companies that cannot sponsor you.' },
        ],
      },
      {
        _type: 'heading',
        level: 3,
        text: '2. You receive a qualifying job offer',
      },
      {
        _type: 'paragraph',
        text:
          'The job must match the visa requirements. This usually includes the job type, skill level and salary. The employer should understand this before offering sponsorship.',
      },
      {
        _type: 'heading',
        level: 3,
        text: '3. The employer assigns your sponsorship certificate',
      },
      {
        _type: 'paragraph',
        text:
          'The Certificate of Sponsorship is not a paper certificate. It is a digital record with a reference number you use in your visa application.',
      },
      {
        _type: 'heading',
        level: 3,
        text: '4. You submit your visa application',
      },
      {
        _type: 'paragraph',
        text:
          'You will provide your documents, pay the relevant fees, and wait for a decision. Timelines can vary depending on where you apply from and whether priority services are available.',
      },
      {
        _type: 'heading',
        text: 'Industries Where Sponsorship Is Common',
      },
      {
        _type: 'paragraph',
        text:
          'Sponsorship can happen in many fields, but it is more common in sectors where employers struggle to fill roles locally.',
      },
      {
        _type: 'list',
        items: [
          'Healthcare and social care',
          'Software engineering and technology',
          'Engineering and construction',
          'Education',
          'Accounting, finance and specialist business roles',
        ],
      },
      {
        _type: 'heading',
        text: 'Mistakes That Delay People',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Applying to employers that cannot sponsor',
      },
      {
        _type: 'paragraph',
        text:
          'If sponsorship is essential for you, check the employer before investing hours into a long application.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Assuming every job title qualifies',
      },
      {
        _type: 'paragraph',
        text:
          'A similar title does not always mean the job meets the rules. The duties, occupation code and salary can all matter.',
      },
      {
        _type: 'heading',
        level: 3,
        text: 'Waiting too late to prepare documents',
      },
      {
        _type: 'paragraph',
        text:
          'Passports, certificates, references and proof documents can take time. Start preparing before you receive the offer so you are not rushing later.',
      },
      {
        _type: 'heading',
        text: 'Frequently Asked Questions',
      },
      {
        _type: 'faq',
        items: [
          {
            question: 'Can I apply for a Skilled Worker visa without a job offer?',
            answer: [
              {
                text:
                  'Usually no. The route is tied to a qualifying job offer from a licensed sponsor. You normally need the offer before applying.',
              },
            ],
          },
          {
            question: 'Can I switch from a Student visa to a Skilled Worker visa?',
            answer: [
              {
                text:
                  'Many people do switch, but timing and eligibility matter. Check the official rules and speak to your employer early if you are hoping to move from student work into a sponsored role.',
              },
            ],
          },
          {
            question: 'Does sponsorship mean the employer pays for everything?',
            answer: [
              {
                text:
                  'Not always. Some employers cover visa-related costs, some cover part of them, and some expect the worker to pay certain fees. Ask clearly before accepting the offer.',
              },
            ],
          },
        ],
      },
      {
        _type: 'heading',
        text: 'Prepare Like the Process Is Competitive',
      },
      {
        _type: 'paragraph',
        text:
          'Sponsorship is possible, but it is competitive. A clear CV, targeted applications, strong interview preparation and a realistic understanding of the visa rules will make your search much stronger.',
      },
    ],
  },
];

export const workshops: Workshop[] = [
  {
    _id: 'workshop-cv-review-live',
    _type: 'workshop',
    createdAt: '2026-05-20T09:00:00Z',
    status: 'published',
    title: 'CV Reviews',
    slug: 'cv-reviews',
    oneLiner: 'Get noticed by recruiters.',
    description:
      'Bring your current CV and leave with clearer positioning, sharper bullets, and practical edits you can use immediately.',
    date: '2026-06-06',
    time: '11:00',
    timezone: 'WAT',
    duration: '60 min',
    format: 'Live online',
    host: 'Career Desk',
    spotsLabel: '18 spots',
    bookingStatus: 'booking-open',
    icon: 'document',
    iconTone: 'warm',
    ctaLabel: 'Book CV Review',
    href: '#',
    featured: true,
  },
  {
    _id: 'workshop-interview-prep-live',
    _type: 'workshop',
    createdAt: '2026-05-24T09:00:00Z',
    status: 'published',
    title: 'Interview Preparation',
    slug: 'interview-preparation',
    oneLiner: 'Walk in ready. Walk out confident.',
    description:
      'Practice stronger answers, structure your stories, and learn how to speak with calm authority in global interviews.',
    date: '2026-06-13',
    time: '14:00',
    timezone: 'WAT',
    duration: '90 min',
    format: 'Live online',
    host: 'Hiring Circle',
    spotsLabel: '9 spots left',
    bookingStatus: 'few-spots',
    icon: 'conversation',
    iconTone: 'gold',
    ctaLabel: 'Reserve Seat',
    href: '#',
    featured: false,
  },
  {
    _id: 'workshop-portfolio-tips-live',
    _type: 'workshop',
    createdAt: '2026-05-28T09:00:00Z',
    status: 'published',
    title: 'Portfolio Tips',
    slug: 'portfolio-tips',
    oneLiner: 'Let your work speak for itself.',
    description:
      'Turn scattered projects into a focused proof-of-work page that makes your value easier to understand.',
    date: '2026-06-20',
    time: '12:00',
    timezone: 'WAT',
    duration: '60 min',
    format: 'Workshop lab',
    host: 'Design Review',
    spotsLabel: 'Waitlist open',
    bookingStatus: 'waitlist',
    icon: 'briefcase',
    iconTone: 'dark',
    ctaLabel: 'Join Waitlist',
    href: '#',
    featured: false,
  },
];

export const events: Event[] = [
  {
    _id: 'event-diaspora-career-mixer',
    _type: 'event',
    status: 'published',
    title: 'Diaspora Career Mixer',
    slug: 'diaspora-career-mixer',
    summary: 'A focused networking evening for professionals building new careers abroad.',
    description:
      'Meet other professionals, hear short career stories, and leave with a clearer map of who can help you move forward.',
    date: '2026-07-04',
    startTime: '18:00',
    endTime: '20:30',
    timezone: 'WAT',
    location: 'Online',
    eventType: 'Online',
    capacityLabel: '120 seats',
    eventStatus: 'registration-open',
    coverImage: {
      alt: 'People meeting at a professional networking event',
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&q=80&auto=format&fit=crop',
    },
    registrationUrl: '#',
    featured: true,
  },
  {
    _id: 'event-settling-in-clinic',
    _type: 'event',
    status: 'published',
    title: 'Settling In Clinic',
    slug: 'settling-in-clinic',
    summary: 'A practical Q&A session on housing, banking, transport, and first-month admin.',
    description:
      'Bring your questions about the first few weeks abroad and get practical answers from people who have recently done it.',
    date: '2026-07-18',
    startTime: '10:00',
    endTime: '12:00',
    timezone: 'WAT',
    location: 'Hybrid',
    eventType: 'Hybrid',
    capacityLabel: '60 seats',
    eventStatus: 'few-spots',
    coverImage: {
      alt: 'Small group discussion around a table',
      url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=80&auto=format&fit=crop',
    },
    registrationUrl: '#',
    featured: false,
  },
  {
    _id: 'event-culture-and-community-night',
    _type: 'event',
    status: 'published',
    title: 'Culture and Community Night',
    slug: 'culture-and-community-night',
    summary: 'A relaxed community night for food, stories, and building friendships in a new city.',
    description:
      'Designed for people who want to feel more rooted, meet neighbors, and reconnect with culture while living abroad.',
    date: '2026-08-01',
    startTime: '17:00',
    endTime: '21:00',
    timezone: 'WAT',
    location: 'Lagos community hub',
    eventType: 'In person',
    capacityLabel: '80 seats',
    eventStatus: 'waitlist',
    coverImage: {
      alt: 'Community dinner table with shared food',
      url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1400&q=80&auto=format&fit=crop',
    },
    registrationUrl: '#',
    featured: false,
  },
];

export const guides: Guide[] = [
  {
    _id: 'guide-first-30-days-abroad',
    _type: 'guide',
    status: 'published',
    title: 'Your First 30 Days Abroad',
    slug: 'first-30-days-abroad',
    summary:
      'A practical settling-in checklist for the admin, housing, money, and community tasks that make the first month feel less chaotic.',
    category: 'Community',
    guideType: 'Checklist',
    stage: 'Settling in',
    coverImage: {
      alt: 'Desk with passport, notes, and travel documents',
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=80&auto=format&fit=crop',
    },
    readTime: '14 min read',
    publishedAt: '2026-06-12',
    ctaLabel: 'Open checklist',
    downloadUrl: '#',
    featured: true,
    seo: {
      title: 'Your First 30 Days Abroad | DiasporaSpot',
      description: 'A practical settling-in checklist for your first month abroad.',
    },
    body: [
      {
        _type: 'paragraph',
        children: [
          {
            text: 'The first month abroad is rarely about one big decision. It is a chain of small tasks that determine whether life starts to feel stable.',
          },
        ],
      },
      {
        _type: 'heading',
        text: 'Week one: make yourself reachable',
        level: 2,
      },
      {
        _type: 'list',
        items: [
          'Buy or activate a local SIM.',
          'Save emergency contacts and your nearest embassy details.',
          'Confirm your temporary address and keep digital copies of key documents.',
        ],
      },
      {
        _type: 'heading',
        text: 'Week two: sort the basics',
        level: 2,
      },
      {
        _type: 'paragraph',
        children: [
          {
            text: 'Prioritize banking, transport, housing paperwork, and any registration steps tied to your visa or residence status.',
          },
        ],
      },
    ],
  },
  {
    _id: 'guide-job-search-sprint',
    _type: 'guide',
    status: 'published',
    title: 'The 2-Week Job Search Sprint',
    slug: 'job-search-sprint',
    summary:
      'A focused playbook for turning scattered job applications into a repeatable weekly system.',
    category: 'Career',
    guideType: 'Playbook',
    stage: 'Actively applying',
    coverImage: {
      alt: 'Laptop with notes and a planning calendar',
      url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80&auto=format&fit=crop',
    },
    readTime: '11 min read',
    publishedAt: '2026-06-18',
    ctaLabel: 'Read playbook',
    featured: false,
    seo: {
      title: 'The 2-Week Job Search Sprint | DiasporaSpot',
      description: 'A practical job search system for diaspora professionals.',
    },
    body: [
      {
        _type: 'paragraph',
        children: [
          {
            text: 'A good job search is not just more applications. It is better targeting, cleaner positioning, and consistent follow-up.',
          },
        ],
      },
      {
        _type: 'heading',
        text: 'Build your target list',
        level: 2,
      },
      {
        _type: 'list',
        items: [
          'Pick 25 companies that hire internationally.',
          'Find the role titles that match your background.',
          'Track recruiter names, application links, and follow-up dates.',
        ],
      },
    ],
  },
  {
    _id: 'guide-rent-viewing-scorecard',
    _type: 'guide',
    status: 'published',
    title: 'Rent Viewing Scorecard',
    slug: 'rent-viewing-scorecard',
    summary:
      'A simple template for comparing rentals beyond price, including commute, paperwork, deposits, and red flags.',
    category: 'Housing',
    guideType: 'Template',
    stage: 'Planning',
    coverImage: {
      alt: 'Bright apartment living room with a sofa',
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80&auto=format&fit=crop',
    },
    readTime: '7 min read',
    publishedAt: '2026-06-24',
    ctaLabel: 'Use template',
    downloadUrl: '#',
    featured: false,
    seo: {
      title: 'Rent Viewing Scorecard | DiasporaSpot',
      description: 'A rental comparison template for people moving abroad.',
    },
    body: [
      {
        _type: 'paragraph',
        children: [
          {
            text: 'The cheapest room can become expensive if the commute, deposit terms, or contract conditions are wrong.',
          },
        ],
      },
      {
        _type: 'table',
        columns: ['Factor', 'What to check'],
        rows: [
          ['Deposit', 'Amount, protection rules, refund timing'],
          ['Commute', 'Door-to-door time at peak hours'],
          ['Contract', 'Notice period, bills, guarantor requirements'],
        ],
      },
    ],
  },
  {
    _id: 'guide-money-transfer-checklist',
    _type: 'guide',
    status: 'published',
    title: 'Money Transfer Safety Checklist',
    slug: 'money-transfer-safety-checklist',
    summary:
      'A resource list for comparing transfer fees, exchange rates, delivery speed, and safety before sending money.',
    category: 'Money',
    guideType: 'Resource list',
    stage: 'Getting started',
    coverImage: {
      alt: 'Phone showing a financial app beside currency notes',
      url: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1400&q=80&auto=format&fit=crop',
    },
    readTime: '8 min read',
    publishedAt: '2026-06-28',
    ctaLabel: 'View checklist',
    featured: false,
    seo: {
      title: 'Money Transfer Safety Checklist | DiasporaSpot',
      description: 'A checklist for comparing international money transfer options.',
    },
    body: [
      {
        _type: 'paragraph',
        children: [
          {
            text: 'Before you send money, compare the full cost. A low fee can hide a poor exchange rate.',
          },
        ],
      },
      {
        _type: 'list',
        items: [
          'Compare the rate against a live mid-market rate.',
          'Check delivery time and recipient payout options.',
          'Confirm support channels before sending large amounts.',
        ],
      },
    ],
  },
];
