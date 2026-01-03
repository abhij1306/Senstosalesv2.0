import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Title 1 - Page headers
export const Title1 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h1 ref={ref} className={cn('type-title-1', className)} {...props} />
    )
);
Title1.displayName = 'Title1';

// Title 2 - Section headers
export const Title2 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn('type-title-2', className)} {...props} />
    )
);
Title2.displayName = 'Title2';

// Title 3 - Card headers
export const Title3 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn('type-title-3', className)} {...props} />
    )
);
Title3.displayName = 'Title3';

// Display 1 - Huge numbers (Dashboard)
export const Display1 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h1 ref={ref} className={cn('type-display-1', className)} {...props} />
    )
);
Display1.displayName = 'Display1';

// Display 2 - Large numbers
export const Display2 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn('type-display-2', className)} {...props} />
    )
);
Display2.displayName = 'Display2';

// Body - Standard text
export const Body = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('type-body', className)} {...props} />
    )
);
Body.displayName = 'Body';

// Subhead - Labels
export const Subhead = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('type-subhead', className)} {...props} />
    )
);
Subhead.displayName = 'Subhead';

// Footnote - Captions
export const Footnote = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('type-footnote', className)} {...props} />
    )
);
Footnote.displayName = 'Footnote';

// Caption1 - Table headers (uppercase)
export const Caption1 = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('type-caption-1', className)} {...props} />
    )
);
Caption1.displayName = 'Caption1';

// Caption2 - Fine print
export const Caption2 = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('type-caption-2', className)} {...props} />
    )
);
Caption2.displayName = 'Caption2';

// Monospace - Numbers
export const Mono = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => (
        <span ref={ref} className={cn('type-mono', className)} {...props} />
    )
);
Mono.displayName = 'Mono';

// Accounting - Numeric data with currency support
export interface AccountingProps extends React.HTMLAttributes<HTMLSpanElement> {
    isCurrency?: boolean;
}
export const Accounting = forwardRef<HTMLSpanElement, AccountingProps>(
    ({ className, isCurrency, children, ...props }, ref) => (
        <span ref={ref} className={cn('type-mono', className)} {...props}>
            {isCurrency ? `₹${children}` : children}
        </span>
    )
);
Accounting.displayName = 'Accounting';

// Legacy Components Map
export const MonoCode = Mono;
export const SmallText = Footnote;
export const Label = Subhead;
