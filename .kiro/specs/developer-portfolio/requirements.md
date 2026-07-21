# Requirements Document

## Introduction

A personal portfolio website for a junior full-stack developer. The site uses file-based content management where projects are added by placing markdown documents in a designated folder. The website features a dark-themed design with JetBrains Mono typography, easy navigation, and a contact form that redirects to the user's email. The site is deployed on Vercel.

## Glossary

- **Portfolio_Site**: The personal portfolio web application for a junior full-stack developer
- **Project_Loader**: The module responsible for reading and parsing markdown files from the projects folder
- **Projects_Folder**: A designated directory where markdown files representing portfolio projects are stored
- **Project_Card**: A UI component that displays a summary of a single project on the projects listing page
- **Project_Page**: A dedicated page displaying the full content of a single project parsed from its markdown file
- **Navigation_Bar**: The persistent navigation component allowing users to move between site sections
- **Contact_Form**: A form component that collects user messages and redirects submissions to the developer's email
- **Visitor**: A person browsing the portfolio website

## Requirements

### Requirement 1: Project File-Based Content Management

**User Story:** As a developer, I want to add projects by placing a markdown file in a folder, so that I can manage my portfolio content without modifying code.

#### Acceptance Criteria

1. THE Project_Loader SHALL parse each markdown file in the Projects_Folder at build time and generate a corresponding project entry on the Portfolio_Site
2. THE Project_Loader SHALL extract frontmatter metadata from each markdown file, requiring the following fields: title (string, maximum 100 characters), description (string, maximum 300 characters), tags (list of strings), and date (in YYYY-MM-DD format)
3. IF a markdown file in the Projects_Folder contains frontmatter that is malformed or missing any of the required fields (title, description, tags, date), THEN THE Project_Loader SHALL skip the file and continue loading remaining projects
4. THE Project_Loader SHALL render all markdown content following the frontmatter block to HTML for display on the Project_Page
5. THE Portfolio_Site SHALL list all valid projects from the Projects_Folder on the projects section, ordered by date descending, using file name as a secondary sort for projects sharing the same date
6. IF the Projects_Folder contains no valid markdown files, THEN THE Portfolio_Site SHALL display an empty projects section with no project entries

### Requirement 2: Site Navigation

