// Shared service names and identifiers for the homepage, Services and quotes.
export const SERVICE_CARDS = [
  {
    slug: 'moving',
    name: 'Moving',
    image: '/photos/Supermovers_Moving.JPEG',
    position: 'center 30%',
    alt: 'SuperMovers moving a wrapped piece of furniture on a staircase',
    description: [
      'Local and long distance, one item or a full house. The price we quote you is the price you pay — we show up when we say we will, wrap your furniture before it goes on the truck, and treat your things like they are our own. No surprise charges on moving day.',
      'Our box trucks arrive stocked with moving blankets, dollies, straps, and shrink wrap — the gear it takes to protect your belongings throughout the move.',
    ],
    quoteLabel: 'Get a free moving quote',
  },
  {
    slug: 'delivery',
    name: 'Delivery',
    image: '/photos/The_Supermovers_Team.jpeg',
    position: 'center 40%',
    alt: 'The SuperMovers team',
    description: [
      "We'll pick it up and drop it off. The safety and protection of your items is always our first priority. We handle heavy, awkward pieces and move them more efficiently while keeping protection at the center of the job. We arrive when scheduled and handle everything from secondhand finds to brand-new furniture with care.",
    ],
    quoteLabel: 'Get a delivery quote',
  },
  {
    slug: 'junk-removal',
    name: 'Junk Removal',
    image: '/crew-optimized.jpg',
    position: 'center 35%',
    alt: 'The SuperMovers crew ready to help with hauling and junk removal',
    description: [
      "Clearing out a garage, an estate, or just getting rid of what you don't need anymore? We'll haul it away. Just point to what needs to go, and we'll get it out of your hair and load it up. No stress, no hassle, no heavy lifting for you.",
    ],
    quoteLabel: 'Get a removal quote',
  },
  {
    slug: 'moving-and-packing',
    name: 'Moving and Packing',
    image: '/photos/Supermovers_Table_2.JPEG',
    position: 'center 40%',
    alt: 'SuperMovers at their community event table',
    description: [
      'Get help with both preparing for your move and moving day itself. Our crew wraps, boxes, and labels your belongings, then loads, transports, and unloads them with care. From the first box to the last piece of furniture, we help keep the process organized.',
    ],
    quoteLabel: 'Get a moving and packing quote',
  },
  {
    slug: 'packing',
    name: 'Packing',
    image: '/photos/Supermovers_Careers.JPEG',
    position: 'center 30%',
    alt: 'A SuperMovers team member meeting someone at a campus event',
    description: [
      'Need a hand getting ready for moving day? Our packers carefully wrap, box, and label household goods for transit. From kitchenware to fragile décor, this service is all about a careful touch and attention to detail.',
    ],
    quoteLabel: 'Get a packing quote',
  },
] as const

export function findService(slug: unknown) {
  return SERVICE_CARDS.find((service) => service.slug === slug)
}
