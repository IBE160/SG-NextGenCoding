# ibe160 UX Design Specification

_Created on 2025-11-22 by BIP_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

An AI-powered web application that transforms lecture notes into concise summaries and interactive quizzes to make learning more efficient, engaging, and help students identify knowledge gaps. The core value is the instant transformation of dense notes into clear summaries and interactive quizzes. The primary users are university and college students. Secondary users are teachers and teaching assistants.

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Chosen System:** shadcn/ui
**Version:** Latest as of document creation date.

**Rationale:** The choice of shadcn/ui aligns with the project's technical preferences (Next.js, TypeScript, Tailwind CSS) as outlined in the PRD. Its "copy-paste" model offers granular control over components, resulting in a lean bundle size and high customizability. This system also leverages Radix UI primitives, ensuring strong accessibility adherence from the outset. This choice balances rapid development with the need for a tailored and high-performance user interface.

---

## 2. Core User Experience

### 2.1 Defining Experience

The defining experience of the application is "Generating knowledge" or "Generating a new way of learning." This is achieved through the seamless transformation of user-provided lecture notes into valuable, AI-generated summaries and quizzes.

While the individual UI components for this process (file uploads, buttons) are standard, the overall experience of instant, high-quality knowledge generation is a novel interaction pattern that defines the product. The user experience must emphasize the speed and "magic" of this transformation.

### 2.2 Desired Emotional Response

Users should feel efficient, productive, engaged, and motivated. The application should evoke a feeling of being a helpful and effective learning companion.

### 2.3 Inspiration and UX Patterns

No specific inspirational apps were provided. The UX design will be based on established best practices and the defined user needs.

### 2.4 Novel UX Patterns

The core novel UX pattern is the **AI-Powered Knowledge Generation Flow**. The detailed documentation of this pattern is as follows:

- **Pattern Name:** AI-Powered Knowledge Generation Flow
- **User Goal:** To seamlessly transform lecture notes into valuable learning materials (summaries and quizzes).
- **Trigger:** Drag-and-drop or file selection for upload; button click for generation.
- **Interaction Flow:**
    1.  User uploads a file.
    2.  System provides immediate feedback on the upload status (success/error).
    3.  User selects generation settings (e.g., difficulty, length).
    4.  User clicks a "Generate" button.
    5.  System provides clear feedback that generation has started.
    6.  Upon completion, the user is presented with the generated content (summary or quiz).
- **Visual Feedback:** Clearly visible pop-ups for feedback (e.g., "Upload successful!", "Generating your quiz...").
- **States:**
    - **Default:** Ready for file upload.
    - **Uploading:** Progress indicator.
    - **Processing:** Loading indicator/animation while the AI generates content.
    - **Success:** Confirmation message and display of the generated content.
    - **Error:** Clear error message with the reason and recovery options.
- **Platform Considerations:** While the logic will be the same, the interface for mobile will be different, but this is not a focus for the MVP.
- **Accessibility:** Keyboard and screen reader support for all interactive elements.
- **Inspiration:** The interaction for generating summaries and quizzes can be inspired by conversational AI like ChatGPT, where the user provides input (the file) and receives a response (the summary/quiz).
- **Shareability:** Users should be able to share generated summaries and quizzes with others via a link or other means.


### 2.5 Core Experience Principles

**Speed:** Prioritize minimal wait times; content generation should be as fast as AI allows, with immediate feedback to the user.
**Guidance:** Provide clear instructions and helpful messages throughout the process, especially during settings configuration and error handling.
**Flexibility:** Offer intuitive controls for content generation (e.g., difficulty, length) while ensuring the AI adapts effectively to diverse user inputs.
**Feedback:** Deliver immediate, clear, and delightful visual and textual feedback for all user actions and system processes.

---

## 3. Visual Foundation

### 3.1 Color System

**Theme:** "Scholarly Slate" (Dark Theme)

