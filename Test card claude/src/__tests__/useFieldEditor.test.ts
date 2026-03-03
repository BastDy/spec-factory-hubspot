// V2: Unit tests for hooks/useFieldEditor.ts
// Tests inline field editing lifecycle: idle, editing, saving, success, error

import { renderHook, act } from '@testing-library/react';
import { useFieldEditor } from '../app/cards/hooks/useFieldEditor';

const defaultOptions = {
  fieldName: 'phone',
  initialValue: '+33612345678',
  fieldType: 'text' as const,
  objectType: 'contacts' as const,
  objectId: '12345',
};

describe('useFieldEditor', () => {
  describe('initial state', () => {
    it('returns initial value and idle status', () => {
      const { result } = renderHook(() => useFieldEditor(defaultOptions));
      expect(result.current.currentValue).toBe('+33612345678');
      expect(result.current.isEditing).toBe(false);
      expect(result.current.status).toBe('idle');
      expect(result.current.errorMessage).toBeNull();
    });

    it('handles null initialValue', () => {
      const { result } = renderHook(() => useFieldEditor({ ...defaultOptions, initialValue: null }));
      expect(result.current.currentValue).toBeNull();
    });
  });

  describe('startEditing', () => {
    it('sets isEditing to true and resets status', () => {
      const { result } = renderHook(() => useFieldEditor(defaultOptions));
      act(() => {
        result.current.startEditing();
      });
      expect(result.current.isEditing).toBe(true);
      expect(result.current.status).toBe('idle');
      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('cancelEditing', () => {
    it('reverts to initialValue and clears editing state', () => {
      const { result } = renderHook(() => useFieldEditor(defaultOptions));
      act(() => {
        result.current.startEditing();
      });
      act(() => {
        result.current.updateValue('new-value');
      });
      expect(result.current.currentValue).toBe('new-value');

      act(() => {
        result.current.cancelEditing();
      });
      expect(result.current.currentValue).toBe('+33612345678');
      expect(result.current.isEditing).toBe(false);
      expect(result.current.status).toBe('idle');
    });
  });

  describe('updateValue', () => {
    it('updates currentValue', () => {
      const { result } = renderHook(() => useFieldEditor(defaultOptions));
      act(() => {
        result.current.startEditing();
      });
      act(() => {
        result.current.updateValue('+33699999999');
      });
      expect(result.current.currentValue).toBe('+33699999999');
    });
  });

  describe('saveField — success', () => {
    it('calls saveFn and transitions to success state', async () => {
      const saveFn = jest.fn().mockResolvedValue(undefined);
      const onSaveSuccess = jest.fn();
      const { result } = renderHook(() => useFieldEditor({
        ...defaultOptions,
        saveFn,
        onSaveSuccess,
      }));

      act(() => {
        result.current.startEditing();
      });
      act(() => {
        result.current.updateValue('+33699999999');
      });

      await act(async () => {
        await result.current.saveField();
      });

      expect(saveFn).toHaveBeenCalledWith('contacts', '12345', 'phone', '+33699999999');
      expect(result.current.status).toBe('success');
      expect(result.current.isEditing).toBe(false);
      expect(onSaveSuccess).toHaveBeenCalledWith('phone', '+33699999999');
    });

    it('transitions to success even without saveFn (no-op mode)', async () => {
      const { result } = renderHook(() => useFieldEditor(defaultOptions));

      act(() => {
        result.current.startEditing();
      });

      await act(async () => {
        await result.current.saveField();
      });

      expect(result.current.status).toBe('success');
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('saveField — error (E10)', () => {
    it('transitions to error state and maintains editing mode', async () => {
      const saveFn = jest.fn().mockRejectedValue(new Error('API Error'));
      const { result } = renderHook(() => useFieldEditor({ ...defaultOptions, saveFn }));

      act(() => {
        result.current.startEditing();
      });

      await act(async () => {
        await result.current.saveField();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.isEditing).toBe(true);
      expect(result.current.errorMessage).toBe('API Error');
    });

    it('ignores second saveField call while saving (E10 — debounce guard)', async () => {
      let resolveSave: (() => void) | undefined;
      const saveFn = jest.fn().mockImplementation(() => new Promise<void>((resolve) => {
        resolveSave = resolve;
      }));
      const { result } = renderHook(() => useFieldEditor({ ...defaultOptions, saveFn }));

      act(() => {
        result.current.startEditing();
      });

      // Start first save (will be pending)
      let firstSave: Promise<void>;
      act(() => {
        firstSave = result.current.saveField();
      });

      // Try second save while first is still 'saving' — should be ignored
      await act(async () => {
        await result.current.saveField();
      });

      // Resolve the first save
      act(() => {
        resolveSave?.();
      });
      await act(async () => {
        await firstSave!;
      });

      // saveFn should only have been called once
      expect(saveFn).toHaveBeenCalledTimes(1);
    });
  });
});
