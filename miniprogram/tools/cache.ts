import { caching } from 'cache-manager';

const memoryCache = caching('memory', {
  max: 50,
  ttl: 30000,
});

export default memoryCache;
