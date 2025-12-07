// frontend/cypress/e2e/upload.cy.ts

describe('File Upload Interface E2E Tests', () => {
  beforeEach(() => {
    // Clear local storage to ensure fresh guest session for each test
    cy.clearLocalStorage()
    // Visit the upload page
    cy.visit('/upload') // Assuming the upload page is at /upload
  })

  it('allows a logged-in user to upload a valid file and sees "processing" status', () => {
    // Mock a logged-in session. In a real app, this might involve setting cookies
    // or directly manipulating local storage/session storage to simulate login.
    // Given the task, we assume the UI for logged-in users won't show the guest limit warning.
    cy.window().then((win) => {
      win.localStorage.setItem(
        'supabase.auth.token',
        '{"some_token": "mock_token"}',
      )
    })
    cy.reload() // Reload to pick up the mocked session

    cy.get('h1').should('contain', 'Upload Your Lecture Notes')
    cy.get('[aria-label="file upload area"]').should('be.visible')

    // Mock the backend upload response
    cy.intercept('POST', '/api/v1/documents/upload', {
      statusCode: 202,
      body: {
        document_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        message:
          'File upload initiated successfully. Processing will begin shortly.',
      },
    }).as('uploadFile')

    // Create a dummy PDF file
    cy.fixture('test_file.pdf', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'valid_lecture.pdf',
        mimeType: 'application/pdf',
      })
    })

    cy.get('[aria-label="file upload area"]').contains('valid_lecture.pdf')
    cy.get('[aria-label="file upload area"]').contains('application/pdf')

    // Trigger upload (if there was an explicit upload button, we'd click it)
    // Since it's automatic on file select/drop, we just wait for the intercept.
    cy.wait('@uploadFile')

    cy.get('p').should('contain', 'Uploading file...')
    cy.get('p').should(
      'contain',
      'File uploaded successfully! Document ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    )
  })

  it('allows a guest user to upload a valid file within the limit', () => {
    // Initial guest state
    cy.get('h1').should('contain', 'Upload Your Lecture Notes')
    cy.get('[aria-label="file upload area"]').should('be.visible')
    cy.get('p').should(
      'contain',
      'As a guest, you have 2 free uploads remaining.',
    )

    // Mock the backend upload response
    cy.intercept('POST', '/api/v1/documents/upload', {
      statusCode: 202,
      body: {
        document_id: 'b1cde123-4f56-7890-abcd-ef1234567890',
        message:
          'File upload initiated successfully. Processing will begin shortly.',
      },
    }).as('uploadFile')

    cy.fixture('test_file.txt', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'valid_notes.txt',
        mimeType: 'text/plain',
      })
    })

    cy.get('[aria-label="file upload area"]').contains('valid_notes.txt')
    cy.wait('@uploadFile')
    cy.get('p').should('contain', 'File uploaded successfully!')
    cy.get('p').should(
      'contain',
      'As a guest, you have 1 free uploads remaining.',
    ) // Limit reduced
  })

  it('prompts a guest user to register/login after exceeding the upload limit', () => {
    // Set local storage to simulate one upload already used (from a clean slate of 2)
    cy.clearLocalStorage()
    cy.get('p').should(
      'contain',
      'As a guest, you have 2 free uploads remaining.',
    )

    // First upload (within limit)
    cy.intercept('POST', '/api/v1/documents/upload', {
      statusCode: 202,
      body: {
        document_id: 'c2def456-7890-1234-5678-90abcdef1234',
        message:
          'File upload initiated successfully. Processing will begin shortly.',
      },
    }).as('uploadFile1')

    cy.fixture('test_file.docx', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'doc1.docx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    })
    cy.wait('@uploadFile1')
    cy.get('p').should('contain', 'File uploaded successfully!')
    cy.get('p').should(
      'contain',
      'As a guest, you have 1 free uploads remaining.',
    )

    // Second upload (reaches limit)
    cy.intercept('POST', '/api/v1/documents/upload', {
      statusCode: 202,
      body: {
        document_id: 'd3efg789-0123-4567-890a-bcdef1234567',
        message:
          'File upload initiated successfully. Processing will begin shortly.',
      },
    }).as('uploadFile2')

    cy.fixture('test_file.pdf', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'doc2.pdf',
        mimeType: 'application/pdf',
      })
    })
    cy.wait('@uploadFile2')
    cy.get('p').should('contain', 'File uploaded successfully!')
    cy.get('div[role="alert"]').should('contain', 'Free Upload Limit Reached!')
    cy.get('div[role="alert"]').should(
      'contain',
      'Please log in or register to continue uploading files.',
    )

    // Attempt third upload (exceeds limit)
    // The UI should prevent this, but if the `alert` from page.tsx is triggered, we check for it.
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Please log in or register to continue uploading.')
    })
    cy.fixture('test_file.txt', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'doc3.txt',
        mimeType: 'text/plain',
      })
    })
  })

  it('simulates uploading an unsupported file type and verifies error message', () => {
    cy.intercept('POST', '/api/v1/documents/upload', {
      statusCode: 400,
      body: {
        detail:
          'Unsupported file type: image/jpeg. Allowed types are: application/pdf, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    }).as('uploadFile')

    cy.fixture('test_image.jpg', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
      })
    })

    cy.get('[aria-label="file upload area"]').contains('image.jpg')
    cy.wait('@uploadFile')
    cy.get('p').should('contain', 'Unsupported file type: image/jpeg')
    cy.get('p').should(
      'contain',
      'Upload failed: Unsupported file type: image/jpeg. Allowed types are: application/pdf, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
  })

  it('simulates uploading an oversized file and verifies error message', () => {
    cy.intercept('POST', '/api/v1/documents/upload', {
      statusCode: 400,
      body: {
        detail: 'File size exceeds limit. Max size is 20MB.',
      },
    }).as('uploadFile')

    // Create a dummy file larger than 20MB
    const twentyOneMB = 21 * 1024 * 1024
    cy.get('input[type="file"]').then((input) => {
      const blob = Cypress.Blob.arrayBufferToBlob(
        new ArrayBuffer(twentyOneMB),
        'application/pdf',
      )
      const file = new File([blob], 'oversized.pdf', {
        type: 'application/pdf',
      })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      cy.wrap(input).trigger('change', { force: true })
    })

    cy.get('[aria-label="file upload area"]').contains('oversized.pdf')
    cy.wait('@uploadFile')
    cy.get('p').should('contain', 'File size exceeds limit. Max size is 20MB.')
    cy.get('p').should(
      'contain',
      'Upload failed: File size exceeds limit. Max size is 20MB.',
    )
  })
})
