# 🌉 Benefit Bridge

Benefit Bridge is an AI-powered civic-tech platform designed to help citizens discover welfare schemes, understand eligibility, manage their documents, and navigate the application journey more confidently.

This project is a practical, user-friendly solution for government benefit discovery and guidance. It is not a government authority portal and does not guarantee eligibility or approval.

---

## 1. Project Objective

Benefit Bridge helps citizens in India, especially Tamil Nadu residents, find relevant welfare opportunities, understand their documentation needs, and identify schemes they may be eligible for.

The platform must support:

- Discovery of relevant central, state and local welfare schemes
- Multilingual access in English and Tamil
- Digital document management through a secure wallet
- Eligibility matching using verified user information and rule-based logic
- AI-powered guidance for scheme-related questions
- Transparency around eligibility gaps, missing documents and next steps
- Admin management for scheme catalog updates and content review

---

## 2. Core Product Requirements

### A. Public Website

The website should include:

- Responsive navbar and landing page
- Hero section with CTA: “Find the Support You Deserve.”
- Scheme search and category browsing
- How-it-works section
- Featured schemes and trust-building content
- Language selector for English and Tamil
- Login / Sign Up actions
- FAQ, privacy and help sections
- Footer with relevant public resources and support links

### B. Scheme Discovery

Users should be able to:

- Search schemes by name, benefit, keywords or category
- Filter by government level, category, region and beneficiary type
- Sort and paginate scheme listings
- View scheme cards with summary, category and verified source
- Access detailed eligibility and benefits information
- Save schemes for later review

### C. Scheme Details

Each scheme page should include:

- Scheme name and department
- Government level and region
- Description and benefit summary
- Eligibility criteria
- Mandatory and conditional requirements
- Required documents
- Application process and deadlines if available
- Official application links and source references
- Benefits and important notes
- Save Scheme and Check My Match actions

### D. Eligibility Checker

The eligibility engine should:

- Compare user profile data against scheme rules
- Estimate match strength and explain the reasoning
- Highlight missing requirements and documents
- Clearly separate verified facts from unknown data
- Avoid making unverifiable claims or inaccurate approvals

### E. Document Wallet

Users must be able to:

- Upload and store supporting documents securely
- View documents in a digital wallet
- Track document status and missing items
- Reuse uploaded proof for scheme and eligibility checks
- Maintain privacy and avoid unnecessary sensitive data collection

### F. AI Chatbot

The chatbot should:

- Help users understand schemes and eligibility terms
- Explain required documents and next steps
- Guide users through application-related questions
- Answer general scheme queries in a supportive and accurate way
- Avoid inventing eligibility decisions or approvals

### G. Multilingual Support

The platform must support:

- English and Tamil throughout the interface
- Consistent translation of labels, scheme details and help content
- Accessible text and readable formatting across devices

### H. Admin Dashboard

Admins should have a way to:

- Manage schemes and categories
- Review eligibility rules and descriptions
- Update official sources and application links
- Moderate content and verify records
- Monitor active scheme data and content quality

---

## 3. Technical Requirements

### Frontend

- React + Vite
- TypeScript preferred for new logic
- Tailwind CSS for styling
- shadcn/ui-style reusable components where appropriate
- React Router for page navigation
- Responsive, mobile-first design

### Data Layer

- The prototype has no Supabase or other database connection.
- Scheme records and profile data are saved in browser local storage.
- Wallet files are saved in browser IndexedDB and do not leave the device.
- Admin scheme changes apply only to the current browser and are not shared across devices.
- Clearing browser site data removes locally saved records and files.

### AI and OCR

- OCR support for uploaded certificate images and PDFs
- Manual review and correction of extracted data
- Deterministic eligibility rules as the primary recommendation engine
- AI used to explain results and assist users, not to invent eligibility decisions
- Secrets and API keys kept on the backend, never exposed in frontend code

---

## 4. Functional User Flows

### User Journey 1: Discover a Scheme

1. User opens the app and selects a language.
2. User searches or browses available scheme categories.
3. User filters schemes and views card summaries.
4. User opens a scheme detail page.
5. User reviews eligibility and documents required.
6. User saves the scheme or checks their match.

### User Journey 2: Check Eligibility

1. User fills in a basic personal and household profile on this device.
2. User uploads relevant documents to the local wallet if available.
3. System analyzes the profile against verified scheme rules.
4. App shows an application-readiness percentage, reasons and missing requirements.
5. User receives clear guidance on what to do next.

### User Journey 3: Use the AI Assistant

1. User opens the chatbot from a scheme page or dashboard.
2. User asks a question about eligibility, required documents or steps.
3. Bot responds with helpful scheme guidance and next-step suggestions.
4. User can continue with document verification or scheme review.

---

## 5. Non-Functional Requirements

- Secure handling of personal and document data
- Clear privacy and consent language
- Accessible UI for keyboard and screen-reader users
- Mobile-first responsive design
- Fast loading for browsing and filtering
- Trustworthy content with official source links and verified information labels
- Transparent handling of unknown or missing data
- Production-ready state management and error handling

---

## 6. Success Criteria

The project is successful when it can:

- help citizens discover relevant benefit schemes quickly
- explain eligibility clearly and accurately
- reduce confusion around document requirements
- support both English and Tamil users
- provide a secure document wallet experience
- show transparent matching logic instead of hidden decisions
- give users a practical next-step path towards application

---

## 7. Project Scope Notes

This platform is intended as a guidance and recommendation tool for welfare scheme discovery. It should never claim to approve benefits or guarantee eligibility. All results must be presented as informational guidance backed by documented criteria and official sources.

---

## 8. Run Locally

```bash
npm install
npm run dev
```

For the backend and AI services, configure environment variables separately and keep all sensitive credentials on the server side.