**Rationale:** This theme combines the user's preference for a focused, dark background ("Focused Slate") with the clean, trustworthy feel of "Scholarly Blue." The result is a professional, accessible, and modern theme that is easy on the eyes for extended study sessions.

**Color Palette:**
- **Primary:** `#60a5fa` (A bright, accessible blue for primary actions)
- **Secondary:** `#818cf8` (A complementary blue for secondary actions)
- **Background:** `#1f2937` (A dark slate gray)
- **Foreground:** `#f9fafb` (White/light gray for text)
- **Success:** `#4ade80` (Green)
- **Error:** `#ef4444` (Red)
- **Warning:** `#facc15` (Yellow)
- **Info:** `#38bdf8` (Light Blue)
- **Neutrals:** A range of grays for borders, cards, and secondary text.

### 3.2 Typography System

The typography is based on the `shadcn/ui` design system defaults, prioritizing readability and clarity.
- **Font Families:**
    - **Heading:** System sans-serif, bold.
    - **Body:** System sans-serif, normal weight.
- **Type Scale:** A standard, responsive type scale is used for headings (h1-h6), paragraphs, and other text elements to ensure a clear visual hierarchy.
- **Line Height:** A comfortable line height is used to enhance readability for long-form content.

### 3.3 Spacing and Layout

The layout is built on a standard 8pt grid system for consistent spacing and alignment.
- **Spacing Scale:** The standard Tailwind CSS spacing scale is used for margins, padding, and gaps.
- **Layout Grid:** A 12-column grid is used for the main page layouts, providing flexibility for responsive design.
- **Container Widths:** Responsive containers with appropriate maximum widths are used to ensure optimal line length and readability on larger screens.

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Direction:** "Engaging AI" (A Hybrid Approach)

**Rationale:** This approach combines the user's preference for the engaging, AI-focused personality of Direction #3 with the clean, structured layout of Direction #2. The result is a design that feels both professional and innovative, making the experience of learning with AI feel both trustworthy and magical.

**Layout Decisions:**
- **Structure:** The application will use a card-based layout to provide clear structure and guidance, inspired by Direction #2.
- **Content Focus:** The AI-generated content will be the central focus, presented in an immersive and engaging way, as seen in Direction #3.

**Hierarchy & Style Decisions:**
- **Visual Style:** The design will have a clean, modern aesthetic with a touch of personality to avoid a "boring" feel.
- **Visual Weight:** The design will be balanced, with enough white space to feel clean and structured, but with immersive elements to highlight the AI-generated content.

**Interaction Decisions:**
- **Onboarding/Upload:** The file upload process will be a guided, step-by-step experience to ensure clarity.
- **Content Generation:** The transition from user input to AI-generated content will be designed to feel seamless and transformative.

**Interactive Mockups:**

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

#### Journey 1: Lecture Note Upload & Content Generation

**User Goal:** To quickly and effortlessly transform lecture notes into learning tools.
**Approach:** Wizard/Stepper (Guided Steps)

**Flow Steps:**
1.  **Home Screen:** User sees a dashboard with previous content and two primary buttons: "Generate Summary" and "Generate Quiz". They click one to begin.
2.  **Step 1: Choose File:** User is presented with a screen to either upload a new file (via drag-and-drop or browse) or select a file from their history.
3.  **Step 2: Adjust Settings:** User sees options to adjust generation settings (e.g., summary length, quiz difficulty). They can proceed with defaults or make changes.
4.  **Step 3: Generate & View Content:** After clicking "Generate," a loading indicator is shown. Upon success, a pop-up message appears, and the user is redirected to the page displaying the new summary or quiz.

**Error Handling:**
- **File Upload Error:** If a file is invalid (e.g., wrong format, too large), a clear, inline error message explains the issue.
- **Generation Error:** If the AI process fails, an error message is displayed with a "Try Again" option.

