import { CookiesTokenStorage } from '../token-storages/cookies-token-storage';
import { InMemoryTokenStorage } from '../token-storages/in-memory-token-storage';
import { LocalStorageTokenStorage } from '../token-storages/local-storage-token-storage';
import { SessionStorageTokenStorage } from '../token-storages/session-storage-token-storage';

export const PREDEFINED_TOKEN_STORAGES = [
  new CookiesTokenStorage(),
  new LocalStorageTokenStorage(),
  new SessionStorageTokenStorage(),
  new InMemoryTokenStorage(),
];
