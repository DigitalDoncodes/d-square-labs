export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      {Icon && <Icon className="h-10 w-10 text-gray-400" />}
      <p className="font-medium text-gray-600 dark:text-gray-300">{title}</p>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      {action}
    </div>
  );
}
