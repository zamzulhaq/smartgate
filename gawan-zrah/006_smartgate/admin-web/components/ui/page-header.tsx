import * as React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export type PageHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 md:flex-row md:items-center md:justify-between", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-bold text-text">{title}</h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  ),
);
PageHeader.displayName = "PageHeader";
