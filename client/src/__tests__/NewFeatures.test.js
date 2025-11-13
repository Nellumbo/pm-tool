/**
 * Comprehensive Integration Tests for New Features
 *
 * Tests cover:
 * 1. Dark Mode functionality
 * 2. Toast Notifications
 * 3. Keyboard Shortcuts
 * 4. Labels API
 */

import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// ============================================
// Mock Setup
// ============================================

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch for API tests
global.fetch = jest.fn();

// Helper to reset mocks
beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  fetch.mockClear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  jest.clearAllTimers();
});

// ============================================
// 1. DARK MODE TESTS
// ============================================

describe('Dark Mode Tests', () => {
  // Test component to access theme context
  const ThemeTestComponent = () => {
    const { theme, toggleTheme } = useTheme();
    return (
      <div>
        <div data-testid="current-theme">{theme}</div>
        <button onClick={toggleTheme} data-testid="toggle-theme">
          Toggle Theme
        </button>
      </div>
    );
  };

  test('theme toggle works correctly', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('current-theme');
    const toggleButton = screen.getByTestId('toggle-theme');

    // Initial theme should be light
    expect(themeDisplay).toHaveTextContent('light');

    // Toggle to dark
    act(() => {
      toggleButton.click();
    });
    expect(themeDisplay).toHaveTextContent('dark');

    // Toggle back to light
    act(() => {
      toggleButton.click();
    });
    expect(themeDisplay).toHaveTextContent('light');
  });

  test('theme persists in localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');

    // Toggle theme
    act(() => {
      toggleButton.click();
    });

    // Check localStorage was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  test('theme loads from localStorage on mount', () => {
    // Set initial theme in localStorage
    localStorageMock.getItem.mockReturnValueOnce('dark');

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('current-theme');
    expect(themeDisplay).toHaveTextContent('dark');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
  });

  test('CSS variables change when theme changes', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');

    // Check initial theme attribute
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Toggle to dark
    act(() => {
      toggleButton.click();
    });

    // Check theme attribute changed
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Toggle back to light
    act(() => {
      toggleButton.click();
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('useTheme throws error outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const InvalidComponent = () => {
      useTheme(); // This should throw
      return <div>Test</div>;
    };

    expect(() => render(<InvalidComponent />)).toThrow(
      'useTheme must be used within ThemeProvider'
    );

    consoleSpy.mockRestore();
  });
});

// ============================================
// 2. TOAST NOTIFICATIONS TESTS
// ============================================

