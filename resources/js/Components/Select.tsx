import React, { forwardRef, useEffect, useRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    className?: string;
    isFocused?: boolean;
}

export default forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { className = '', isFocused = false, children, ...props },
    ref
) {
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isFocused) {
            selectRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
            ref={ref || selectRef}
        >
            {children}
        </select>
    );
});
