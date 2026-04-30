# Course & LMS Management Refactoring

## Overview

This document describes the refactored Course and LMS management architecture for the QMS system. The refactoring separates concerns into reusable components and dedicated pages, improving maintainability and scalability.

## Architecture

### Components

#### Core Page Components

- **CoursePage** ([CoursePage.tsx](./CoursePage.tsx))
  - Main course listing and management page
  - Responsibilities:
    - Display paginated list of courses
    - Create new courses
    - Edit existing courses
    - Delete courses
    - Expand course details
    - Navigate to LMS management pages
  - State: Course data, pagination, search, modal visibility, editing state

#### LMS Management Components

- **LmsManagementPage** ([LmsManagementPage.tsx](./LmsManagementPage.tsx))
  - Core LMS management component handling 4 different views
  - Responsibilities:
    - Manage course content (videos, PDFs, links)
    - Manage assignments
    - Review assignment submissions (checking)
    - Manage test series
  - Props:
    - `view`: 'content' | 'assignments' | 'checking' | 'testSeries'
  - Features:
    - Course selector dropdown
    - Context-aware modal for editing/creating
    - Data refresh
    - Edit/delete operations

- **LmsContentPage** ([LmsContentPage.tsx](./LmsContentPage.tsx))
  - Thin wrapper that renders LmsManagementPage with view="content"

- **LmsAssignmentsPage** ([LmsAssignmentsPage.tsx](./LmsAssignmentsPage.tsx))
  - Thin wrapper that renders LmsManagementPage with view="assignments"

- **LmsCheckingPage** ([LmsCheckingPage.tsx](./LmsCheckingPage.tsx))
  - Thin wrapper that renders LmsManagementPage with view="checking"

- **LmsTestSeriesPage** ([LmsTestSeriesPage.tsx](./LmsTestSeriesPage.tsx))
  - Thin wrapper that renders LmsManagementPage with view="testSeries"

### Reusable Sub-Components

- **CourseActionMenu** ([CourseActionMenu.tsx](./CourseActionMenu.tsx))
  - Reusable dropdown menu for course actions
  - Actions: Edit, Manage Content, Manage Assignments, Assignment Checking, Test Series, Delete
  - Reduces code duplication in table rendering
  - Props:
    - `isOpen`: boolean
    - `row`: CourseRow
    - Action callbacks (onEdit, onManageContent, etc.)
    - `onClose`: close handler

- **CourseFormModal** ([CourseFormModal.tsx](./CourseFormModal.tsx))
  - Extracted course create/edit modal
  - Encapsulates course form UI and logic
  - Props:
    - `open`, `editing`, `form`, `saving`
    - `onClose`, `onSave`, `onFormChange`
  - Replaces inline modal code in CoursePage

- **LmsModal** ([LmsModal.tsx](./LmsModal.tsx))
  - Unified modal wrapper for all LMS operations
  - Handles conditional rendering of correct form based on mode
  - Supports: content, assignment, submission, testSeries
  - Props:
    - `mode`: LmsModalMode | null
    - `form`, `editing`, `courses`
    - Action callbacks
  - Replaces multiple modal conditionals in LmsManagementPage

### Existing Sub-Components (Already Present)

- **ContentModalForm** - Form for content management
- **AssignmentModalForm** - Form for assignment management
- **SubmissionModalForm** - Form for submission review
- **TestSeriesModalForm** - Form for test series
- **LmsPanel** - (Kept for compatibility, not actively used in refactored version)
- **CourseTable** - Reusable table component for courses

## File Organization

```
src/pages/course/
├── index.ts                      # Exports all course pages and components
├── CoursePage.tsx               # Main course listing page
├── CourseActionMenu.tsx         # Reusable action menu
├── CourseFormModal.tsx          # Reusable course form modal
├── LmsManagementPage.tsx        # Core LMS management component
├── LmsModal.tsx                 # Reusable LMS modal
├── LmsContentPage.tsx           # LMS content view wrapper
├── LmsAssignmentsPage.tsx       # LMS assignments view wrapper
├── LmsCheckingPage.tsx          # LMS checking view wrapper
├── LmsTestSeriesPage.tsx        # LMS test series view wrapper
├── types.ts                      # Type definitions
├── useLmsData.ts                # LMS data hook
├── CourseTable.tsx              # Course table component
├── LmsPanel.tsx                 # LMS panel component
├── ContentModalForm.tsx         # Content form
├── AssignmentModalForm.tsx      # Assignment form
├── SubmissionModalForm.tsx      # Submission form
├── TestSeriesModalForm.tsx      # Test series form
├── MyCoursesPage.tsx            # Employee course page
├── AssignCoursePage.tsx         # Course assignment page
└── CourseSummaryPage.tsx        # Course summary page
```

## Routing

The application should set up routes as follows (update in your router configuration):

