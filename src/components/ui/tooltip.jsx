import * as React from "react"

const TooltipProvider = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

const Tooltip = ({ children }) => {
  return <div className="relative inline-block">{children}</div>
}

const TooltipTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  return React.cloneElement(children, { ...props, ref })
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md px-2 py-1 text-sm text-[var(--text-primary)] shadow-lg whitespace-nowrap z-50 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }