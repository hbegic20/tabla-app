import type { QuizQuestion } from '../types'

export const ENGLISH_QUIZ: QuizQuestion[] = [
  {
    q: 'Which is correct?',
    options: [
      'I have 25 years.',
      'I am 25 years old.',
      'I has 25 years old.',
      "I'm having 25 years.",
    ],
    correct: 1,
    explain: "In English, age uses 'to be': I am 25 years old — not 'to have', unlike Bosnian 'imam 25 godina'.",
  },
  {
    q: 'Choose the correct sentence:',
    options: [
      'She is married with a doctor.',
      'She is married to a doctor.',
      'She is married on a doctor.',
      'She married with a doctor.',
    ],
    correct: 1,
    explain: "'Married to' is the fixed preposition in English, even though Bosnian uses 'udana za'.",
  },
  {
    q: 'Which is correct?',
    options: [
      "I'm agree with you.",
      'I agree with you.',
      "I'm agreeing with you.",
      'I am agree you.',
    ],
    correct: 1,
    explain: "'Agree' is a normal verb, not used with 'to be' — say 'I agree', not 'I'm agree'.",
  },
  {
    q: 'Pick the right option:',
    options: [
      'Depends of the weather.',
      'It depends of the weather.',
      'It depends on the weather.',
      "It's depend on the weather.",
    ],
    correct: 2,
    explain: "The fixed phrase is 'depends on', not 'depends of'.",
  },
  {
    q: 'Which sentence is correct?',
    options: [
      'I look forward to meet you.',
      'I look forward to meeting you.',
      'I look forward meeting you.',
      "I'm looking forward meet you.",
    ],
    correct: 1,
    explain: "After 'look forward to', use the -ing form: 'to meeting', because here 'to' is a preposition, not part of an infinitive.",
  },
  {
    q: 'Choose correctly:',
    options: [
      'He explained me the problem.',
      'He explained to me the problem.',
      'He explained me about the problem.',
      'He explained the problem to me.',
    ],
    correct: 3,
    explain: "'Explain' takes an object then 'to' + person: 'explain the problem to me' — you can't say 'explain me'.",
  },
  {
    q: 'Which is right?',
    options: [
      "I'm working here since 2019.",
      'I work here since 2019.',
      'I have worked here since 2019.',
      'I was working here since 2019.',
    ],
    correct: 2,
    explain: "'Since + a point in time' needs the present perfect: 'I have worked here since 2019'.",
  },
  {
    q: 'Pick the correct sentence:',
    options: [
      "It's very important thing.",
      "It's a very important thing.",
      "It's very important a thing.",
      'Is very important thing.',
    ],
    correct: 1,
    explain: "Singular countable nouns need an article: 'a very important thing'. Bosnian has no articles, so this one's easy to forget.",
  },
  {
    q: 'Which is correct?',
    options: [
      "I'm boring in this meeting.",
      "I'm bored in this meeting.",
      "I'm boring of this meeting.",
      'I bore in this meeting.',
    ],
    correct: 1,
    explain: "'Bored' describes how you feel; 'boring' describes the thing causing the feeling. The meeting is boring, you are bored.",
  },
  {
    q: 'Choose the right option:',
    options: [
      "Let's discuss about the plan.",
      "Let's discuss the plan.",
      "Let's discuss for the plan.",
      "Let's discussing the plan.",
    ],
    correct: 1,
    explain: "'Discuss' already includes the meaning of 'about' — no preposition needed: 'discuss the plan'.",
  },
  {
    q: 'Which is correct?',
    options: [
      'I need to go in the city.',
      'I need to go to the city.',
      'I need to go on the city.',
      'I need go to the city.',
    ],
    correct: 1,
    explain: "Movement toward a place uses 'to': 'go to the city', not 'in the city' (which describes location, not direction).",
  },
  {
    q: 'Pick the correct sentence:',
    options: [
      'Everybody are here.',
      'Everybody is here.',
      'Everybody were here.',
      'Everybody have here.',
    ],
    correct: 1,
    explain: "'Everybody' is grammatically singular in English, so it takes 'is', even though it refers to many people.",
  },
]

