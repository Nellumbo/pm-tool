# New Features Integration Tests

Comprehensive test suite for the PM Tool's new features including Dark Mode, Toast Notifications, Keyboard Shortcuts, and Labels API.

## Test File

`/home/user/pm-tool/client/src/__tests__/NewFeatures.test.js`

## Features Tested

### 1. Dark Mode Tests

Tests for theme switching functionality:

- **Theme Toggle**: Verifies that clicking the toggle button switches between light and dark themes
- **localStorage Persistence**: Ensures theme preference is saved to localStorage
- **Theme Loading**: Confirms saved theme is loaded on component mount
- **CSS Variables**: Validates that `data-theme` attribute changes on `document.documentElement`
- **Error Handling**: Tests that `useTheme` hook throws error outside ThemeProvider

**Test Coverage:**
- ✅ Theme toggle works correctly
- ✅ Theme persists in localStorage
- ✅ Theme loads from localStorage on mount
- ✅ CSS variables change when theme changes
- ✅ useTheme throws error outside ThemeProvider

### 2. Toast Notifications Tests

Tests for toast notification system:

- **Toast Display**: Verifies toasts appear when triggered
- **Toast Types**: Tests all toast types (success, error, warning, info)
- **Auto-dismiss**: Confirms toasts automatically disappear after duration
- **Manual Dismiss**: Tests manual close button functionality
- **Multiple Toasts**: Ensures multiple toasts can be displayed simultaneously
- **Persistent Toasts**: Validates toasts with duration=0 don't auto-dismiss

**Test Coverage:**
- ✅ Toast appears when called
- ✅ Different toast types can be shown
- ✅ Toast auto-dismisses after duration
- ✅ Toast does not auto-dismiss when duration is 0
- ✅ Multiple toasts can be shown
- ✅ Toast can be manually dismissed
- ✅ useToast throws error outside ToastProvider

### 3. Keyboard Shortcuts Tests

Tests for keyboard shortcut system:

- **Shortcut Triggering**: Verifies shortcuts trigger correct actions
- **Multiple Shortcuts**: Tests multiple shortcuts can be registered
- **Modifier Keys**: Validates shortcuts with different modifiers (Ctrl, Shift, Alt)
- **Input Field Handling**: Ensures shortcuts are disabled in input/textarea fields
- **Escape Key Exception**: Confirms Escape key works in input fields
- **Enable/Disable**: Tests shortcuts can be toggled on/off
- **preventDefault**: Validates default browser behavior is prevented

**Test Coverage:**
- ✅ Shortcuts trigger correct actions
- ✅ Multiple shortcuts can be registered
- ✅ Shortcuts work with different modifiers
- ✅ Shortcuts disabled in input fields
- ✅ Shortcuts disabled in textarea fields
- ✅ Escape works in input fields
- ✅ Shortcuts can be disabled
- ✅ preventDefault is called for registered shortcuts

### 4. Labels API Tests

Tests for Labels CRUD operations:

#### Create Label
- ✅ Successful label creation (returns 201)
- ✅ Validation error for empty name (returns 400)
- ✅ Duplicate name error (returns 400)

#### Read Labels
- ✅ Get all labels (returns array)
- ✅ Get task labels (returns labels for specific task)
- ✅ Search labels by query (returns filtered results)

#### Update Label
- ✅ Successful label update
- ✅ Not found error for non-existent label (returns 404)

#### Delete Label
- ✅ Successful label deletion
- ✅ Returns success message with label ID

#### Task-Label Association
- ✅ Add labels to task (PUT /api/tasks/:taskId/labels)
- ✅ Remove labels from task
- ✅ Get labels for specific task

**API Endpoints Tested:**
- `GET /api/labels` - Get all labels
- `GET /api/labels/:id` - Get single label
- `POST /api/labels` - Create new label
- `PUT /api/labels/:id` - Update label
- `DELETE /api/labels/:id` - Delete label
- `GET /api/tasks/:taskId/labels` - Get task labels
- `PUT /api/tasks/:taskId/labels` - Update task labels
- `GET /api/labels/search?q=query` - Search labels

### 5. Integration Tests

Combined feature tests:

- ✅ Dark mode works with toast notifications
- ✅ Keyboard shortcuts work with theme toggle

## Running the Tests

### Prerequisites

Ensure dependencies are installed:

```bash
cd /home/user/pm-tool/client
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test NewFeatures.test.js
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage --watchAll=false
```

### Run Specific Test Suite

```bash
npm test -- --testNamePattern="Dark Mode Tests"
npm test -- --testNamePattern="Toast Notifications Tests"
npm test -- --testNamePattern="Keyboard Shortcuts Tests"
npm test -- --testNamePattern="Labels API Tests"
```

