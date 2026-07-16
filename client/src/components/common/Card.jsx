const PADDING = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const BASE = 'rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800/80 dark:bg-gray-900';

export default function Card({
  variant = 'passive',
  padding = 'md',
  hoverable = false,
  onClick,
  as: Tag = 'div',
  className = '',
  children,
}) {
  const interactive = hoverable || onClick;
  const cls = `${BASE} ${PADDING[padding]} ${
    interactive
      ? 'transition-shadow duration-150 ease-out cursor-pointer hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.07)]'
      : ''
  } ${className}`;

  if (onClick) {
    return <button type="button" onClick={onClick} className={cls}>{children}</button>;
  }

  return <Tag className={cls}>{children}</Tag>;
}
