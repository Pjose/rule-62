'use client';

import * as React from 'react';
import { cx } from '@/lib/utils';

// ---------- Form wiring ----------
// Wraps a <form> so it can call a Server Action directly and surface its
// returned { error } message, without needing experimental React APIs.

const PendingContext = React.createContext(false);

type ActionResult = { error?: string } | void;

export function FormAction({
  action,
  children,
  className,
  resetOnSuccess = true,
  onSuccess,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  return (
    <PendingContext.Provider value={pending}>
      <form
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          setError(null);
          startTransition(async () => {
            const result = await action(formData);
            if (result && 'error' in result && result.error) {
              setError(result.error);
              return;
            }
            if (resetOnSuccess) form.reset();
            onSuccess?.();
          });
        }}
      >
        {children}
        {error && (
          <p role="alert" className="mt-2 text-sm text-brick font-medium">
            {error}
          </p>
        )}
      </form>
    </PendingContext.Provider>
  );
}

export function useFormPending() {
  return React.useContext(PendingContext);
}

// ---------- Buttons ----------

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-sage text-paper hover:bg-sage-dark focus-visible:outline-sage',
  secondary: 'bg-transparent text-ink border border-ink/30 hover:bg-ink/5 focus-visible:outline-ink',
  accent: 'bg-amber text-ink hover:bg-amber-dark focus-visible:outline-amber-dark',
  ghost: 'bg-transparent text-inkmuted hover:text-ink hover:bg-ink/5 focus-visible:outline-ink',
  danger: 'bg-transparent text-brick border border-brick/40 hover:bg-brick/10 focus-visible:outline-brick',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' }) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-card font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed outline-offset-2',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SubmitButton({
  children,
  pendingText = 'Saving…',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md'; pendingText?: string }) {
  const pending = useFormPending();
  return (
    <Button type="submit" disabled={pending} {...(props as any)}>
      {pending ? pendingText : children}
    </Button>
  );
}

// ---------- Layout primitives ----------

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx('rounded-card border border-rule bg-paper shadow-card p-5', className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="font-mono text-xs uppercase tracking-widest text-sage-dark mb-1">{eyebrow}</p>}
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-inkmuted max-w-2xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-rule bg-paper/60 p-8 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-inkmuted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cx('border-t border-rule', className)} />;
}

// ---------- Form fields ----------

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink mb-1">
      {children}
    </label>
  );
}

const fieldBase =
  'w-full rounded-card border border-ink/20 bg-white/70 px-3 py-2 text-ink placeholder:text-inkmuted/70 focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(fieldBase, props.className)} {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(fieldBase, 'min-h-[6rem]', props.className)} {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(fieldBase, props.className)} {...props} />;
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink select-none cursor-pointer">
      <input type="checkbox" className="h-4 w-4 rounded border-ink/30 text-sage focus:ring-sage/50" {...props} />
      {label}
    </label>
  );
}

// ---------- Badges ----------

type BadgeTone = 'open' | 'filled' | 'pending' | 'neutral' | 'admin' | 'coordinator';

const badgeClasses: Record<BadgeTone, string> = {
  open: 'bg-amber/15 text-amber-dark border border-amber/40',
  filled: 'bg-sage/15 text-sage-dark border border-sage/40',
  pending: 'bg-brick/10 text-brick border border-brick/30',
  neutral: 'bg-ink/5 text-inkmuted border border-ink/15',
  admin: 'bg-sage text-paper border border-sage',
  coordinator: 'bg-sage/20 text-sage-dark border border-sage/40',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', badgeClasses[tone])}>
      {children}
    </span>
  );
}
