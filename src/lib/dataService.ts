import {
  getProfile,
  getSchemes,
  getWalletDocuments,
  saveProfile,
  saveSchemes,
  saveWalletDocuments,
  MAX_WALLET_DOCUMENTS,
  type Scheme,
  type UserProfile,
  type WalletDoc,
} from '@/lib/mockData';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const LOCAL_SCHEME_CATALOG_OVERRIDE_KEY = 'serve_sahayak_local_scheme_catalog_override';

export type SchemeCatalogResult = {
  schemes: Scheme[];
  source: 'local';
  notice: string | null;
};

export const saveLocalSchemeCatalog = (schemes: Scheme[]): void => {
  try {
    saveSchemes(schemes);
    window.localStorage.setItem(LOCAL_SCHEME_CATALOG_OVERRIDE_KEY, 'true');
  } catch (error) {
    throw new Error(error instanceof Error ? `Unable to save schemes in this browser: ${error.message}` : 'Unable to save schemes in this browser.');
  }
};

export const loadSchemes = async (): Promise<SchemeCatalogResult> => {
  return {
    schemes: getSchemes(),
    source: 'local',
    notice: null,
  };
};

const openDemoFileStore = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open('serve-sahayak-wallet', 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains('documents')) {
      request.result.createObjectStore('documents');
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Unable to open local document storage.'));
});

const storeDemoFile = async (id: string, file: File) => {
  const database = await openDemoFileStore();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('documents', 'readwrite');
    transaction.objectStore('documents').put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Unable to save the uploaded file.'));
  });
  database.close();
};

const removeDemoFile = async (id: string) => {
  const database = await openDemoFileStore();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('documents', 'readwrite');
    transaction.objectStore('documents').delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Unable to remove the uploaded file.'));
  });
  database.close();
};

export const loadProfile = async (): Promise<UserProfile> => getProfile();

export const persistProfile = async (profile: UserProfile) => {
  saveProfile(profile);
};

export const loadWallet = async (): Promise<WalletDoc[]> => getWalletDocuments();

export const uploadWalletFile = async (documentType: string, file: File): Promise<WalletDoc> => {
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    throw new Error('Choose a non-empty PDF or image no larger than 10 MB.');
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Supported document formats are PDF, JPG, and PNG.');
  }

  const currentDocuments = getWalletDocuments();
  const previous = currentDocuments.find((entry) => entry.document_type === documentType);
  if (!previous && currentDocuments.length >= MAX_WALLET_DOCUMENTS) {
    throw new Error(`Your wallet can hold up to ${MAX_WALLET_DOCUMENTS} documents. Remove a document or replace an existing one to continue.`);
  }
  const id = `doc-${crypto.randomUUID()}`;
  await storeDemoFile(id, file);
  const document: WalletDoc = {
    id,
    document_type: documentType,
    document_name: file.name,
    uploaded_at: new Date().toISOString(),
    file_path: id,
  };

  try {
    saveWalletDocuments([
      document,
      ...getWalletDocuments().filter((entry) => entry.document_type !== documentType),
    ]);
  } catch (error) {
    await removeDemoFile(id);
    throw error;
  }

  if (previous) {
    try {
      await removeDemoFile(previous.id);
    } catch (error) {
      console.error('A replaced local document could not be cleaned up:', error);
    }
  }
  return document;
};

export const removeWalletFile = async (document: WalletDoc) => {
  await removeDemoFile(document.id);
  saveWalletDocuments(getWalletDocuments().filter((entry) => entry.id !== document.id));
};

export const getWalletFileUrl = async (document: WalletDoc): Promise<string> => {
  const database = await openDemoFileStore();
  const file = await new Promise<File | undefined>((resolve, reject) => {
    const request = database.transaction('documents').objectStore('documents').get(document.id);
    request.onsuccess = () => resolve(request.result as File | undefined);
    request.onerror = () => reject(request.error || new Error('Unable to open this document.'));
  });
  database.close();
  if (!file) throw new Error('The saved local file could not be found.');
  return URL.createObjectURL(file);
};
