// Inspired by react-hot-toast library
import { useState, useEffect, createContext, useContext } from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type ActionType = typeof actionTypes[keyof typeof actionTypes];

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  action?: React.ReactNode;
}

interface ToastState {
  toasts: Toast[];
}

interface AddToastAction {
  type: typeof actionTypes.ADD_TOAST;
  toast: Toast;
}

interface UpdateToastAction {
  type: typeof actionTypes.UPDATE_TOAST;
  toast: Partial<Toast> & { id: string };
}

interface DismissToastAction {
  type: typeof actionTypes.DISMISS_TOAST;
  toastId?: string;
}

interface RemoveToastAction {
  type: typeof actionTypes.REMOVE_TOAST;
  toastId?: string;
}

type ToastAction = AddToastAction | UpdateToastAction | DismissToastAction | RemoveToastAction;

let count = 0;

function genId(): string {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map<string, NodeJS.Timeout>();

const addToRemoveQueue = (toastId: string): void => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const clearFromRemoveQueue = (toastId: string): void => {
  const timeout = toastTimeouts.get(toastId);
  if (timeout) {
    clearTimeout(timeout);
    toastTimeouts.delete(toastId);
  }
};

export const reducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      // Immediately remove the toast instead of just closing it
      if (toastId) {
        // Clear any existing timeout for this toast
        clearFromRemoveQueue(toastId);
        // Immediately remove from DOM
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      } else {
        // Clear all timeouts and remove all toasts
        state.toasts.forEach((toast) => {
          clearFromRemoveQueue(toast.id);
        });
        return {
          ...state,
          toasts: [],
        };
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: ToastState) => void> = [];

let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

interface ToastConfig {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  action?: React.ReactNode;
}

interface ToastResult {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToastConfig>) => void;
  timeoutId?: NodeJS.Timeout;
}

function toast({ ...props }: ToastConfig): ToastResult {
  const id = genId();

  const update = (props: Partial<ToastConfig>): void =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = (): void =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
    timeoutId: undefined,
  };
}

interface UseToastReturn {
  toasts: Toast[];
  toast: (config: ToastConfig) => ToastResult;
  dismiss: (toastId?: string) => void;
}

function useToast(): UseToastReturn {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
export type { Toast, ToastConfig, ToastResult, UseToastReturn }; 