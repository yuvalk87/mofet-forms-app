import * as React from "react"
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--swipe-duration)] data-[swipe=cancel]:duration-200 data-[swipe=end]:duration-200 data-[swipe=cancel]:ease-out data-[swipe=end]:ease-out data-[open]:animate-in data-[close]:animate-out data-[swipe=end]:animate-out data-[open]:slide-in-from-top-full data-[open]:sm:slide-in-from-bottom-full data-[close]:slide-out-to-right-full data-[close]:sm:slide-out-to-bottom-full",
  {
    variants: {
      variant: {
        default:
          "border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
        destructive:
          "destructive group border-red-500 bg-red-500 text-slate-50 dark:border-red-900 dark:bg-red-900 dark:text-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {children}
      </li>
    )
  }
)
Toast.displayName = "Toast"

const ToastProvider = ({ ...props }) => (
  <Toast.Provider
    className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    {...props}
  />
)
ToastProvider.displayName = "ToastProvider"

const ToastViewport = React.forwardRef((props, ref) => (
  <Toast.Viewport
    ref={ref}
    className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

const ToastRoot = React.forwardRef(({ className, ...props }, ref) => (
  <Toast.Root
    ref={ref}
    className={cn(
      "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--swipe-duration)] data-[swipe=cancel]:duration-200 data-[swipe=end]:duration-200 data-[swipe=cancel]:ease-out data-[swipe=end]:ease-out data-[open]:animate-in data-[close]:animate-out data-[swipe=end]:animate-out data-[open]:slide-in-from-top-full data-[open]:sm:slide-in-from-bottom-full data-[close]:slide-out-to-right-full data-[close]:sm:slide-out-to-bottom-full",
      className
    )}
    {...props}
  />
))
ToastRoot.displayName = "ToastRoot"

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <Toast.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <Toast.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <Toast.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-slate-950/50 opacity-0 transition-opacity hover:text-slate-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </Toast.Close>
))
ToastClose.displayName = "ToastClose"

const toast = ({ ...props }) => {
  return {
    id: Date.now(),
    ...props,
  }
}

export { toast, ToastProvider, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose, toastVariants }

