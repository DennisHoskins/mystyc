import { Clock, AlarmClockCheck } from 'lucide-react'

interface ScheduleIconProps {
  size?: number;
  variant?: 'schedule' | 'schedule-execution';
}

export default function ScheduleIcon({ size = 6, variant = 'schedule' }: ScheduleIconProps) {
  return (
    <>
      {variant === 'schedule-execution' ? 
        (
          <AlarmClockCheck className={`w-${size} h-${size}`} />
        ) : (
          <Clock className={`w-${size} h-${size}`} />
        ) 
      }
    </>
  );    
}