**Mermaid Diagram:**
```mermaid
graph TD
    A[Home Screen] -->|Click 'Generate'| B(Step 1: Choose File);
    B --> C{New or Existing?};
    C -->|New| D[Upload & Validate File];
    C -->|Existing| E[Select From History];
    D --> F(Step 2: Adjust Settings);
    E --> F;
    F --> G[Generate Content (AI)];
    G --> H{Success?};
    H -->|Yes| I(Step 3: View Content);
    H -->|No| J[Show Error & Retry Option];
    I --> A;
```


#### Journey 2: User Onboarding / Registration & Login

**User Goal:** To securely access the application, either by creating an account or using it as a guest.
**Approach:** Dedicated Page Approach

**Flow Steps:**
1.  **Landing Page:** A page explaining the app's value with clear "Login," "Sign Up," and "Try as Guest" buttons.
2.  **Authentication Page:** If Login/Sign Up is clicked, the user is taken to a dedicated page (`/login` or `/signup`) with a clean form. A link allows switching between Login and Sign Up.
3.  **Guest Access:** Clicking "Try as Guest" leads directly to the main app, but with a persistent header indicating "Guest Mode." A modal prompts for signup when the usage limit is reached.
4.  **Home Screen:** After a successful login or signup, the user is redirected to the main application home screen in a logged-in state.

**Error Handling:**
- **Form Validation:** Clear, inline error messages for invalid fields (e.g., password mismatch).
- **Authentication Errors:** A general error message is displayed on the form if login/signup fails.

**Mermaid Diagram:**
```mermaid
graph TD
    A[Landing Page] -->|Click 'Login'| B(Login Page);
    A -->|Click 'Sign Up'| C(Sign Up Page);
    A -->|Click 'Try as Guest'| D[Home Screen (Guest Mode)];
    B --> E{Submit};
    C --> E;
    E -->|Success| F[Show Success Pop-up] --> G[Home Screen (Logged In)];
    E -->|Failure| H[Show Form Error];
    H --> B;
    H --> C;
    D --> |Use Limit Reached| I[Show 'Sign Up' Modal];
```


#### Journey 3: Reviewing Past Content

**User Goal:** To access and track learning progress over time.
**Approach:** Hybrid Dashboard/Menu Approach

**Flow Steps:**
1.  **Home Screen Dashboard:** The main screen displays lists of the most recent summaries and quizzes. Users can click an item to view it directly or click "View All".
2.  **Top Navigation Menu:** A persistent navigation menu contains links like "My Summaries" and "My Quizzes" for direct access to full history pages.
3.  **Dedicated History Page:** This page shows a full, chronological list of the selected content type (e.g., all summaries).
4.  **Content View:** Clicking an item displays its content. If viewing a quiz, an option to "View Attempts" is also available.

**Error Handling:**
- **No History:** If a user has no content for a specific category, a friendly message with a call to action is displayed.

**Mermaid Diagram:**
```mermaid
graph TD
    A[Home Screen Dashboard] -->|Click Recent Item| B(View Content);
    A -->|Click 'View All'| C[History Page (e.g., /summaries)];
    A -->|Click Menu: 'My Summaries'| C;
    A -->|Click Menu: 'My Quizzes'| D[History Page (e.g., /quizzes)];
    C -->|Click Item| B;
    D -->|Click Item| B;
    B -->|If Quiz, Click 'View Attempts'| E(View Past Quiz Attempts);
```

---

## 6. Component Library

### 6.1 Component Strategy

Our strategy is to leverage the `shadcn/ui` design system for foundational components while developing a few key custom components for the application's unique features. Any specific customizations to `shadcn/ui` components (e.g., theme overrides) will be documented in the project's Storybook or component library.

#### Components from `shadcn/ui`:
- **Buttons:** For all primary and secondary actions.
- **Form Inputs:** For login, signup, feedback forms, and quiz answer inputs.
- **Modals/Dialogs:** For success/error messages and guest mode prompts.
- **Cards:** To structure the dashboard and display content snippets.
- **Navigation Menus:** For top-level navigation to history pages.
- **Alerts/Toasts:** For non-disruptive feedback.
- **Core Typography & Icons.**

#### Custom Components:

