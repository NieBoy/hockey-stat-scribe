
interface StatTypeSectionHeaderProps {
  title: string;
}

export default function StatTypeSectionHeader({ title }: StatTypeSectionHeaderProps) {
  return <h3 className="font-semibold capitalize">{title}</h3>;
}
