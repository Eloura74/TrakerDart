/**
 * Hook simple pour afficher des notifications toast
 * Version basique avec alert() en attendant un vrai système de toast
 */

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const message = options.description 
      ? `${options.title}\n\n${options.description}`
      : options.title;
    
    // Version basique avec alert
    // TODO: Remplacer par un vrai système de toast (react-hot-toast, sonner, etc.)
    if (options.variant === 'destructive') {
      console.error('[Toast Error]', message);
      alert(`❌ ${message}`);
    } else {
      console.log('[Toast]', message);
      alert(`✅ ${message}`);
    }
  };

  return { toast };
}
