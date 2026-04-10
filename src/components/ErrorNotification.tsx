// components/ErrorNotification.tsx
import React, { useEffect, useState } from 'react';
import { XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export type ErrorType = 'error' | 'validation' | 'info' | 'success';

interface ErrorNotificationProps {
  message: string | null;
  type?: ErrorType;
  duration?: number; 
  onClose: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  message, 
  type = 'error', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (message) {
      // Mostrar con animación de entrada
      setIsVisible(true);
      setIsFading(false);
      
      // Configurar temporizador para cerrar
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, duration - 300); 
      
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [message, duration, onClose]);

  if (!message || !isVisible) return null;

  // Configuración según el tipo de error
  const config = {
    error: {
      bg: 'bg-red-500/95',
      border: 'border-red-400',
      icon: <XCircleIcon className="w-5 h-5" />,
      title: 'ERROR DEL SERVIDOR',
      textColor: 'text-red-100'
    },
    validation: {
      bg: 'bg-red-500/95',
      border: 'border-red-400',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      title: 'ERROR DE VALIDACIÓN',
      textColor: 'text-yellow-100'
    },
    info: {
      bg: 'bg-blue-500/95',
      border: 'border-blue-400',
      icon: <InformationCircleIcon className="w-5 h-5" />,
      title: 'INFORMACIÓN',
      textColor: 'text-blue-100'
    },
    success: {
      bg: 'bg-green-500/95',
      border: 'border-green-400',
      icon: <CheckCircleIcon className="w-5 h-5" />,
      title: 'ÉXITO',
      textColor: 'text-green-100'
    }
  };

  const currentConfig = config[type];

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div 
        className={`
          ${currentConfig.bg} 
          ${currentConfig.border} 
          border-2 rounded-lg shadow-2xl overflow-hidden
          transition-all duration-300 ease-out
          ${isFading ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'}
        `}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Icono */}
          <div className={`${currentConfig.textColor} flex-shrink-0`}>
            {currentConfig.icon}
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-black uppercase tracking-wider ${currentConfig.textColor} opacity-90`}>
              {currentConfig.title}
            </p>
            <p className={`text-sm font-medium mt-1 ${currentConfig.textColor} break-words`}>
              {message}
            </p>
          </div>
          
          {/* Botón cerrar */}
          <button
            onClick={() => {
              setIsFading(true);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 300);
            }}
            className={`${currentConfig.textColor} hover:bg-white/10 rounded-md p-1 transition-colors flex-shrink-0`}
            title="Cerrar"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Barra de progreso */}
        <div className="h-1 bg-white/20">
          <div 
            className={`h-full ${type === 'error' ? 'bg-red-300' : type === 'validation' ? 'bg-yellow-300' : 'bg-white'}`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Agrega este CSS global para la animación de la barra
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;
document.head.appendChild(style);