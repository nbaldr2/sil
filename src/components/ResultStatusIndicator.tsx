import  React from 'react';
import { CheckCircle, AlertTriangle, Clock, AlertCircle } from 'lucide-react';

interface ResultStatusIndicatorProps {
  status: 'pending' | 'completed' | 'abnormal' | 'missing';
}

export default function ResultStatusIndicator({ status }: ResultStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          text: 'Terminé'
        };
      case 'abnormal':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          text: 'Anormal'
        };
      case 'missing':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'Manquant'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'En attente'
        };
    }
  };

  const { icon: Icon, color, bgColor, text } = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      <Icon className={`${color} mr-1`} size={12} />
      <span className={color}>{text}</span>
    </div>
  );
}
 