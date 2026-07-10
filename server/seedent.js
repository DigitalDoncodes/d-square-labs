// Seed the Nostalgia Archive with the batch's childhood cartoons.
// Run: node seedent.js  (uses MONGODB_URI from .env; replaces existing archive items)
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const EntertainmentItem = require('./models/EntertainmentItem');

dotenv.config();

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

const cartoons = [
  {
    title: 'Jackie Chan Adventures (Jackie Chanin Sagasangal)',
    slug: 'jackie-chan-adventures',
    category: 'cartoons',
    yearsActive: '2000 - 2005',
    releaseYear: 2000,
    country: 'USA',
    studio: "Sony Pictures Television / Kids' WB",
    genre: ['Action', 'Adventure', 'Martial Arts', 'Fantasy'],
    ageGroup: 'Kids / Teens',
    overview:
      'Archaeologist and martial artist Jackie Chan hunts twelve magical Talismans across the world with his niece Jade and Uncle — beloved in Tamil Nadu as "Jackie Chanin Sagasangal".',
    history:
      'Created by John Rogers and Duane Capizzi, the show blended an animated Jackie Chan with real interview clips at the end of every episode. Its Tamil dub became a Chutti TV staple.',
    mainCharacters: [
      { name: 'Jackie Chan', role: 'Protagonist', description: 'Reluctant martial arts hero and archaeologist.' },
      { name: 'Jade Chan', role: 'Niece', description: 'Fearless 11-year-old who sneaks into every mission.' },
      { name: 'Uncle', role: 'Chi wizard', description: 'Antique shop owner famous for "One more thing!"' },
    ],
    villains: [{ name: 'Shendu', description: 'A demon dragon hunting his lost Talismans.' }],
    interestingFacts: [
      'Uncle\'s chant "Yu Mo Gui Gwai Fai Di Zao" roughly means "evil spirits begone quickly" in Cantonese.',
      'The real Jackie Chan answered fan questions at the end of every episode.',
    ],
    whyPopular: 'Authentic martial arts, Chinese mythology and family banter in one package.',
    iconicQuotes: [
      { quote: 'One more thing!', character: 'Uncle' },
      { quote: 'Bad day, bad day, bad day!', character: 'Jackie Chan' },
    ],
    lifeLessons: [
      { lesson: 'Magic must defeat magic', psychologicalTheme: 'Resourcefulness' },
      { lesson: 'Family is your greatest strength', psychologicalTheme: 'Bonds & responsibility' },
    ],
    psychology: {
      whyWeLovedThis: 'Jade was the self-insert who proved age never stops you from saving the world.',
      emotionalDevelopment: 'Sparked curiosity about history, artifacts and respect for elders.',
      humorStyle: 'Slapstick kung-fu comedy with Uncle\'s endless exasperation.',
      memoryAnchors: 'After-school marathons on Cartoon Network and Chutti TV.',
    },
    aiArtworks: [{ url: img('photo-1518709268805-4e9042af9f23'), caption: 'An ancient temple glowing with talisman magic.' }],
    views: 220, likes: 95, bookmarksCount: 50, readingTime: 5,
  },
  {
    title: 'Shin-chan',
    slug: 'shin-chan',
    category: 'cartoons',
    yearsActive: '1992 - Present',
    releaseYear: 1992,
    country: 'Japan',
    studio: 'Shin-Ei Animation',
    genre: ['Comedy', 'Slice of Life'],
    ageGroup: 'Kids / Teens',
    overview:
      'Five-year-old Shinnosuke Nohara terrorises Kasukabe with brutal honesty, shameless dances and zero filter — the naughtiest kid on Indian television.',
    history:
      'Based on Yoshito Usui\'s manga, the Hindi/Tamil dubs made Shin-chan a phenomenon in India — so popular it was briefly banned before returning censored, which only grew the legend.',
    mainCharacters: [
      { name: 'Shinnosuke "Shin" Nohara', role: 'Protagonist', description: 'Cheeky 5-year-old menace with a heart of gold.' },
      { name: 'Himawari', role: 'Sister', description: 'Baby sister obsessed with shiny things.' },
      { name: 'Misae & Hiroshi', role: 'Parents', description: 'The long-suffering Nohara parents.' },
    ],
    interestingFacts: [
      'Shin-chan was temporarily banned in India in 2008 for "bad manners" — and came back bigger than ever.',
      'The series has run for over 1,000 episodes in Japan.',
    ],
    whyPopular: 'Kids loved watching a kid get away with everything they never could.',
    iconicQuotes: [{ quote: 'O kaasu kaasu kaasu…', character: 'Shin-chan' }],
    lifeLessons: [
      { lesson: 'Honesty can be hilarious — and disarming', psychologicalTheme: 'Authenticity' },
      { lesson: 'Family forgives everything', psychologicalTheme: 'Unconditional love' },
    ],
    psychology: {
      whyWeLovedThis: 'Pure id on screen — Shin-chan said and did what every kid secretly wanted to.',
      emotionalDevelopment: 'A safe outlet for mischief; kids processed rules by watching them broken.',
      humorStyle: 'Irreverent gag comedy and catchphrases that spread through every classroom.',
      memoryAnchors: 'Weekday evenings on Hungama and Chutti TV, imitating the elephant dance.',
    },
    aiArtworks: [{ url: img('photo-1489599849927-2ee91cede3ba'), caption: 'A bright suburban street frozen in cartoon mischief.' }],
    views: 260, likes: 120, bookmarksCount: 70, readingTime: 4,
  },
  {
    title: 'Dora the Explorer (Doravin Payanangal)',
    slug: 'dora-the-explorer',
    category: 'cartoons',
    yearsActive: '2000 - 2019',
    releaseYear: 2000,
    country: 'USA',
    studio: 'Nickelodeon Animation Studio',
    genre: ['Interactive', 'Educational', 'Adventure'],
    ageGroup: 'Preschool',
    overview:
      'Dora and her monkey friend Boots solve map quests while dodging Swiper the fox — Tamil kids knew every word of "Doravin Payanangal".',
    history:
      'Pioneered fourth-wall interactive TV for preschoolers; the pauses after questions were designed so toddlers could answer aloud. The Tamil dub on Chutti TV became a generation\'s first "TV friend".',
    mainCharacters: [
      { name: 'Dora', role: 'Protagonist', description: 'Brave 7-year-old explorer.' },
      { name: 'Boots', role: 'Best friend', description: 'Energetic monkey in red boots.' },
      { name: 'Map & Backpack', role: 'Guides', description: 'Singing helpers on every quest.' },
    ],
    villains: [{ name: 'Swiper', description: 'The sneaky fox — "Swiper, no swiping!"' }],
    interestingFacts: [
      'Dora was the first animated Latina lead on major American children\'s TV.',
      'The question pauses were engineered so kids at home would answer the screen.',
    ],
    whyPopular: 'It talked WITH kids, not at them.',
    iconicQuotes: [{ quote: 'Swiper, no swiping!', character: 'Dora' }],
    lifeLessons: [
      { lesson: 'Plan the route, then start walking', psychologicalTheme: 'Goal-setting' },
      { lesson: 'Ask for help — out loud', psychologicalTheme: 'Confidence' },
    ],
    psychology: {
      whyWeLovedThis: 'It validated toddlers\' answers, building early confidence and participation.',
      emotionalDevelopment: 'Early problem-solving, direction sense and bilingual curiosity.',
      humorStyle: 'Call-and-response games and catchy repetitive jingles.',
      memoryAnchors: 'Early-morning Chutti TV before school.',
    },
    aiArtworks: [{ url: img('photo-1448375240586-882707db888b'), caption: 'A winding jungle path under morning sun.' }],
    views: 150, likes: 60, bookmarksCount: 25, readingTime: 4,
  },
  {
    title: 'Ben 10',
    slug: 'ben-10',
    category: 'cartoons',
    yearsActive: '2005 - 2008',
    releaseYear: 2005,
    country: 'USA',
    studio: 'Cartoon Network Studios',
    genre: ['Sci-Fi', 'Superhero', 'Action'],
    ageGroup: 'Kids / Teens',
    overview:
      'Ten-year-old Ben Tennyson finds the Omnitrix on a summer road trip and can transform into ten alien heroes — every kid checked their wrist after this.',
    history:
      'Created by Man of Action, Ben 10 became Cartoon Network\'s biggest original franchise, spawning sequels, films and the great Omnitrix toy craze of the mid-2000s.',
    mainCharacters: [
      { name: 'Ben Tennyson', role: 'Protagonist', description: 'Cocky kid wielding the Omnitrix.' },
      { name: 'Gwen Tennyson', role: 'Cousin', description: 'Smart magic-user who keeps Ben grounded.' },
      { name: 'Grandpa Max', role: 'Grandfather', description: 'Retired interstellar "Plumber".' },
    ],
    villains: [{ name: 'Vilgax', description: 'Alien conqueror relentless in chasing the Omnitrix.' }],
    interestingFacts: [
      'The Omnitrix hourglass symbol represents time running out on transformations.',
      'Heatblast, Four Arms and XLR8 were among the original ten aliens.',
    ],
    whyPopular: 'A watch that turns you into aliens — the ultimate playground fantasy.',
    iconicQuotes: [{ quote: "It's hero time!", character: 'Ben Tennyson' }],
    lifeLessons: [
      { lesson: 'Heroism comes from the heart, not powers', psychologicalTheme: 'Self-identity' },
      { lesson: 'Great power demands maturity', psychologicalTheme: 'Responsibility' },
    ],
    psychology: {
      whyWeLovedThis: 'The perfect power fantasy kept relatable by Ben\'s everyday flaws and cousin bickering.',
      emotionalDevelopment: 'Taught adaptability — solving problems even with the "wrong" alien.',
      humorStyle: 'Snarky banter and transformation mishaps.',
      memoryAnchors: 'Summer holidays and Omnitrix toy watches on every wrist.',
    },
    aiArtworks: [{ url: img('photo-1506703719100-a0f3a48c0f86'), caption: 'A green sci-fi glow in the dark.' }],
    views: 280, likes: 140, bookmarksCount: 90, readingTime: 6,
  },
  {
    title: 'Kick Buttowski: Suburban Daredevil',
    slug: 'kick-buttowski',
    category: 'cartoons',
    yearsActive: '2010 - 2012',
    releaseYear: 2010,
    country: 'USA',
    studio: 'Disney Television Animation',
    genre: ['Action', 'Comedy'],
    ageGroup: 'Kids',
    overview:
      'Clarence "Kick" Buttowski treats his sleepy suburb as one giant stunt course, chasing glory as the world\'s greatest daredevil with best friend Gunther.',
    history:
      'Disney XD\'s first original animated series. Its Hindi dub made "Kick" a household name in India, where his fearlessness became shorthand for absurd bravery.',
    mainCharacters: [
      { name: 'Kick Buttowski', role: 'Protagonist', description: 'Pint-sized stuntman without fear.' },
      { name: 'Gunther', role: 'Best friend', description: 'Loyal wingman and stunt assistant.' },
      { name: 'Brad', role: 'Brother', description: 'Obnoxious older brother and obstacle #1.' },
    ],
    interestingFacts: [
      'Kick never removes his helmet — it\'s part of the legend.',
      'It was Disney XD\'s very first original cartoon.',
    ],
    whyPopular: 'Every stunt kids imagined on their cycles, Kick actually did.',
    iconicQuotes: [{ quote: 'Aww, biscuits!', character: 'Kick' }],
    lifeLessons: [
      { lesson: 'Commit fully to what you love', psychologicalTheme: 'Passion & grit' },
      { lesson: 'Failure is just a stunt rehearsal', psychologicalTheme: 'Resilience' },
    ],
    psychology: {
      whyWeLovedThis: 'Kick embodied fearless commitment — a tiny kid with unshakeable self-belief.',
      emotionalDevelopment: 'Modelled persistence: crash, dust off, try the bigger ramp.',
      humorStyle: 'Over-the-top physics-defying stunt comedy.',
      memoryAnchors: 'Disney XD afternoons and cycle "stunts" that followed.',
    },
    aiArtworks: [{ url: img('photo-1478720568477-152d9b164e26'), caption: 'A ramp against a blazing suburban sunset.' }],
    views: 170, likes: 75, bookmarksCount: 35, readingTime: 4,
  },
  {
    title: 'Doraemon',
    slug: 'doraemon',
    category: 'cartoons',
    yearsActive: '1979 - Present',
    releaseYear: 1979,
    country: 'Japan',
    studio: 'Shin-Ei Animation',
    genre: ['Sci-Fi', 'Comedy', 'Slice of Life'],
    ageGroup: 'Kids',
    overview:
      'A robotic cat from the 22nd century pulls impossible gadgets out of his 4D pocket to rescue the hopeless Nobita — and teaches him why shortcuts backfire.',
    history:
      'Fujiko F. Fujio\'s manga became one of the most successful franchises in animation history. In India, the Hindi and Tamil dubs made "Doraemon" and "gadget" synonymous.',
    mainCharacters: [
      { name: 'Doraemon', role: 'Protagonist', description: 'Blue robot cat with a 4D pocket.' },
      { name: 'Nobita', role: 'Deuteragonist', description: 'Lazy but kind-hearted schoolboy.' },
      { name: 'Shizuka', role: 'Friend', description: 'Nobita\'s gentle crush.' },
      { name: 'Gian & Suneo', role: 'Frenemies', description: 'The bully and the show-off.' },
    ],
    interestingFacts: [
      'Doraemon is an official anime ambassador of Japan.',
      'He fears mice because robotic mice ate his original ears.',
    ],
    whyPopular: 'Every episode asked: what would YOU do with this gadget?',
    iconicQuotes: [{ quote: 'Doraemooon! Help me!', character: 'Nobita' }],
    lifeLessons: [
      { lesson: 'Shortcuts create bigger problems', psychologicalTheme: 'Delayed gratification' },
      { lesson: 'True friends help you grow, not escape', psychologicalTheme: 'Friendship' },
    ],
    psychology: {
      whyWeLovedThis: 'The gadget fantasy wrapped a gentle lesson: fixing life takes effort, not magic.',
      emotionalDevelopment: 'Consequences and empathy taught through Nobita\'s daily failures.',
      humorStyle: 'Gadget backfires and Gian\'s dreaded concerts.',
      memoryAnchors: 'Lunch-break episodes on Hungama and Chutti TV.',
    },
    aiArtworks: [{ url: img('photo-1534447677768-be436bb09401'), caption: 'A cozy room where a 4D pocket might live.' }],
    views: 300, likes: 150, bookmarksCount: 95, readingTime: 5,
  },
  {
    title: 'SpongeBob SquarePants',
    slug: 'spongebob-squarepants',
    category: 'cartoons',
    yearsActive: '1999 - Present',
    releaseYear: 1999,
    country: 'USA',
    studio: 'Nickelodeon Animation Studio',
    genre: ['Comedy', 'Absurdist'],
    ageGroup: 'All ages',
    overview:
      'An eternally optimistic sea sponge flips Krabby Patties in Bikini Bottom, annoying Squidward and adoring every second of his ordinary job.',
    history:
      'Created by marine biologist-turned-animator Stephen Hillenburg, SpongeBob became Nickelodeon\'s flagship and a global meme factory decades later.',
    mainCharacters: [
      { name: 'SpongeBob', role: 'Protagonist', description: 'Optimistic fry cook.' },
      { name: 'Patrick', role: 'Best friend', description: 'A starfish of legendary simplicity.' },
      { name: 'Squidward', role: 'Neighbor', description: 'Grumpy artist trapped between them.' },
    ],
    interestingFacts: [
      'Creator Stephen Hillenburg was a marine biology teacher.',
      'SpongeBob memes outlived the childhoods of the kids who watched it.',
    ],
    whyPopular: 'Joy so absurd it was contagious — plus the greatest supporting cast in cartoons.',
    iconicQuotes: [
      { quote: "I'm ready! I'm ready!", character: 'SpongeBob' },
      { quote: 'Is mayonnaise an instrument?', character: 'Patrick' },
    ],
    lifeLessons: [
      { lesson: 'Find joy in ordinary work', psychologicalTheme: 'Optimism' },
      { lesson: 'Enthusiasm beats talent on most days', psychologicalTheme: 'Attitude' },
    ],
    psychology: {
      whyWeLovedThis: 'SpongeBob modelled unconditional enthusiasm — happiness as a choice, not a circumstance.',
      emotionalDevelopment: 'Absurdist humor stretched imagination and taught kids to laugh at chaos.',
      humorStyle: 'Surreal underwater logic and quotable one-liners.',
      memoryAnchors: 'Nick marathons and the F.U.N. song.',
    },
    aiArtworks: [{ url: img('photo-1511192336575-5a79af67a629'), caption: 'Neon jellyfish colors under the sea.' }],
    views: 240, likes: 110, bookmarksCount: 65, readingTime: 5,
  },
  {
    title: 'Tom and Jerry',
    slug: 'tom-and-jerry',
    category: 'cartoons',
    yearsActive: '1940 - Present',
    releaseYear: 1940,
    country: 'USA',
    studio: 'MGM / Hanna-Barbera',
    genre: ['Slapstick', 'Comedy'],
    ageGroup: 'All ages',
    overview:
      'The timeless rivalry of a cat who can never win and a mouse who never stops winning — comedy so universal it needs no dialogue at all.',
    history:
      'Created in 1940 by William Hanna and Joseph Barbera, Tom and Jerry won seven Academy Awards — more than any other animated series of its kind.',
    mainCharacters: [
      { name: 'Tom', role: 'The cat', description: 'Endlessly determined, endlessly defeated.' },
      { name: 'Jerry', role: 'The mouse', description: 'Small, smug and always one step ahead.' },
    ],
    interestingFacts: [
      'Won 7 Academy Awards for animated short films.',
      'In the 1940 pilot, Tom was originally named Jasper.',
    ],
    whyPopular: 'Pure visual comedy — no language barrier, no expiry date.',
    lifeLessons: [
      { lesson: 'Wit beats size', psychologicalTheme: 'Underdog thinking' },
      { lesson: 'Rivals can\'t live without each other', psychologicalTheme: 'Frenemy dynamics' },
    ],
    psychology: {
      whyWeLovedThis: 'The classic underdog dynamic — everyone rooted for Jerry while secretly pitying Tom.',
      emotionalDevelopment: 'Taught visual storytelling — kids read emotion without a word spoken.',
      humorStyle: 'Orchestra-scored slapstick perfection.',
      memoryAnchors: 'Saturday mornings and Cartoon Network reruns with grandparents.',
    },
    aiArtworks: [{ url: img('photo-1524985069026-dd778a71c7b4'), caption: 'A grand stage for an eternal chase.' }],
    views: 350, likes: 170, bookmarksCount: 110, readingTime: 5,
    isThrowbackPick: true,
  },
  {
    title: 'Oggy and the Cockroaches',
    slug: 'oggy-and-the-cockroaches',
    category: 'cartoons',
    yearsActive: '1998 - Present',
    releaseYear: 1998,
    country: 'France',
    studio: 'Xilam Animation',
    genre: ['Slapstick', 'Comedy'],
    ageGroup: 'All ages',
    overview:
      'A lazy blue cat just wants a quiet life, but three cockroaches — Joey, Dee Dee and Marky — exist purely to destroy it. Chaos, every single episode.',
    history:
      'France\'s answer to Tom and Jerry, Oggy found its biggest audience in India where the dubbed version ran endlessly on Cartoon Network and Nickelodeon.',
    mainCharacters: [
      { name: 'Oggy', role: 'Protagonist', description: 'Blue cat who dreams of peace and cooking.' },
      { name: 'Joey, Dee Dee & Marky', role: 'Antagonists', description: 'The cockroach trio of chaos.' },
      { name: 'Jack', role: 'Cousin', description: 'Short-tempered green cat with big plans.' },
    ],
    interestingFacts: [
      'Produced in France but most-watched in India.',
      'Like Tom and Jerry, it\'s almost entirely dialogue-free.',
    ],
    whyPopular: 'Relentless slapstick with the pettiest villains in cartoon history.',
    lifeLessons: [
      { lesson: 'Chaos finds everyone — laugh through it', psychologicalTheme: 'Stress relief' },
    ],
    psychology: {
      whyWeLovedThis: 'The cockroaches\' pure pettiness was hilarious because it had no motive at all.',
      emotionalDevelopment: 'Safe cathartic chaos — tension release through absurd escalation.',
      humorStyle: 'French slapstick with rubber-band physics.',
      memoryAnchors: 'Holiday-afternoon marathons that never seemed to end.',
    },
    aiArtworks: [{ url: img('photo-1605649487212-47bdab064df7'), caption: 'A sunny house about to descend into chaos.' }],
    views: 200, likes: 85, bookmarksCount: 40, readingTime: 4,
  },
  {
    title: 'Dragon Ball Z',
    slug: 'dragon-ball-z',
    category: 'cartoons',
    yearsActive: '1989 - 1996',
    releaseYear: 1989,
    country: 'Japan',
    studio: 'Toei Animation',
    genre: ['Action', 'Martial Arts', 'Shonen'],
    ageGroup: 'Teens',
    overview:
      'Goku and the Z Fighters defend Earth against ever-stronger foes — Saiyans, Frieza, Cell, Buu — in the series that defined "power up" for a generation.',
    history:
      'Akira Toriyama\'s saga became the gateway anime for millions worldwide. In India it ruled Cartoon Network\'s Toonami block, and "going Super Saiyan" entered the playground dictionary.',
    mainCharacters: [
      { name: 'Goku', role: 'Protagonist', description: 'Saiyan raised on Earth who lives to grow stronger.' },
      { name: 'Vegeta', role: 'Rival', description: 'The proud Saiyan prince.' },
      { name: 'Gohan', role: 'Son', description: 'Hidden potential personified.' },
    ],
    villains: [
      { name: 'Frieza', description: 'Galactic tyrant of the most iconic arc.' },
      { name: 'Cell', description: 'The perfect bio-android.' },
    ],
    interestingFacts: [
      'The Goku vs Frieza fight is one of the longest in anime history.',
      '"It\'s over 9000!" became one of the internet\'s first mega-memes.',
    ],
    whyPopular: 'Stakes, screaming and transformations — hype television perfected.',
    iconicQuotes: [{ quote: "It's over 9000!", character: 'Vegeta' }],
    lifeLessons: [
      { lesson: 'Limits exist to be broken', psychologicalTheme: 'Growth mindset' },
      { lesson: 'Rivals make you stronger', psychologicalTheme: 'Healthy competition' },
    ],
    psychology: {
      whyWeLovedThis: 'Every arc was a masterclass in earned power — train, fail, transcend.',
      emotionalDevelopment: 'Perseverance modelling: heroes lost first, trained harder, returned.',
      humorStyle: 'Deadpan Piccolo, hungry Goku, furious Vegeta.',
      memoryAnchors: 'Toonami evenings and attempting Kamehamehas at school.',
    },
    aiArtworks: [{ url: img('photo-1506703719100-a0f3a48c0f86'), caption: 'Golden energy tearing through the sky.' }],
    views: 320, likes: 160, bookmarksCount: 100, readingTime: 6,
  },
  {
    title: 'He-Man and the Masters of the Universe',
    slug: 'he-man',
    category: 'cartoons',
    yearsActive: '1983 - 1985',
    releaseYear: 1983,
    country: 'USA',
    studio: 'Filmation',
    genre: ['Action', 'Fantasy'],
    ageGroup: 'Kids',
    overview:
      'Prince Adam raises his sword, shouts "By the power of Grayskull!" and becomes He-Man — Eternia\'s mightiest defender against Skeletor.',
    history:
      'Born from the Mattel toyline, He-Man defined 1980s action cartoons and returned to Indian screens in reruns that hooked a second generation.',
    mainCharacters: [
      { name: 'He-Man / Prince Adam', role: 'Protagonist', description: 'The most powerful man in the universe.' },
      { name: 'Battle Cat / Cringer', role: 'Companion', description: 'Cowardly tiger turned armored steed.' },
      { name: 'Teela & Man-At-Arms', role: 'Allies', description: 'Eternia\'s royal guard.' },
    ],
    villains: [{ name: 'Skeletor', description: 'Skull-faced sorcerer of Snake Mountain.' }],
    interestingFacts: [
      'Each episode ended with a direct-to-camera moral lesson.',
      'He-Man was one of the first cartoons based on a toyline.',
    ],
    whyPopular: 'The transformation sequence — pure 80s lightning-and-muscle spectacle.',
    iconicQuotes: [{ quote: 'By the power of Grayskull… I have the power!', character: 'He-Man' }],
    lifeLessons: [
      { lesson: 'Strength serves others, not ego', psychologicalTheme: 'Duty' },
      { lesson: 'Your mild self and mighty self are the same person', psychologicalTheme: 'Identity' },
    ],
    psychology: {
      whyWeLovedThis: 'The double-identity fantasy: an ordinary prince hiding a hero within.',
      emotionalDevelopment: 'Explicit end-of-episode morals gave kids clear ethical anchors.',
      humorStyle: 'Orko\'s failed magic and Cringer\'s reluctance.',
      memoryAnchors: 'Sunday-morning reruns and sword-stick reenactments.',
    },
    aiArtworks: [{ url: img('photo-1518709268805-4e9042af9f23'), caption: 'A castle humming with ancient power.' }],
    views: 140, likes: 55, bookmarksCount: 22, readingTime: 4,
  },
  {
    title: 'Chhota Bheem',
    slug: 'chhota-bheem',
    category: 'cartoons',
    yearsActive: '2008 - Present',
    releaseYear: 2008,
    country: 'India',
    studio: 'Green Gold Animations',
    genre: ['Adventure', 'Fantasy', 'Comedy'],
    ageGroup: 'Kids',
    overview:
      'In the kingdom of Dholakpur, laddu-powered Bheem and his friends protect the village from villains, monsters and Kalia\'s schemes.',
    history:
      'Rajiv Chilaka\'s creation pioneered the modern Indian animation industry — films, merchandise and a hero rooted in Indian soil rather than imported.',
    mainCharacters: [
      { name: 'Bheem', role: 'Protagonist', description: 'Kind, humble and laddu-powered.' },
      { name: 'Chutki', role: 'Best friend', description: 'Smart and caring — maker of the laddus.' },
      { name: 'Kalia', role: 'Rival', description: 'The envious neighborhood strongman.' },
    ],
    villains: [{ name: 'Kirmada', description: 'Dark warlord craving Dholakpur.' }],
    interestingFacts: [
      'One of the most successful homegrown Indian animation franchises ever.',
      'Bheem\'s strength activates with every fresh laddu.',
    ],
    whyPopular: 'The first superhero many Indian kids had who looked and lived like them.',
    iconicQuotes: [{ quote: 'Dholakpur ki raksha karna mera farz hai!', character: 'Bheem' }],
    lifeLessons: [
      { lesson: 'Protect those weaker than you', psychologicalTheme: 'Moral courage' },
      { lesson: 'Forgive rivals into friends', psychologicalTheme: 'Empathy' },
    ],
    psychology: {
      whyWeLovedThis: 'A relatable Indian hero rooted in local food, festivals and folklore.',
      emotionalDevelopment: 'Reinforced kindness, fitness and loyalty to community.',
      humorStyle: 'Light rivalry banter between Bheem\'s crew and Kalia\'s gang.',
      memoryAnchors: 'Pogo TV afternoons and asking mothers for "power laddus".',
    },
    aiArtworks: [{ url: img('photo-1605649487212-47bdab064df7'), caption: 'A golden village out of Indian folklore.' }],
    views: 230, likes: 105, bookmarksCount: 62, readingTime: 5,
  },
  {
    title: 'Varuthapadatha Karadi Sangam',
    slug: 'varuthapadatha-karadi-sangam',
    category: 'cartoons',
    yearsActive: '2015 - 2019',
    releaseYear: 2015,
    country: 'USA',
    studio: 'Cartoon Network Studios',
    genre: ['Comedy', 'Slice of Life'],
    ageGroup: 'All ages',
    overview:
      'Three bear brothers — Grizz, Panda and Ice Bear — try to fit into human society. The Tamil dub\'s genius title (a nod to "Varuthapadatha Valibar Sangam") made "We Bare Bears" a Tamil cult classic.',
    history:
      'Daniel Chong\'s webcomic became a Cartoon Network hit; the Tamil localisation\'s movie-reference title and dialogue turned it into one of the most beloved dubs on Tamil TV.',
    mainCharacters: [
      { name: 'Grizz', role: 'Eldest', description: 'Over-enthusiastic leader of the bear stack.' },
      { name: 'Panda', role: 'Middle', description: 'Phone-addicted, anxious and adorable.' },
      { name: 'Ice Bear', role: 'Youngest', description: 'Speaks in third person. Does everything. Legend.' },
    ],
    interestingFacts: [
      'The Tamil title spoofs the film "Varuthapadatha Valibar Sangam" — the no-worries bear association.',
      'The bears travel by stacking on top of each other.',
    ],
    whyPopular: 'Localised comedy so good it felt written in Tamil first.',
    iconicQuotes: [{ quote: 'Ice Bear approves.', character: 'Ice Bear' }],
    lifeLessons: [
      { lesson: 'Belonging starts with being yourself', psychologicalTheme: 'Identity & acceptance' },
      { lesson: 'Brothers stack together through everything', psychologicalTheme: 'Sibling bonds' },
    ],
    psychology: {
      whyWeLovedThis: 'Three personality types every friend group recognised — the hype man, the anxious one, the silent operator.',
      emotionalDevelopment: 'Normalised social anxiety and awkwardness with warmth.',
      humorStyle: 'Deadpan Ice Bear lines and Tamil-dub punchlines.',
      memoryAnchors: 'Evening Cartoon Network Tamil with the whole family laughing.',
    },
    aiArtworks: [{ url: img('photo-1478720568477-152d9b164e26'), caption: 'Three silhouettes stacked against the city.' }],
    views: 190, likes: 90, bookmarksCount: 48, readingTime: 4,
  },
  {
    title: 'Mr. Bean: The Animated Series',
    slug: 'mr-bean-animated',
    category: 'cartoons',
    yearsActive: '2002 - Present',
    releaseYear: 2002,
    country: 'UK',
    studio: 'Tiger Aspect Productions',
    genre: ['Slapstick', 'Comedy'],
    ageGroup: 'All ages',
    overview:
      'The rubber-faced disaster magnet returns in cartoon form with Teddy, the temperamental Mini, and landlady Mrs. Wicket — chaos without needing a single sentence.',
    history:
      'Rowan Atkinson voiced and modelled the animated Bean himself. The cartoon ran endlessly on Indian kids\' channels, introducing Bean to kids who\'d never seen the live show.',
    mainCharacters: [
      { name: 'Mr. Bean', role: 'Protagonist', description: 'A grown man versus everyday objects.' },
      { name: 'Teddy', role: 'Companion', description: 'His silent, suffering best friend.' },
      { name: 'Mrs. Wicket', role: 'Landlady', description: 'Bean\'s grumpy nemesis at home.' },
    ],
    interestingFacts: [
      'Rowan Atkinson provided the grunts and physical reference for animation.',
      'The animated series has far more episodes than the original live show.',
    ],
    whyPopular: 'Silent comedy that every age and language understood instantly.',
    lifeLessons: [
      { lesson: 'Creativity solves what convention can\'t', psychologicalTheme: 'Lateral thinking' },
    ],
    psychology: {
      whyWeLovedThis: 'Watching an adult fail at ordinary life made every kid feel competent.',
      emotionalDevelopment: 'Non-verbal humor sharpened reading of expressions and body language.',
      humorStyle: 'Wordless physical comedy and absurd improvisation.',
      memoryAnchors: 'Pogo reruns during homework breaks.',
    },
    aiArtworks: [{ url: img('photo-1524985069026-dd778a71c7b4'), caption: 'A quiet London street awaiting disaster.' }],
    views: 210, likes: 92, bookmarksCount: 45, readingTime: 4,
  },
  {
    title: 'Little Krishna',
    slug: 'little-krishna',
    category: 'cartoons',
    yearsActive: '2009 - 2010',
    releaseYear: 2009,
    country: 'India',
    studio: 'BIG Animation / ISKCON',
    genre: ['Mythology', 'Adventure'],
    ageGroup: 'Kids / Family',
    overview:
      'The divine child of Vrindavan — butter thief, flute player, demon slayer — brought to life in the most lavish Indian animation of its era.',
    history:
      'A five-year collaboration between BIG Animation and ISKCON scholars, Little Krishna set a new visual benchmark for Indian TV animation and aired in Tamil, Hindi and English on Nick.',
    mainCharacters: [
      { name: 'Krishna', role: 'Protagonist', description: 'The playful, fearless divine child.' },
      { name: 'Balarama', role: 'Brother', description: 'Strong, protective elder brother.' },
      { name: 'Radha', role: 'Friend', description: 'Krishna\'s dearest companion.' },
    ],
    villains: [{ name: 'Kamsa\'s demons', description: 'Putana, Aghasura, Bakasura and more, sent to end Krishna.' }],
    interestingFacts: [
      'Backed by ISKCON research for scriptural accuracy.',
      'Among the most expensive Indian TV animation productions of its time.',
    ],
    whyPopular: 'Grandma\'s bedtime stories, finally with world-class visuals.',
    lifeLessons: [
      { lesson: 'Courage can be playful', psychologicalTheme: 'Fearlessness' },
      { lesson: 'Protect your people, whatever your size', psychologicalTheme: 'Dharma' },
    ],
    psychology: {
      whyWeLovedThis: 'It connected kids to stories their grandparents told — mythology made vivid and personal.',
      emotionalDevelopment: 'Cultural rooting and moral imagination through familiar epics.',
      humorStyle: 'Butter-theft mischief between heroic feats.',
      memoryAnchors: 'Festival-season telecasts and Janmashtami mornings.',
    },
    aiArtworks: [{ url: img('photo-1448375240586-882707db888b'), caption: 'A flute melody drifting over Vrindavan\'s forests.' }],
    views: 180, likes: 82, bookmarksCount: 44, readingTime: 5,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding…');

    await EntertainmentItem.deleteMany({});
    await EntertainmentItem.insertMany(cartoons);

    console.log(`✅ Seeded ${cartoons.length} archive items.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
