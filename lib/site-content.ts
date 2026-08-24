export const profile = {
  name: 'Fakhrul Alam',
  greeting: 'Hello!',
  role: 'A professional 3D generalist, 3D game assets artist and Multimedia designer.',
}

export const stats = [
  { value: '30+', title: '3D Models', note: 'as 3D artist' },
  { value: '10+', title: '3D Visualization', note: 'as 3D generalist' },
  { value: '100+', title: 'Creative Design', note: 'as multimedia designer' },
] as const

export const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'ArtStation', href: 'https://www.artstation.com/' },
  { label: 'Behance', href: 'https://www.behance.net/' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
] as const

export const aboutStory =
  'In 2015, a curious teenager enrolled in a vocational school to dive into the world of computers, exploring both hardware and software. Photography soon captured his imagination, and what started as a hobby evolved into a passion for digital creativity. Over the years, this passion transformed into a love for 3D art, pushing him toward the creative industry.'

/**
 * Placeholder client slots — swap each `name` for a real studio/brand
 * (and optionally add a `logo` path) once the list is confirmed.
 */
export const clients = [
  { name: 'Client Slot 01' },
  { name: 'Client Slot 02' },
  { name: 'Client Slot 03' },
  { name: 'Client Slot 04' },
  { name: 'Client Slot 05' },
] as const

export const expertise = [
  {
    index: '01',
    title: '3D Game Asset',
    description:
      'Game-ready props, environments and hard-surface models — clean topology, optimised UVs and PBR texture sets built to drop straight into an engine.',
    tools: ['Blender', 'Substance Painter', 'Marmoset', 'Unreal Engine'],
  },
  {
    index: '02',
    title: '3D Visualization',
    description:
      'Product and architectural renders, lighting studies and look development — turning a brief or a plan into an image that reads instantly.',
    tools: ['Blender', 'Cycles', 'Corona', 'Photoshop'],
  },
  {
    index: '03',
    title: 'Graphic Design',
    description:
      'Multimedia and campaign design across print and social — layout, type and composition tied together with the 3D work.',
    tools: ['Illustrator', 'Photoshop', 'After Effects', 'InDesign'],
  },
] as const

export type ReelItem = {
  /** Original source filename, shown as the technical caption. */
  file: string
  title: string
  /** Placeholder still. Replace with a frame from the real video. */
  poster: string
  alt: string
  featured?: boolean
  /**
   * Optional video path, e.g. '/reel/mountain-dew-ad.mp4'.
   * Add the file to /public/reel and set this to make the tile playable —
   * until then the tile opens the still in a lightbox.
   */
  src?: string
}

/** AI-Generated Content reel. */
export const reel: ReelItem[] = [
  {
    file: 'InShot_20250726_233412101.mp4',
    title: 'Hard-surface asset pass',
    poster: '/renders/reel-01.png',
    alt: 'Weathered sci-fi supply crate render with amber warning stripes',
    featured: true,
  },
  {
    file: 'InShot_20250728_001903666.mp4',
    title: 'Character sculpt study',
    poster: '/renders/reel-02.png',
    alt: 'Stylized 3D character bust of a hooded explorer lit by warm rim light',
  },
  {
    file: 'InShot_20250802_215823258.mp4',
    title: 'Interior lighting study',
    poster: '/renders/reel-03.png',
    alt: 'Architectural interior visualization of a concrete living space at dusk',
  },
  {
    file: 'InShot_20250728_225023134.mp4',
    title: 'Abstract motion loop',
    poster: '/renders/reel-04.png',
    alt: 'Abstract dark chrome ribbons twisting through a void',
  },
  {
    file: 'InShot_20250728_233838750.mp4',
    title: 'Mech rig breakdown',
    poster: '/renders/reel-05.png',
    alt: 'Hard-surface robotic arm render with hydraulic pistons',
  },
  {
    file: 'mountain dew ad.mp4',
    title: 'Citrus soda spot',
    poster: '/renders/reel-06.png',
    alt: 'Green aluminium soda can mid-air in a citrus liquid splash',
  },
  {
    file: 'Fanta ad.mp4',
    title: 'Orange soda spot',
    poster: '/renders/reel-07.png',
    alt: 'Glass bottle of orange soda backlit inside a swirling splash',
  },
]

export const journey = [
  {
    date: '15 August 2013',
    year: '2013',
    title: 'The first design',
    description:
      'My first creative endeavor was on 15 August 2013, when I designed an Eid Mubarak greeting using the Windows 7 Paint tool.',
  },
  {
    date: '2 March 2015',
    year: '2015',
    title: 'The first photograph',
    description:
      'On 2 March 2015, I captured my first photograph, revealing the beauty around me and igniting my love for photography.',
  },
  {
    date: '2020',
    year: '2020',
    title: 'The first 3D model',
    description:
      'In 2020, I took my first steps into 3D design during my fundamentals of 3D modeling course, where I began to shape my artistic vision.',
  },
] as const

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'reel', label: 'Reel' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
] as const