```tsx
// Course management routes
<Route path="/courses" element={<CoursePage />} />

// LMS management routes with courseId parameter
<Route path="/lms/content" element={<LmsContentPage />} />
<Route path="/lms/assignments" element={<LmsAssignmentsPage />} />
<Route path="/lms/checking" element={<LmsCheckingPage />} />
<Route path="/lms/test-series" element={<LmsTestSeriesPage />} />

// Employee course routes (existing)
<Route path="/my-courses" element={<MyCoursesPage />} />
<Route path="/assign-courses" element={<AssignCoursePage />} />
```

URL format for LMS pages: `/lms/{view}?courseId={id}`

## Data Flow

### Course Management
```
CoursePage (list)
  ├─ loadCourses() → API: GET /training
  ├─ openCreate() → CourseFormModal
  ├─ openEdit(row) → CourseFormModal with data
  ├─ handleSave() → API: POST/PUT /training
  ├─ handleDelete(row) → API: DELETE /training/{id}
  └─ navigateLmsManagement() → Route to LmsManagementPage
```

### LMS Management
```
LmsManagementPage
  ├─ Load courses → API: GET /training
  ├─ Load LMS data → useLmsData hook
  │  ├─ loadContent(courseId) → API: GET /course-content
  │  ├─ saveLmsContent() → API: POST/PUT /course-content
  │  ├─ saveLmsAssignment() → API: POST/PUT /assignments
  │  ├─ checkSubmission() → API: POST/PUT /assignment-submissions
  │  ├─ saveLmsTestSeries() → API: POST/PUT /test-series
  │  └─ deleteContent() → API: DELETE /course-content/{id}
  └─ LmsModal
     └─ Render appropriate form based on mode
```

## Benefits of Refactoring

### 1. **Separation of Concerns**
   - CoursePage: Course CRUD operations only
   - LmsManagementPage: All LMS operations
   - Each component has a single responsibility

### 2. **Code Reusability**
   - CourseActionMenu: Eliminates inline dropdown code
   - CourseFormModal: Reusable course form
   - LmsModal: Unified modal for all LMS operations
   - Reduces duplicated JSX and logic

### 3. **Improved Maintainability**
   - CoursePage reduced from ~400 lines to ~250 lines
   - Easier to locate and fix bugs
   - Clearer component relationships
   - Better code readability

### 4. **Scalability**
   - Easy to add new LMS views (just create wrapper)
   - Easy to add new action menu items
   - Easy to extend forms with new fields

### 5. **Better Navigation**
   - Clear navigation flow from courses to LMS management
   - URL-based state for LMS views (courseId in query params)
   - Back button functionality maintained

### 6. **Type Safety**
   - All types in `types.ts`
   - Props fully typed in all components
   - Better IDE support and error catching

## Usage Examples

### Navigating to LMS Management

```tsx
// From CoursePage action menu
const navigateLmsManagement = (view: 'content' | 'assignments' | 'checking' | 'testSeries', courseId: number) => {
  navigate(`/lms/${view}?courseId=${courseId}`);
};
```

### Creating Custom LMS View

If you need to create a new LMS management page:

1. Create a new wrapper page in `src/pages/course/Lms{Feature}Page.tsx`:
```tsx
import { LmsManagementPage } from './LmsManagementPage';

export const Lms{Feature}Page = () => <LmsManagementPage view="{feature}" />;
```

2. Add route in router configuration
3. Update LmsManagementPage to handle the new view type

## Testing Strategy

### Unit Tests
- Test CourseActionMenu menu item rendering
- Test CourseFormModal form state management
- Test LmsModal conditional rendering
- Test form validation

### Integration Tests
- Test navigation from CoursePage to LmsManagementPage
- Test course CRUD operations
- Test LMS data loading and saving
- Test URL query parameters

### E2E Tests
- Test full course creation → content management flow
- Test course editing and deletion
- Test assignment submission workflow

## Future Improvements

1. **Performance**
   - Add pagination to LMS tables
   - Implement virtual scrolling for large lists
   - Add caching for course data

2. **Features**
   - Bulk operations (delete multiple)
   - Export data (CSV/PDF)
   - Batch import
   - Course templates

3. **UX**
   - Add breadcrumbs for navigation
   - Add more confirmation dialogs for destructive actions
   - Add progress indicators for long operations
   - Add toast notifications for all operations

4. **Architecture**
   - Move modal state to context
   - Implement state management (Redux/Zustand)
   - Add optimistic updates
   - Implement error recovery

## Dependencies

- react
- react-router-dom (for navigation)
- axios (for API calls)
- react-hot-toast (for notifications)
- tailwindcss (for styling)

## Related Services

- `api.ts` - API client
- `lmsService.ts` - LMS-specific API operations (used via useLmsData hook)

## Migration Notes

If upgrading from the previous version:

1. Update all imports to use new components
2. Update route configurations
3. Replace navigation calls to use `/lms/{view}?courseId={id}` format
4. No breaking changes to API contracts
5. Backward compatible with existing data

---

**Last Updated**: April 30, 2026
**Version**: 2.0 (Refactored)
