import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  headerAccent?: string; // Cor opcional para borda superior
  className?: string;
  hoverLift?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  headerAccent,
  hoverLift = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-card transition-all duration-300 ease-out relative overflow-hidden ${
        hoverLift ? 'hover:-translate-y-1 hover:shadow-xl' : ''
      } ${className}`}
      style={{
        borderTopColor: headerAccent || undefined,
        borderTopWidth: headerAccent ? '4px' : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`p-6 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-bold text-slate-900 font-['Outfit']">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-4 sm:p-6 bg-slate-50/60 border-t border-slate-100 ${className}`}>{children}</div>;
};