**1. Settings Selector for Generation**
- **Purpose:** To allow users to configure the AI generation parameters.
- **Anatomy:**
    - Summary Length: A segmented control for "Short," "Medium," "Long."
    - Quiz Difficulty: A segmented control for "Easy," "Medium," "Hard."
    - Number of Questions: A number input field.
- **Behavior:** The component holds the state of the user's choices, which are passed to the AI upon generation. It will have pre-selected default values.
- **States & Variants:**
    - **Default:** All options are selectable.
    - **Disabled:** All controls are disabled during content generation.
    - **Variants:** A compact version may be used in-line, while a more spacious version could be used in a dedicated settings page.

**2. Interactive Quiz Player**
- **Purpose:** To create an engaging, conversational quiz experience.
- **Anatomy:**
    - Question Display: A text block to show the current AI-generated question.
    - Answer Input: An input field for the user to type their answer.
    - Submit Button.
- **Behavior:** This will be a turn-by-turn interaction. The AI provides a question, the user answers, the AI gives feedback, and then presents the next question.
- **States & Variants:**
    - **Waiting for answer:** Input field is active, submit button is enabled.
    - **Submitting:** Input and button are disabled; a loading indicator is shown.
    - **Displaying feedback:** Input is disabled; a "Next Question" button appears.
    - **Error:** An error message is displayed if submission fails.

**3. Quiz Attempt Reviewer**
- **Purpose:** To allow users to review their performance on past quizzes.
- **Anatomy:** A read-only log displaying the "conversation" of a past quiz, showing each question, the user's answer, and the AI's feedback.
- **Behavior:** A static, scrollable view of the quiz history.
- **States & Variants:**
    - **Default:** Displays the full quiz conversation.
    - **Empty:** Shows a message if no attempt history is available.

**4. Dashboard Layout**
- **Purpose:** To provide a clear overview and starting point for the user.
- **Anatomy:**
    - Action Buttons: Prominent buttons to "Create Summary" and "Create Quiz."
    - Recent Content Lists: Lists of recent files, summaries, and quizzes.
- **Behavior:** The lists are populated with the user's most recent activity, providing quick access.
- **States & Variants:**
    - **Populated:** Shows recent activity.
    - **Empty (First Use):** The "Recent Content" areas display empty state messages, guiding the user to create their first piece of content.

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

The following patterns will be used to ensure a consistent and predictable user experience across the application.

**1. Button Hierarchy**
- **Primary:** `shadcn/ui` default style. Used for the main call to action on a page.
    - *Example:* "Generate Quiz," "Login."
- **Secondary:** `shadcn/ui` secondary style (outline). Used for less important actions.
    - *Example:* "View History," "Cancel."
- **Tertiary/Link:** `shadcn/ui` link style. Used for navigation or non-critical actions that don't need prominence.
    - *Example:* "Learn More," "Advanced Settings."
- **Destructive:** `shadcn/ui` destructive style (red). Used for actions that delete data.
    - *Example:* "Delete File," "End Session."

**2. Feedback Patterns**
- **Success:** A non-intrusive "toast" notification at the bottom of the screen that auto-dismisses after 3-5 seconds.
    - *Example:* "Quiz generated successfully!"
- **Error:** A "toast" for non-critical errors. For critical failures (e.g., AI generation fails), an inline alert with a "Try Again" option will be used.
    - *Example (Toast):* "Invalid file format."
    - *Example (Alert):* "Generation failed due to a network error. [Try Again]"
- **Warning:** An inline alert or toast with a yellow accent to notify users of potential issues that are not errors.
    - *Example:* "Your summary is very long. Consider generating a shorter version."
- **Info:** A dismissible inline alert with a blue accent for helpful tips or informational messages.
    - *Example:* "Did you know? You can share generated quizzes with your friends."
- **Loading:** A loading spinner or skeleton loader integrated directly into the component that is loading content.
    - *Example:* A card will show a shimmering placeholder while its content is being fetched.