export const ARCH_QUIZ: QuizQuestion[] = [
  {
    q: 'What does REST stand for, and what best describes it?',
    options: [
      'A specific programming language',
      'An architectural style for designing networked APIs using standard HTTP methods',
      'A database engine',
      'A type of message queue',
    ],
    correct: 1,
    explain: 'REST (Representational State Transfer) is a style for structuring APIs around resources and standard HTTP verbs (GET, POST, PUT, DELETE), not a language or product.',
  },
  {
    q: 'What is the main purpose of caching?',
    options: [
      'To permanently store all application data',
      'To reduce load and latency by reusing previously computed or fetched results',
      'To replace the database entirely',
      'To encrypt data in transit',
    ],
    correct: 1,
    explain: "A cache stores fast-access copies of data so repeated requests don't have to hit a slower source (like a database) every time.",
  },
  {
    q: "In a typical relational database, what does 'normalization' aim to reduce?",
    options: [
      'Query speed',
      'Data redundancy and inconsistency',
      'The number of tables',
      'Network latency',
    ],
    correct: 1,
    explain: 'Normalization organizes data to avoid storing the same information in multiple places, reducing redundancy and the risk of inconsistent updates.',
  },
  {
    q: "What's a key difference between a monolith and microservices?",
    options: [
      "Monoliths can't use databases",
      'Microservices split an app into independently deployable services; a monolith is one deployable unit',
      'Microservices are always faster',
      'Monoliths only run on one server ever',
    ],
    correct: 1,
    explain: 'The core distinction is deployment and boundaries: microservices are separate, independently deployable services communicating over a network; a monolith ships as a single unit.',
  },
  {
    q: 'Why would you use a message queue (like RabbitMQ or SQS) between services?',
    options: [
      'To make services talk synchronously and instantly',
      'To decouple services and let them process work asynchronously and reliably',
      'To store user passwords',
      'To replace HTTP entirely',
    ],
    correct: 1,
    explain: 'Queues let a producer hand off work without waiting for the consumer, smoothing out spikes and letting each side fail or scale independently.',
  },
  {
    q: "What does 'horizontal scaling' mean?",
    options: [
      'Making a single server more powerful (more CPU/RAM)',
      'Adding more machines/instances to share the load',
      'Reducing the number of servers',
      'Increasing database columns',
    ],
    correct: 1,
    explain: 'Horizontal scaling adds more instances running in parallel (often behind a load balancer), as opposed to vertical scaling, which upgrades a single machine.',
  },
  {
    q: 'What is the main job of a load balancer?',
    options: [
      'To compress images',
      'To distribute incoming requests across multiple servers',
      'To store session data permanently',
      'To write logs to disk',
    ],
    correct: 1,
    explain: 'A load balancer spreads traffic across several backend instances so no single server gets overwhelmed, and can reroute around failed instances.',
  },
  {
    q: "What's the difference between authentication and authorization?",
    options: [
      'They are the same thing',
      "Authentication verifies who you are; authorization decides what you're allowed to do",
      'Authorization verifies identity; authentication grants permissions',
      'Neither applies to APIs',
    ],
    correct: 1,
    explain: 'Authentication = proving identity (e.g. login). Authorization = deciding what an authenticated identity is permitted to access or do.',
  },
  {
    q: 'Why use an index on a database column?',
    options: [
      'To make writes faster in every case',
      'To speed up lookups/queries on that column, at some cost to write speed',
      'To encrypt the column',
      'Indexes have no effect on performance',
    ],
    correct: 1,
    explain: 'An index lets the database find matching rows quickly without scanning the whole table, though it adds overhead to inserts/updates on that column.',
  },
  {
    q: "What is 'idempotency' in the context of an API?",
    options: [
      'An API that only works once',
      'Calling the same request multiple times has the same effect as calling it once',
      'A type of encryption',
      'A synonym for authentication',
    ],
    correct: 1,
    explain: "An idempotent operation (like a standard PUT or DELETE) can be safely retried — repeating it doesn't cause extra side effects, which matters a lot for reliability over unreliable networks.",
  },
  {
    q: "What's a common reason to introduce a CDN (Content Delivery Network)?",
    options: [
      'To run your database',
      'To serve static assets from servers geographically closer to users, reducing latency',
      'To replace your backend logic',
      'To manage user authentication',
    ],
    correct: 1,
    explain: 'A CDN caches and serves static content (images, JS, CSS) from edge locations near the user, cutting load times and reducing load on your origin server.',
  },
  {
    q: "In CI/CD, what does 'CI' (Continuous Integration) mainly refer to?",
    options: [
      'Automatically deploying to production on every commit with no checks',
      'Frequently merging code changes and automatically building/testing them',
      'Manually testing code once a month',
      'A cloud hosting provider',
    ],
    correct: 1,
    explain: 'CI is the practice of integrating code changes frequently and running automated builds/tests on each change, catching problems early.',
  },
]