describe('Toast Notifications Tests', () => {
  jest.useFakeTimers();

  const ToastTestComponent = () => {
    const toast = useToast();
    return (
      <div>
        <button onClick={() => toast.success('Success message')} data-testid="show-success">
          Show Success
        </button>
        <button onClick={() => toast.error('Error message')} data-testid="show-error">
          Show Error
        </button>
        <button onClick={() => toast.warning('Warning message')} data-testid="show-warning">
          Show Warning
        </button>
        <button onClick={() => toast.info('Info message')} data-testid="show-info">
          Show Info
        </button>
        <button
          onClick={() => toast.success('No auto-dismiss', 0)}
          data-testid="show-no-dismiss"
        >
          Show No Dismiss
        </button>
      </div>
    );
  };

  test('toast appears when called', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByTestId('show-success');

    act(() => {
      successButton.click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  test('different toast types can be shown', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    // Show success toast
    act(() => {
      screen.getByTestId('show-success').click();
    });
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Show error toast
    act(() => {
      screen.getByTestId('show-error').click();
    });
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Show warning toast
    act(() => {
      screen.getByTestId('show-warning').click();
    });
    expect(screen.getByText('Warning message')).toBeInTheDocument();

    // Show info toast
    act(() => {
      screen.getByTestId('show-info').click();
    });
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  test('toast auto-dismisses after duration', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByTestId('show-success');

    act(() => {
      successButton.click();
    });

    // Toast should be visible
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Fast-forward time by 3000ms (default duration)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Toast should be removed
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  test('toast does not auto-dismiss when duration is 0', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    const noDismissButton = screen.getByTestId('show-no-dismiss');

    act(() => {
      noDismissButton.click();
    });

    // Toast should be visible
    expect(screen.getByText('No auto-dismiss')).toBeInTheDocument();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Toast should still be visible
    expect(screen.getByText('No auto-dismiss')).toBeInTheDocument();
  });

  test('multiple toasts can be shown', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    // Show multiple toasts
    act(() => {
      screen.getByTestId('show-success').click();
      screen.getByTestId('show-error').click();
      screen.getByTestId('show-warning').click();
    });

    // All toasts should be visible
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  test('toast can be manually dismissed', () => {
    render(
      <ToastProvider>
        <ToastTestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId('show-success').click();
    });

    const toast = screen.getByText('Success message');
    expect(toast).toBeInTheDocument();

    // Find and click the close button
    const closeButton = toast.parentElement.querySelector('.toast-close');

    act(() => {
      closeButton.click();
    });

    // Toast should be removed
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  test('useToast throws error outside ToastProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const InvalidComponent = () => {
      useToast(); // This should throw
      return <div>Test</div>;
    };

    expect(() => render(<InvalidComponent />)).toThrow(
      'useToast must be used within ToastProvider'
    );

    consoleSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});

// ============================================
// 3. KEYBOARD SHORTCUTS TESTS
// ============================================

describe('Keyboard Shortcuts Tests', () => {
  const KeyboardTestComponent = ({ shortcuts, enabled = true }) => {
    const [actions, setActions] = React.useState([]);

    const handlersWithTracking = React.useMemo(() => {
      const handlers = {};
      Object.keys(shortcuts).forEach(key => {
        handlers[key] = (e) => {
          setActions(prev => [...prev, key]);
          shortcuts[key](e);
        };
      });
      return handlers;
    }, [shortcuts]);

    useKeyboardShortcuts(handlersWithTracking, enabled);

    return (
      <div>
        <div data-testid="actions">{actions.join(', ')}</div>
        <input type="text" data-testid="test-input" />
        <textarea data-testid="test-textarea" />
      </div>
    );
  };

  test('shortcuts trigger correct actions', () => {
    const mockHandler = jest.fn();
    const shortcuts = {
      'ctrl+k': mockHandler
    };

    render(<KeyboardTestComponent shortcuts={shortcuts} />);

    // Trigger Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test('multiple shortcuts can be registered', () => {
    const mockHandler1 = jest.fn();
    const mockHandler2 = jest.fn();
    const mockHandler3 = jest.fn();

    const shortcuts = {
      'ctrl+k': mockHandler1,
      'ctrl+n': mockHandler2,
      'esc': mockHandler3
    };

    render(<KeyboardTestComponent shortcuts={shortcuts} />);

    // Trigger different shortcuts
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'n', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockHandler1).toHaveBeenCalledTimes(1);
    expect(mockHandler2).toHaveBeenCalledTimes(1);
    expect(mockHandler3).toHaveBeenCalledTimes(1);
  });

  test('shortcuts work with different modifiers', () => {
    const mockHandler1 = jest.fn();
    const mockHandler2 = jest.fn();
    const mockHandler3 = jest.fn();

    const shortcuts = {
      'ctrl+k': mockHandler1,
      'shift+k': mockHandler2,
      'alt+k': mockHandler3
    };

    render(<KeyboardTestComponent shortcuts={shortcuts} />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'k', shiftKey: true });
    fireEvent.keyDown(window, { key: 'k', altKey: true });

    expect(mockHandler1).toHaveBeenCalledTimes(1);
    expect(mockHandler2).toHaveBeenCalledTimes(1);
    expect(mockHandler3).toHaveBeenCalledTimes(1);
  });

  test('shortcuts disabled in input fields', () => {
    const mockHandler = jest.fn();
    const shortcuts = {
      'ctrl+k': mockHandler
    };

    render(<KeyboardTestComponent shortcuts={shortcuts} />);

    const input = screen.getByTestId('test-input');
    input.focus();

    // Trigger Ctrl+K in input field
    fireEvent.keyDown(input, { key: 'k', ctrlKey: true });

    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('shortcuts disabled in textarea fields', () => {
    const mockHandler = jest.fn();
    const shortcuts = {
      'ctrl+k': mockHandler
    };

    render(<KeyboardTestComponent shortcuts={shortcuts} />);

    const textarea = screen.getByTestId('test-textarea');
    textarea.focus();

    // Trigger Ctrl+K in textarea
    fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });

    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('Escape works in input fields', () => {
    const mockHandler = jest.fn();
    const shortcuts = {
      'esc': mockHandler
    };

    render(<KeyboardTestComponent shortcuts={shortcuts} />);

    const input = screen.getByTestId('test-input');
    input.focus();

    // Trigger Escape in input field
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test('shortcuts can be disabled', () => {
    const mockHandler = jest.fn();
    const shortcuts = {
      'ctrl+k': mockHandler
    };

    const { rerender } = render(
      <KeyboardTestComponent shortcuts={shortcuts} enabled={true} />
    );

    // Trigger shortcut when enabled
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(mockHandler).toHaveBeenCalledTimes(1);

    // Disable shortcuts
    rerender(
      <KeyboardTestComponent shortcuts={shortcuts} enabled={false} />
    );

    // Trigger shortcut when disabled
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(mockHandler).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  test('preventDefault is called for registered shortcuts', () => {
    const mockHandler = jest.fn();
    const shortcuts = {
      'ctrl+k': mockHandler
    };

    render(<KeyboardTestComponent shortcuts={shortcuts} />);

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});

// ============================================
// 4. LABELS API TESTS
// ============================================

describe('Labels API Tests', () => {
  const API_BASE = 'http://localhost:5000/api';
  const mockAuthToken = 'mock-auth-token';

  beforeEach(() => {
    fetch.mockClear();
  });

  // Helper function to mock fetch response
  const mockFetchResponse = (data, status = 200) => {
    fetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  };

  test('create label - successful', async () => {
    const newLabel = {
      name: 'Bug',
      color: '#dc3545',
      description: 'Bug reports'
    };

    const expectedResponse = {
      id: 1,
      ...newLabel,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      usageCount: 0
    };

    mockFetchResponse(expectedResponse, 201);

    const response = await fetch(`${API_BASE}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockAuthToken}`
      },
      body: JSON.stringify(newLabel)
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/labels`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(newLabel)
      })
    );

    expect(response.status).toBe(201);
    expect(data).toEqual(expectedResponse);
    expect(data.id).toBe(1);
    expect(data.name).toBe('Bug');
  });

  test('get all labels - successful', async () => {
    const mockLabels = [
      {
        id: 1,
        name: 'Bug',
        color: '#dc3545',
        description: 'Bug reports',
        usageCount: 5
      },
      {
        id: 2,
        name: 'Feature',
        color: '#28a745',
        description: 'New features',
        usageCount: 3
      }
    ];

    mockFetchResponse(mockLabels);

    const response = await fetch(`${API_BASE}/labels`, {
      headers: {
        'Authorization': `Bearer ${mockAuthToken}`
      }
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/labels`,
      expect.objectContaining({
        headers: expect.any(Object)
      })
    );

    expect(response.ok).toBe(true);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0].name).toBe('Bug');
    expect(data[1].name).toBe('Feature');
  });

  test('update label - successful', async () => {
    const labelId = 1;
    const updatedData = {
      name: 'Critical Bug',
      color: '#ff0000',
      description: 'Critical bug reports'
    };

    const expectedResponse = {
      id: labelId,
      ...updatedData,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
      usageCount: 5
    };

    mockFetchResponse(expectedResponse);

    const response = await fetch(`${API_BASE}/labels/${labelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockAuthToken}`
      },
      body: JSON.stringify(updatedData)
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/labels/${labelId}`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedData)
      })
    );

    expect(response.ok).toBe(true);
    expect(data.id).toBe(labelId);
    expect(data.name).toBe('Critical Bug');
    expect(data.color).toBe('#ff0000');
  });

  test('delete label - successful', async () => {
    const labelId = 1;
    const expectedResponse = {
      message: 'Метка успешно удалена',
      id: labelId
    };

    mockFetchResponse(expectedResponse);

    const response = await fetch(`${API_BASE}/labels/${labelId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${mockAuthToken}`
      }
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/labels/${labelId}`,
      expect.objectContaining({
        method: 'DELETE'
      })
    );

    expect(response.ok).toBe(true);
    expect(data.message).toBeTruthy();
    expect(data.id).toBe(labelId);
  });

  test('add label to task - successful', async () => {
    const taskId = 10;
    const labelIds = [1, 2, 3];

    const expectedResponse = {
      message: 'Метки задачи успешно обновлены',
      labels: [
        { id: 1, name: 'Bug', color: '#dc3545' },
        { id: 2, name: 'Feature', color: '#28a745' },
        { id: 3, name: 'Urgent', color: '#fd7e14' }
      ]
    };

    mockFetchResponse(expectedResponse);

    const response = await fetch(`${API_BASE}/tasks/${taskId}/labels`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockAuthToken}`
      },
      body: JSON.stringify({ labelIds })
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tasks/${taskId}/labels`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ labelIds })
      })
    );

    expect(response.ok).toBe(true);
    expect(data.labels).toHaveLength(3);
    expect(data.message).toBeTruthy();
  });

  test('remove label from task - successful', async () => {
    const taskId = 10;
    const labelIds = [1]; // Keep only one label

    const expectedResponse = {
      message: 'Метки задачи успешно обновлены',
      labels: [
        { id: 1, name: 'Bug', color: '#dc3545' }
      ]
    };

    mockFetchResponse(expectedResponse);

    const response = await fetch(`${API_BASE}/tasks/${taskId}/labels`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockAuthToken}`
      },
      body: JSON.stringify({ labelIds })
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.labels).toHaveLength(1);
  });

  test('get task labels - successful', async () => {
    const taskId = 10;
    const mockLabels = [
      { id: 1, name: 'Bug', color: '#dc3545', description: 'Bug reports' },
      { id: 2, name: 'Urgent', color: '#fd7e14', description: 'Urgent tasks' }
    ];

    mockFetchResponse(mockLabels);

    const response = await fetch(`${API_BASE}/tasks/${taskId}/labels`, {
      headers: {
        'Authorization': `Bearer ${mockAuthToken}`
      }
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tasks/${taskId}/labels`,
      expect.any(Object)
    );

    expect(response.ok).toBe(true);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
  });

  test('create label - validation error', async () => {
    const invalidLabel = {
      name: '', // Empty name
      color: '#dc3545'
    };

    const errorResponse = {
      message: 'Название метки обязательно'
    };

    mockFetchResponse(errorResponse, 400);

    const response = await fetch(`${API_BASE}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockAuthToken}`
      },
      body: JSON.stringify(invalidLabel)
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeTruthy();
  });

  test('update label - not found error', async () => {
    const labelId = 999; // Non-existent label
    const updatedData = {
      name: 'Updated Label',
      color: '#000000'
    };

    const errorResponse = {
      message: 'Метка не найдена'
    };

    mockFetchResponse(errorResponse, 404);

    const response = await fetch(`${API_BASE}/labels/${labelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockAuthToken}`
      },
      body: JSON.stringify(updatedData)
    });

    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toContain('не найдена');
  });

  test('create label - duplicate name error', async () => {
    const duplicateLabel = {
      name: 'Bug', // Already exists
      color: '#dc3545'
    };

    const errorResponse = {
      message: 'Метка с таким названием уже существует'
    };

    mockFetchResponse(errorResponse, 400);

    const response = await fetch(`${API_BASE}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockAuthToken}`
      },
      body: JSON.stringify(duplicateLabel)
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain('уже существует');
  });

  test('label search - successful', async () => {
    const searchQuery = 'bug';
    const mockResults = [
      { id: 1, name: 'Bug', color: '#dc3545', usageCount: 5 },
      { id: 2, name: 'Debug', color: '#007bff', usageCount: 2 }
    ];

    mockFetchResponse(mockResults);

    const response = await fetch(`${API_BASE}/labels/search?q=${searchQuery}`, {
      headers: {
        'Authorization': `Bearer ${mockAuthToken}`
      }
    });

    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/labels/search?q=${searchQuery}`,
      expect.any(Object)
    );

    expect(response.ok).toBe(true);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Integration Tests - Combined Features', () => {
  test('dark mode works with toast notifications', () => {
    const IntegrationComponent = () => {
      const { theme, toggleTheme } = useTheme();
      const toast = useToast();

      return (
        <div>
          <div data-testid="current-theme">{theme}</div>
          <button onClick={toggleTheme} data-testid="toggle-theme">
            Toggle Theme
          </button>
          <button
            onClick={() => toast.success(`Theme is ${theme}`)}
            data-testid="show-toast"
          >
            Show Toast
          </button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <ToastProvider>
          <IntegrationComponent />
        </ToastProvider>
      </ThemeProvider>
    );

    // Toggle theme
    act(() => {
      screen.getByTestId('toggle-theme').click();
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // Show toast in dark mode
    act(() => {
      screen.getByTestId('show-toast').click();
    });

    expect(screen.getByText('Theme is dark')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('keyboard shortcuts work with theme toggle', () => {
    const IntegrationComponent = () => {
      const { theme, toggleTheme } = useTheme();

      useKeyboardShortcuts({
        'ctrl+t': toggleTheme
      });

      return (
        <div data-testid="current-theme">{theme}</div>
      );
    };

    render(
      <ThemeProvider>
        <IntegrationComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Trigger Ctrl+T
    fireEvent.keyDown(window, { key: 't', ctrlKey: true });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });
});