**3. Form Patterns**
- **Labels:** Positioned above the input field for maximum clarity.
- **Help Text:** Small, gray text appearing below a field to provide additional guidance.
    - *Example:* "Password must be at least 8 characters long."
- **Validation:** Occurs on form submission. After the first submission, individual fields will validate as the user types.
- **Error Display:** Inline error messages appear directly below the relevant field in red text.

**4. Modal Patterns**
- **Usage:** Reserved for short, focused tasks like confirming a destructive action or showing a critical message. Not for complex forms.
- **Sizes:** Predefined sizes (Small, Medium, Large) will be used for consistency. Small for confirmations, Medium for simple forms, Large for more content.
- **Dismiss Behavior:** Can be dismissed by clicking an "X" icon, pressing the Escape key, or clicking the background overlay.
- **Focus Management:** When a modal opens, focus is trapped inside it. When it closes, focus returns to the element that opened it.
- **Stacking:** Stacking modals (opening a modal from another modal) should be avoided. If necessary, the first modal is hidden or replaced.

**5. Navigation Patterns**
- **Active State:** The current page in the top or side navigation menu is visually highlighted (e.g., bolder text, different background).
- **Back Button:** The browser's back button will function as expected, taking the user to their previously viewed page.
- **Breadcrumbs:** For deeply nested content (e.g., viewing a specific quiz attempt), breadcrumbs will be displayed at the top of the page.
    - *Example:* `Home > My Quizzes > Modern History Midterm > Attempt 2`

**6. Empty State Patterns**
- **Usage:** Displayed when a list or area has no content.
- **Content:** Will include a helpful message, an icon, and a clear call to action.
    - *Example:* An illustration of a book with the text "You have no summaries yet." and a button "[Generate Your First Summary]".

**7. Confirmation Patterns**
- **Destructive Actions:** A modal will appear to confirm any action that permanently deletes user data. The final confirmation button will use the "destructive" style.
    - *Example:* Modal title "Delete Summary?", body text "Are you sure you want to permanently delete this summary? This action cannot be undone.", with buttons "[Cancel]" and "[Delete]".
- **Unsaved Changes:** Rely on auto-saving where possible. For manual forms, the browser's default confirmation will be used if a user tries to navigate away with unsaved changes.

**8. Notification Patterns**
- **Placement:** Non-critical notifications (toasts) appear at the bottom-center of the screen. Critical system-wide alerts appear at the top of the page.
- **Duration & Stacking:** Toasts auto-dismiss after 5 seconds. If multiple toasts are triggered, they stack vertically. Banners are dismissible by the user.
- **Priority:** Critical alerts (Error/Destructive) require user interaction. Non-critical (Success, Info) do not.

**9. Search Patterns**
- **Trigger:** A search bar will be present at the top of pages with lists (e.g., My Quizzes). Typing in the bar will trigger the search.
- **Results:** The list updates in real-time as the user types. Matched text is highlighted in the results.
- **Filters:** Advanced filtering options (e.g., by date, by subject) will be available via a dropdown next to the search bar.
- **No Results:** If no results are found, an empty state message is shown.
    - *Example:* "No quizzes found for 'Ancient Rome'. Try a different search term."

**10. Date/Time Patterns**
- **Format:** Relative time is used for recent items (e.g., "2 hours ago"). Absolute dates (e.g., "Nov 22, 2025") are used for older items.
- **Timezone:** All times are displayed in the user's local timezone.
- **Pickers:** When a date picker is required, it will use a calendar-style interface, defaulting to the current date.

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Alignment with Design Direction:** The responsive strategy directly supports the "Engaging AI" design direction by adapting the layout to be immersive and focused on all screen sizes. On larger screens, the multi-column layout allows for a rich, dashboard-like experience. On smaller screens, the single-column focus removes distractions and centers the AI-generated content, maintaining the core "Engaging AI" principle of a clear, transformative experience.

