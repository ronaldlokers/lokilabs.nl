export type Job = {
  when: string;
  role: string;
  org?: string;
  // Shown instead of an "@ org" attribution for non-employer chapters —
  // "@ lokilabs" previously read exactly like a real employer.
  tag?: string;
  desc?: string;
};

export const jobs: Job[] = [
  {
    when: 'dec 2024 → now',
    role: 'Career switch → platform engineering',
    tag: 'independent · homelab',
    desc: 'A health break turned pivot: built a multi-node Kubernetes cluster (Raspberry Pi CM5) run like production — GitOps with FluxCD, full Prometheus/Grafana observability. Fully cleared and eager to get back to work.',
  },
  {
    when: 'may 2024 → nov 2024',
    role: 'Consultant · Software Engineer',
    org: 'Oliver IT',
    desc: 'Full-stack internal applications for enterprise clients — Node.js, TypeScript, React; CI/CD pipelines with GitHub Actions.',
  },
  {
    when: '2019 → 2023',
    role: 'Senior Software Engineer',
    org: 'Mendix',
    desc: "Mendix Studio's Page Editor — developer tooling at platform scale. Reusable React components used by thousands of developers; large TypeScript codebase; CI/CD with Jenkins and GitHub Actions.",
  },
  {
    when: '2012 → 2019',
    role: 'Medior Front-end Developer',
    org: 'Coolblue',
    desc: 'Webshop frontend through explosive growth (~20 to 100+ engineers). Cut frontend build times from 2m45s to seconds; led SMACSS CSS modularization; built a React + TypeScript customer-service tool.',
  },
  {
    when: '2010 → 2012',
    role: 'Front-end developer',
    org: 'Redhotminute',
    desc: 'Frontend and email templates in a .NET environment for Landal GreenParks, Van der Valk, Kia, Domino’s Pizza, and North Sea Jazz.',
  },
  {
    when: '2009 → 2010',
    role: 'Senior web nerd',
    org: 'medianerds',
    desc: 'Built and managed websites and newsletters.',
  },
  {
    when: '2007 → 2009',
    role: 'Interactive Designer',
    org: 'Pixel Reclame Producties',
    desc: 'Websites and newsletters for SMBs (valid XHTML!), plus SEO/SEA advisory.',
  },
  {
    when: '2006 → 2007',
    role: 'Webdeveloper',
    org: 'Crea10 Communicatie',
  },
  {
    when: '2005 → 2015',
    role: 'Owner / Front-end developer',
    org: 'h2o media',
    desc: 'Side business building websites for local clients, long before it was called freelancing.',
  },
];

export type Education = {
  when: string;
  what: string;
  where: string;
};

export const education: Education[] = [
  { when: '2025 → now', what: 'DevOps', where: 'Kubecraft' },
  { when: '2007 → 2008', what: 'Jong Ondernemen', where: 'ROCWB Radius College' },
  { when: '2004 → 2008', what: 'Media design 4 · Interactive designer', where: 'ROCWB Radius College' },
  { when: '2000 → 2004', what: 'VMBO', where: 'Markland College' },
];

export const skills: string[] = [
  'kubernetes (k3s)',
  'gitops · fluxcd',
  'docker',
  'prometheus · grafana',
  'linux (arch)',
  'ci/cd — github actions · jenkins · teamcity',
  'typescript · node.js · react',
];
