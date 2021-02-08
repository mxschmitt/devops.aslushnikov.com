// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

const animals = [
  'aardvark',
  'albatross',
  'alligator',
  'alpaca',
  'ant',
  'anteater',
  'antelope',
  'ape',
  'armadillo',
  'baboon',
  'badger',
  'barracuda',
  'bat',
  'bear',
  'beaver',
  'bee',
  'binturong',
  'bird',
  'aves',
  'bison',
  'bluebird',
  'boar',
  'bobcat',
  'buffalo',
  'butterfly',
  'camel',
  'capybara',
  'caracal',
  'caribou',
  'cassowary',
  'cat',
  'caterpillar',
  'cattle',
  'chameleon',
  'chamois',
  'cheetah',
  'chicken',
  'chimpanzee',
  'chinchilla',
  'chough',
  'coati',
  'cobra',
  'cockroach',
  'cod',
  'cormorant',
  'cougar',
  'coyote',
  'crab',
  'crane',
  'cricket',
  'crocodile',
  'crow',
  'cuckoo',
  'curlew',
  'deer',
  'degu',
  'dhole',
  'dingo',
  'dinosaur',
  'dog',
  'dogfish',
  'dolphin',
  'donkey',
  'dotterel',
  'dove',
  'dragonfly',
  'duck',
  'dugong',
  'dunlin',
  'eagle',
  'echidna',
  'eel',
  'eland',
  'elephant',
  'elephant seal',
  'elk',
  'emu',
  'falcon',
  'ferret',
  'finch',
  'fish',
  'flamingo',
  'fly',
  'fox',
  'frog',
  'gaur',
  'gazelle',
  'gecko',
  'gerbil',
  'giant panda',
  'giraffe',
  'gnat',
  'gnu',
  'goat',
  'goldfinch',
  'goosander',
  'goose',
  'gorilla',
  'goshawk',
  'grasshopper',
  'grouse',
  'guanaco',
  'guinea fowl',
  'guinea pig',
  'gull',
  'hamster',
  'hare',
  'hawk',
  'hedgehog',
  'hermit crab',
  'heron',
  'herring',
  'hippopotamus',
  'hoatzin',
  'hoopoe',
  'hornet',
  'horse',
  'human',
  'hummingbird',
  'hyena',
  'ibex',
  'ibis',
  'iguana',
  'impala',
  'jackal',
  'jaguar',
  'jay',
  'jellyfish',
  'jerboa',
  'kangaroo',
  'kingfisher',
  'kinkajou',
  'koala',
  'komodo dragon',
  'kookaburra',
  'kouprey',
  'kudu',
  'lapwing',
  'lark',
  'lemur',
  'leopard',
  'lion',
  'lizard',
  'llama',
  'lobster',
  'locust',
  'loris',
  'louse',
  'lynx',
  'lyrebird',
  'macaque',
  'macaw',
  'magpie',
  'mallard',
  'mammoth',
  'manatee',
  'mandrill',
  'marmoset',
  'marmot',
  'meerkat',
  'mink',
  'mole',
  'mongoose',
  'monkey',
  'moose',
  'mosquito',
  'mouse',
  'myna',
  'narwhal',
  'newt',
  'nightingale',
  'nine-banded armadillo',
  'octopus',
  'okapi',
  'opossum',
  'oryx',
  'ostrich',
  'otter',
  'owl',
  'oyster',
  'panther',
  'parrot',
  'panda',
  'partridge',
  'peafowl',
  'pelican',
  'penguin',
  'pheasant',
  'pig',
  'pigeon',
  'pika',
  'polar bear',
  'pony',
  'porcupine',
  'porpoise',
  'prairie dog',
  'pug',
  'quail',
  'quelea',
  'quetzal',
  'rabbit',
  'raccoon',
  'ram',
  'rat',
  'raven',
  'red deer',
  'red panda',
  'reindeer',
  'rhea',
  'rhinoceros',
  'rook',
  'salamander',
  'salmon',
  'sand dollar',
  'sandpiper',
  'sardine',
  'sea lion',
  'seahorse',
  'seal',
  'shark',
  'sheep',
  'shrew',
  'siamang',
  'skunk',
  'sloth',
  'snail',
  'snake',
  'spider',
  'squid',
  'squirrel',
  'starling',
  'stegosaurus',
  'swan',
  'tamarin',
  'tapir',
  'tarsier',
  'termite',
  'tiger',
  'toad',
  'toucan',
  'turaco',
  'turkey',
  'turtle',
  'vicuña',
  'vinegaroon',
  'viper',
  'vulture',
  'wallaby',
  'walrus',
  'wasp',
  'water buffalo',
  'waxwing',
  'weasel',
  'whale',
  'wobbegong',
  'wolf',
  'wolverine',
  'wombat',
  'woodpecker',
  'worm',
  'wren',
  'yak',
  'zebra'
];

const adjectives = [
  'adaptable',
  'adventurous',
  'affable',
  'affectionate',
  'agreeable',
  'ambitious',
  'amiable',
  'amicable',
  'amusing',
  'brave',
  'bright',
  'broad-minded',
  'calm',
  'careful',
  'charming',
  'communicative',
  'compassionate',
  'conscientious',
  'considerate',
  'convivial',
  'courageous',
  'courteous',
  'creative',
  'decisive',
  'determined',
  'diligent',
  'diplomatic',
  'discreet',
  'dynamic',
  'easygoing',
  'emotional',
  'energetic',
  'enthusiastic',
  'exuberant',
  'fair-minded',
  'faithful',
  'fearless',
  'forceful',
  'frank',
  'friendly',
  'funny',
  'generous',
  'gentle',
  'good',
  'gregarious',
  'hard-working',
  'helpful',
  'honest',
  'humorous',
  'imaginative',
  'impartial',
  'independent',
  'intellectual',
  'intelligent',
  'intuitive',
  'inventive',
  'kind',
  'loving',
  'loyal',
  'modest',
  'neat',
  'nice',
  'optimistic',
  'passionate',
  'patient',
  'persistent',
  'pioneering',
  'philosophical',
  'placid',
  'plucky',
  'polite',
  'powerful',
  'practical',
  'pro-active',
  'quick-witted',
  'quiet',
  'rational',
  'reliable',
  'reserved',
  'resourceful',
  'romantic',
  'self-confident',
  'self-disciplined',
  'sensible',
  'sensitive',
  'shy',
  'sincere',
  'sociable',
  'straightforward',
  'sympathetic',
  'thoughtful',
  'tidy',
  'tough',
  'unassuming',
  'understanding',
  'versatile',
  'warmhearted',
  'willing',
  'witty',
];

// Taken from https://stackoverflow.com/a/52171480/314883
function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

export function humanId(text) {
  return `${adjectives[cyrb53(text, 1) % adjectives.length]}-${animals[cyrb53(text, 2) % animals.length]}-${cyrb53(text, 3) % 97 + 3}`;
}