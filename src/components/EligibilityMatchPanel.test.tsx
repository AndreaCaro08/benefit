import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EligibilityMatchPanel from './EligibilityMatchPanel';
import { evaluateSchemeMatch, getProfile, getSchemes } from '@/lib/mockData';

const publishedScheme = {
  ...getSchemes()[0],
  is_published: true,
  verification_status: 'published' as const,
  last_verified_at: '2026-10-30',
  required_documents: ['aadhaar_card'],
  eligibility_rules: [{
    field: 'age',
    operator: 'gte' as const,
    value: '18',
    source_url: 'https://official.gov.in/scheme',
  }],
};

describe('EligibilityMatchPanel', () => {
  it('shows eligibility and document completion separately and uploads missing documents', () => {
    const onUpload = vi.fn();
    const match = evaluateSchemeMatch(
      publishedScheme,
      { ...getProfile(), age: 24 },
      [],
    );

    render(
      <EligibilityMatchPanel
        scheme={publishedScheme}
        match={match}
        walletDocs={[]}
        language="en"
        uploadingDocumentId={null}
        onUpload={onUpload}
        onUpdateProfile={() => {}}
      />,
    );

    expect(screen.getByText('Eligibility match')).toBeInTheDocument();
    expect(screen.getByText('Document-based eligibility estimate (max 80%)')).toBeInTheDocument();
    expect(screen.getByText('Document completion')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toHaveTextContent('None of the required documents are in your wallet yet; the document estimate is 0%.');
    expect(screen.getByText('Age at least 18')).toBeInTheDocument();
    expect(screen.getAllByText('Aadhaar Card').length).toBeGreaterThan(0);
    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.getByText(/Required documents: 0\/1/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Upload document' }));
    expect(onUpload).toHaveBeenCalledWith('aadhaar_card');
  });

  it('counts uploaded documents, separates pending verification, and avoids duplicate upload prompts', () => {
    const scheme = { ...publishedScheme, required_documents: ['aadhaar_card', 'income_certificate'] };
    const walletDocs = [{
      id: 'doc-1',
      document_type: 'aadhaar_card',
      document_name: 'aadhaar.pdf',
      uploaded_at: '2026-10-30',
      file_path: 'doc-1',
    }];
    const match = evaluateSchemeMatch(scheme, { ...getProfile(), age: 24 }, ['aadhaar_card']);

    render(
      <EligibilityMatchPanel
        scheme={scheme}
        match={match}
        walletDocs={walletDocs}
        language="en"
        uploadingDocumentId={null}
        onUpload={() => {}}
        onUpdateProfile={() => {}}
      />,
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText(/Required documents: 1\/2/)).toBeInTheDocument();
    expect(screen.getByText('Uploaded documents (1)')).toBeInTheDocument();
    expect(screen.getByText('Missing documents (1)')).toBeInTheDocument();
    expect(screen.getByText('Pending verification (1)')).toBeInTheDocument();
    expect(screen.getByText(/aadhaar\.pdf · Pending verification/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Upload document' })).toHaveLength(1);
    expect(screen.getAllByText('Uploaded').length).toBeGreaterThan(0);
  });

  it('disables missing-document upload when the six-document wallet limit is reached', () => {
    const walletDocs = Array.from({ length: 6 }, (_, index) => ({
      id: `wallet-${index}`,
      document_type: `other-${index}`,
      document_name: `document-${index}.pdf`,
      uploaded_at: '2026-10-30',
      file_path: `wallet-${index}`,
    }));
    const match = evaluateSchemeMatch(publishedScheme, { ...getProfile(), age: 24 }, []);

    render(
      <MemoryRouter>
        <EligibilityMatchPanel
          scheme={publishedScheme}
          match={match}
          walletDocs={walletDocs}
          language="en"
          uploadingDocumentId={null}
          onUpload={() => {}}
          onUpdateProfile={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Your wallet holds up to 6 documents/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload document' })).toBeDisabled();
  });

  it('localizes result and document labels in Tamil', () => {
    const match = evaluateSchemeMatch(publishedScheme, { ...getProfile(), age: 24 }, ['aadhaar_card']);

    render(
      <EligibilityMatchPanel
        scheme={publishedScheme}
        match={match}
        walletDocs={[{
          id: 'doc-1',
          document_type: 'aadhaar_card',
          document_name: 'aadhaar.pdf',
          uploaded_at: '2026-10-30',
          file_path: 'doc-1',
        }]}
        language="ta"
        uploadingDocumentId={null}
        onUpload={() => {}}
        onUpdateProfile={() => {}}
      />,
    );

    expect(screen.getByText('உங்கள் தகுதி சரிபார்ப்பு')).toBeInTheDocument();
    expect(screen.getByText('தகுதி பொருத்தம்')).toBeInTheDocument();
    expect(screen.getAllByText('ஆதார் அட்டை').length).toBeGreaterThan(0);
    expect(screen.getByText('ஆவண நிறைவு')).toBeInTheDocument();
    expect(screen.getAllByText(/சரிபார்ப்பு நிலுவையில்/).length).toBeGreaterThan(0);
  });

  it('shows document matching for draft schemes without implying official verification', () => {
    const draftScheme = getSchemes()[0];
    const match = evaluateSchemeMatch(draftScheme, getProfile(), []);

    render(
      <EligibilityMatchPanel
        scheme={draftScheme}
        match={match}
        walletDocs={[]}
        language="en"
        uploadingDocumentId={null}
        onUpload={() => {}}
        onUpdateProfile={() => {}}
      />,
    );

    expect(screen.getAllByText('—')).toHaveLength(1);
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.queryByText(/This estimate uses unverified example documents/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Missing').length).toBeGreaterThan(0);
  });

  it('labels manually entered draft document lists as unverified estimates', () => {
    const draftScheme = {
      ...getSchemes()[0],
      required_documents: ['aadhaar_card', 'income_certificate'],
    };
    const match = evaluateSchemeMatch(draftScheme, getProfile(), ['aadhaar_card']);

    render(
      <EligibilityMatchPanel
        scheme={draftScheme}
        match={match}
        walletDocs={[{
          id: 'doc-1',
          document_type: 'aadhaar_card',
          document_name: 'aadhaar.pdf',
          uploaded_at: '2026-10-30',
          file_path: 'doc-1',
        }]}
        language="en"
        uploadingDocumentId={null}
        onUpload={() => {}}
        onUpdateProfile={() => {}}
      />,
    );

    expect(screen.getByText(/Required documents: 1\/2/)).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(1);
    expect(screen.queryByText(/This estimate uses unverified example documents/)).not.toBeInTheDocument();
  });
});