**User Story:** As a visitor, I want clear and easy navigation, so that I can quickly find different sections of the portfolio.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL be rendered in a fixed position at the top of the viewport on all pages of the Portfolio_Site
2. THE Navigation_Bar SHALL contain links to the Home, Projects, and Contact sections
3. WHEN a Visitor clicks a navigation link, THE Portfolio_Site SHALL scroll smoothly to the corresponding section without a full page reload
4. WHILE the Visitor is on a section, THE Navigation_Bar SHALL visually indicate the currently active section by applying the accent color (#FF8014) to the corresponding link text
5. THE Navigation_Bar SHALL detect the active section based on which section is currently within the viewport scroll position

### Requirement 3: Visual Design and Theming

**User Story:** As a developer, I want a consistent dark-themed design with specific typography, so that the portfolio has a professional and recognizable appearance.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL use JetBrains Mono as the primary font family for all text content
2. THE Portfolio_Site SHALL use #262626 as the background color for all pages
3. THE Portfolio_Site SHALL use #FEFEFE as the main text color
4. THE Portfolio_Site SHALL use #FF8014 as the accent color for links, buttons, active navigation indicators, and hover states
5. THE Portfolio_Site SHALL load JetBrains Mono from Google Fonts or include it as a bundled asset
6. IF JetBrains Mono fails to load within 3 seconds, THEN THE Portfolio_Site SHALL fall back to a system monospace font
7. THE text and background color combination (#FEFEFE on #262626) SHALL meet WCAG 2.1 AA contrast ratio of at least 4.5:1 for normal text

### Requirement 4: Contact Form

**User Story:** As a visitor, I want to send a message to the developer through a contact form, so that I can reach out without needing to find their email address manually.

#### Acceptance Criteria

1. THE Contact_Form SHALL provide input fields for the sender's name (maximum 100 characters), sender's email address (maximum 254 characters), and message body (maximum 2000 characters)
2. WHEN the Visitor attempts to submit the Contact_Form, THE Contact_Form SHALL validate that the name field contains at least 1 non-whitespace character
3. WHEN the Visitor attempts to submit the Contact_Form, THE Contact_Form SHALL validate that the email field contains a value matching the pattern local-part@domain (containing an "@" symbol with at least one character before and a domain with at least one dot after)
4. WHEN the Visitor attempts to submit the Contact_Form, THE Contact_Form SHALL validate that the message body contains at least 1 non-whitespace character
5. IF any validation fails, THEN THE Contact_Form SHALL display an error message next to each invalid field indicating which validation rule was not satisfied
6. WHEN the Visitor submits a valid Contact_Form, THE Portfolio_Site SHALL redirect the submission to the developer's email address using a mailto link or email forwarding service
7. WHEN the form submission is triggered, THE Contact_Form SHALL display a visible confirmation message indicating that the message action was initiated

### Requirement 5: Project Detail Page

**User Story:** As a visitor, I want to view full details of a project, so that I can understand the developer's work in depth.

#### Acceptance Criteria

1. WHEN a Visitor clicks a Project_Card, THE Portfolio_Site SHALL navigate to the corresponding Project_Page
2. THE Project_Page SHALL display the full rendered markdown content of the selected project
3. THE Project_Page SHALL display the project title, date in a human-readable format (e.g., "January 15, 2025"), and tags from the frontmatter metadata; IF no tags are present, THEN the tags section SHALL be omitted
4. THE Project_Page SHALL provide a link to navigate back to the projects listing
5. IF a Visitor navigates to a Project_Page URL that does not correspond to any valid project file, THEN THE Portfolio_Site SHALL display a 404 page with a link back to the projects listing

### Requirement 6: Home Page

**User Story:** As a visitor, I want to see an introduction to the developer when I land on the site, so that I get an immediate sense of who they are and what they do.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL display the developer's name as the largest text element on the Home page, using a top-level heading
2. THE Portfolio_Site SHALL display an introduction or tagline of no more than 150 characters describing the developer as a junior full-stack developer
3. THE Home page SHALL provide at least one call-to-action element styled with the accent color that links to the Projects section, the Contact section, or both

### Requirement 7: Vercel Deployment Compatibility

**User Story:** As a developer, I want the site to deploy seamlessly on Vercel, so that I can host the portfolio with minimal configuration.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL be built using a static site generator or framework that produces static HTML, CSS, and JavaScript output requiring no server-side runtime to serve
2. THE Portfolio_Site SHALL generate static pages at build time for all project entries in the Projects_Folder, completing the build within 120 seconds for up to 50 project files
3. WHEN a new markdown file is added to the Projects_Folder and the repository is pushed, THE Portfolio_Site SHALL include the new project after the next Vercel build
4. IF the build process fails due to an invalid markdown file or missing dependency, THEN THE Portfolio_Site SHALL exit with a non-zero status code and output an error message indicating the cause of failure

### Requirement 8: Responsive Design

**User Story:** As a visitor, I want the portfolio to look good on different screen sizes, so that I can browse it on my phone or desktop.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL render all page content without horizontal scrollbar or clipped content for viewport widths from 320px to 1920px
2. WHILE the viewport width is below 768px, THE Navigation_Bar SHALL collapse into a toggle-activated collapsible menu, accessible via a visible menu button that expands and collapses the navigation links
3. WHILE the viewport width is below 768px, THE Project_Card components SHALL display in a single-column layout, and WHILE the viewport width is 768px or above, THE Project_Card components SHALL display in a multi-column grid of 2 or more columns
4. WHILE the viewport width is below 768px, THE Portfolio_Site SHALL render all interactive elements (links, buttons, form inputs) with a minimum touch target size of 44x44 CSS pixels
