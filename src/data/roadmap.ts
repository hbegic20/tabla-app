import type { RoadmapTopic } from '../types'

export const ROADMAP_TOPICS: RoadmapTopic[] = [
  {
    id: 'http',
    title: 'HTTP & REST fundamentals',
    note: 'Methods, status codes, headers — the language every API speaks.',
  },
  {
    id: 'db',
    title: 'Databases: SQL vs NoSQL',
    note: 'When to reach for tables and joins vs documents and key-value stores.',
  },
  {
    id: 'api-design',
    title: 'API design',
    note: 'Designing endpoints, request/response shapes, versioning, pagination.',
  },
  {
    id: 'auth',
    title: 'Authentication & authorization',
    note: 'Sessions, tokens (JWT), OAuth — who you are vs what you can do.',
  },
  {
    id: 'caching',
    title: 'Caching strategies',
    note: 'In-memory caches, CDNs, cache invalidation — the classic hard problem.',
  },
  {
    id: 'queues',
    title: 'Message queues & async processing',
    note: 'Decoupling work with queues instead of doing everything synchronously.',
  },
  {
    id: 'monolith-micro',
    title: 'Monolith vs microservices',
    note: 'Trade-offs in splitting an app into independently deployed services.',
  },
  {
    id: 'scaling',
    title: 'Scalability & load balancing',
    note: 'Horizontal vs vertical scaling, load balancers, stateless services.',
  },
  {
    id: 'system-design',
    title: 'System design basics',
    note: 'Sketching a design for something like a URL shortener or a feed.',
  },
  {
    id: 'containers',
    title: 'Containers & Docker',
    note: 'Packaging an app so it runs the same everywhere.',
  },
  {
    id: 'cicd',
    title: 'CI/CD pipelines',
    note: "Automating tests and deployments so releases aren't scary.",
  },
  {
    id: 'observability',
    title: 'Observability: logs, metrics, tracing',
    note: 'Knowing what your backend is actually doing in production.',
  },
]