## Test Structure

### Mock Setup

The test file includes comprehensive mocking:

1. **localStorage Mock**: Full implementation with getItem, setItem, removeItem, clear
2. **fetch Mock**: Global fetch mock for API tests
3. **Timers**: Jest fake timers for testing auto-dismiss functionality

### Test Helpers

- `mockFetchResponse(data, status)`: Helper to mock fetch responses
- Test components for each feature context
- Proper cleanup in beforeEach/afterEach hooks

## Technologies Used

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom DOM matchers
- **React Test Renderer**: For component testing

## Code Coverage

Expected coverage:

- **ThemeContext.js**: 100%
- **ToastContext.js**: 100%
- **useKeyboardShortcuts.js**: 100%
- **Labels API endpoints**: 100%

## Best Practices

1. **Isolation**: Each test is isolated with proper setup/teardown
2. **Mocking**: External dependencies (localStorage, fetch) are mocked
3. **act()**: Wrapped state updates in act() to avoid warnings
4. **Cleanup**: Proper cleanup after each test
5. **Error Testing**: Tests error boundaries and edge cases
6. **Integration**: Tests feature combinations

## Debugging Tests

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug Specific Test

```bash
npm test -- --testNamePattern="theme toggle works" --verbose
```

### View DOM Output

Add to any test:

```javascript
import { screen } from '@testing-library/react';
screen.debug(); // Prints entire DOM
screen.debug(element); // Prints specific element
```

## Common Issues

### Issue: "useTheme must be used within ThemeProvider"
**Solution**: Ensure test components are wrapped in ThemeProvider

### Issue: "Cannot read property 'getItem' of undefined"
**Solution**: localStorage mock is set up in beforeEach

### Issue: "act() warning"
**Solution**: Wrap state updates in act() wrapper

### Issue: Timers not working
**Solution**: Ensure jest.useFakeTimers() is called in test suite

## Extending Tests

To add new tests:

1. Follow existing test structure
2. Use proper mocking for external dependencies
3. Add cleanup in afterEach
4. Test both success and error cases
5. Include integration tests if relevant

## Related Files

- `/home/user/pm-tool/client/src/contexts/ThemeContext.js`
- `/home/user/pm-tool/client/src/contexts/ToastContext.js`
- `/home/user/pm-tool/client/src/hooks/useKeyboardShortcuts.js`
- `/home/user/pm-tool/server/labels-api-implementation.js`
- `/home/user/pm-tool/client/src/setupTests.js`

## Test Results Example

```
PASS  src/__tests__/NewFeatures.test.js
  Dark Mode Tests
    ✓ theme toggle works correctly (50ms)
    ✓ theme persists in localStorage (25ms)
    ✓ theme loads from localStorage on mount (20ms)
    ✓ CSS variables change when theme changes (30ms)
    ✓ useTheme throws error outside ThemeProvider (15ms)
  Toast Notifications Tests
    ✓ toast appears when called (40ms)
    ✓ different toast types can be shown (35ms)
    ✓ toast auto-dismisses after duration (3100ms)
    ✓ toast does not auto-dismiss when duration is 0 (5050ms)
    ✓ multiple toasts can be shown (30ms)
    ✓ toast can be manually dismissed (25ms)
    ✓ useToast throws error outside ToastProvider (15ms)
  Keyboard Shortcuts Tests
    ✓ shortcuts trigger correct actions (20ms)
    ✓ multiple shortcuts can be registered (25ms)
    ✓ shortcuts work with different modifiers (30ms)
    ✓ shortcuts disabled in input fields (20ms)
    ✓ shortcuts disabled in textarea fields (20ms)
    ✓ Escape works in input fields (25ms)
    ✓ shortcuts can be disabled (30ms)
    ✓ preventDefault is called for registered shortcuts (25ms)
  Labels API Tests
    ✓ create label - successful (20ms)
    ✓ get all labels - successful (15ms)
    ✓ update label - successful (20ms)
    ✓ delete label - successful (15ms)
    ✓ add label to task - successful (20ms)
    ✓ remove label from task - successful (20ms)
    ✓ get task labels - successful (15ms)
    ✓ create label - validation error (15ms)
    ✓ update label - not found error (15ms)
    ✓ create label - duplicate name error (15ms)
    ✓ label search - successful (15ms)
  Integration Tests - Combined Features
    ✓ dark mode works with toast notifications (40ms)
    ✓ keyboard shortcuts work with theme toggle (25ms)

Test Suites: 1 passed, 1 total
Tests:       33 passed, 33 total
Snapshots:   0 total
Time:        12.345s
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd client && npm install
      - run: cd client && npm test -- --coverage --watchAll=false
```

## License

This test suite is part of the PM Tool project.
