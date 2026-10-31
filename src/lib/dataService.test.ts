import { describe, expect, it } from 'vitest';
import { loadSchemes, saveLocalSchemeCatalog, uploadWalletFile } from './dataService';
import { getSchemes, MAX_WALLET_DOCUMENTS } from './mockData';

describe('local scheme catalogue editing', () => {
  it('persists local edits and makes Explore use this browser catalogue', async () => {
    const original = getSchemes();
    const updated = original.slice(0, 1);
    updated[0] = { ...updated[0], name: 'Locally updated scheme' };

    saveLocalSchemeCatalog(updated);

    const result = await loadSchemes();

    expect(result.source).toBe('local');
    expect(result.schemes).toEqual(updated);
    expect(result.notice).toBeNull();
  });
});

describe('wallet document limit', () => {
  it('rejects adding a seventh document', async () => {
    localStorage.setItem('bb_wallet_docs', JSON.stringify(
      Array.from({ length: MAX_WALLET_DOCUMENTS }, (_, index) => ({
        id: `doc-${index}`,
        document_type: `type-${index}`,
        document_name: `document-${index}.pdf`,
        uploaded_at: '2026-10-30',
        file_path: `doc-${index}`,
      })),
    ));

    await expect(
      uploadWalletFile('new_document', new File(['content'], 'new.pdf', { type: 'application/pdf' })),
    ).rejects.toThrow('up to 6 documents');

    localStorage.removeItem('bb_wallet_docs');
  });
});