**Breakpoints:**
- **Desktop (large screens, > 1024px):**
    - Layout: Multi-column.
    - Navigation: Persistent side navigation, displaying menus like "My Quizzes," "My Summaries" by default.
    - Component Scaling: Components and text will scale to make efficient use of extra screen space.
- **Tablet (medium screens, 640px - 1024px):**
    - Layout: Simplified (single-column or two-column views).
    - Navigation: Side navigation collapses into a hamburger menu or is integrated into the top navigation.
    - Orientation: Adapts to both portrait and landscape orientations.
- **Mobile (small screens, < 640px, post-MVP):**
    - Layout: Strictly single-column.
    - Information Display: Users are redirected to focused pages rather than displaying a lot of information on one screen.

### 8.2 Accessibility Strategy

**Compliance Target:** WCAG 2.1 Level AA

**Key Requirements:**
- **Color Contrast:** Maintain sufficient contrast ratios (at least 4.5:1 for normal text, 3:1 for large text).
- **Keyboard Navigation:** All interactive elements must be navigable and operable using only a keyboard. Focus indicators must be clearly visible.
- **ARIA Labels:** Use meaningful ARIA labels for context and semantics for screen readers.
- **Alt Text:** All meaningful images must have descriptive alt text.
- **Form Labels:** Form fields must have properly associated labels, and error messages should be programmatically linked.
- **Error Identification:** Error messages must be clear, descriptive, and actionable.
- **Touch Target Size:** Interactive elements on touch devices must have a minimum touch target size (e.g., 44x44 CSS pixels).
- **Semantic HTML:** Use appropriate semantic HTML5 elements to convey meaning and structure.

**Testing Strategy:**
- **Automated:** Utilize tools like Lighthouse, axe DevTools.
- **Manual:** Conduct keyboard-only navigation, focus management checks, and screen reader testing.

---

## 9. Implementation Guidance

### 9.1 Completion Summary

### 9.1 Completion Summary

Excellent work! Your UX Design Specification is complete.

**What we created together:**

- **Design System:** shadcn/ui with 4 custom components
- **Visual Foundation:** "Scholarly Slate" (Dark Theme) color theme with shadcn/ui defaults with system sans-serif fonts typography and an 8pt grid spacing system
- **Design Direction:** "Engaging AI" (A Hybrid Approach) - Combines engaging AI personality with clean, structured layout, creating a professional and innovative learning experience.
- **User Journeys:** 3 flows designed with clear navigation paths
- **UX Patterns:** 7 consistency rules established for cohesive experience
- **Responsive Strategy:** 3 breakpoints with adaptation patterns for all device sizes
- **Accessibility:** WCAG 2.1 Level AA compliance requirements defined

**Your Deliverables:**
- UX Design Document: [ux-design-specification.md](./ux-design-specification.md)
- Interactive Color Themes: [ux-color-themes.html](./ux-color-themes.html)
- Design Direction Mockups: [ux-design-directions.html](./ux-design-directions.html)

**What happens next:**
- Designers can create high-fidelity mockups from this foundation
- Developers can implement with clear UX guidance and rationale
- All your design decisions are documented with reasoning for future reference

You've made thoughtful choices through visual collaboration that will create a great user experience. Ready for design refinement and implementation!

---

## Appendix

### Related Documents

- Product Requirements: `../PRD.md`
- Product Brief: `../product-brief-ibe160-2025-11-19.md`
- Brainstorming: `../brainstorming-session-results-onsdag 5. november 2025.md`

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: [ux-color-themes.html](./ux-color-themes.html)
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: [ux-design-directions.html](./ux-design-directions.html)
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Optional Enhancement Deliverables

No additional UX artifacts were generated as part of this workflow. This section can be updated by future workflows that generate supplementary design materials (e.g., detailed wireframes, interactive prototypes).

<!-- Additional deliverables added here by other workflows -->

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

### Version History

| Date     | Version | Changes                         | Author        |
| -------- | ------- | ------------------------------- | ------------- |
| 2025-11-22 | 1.0     | Initial UX Design Specification | BIP |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._
