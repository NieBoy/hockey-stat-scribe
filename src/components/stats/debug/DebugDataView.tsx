
interface DebugDataViewProps {
  title: string;
  data: any[];
  maxItems?: number;
}

export default function DebugDataView({ title, data, maxItems = 10 }: DebugDataViewProps) {
  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
        {JSON.stringify(data.slice(0, maxItems), null, 2)}
        {data.length > maxItems && 
          `\n... and ${data.length - maxItems} more items`}
      </pre>
    </div>
  );
}
