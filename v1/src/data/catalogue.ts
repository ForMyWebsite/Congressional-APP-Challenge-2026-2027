import type { Opportunity } from '../domain/models';
const unknown = { grades: null, minimumAge: null, regions: null, other: [] };
export const catalogue: Opportunity[] = [
  {
    id: 'cmu-sams',
    name: 'Summer Academy for Math and Science',
    organizer: 'Carnegie Mellon University',
    type: 'Program',
    description:
      'An organizer program page to investigate. Acadia could not access the official source in this environment, so requirements, cost and current availability have not been verified.',
    interests: ['Engineering', 'Computer science'],
    demo: false,
    format: 'Unknown',
    location: null,
    requirements: unknown,
    cost: { participation: null, funding: null, additionalCosts: null },
    deadline: null,
    applicationStatus: 'unknown',
    materials: [],
    sources: [
      {
        id: 'cmu-page',
        url: 'https://www.cmu.edu/pre-college/academic-programs/sams.html',
        title: 'Official CMU SAMS program page — not reviewed',
        excerpt:
          'No source excerpt: HTTPS access returned a network-policy error. Read the organizer page directly.',
        reviewedAt: null,
        status: 'unreviewed',
      },
    ],
    unresolved: [
      'Confirm the current program cycle, eligibility, location, costs and application materials directly with CMU.',
    ],
  },
  {
    id: 'cac',
    name: 'Congressional App Challenge',
    organizer: 'Congressional App Challenge',
    type: 'Competition',
    description:
      'Explore the official competition rules and your district’s participation. No current cycle, eligibility, fees or deadline has been source-reviewed by Acadia.',
    interests: ['Computer science', 'Engineering', 'Arts & design'],
    demo: false,
    format: 'Unknown',
    location: null,
    requirements: unknown,
    cost: { participation: null, funding: null, additionalCosts: null },
    deadline: null,
    applicationStatus: 'unknown',
    materials: [],
    sources: [
      {
        id: 'cac-page',
        url: 'https://www.congressionalappchallenge.us/students/student-rules/',
        title: 'Official student rules — not reviewed',
        excerpt:
          'No source excerpt: HTTPS access returned a network-policy error. Check official rules before making a plan.',
        reviewedAt: null,
        status: 'unreviewed',
      },
    ],
    unresolved: [
      'Confirm district participation and current rules.',
      'Confirm any costs, submission materials and deadline.',
    ],
  },
  {
    id: 'cs50',
    name: 'CS50x learning resource',
    organizer: 'Harvard CS50',
    type: 'Learning resource',
    description:
      'A learning-resource link, separate from application-based opportunities. Course access, certificate costs and current details have not been verified in this environment.',
    interests: ['Computer science', 'Engineering'],
    demo: false,
    format: 'Unknown',
    location: null,
    requirements: unknown,
    cost: { participation: null, funding: null, additionalCosts: null },
    deadline: null,
    applicationStatus: 'not-applicable',
    materials: [],
    sources: [
      {
        id: 'cs50-page',
        url: 'https://cs50.harvard.edu/x/2026/',
        title: 'Official CS50x site — not reviewed',
        excerpt:
          'No source excerpt: HTTPS access returned a network-policy error. Check the course and any optional certificate fees directly.',
        reviewedAt: null,
        status: 'unreviewed',
      },
    ],
    unresolved: ['Confirm course access, prerequisites and any optional certificate fees.'],
  },
  {
    id: 'demo-engineering',
    name: 'Engineering studio',
    organizer: 'Fictional organizer · demonstration only',
    type: 'Program',
    description:
      'Practice turning an engineering interest into a plan. This fictional example demonstrates a free, remote program for Pennsylvania students. It is not a real program or application.',
    interests: ['Engineering', 'Computer science'],
    demo: true,
    format: 'Remote',
    location: 'Pennsylvania · example coverage',
    requirements: {
      grades: ['9', '10', '11', '12'],
      minimumAge: null,
      regions: ['Pennsylvania'],
      other: ['Example requirement: a short project idea.'],
    },
    cost: {
      participation: 0,
      funding: null,
      additionalCosts: 'Example: internet access and a suitable device are not supplied.',
    },
    deadline: null,
    applicationStatus: 'unknown',
    materials: [{ name: 'a short project idea (sample requirement)', sourceId: 'demo-brief' }],
    sources: [
      {
        id: 'demo-brief',
        url: null,
        title: 'Sample program brief · fictional evidence',
        excerpt:
          'DEMONSTRATION ONLY. Imagine a remote engineering studio for Pennsylvania students in grades 9–12, with no participation fee. The example application requests a short project idea. Internet and device access are not supplied. No real deadline or application exists.',
        reviewedAt: null,
        status: 'demonstration',
      },
    ],
    unresolved: ['In a real program, confirm dates, device access and support with the organizer.'],
  },
  {
    id: 'demo-design',
    name: 'Community design lab',
    organizer: 'Fictional organizer · demonstration only',
    type: 'Program',
    description:
      'A fictional in-person design program to explore cost, location and transportation mismatches. This record is not an available opportunity.',
    interests: ['Engineering', 'Arts & design', 'Community impact'],
    demo: true,
    format: 'In person',
    location: 'Pennsylvania · example location',
    requirements: { grades: ['11', '12'], minimumAge: null, regions: ['Pennsylvania'], other: [] },
    cost: {
      participation: 150,
      funding: null,
      additionalCosts: 'Example: travel and meals are not included.',
    },
    deadline: null,
    applicationStatus: 'unknown',
    materials: [],
    sources: [
      {
        id: 'demo-design-brief',
        url: null,
        title: 'Sample design-lab brief · fictional evidence',
        excerpt:
          'DEMONSTRATION ONLY. Imagine a local design lab for Pennsylvania grades 11–12 costing $150, excluding travel and meals. Funding and dates are unspecified. No real application exists.',
        reviewedAt: null,
        status: 'demonstration',
      },
    ],
    unresolved: ['Funding, travel support, accessibility and dates are unknown in this example.'],
  },
];
export function findOpportunity(id: string) {
  return catalogue.find((item) => item.id === id);
}
