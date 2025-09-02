import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastTimeouts = new Map()

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const ToastContext = React.createContext(undefined)

export const ToastProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })

  const addToast = React.useCallback(
    (toast) => {
      dispatch({
        type: "ADD_TOAST",
        toast: { ...toast, id: genId() },
      })
    },
    [dispatch]
  )

  const updateToast = React.useCallback(
    (toast) => {
      dispatch({
        type: "UPDATE_TOAST",
        toast,
      })
    },
    [dispatch]
  )

  const removeToast = React.useCallback(
    (toastId) => {
      dispatch({
        type: "REMOVE_TOAST",
        toastId,
      })
    },
    [dispatch]
  )

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.duration) {
        addToRemoveQueue(toast.id)
      }
    })
  }, [state.toasts])

  return (
    <ToastContext.Provider
      value={React.useMemo(
        () => ({
          toasts: state.toasts,
          addToast,
          updateToast,
          removeToast,
        }),
        [state.toasts, addToast, updateToast, removeToast]
      )}
    >
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return {
    ...context,
    toast: context.addToast,
  }
}


