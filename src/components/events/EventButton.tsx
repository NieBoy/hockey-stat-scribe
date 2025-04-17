
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function EventButton({ label, onClick, icon, className }: EventButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      className={cn(
        "w-full h-24 text-xl flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      {icon && <div className="text-2xl">{icon}</div>}
      {label}
    </Button>
  );
}
