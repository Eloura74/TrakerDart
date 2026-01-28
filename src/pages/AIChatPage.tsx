/**
 * Page de chat interactif avec l'assistant IA
 * Permet de poser des questions et obtenir des conseils personnalisés
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/AppHeader';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Settings,
  Loader2 
} from 'lucide-react';
import { AIService } from '@/services/aiService';
import type { AIChatMessage, AISettings } from '@/types/ai';
import { DEFAULT_AI_SETTINGS } from '@/types/ai';

export function AIChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiService, setAiService] = useState<AIService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger la config IA au montage
  useEffect(() => {
    const apiKey = localStorage.getItem('openai_api_key');
    const savedSettings = localStorage.getItem('ai_settings');
    
    if (!apiKey) {
      toast({
        title: 'Configuration requise',
        description: 'Veuillez configurer votre clé API OpenAI dans les paramètres.',
        variant: 'destructive',
      });
      return;
    }

    const settings: AISettings = savedSettings 
      ? JSON.parse(savedSettings) 
      : DEFAULT_AI_SETTINGS;

    if (!settings.chatEnabled) {
      toast({
        title: 'Chat désactivé',
        description: 'Activez le chat dans les paramètres IA.',
        variant: 'destructive',
      });
      return;
    }

    const service = new AIService(apiKey, settings.modelConfig);
    setAiService(service);

    // Message d'accueil
    setMessages([{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '👋 Bonjour ! Je suis votre coach IA personnel. Posez-moi vos questions sur votre technique, votre entraînement ou vos performances !',
      timestamp: new Date(),
    }]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Envoyer un message
   */
  const sendMessage = async () => {
    if (!input.trim() || !aiService || loading) return;

    const userMessage: AIChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Préparer le contexte de conversation
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      chatHistory.push({
        role: 'user',
        content: userMessage.content,
      });

      // Appeler l'IA
      const response = await aiService.chat(chatHistory as any);

      setMessages(prev => [...prev, response]);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de communiquer avec l\'IA.',
        variant: 'destructive',
      });

      // Message d'erreur
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '❌ Désolé, une erreur s\'est produite. Vérifiez votre clé API et votre connexion.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gérer la touche Entrée
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen app-bg-gradient">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Assistant Coach IA</h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.hash = '#/ai-settings'}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>

        {/* Zone de chat */}
        <Card className="border-primary/20 h-[600px] flex flex-col">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Conversation avec votre coach
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message */}
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.tokensUsed && (
                      <>
                        <span>•</span>
                        <span>{message.tokensUsed} tokens</span>
                      </>
                    )}
                    {message.modelUsed && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs py-0">
                          {message.modelUsed}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">L'IA réfléchit...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t border-border/50 p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                disabled={!aiService || loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || !aiService || loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>

            {!aiService && (
              <p className="text-xs text-yellow-500 mt-2">
                ⚠️ Configuration requise : Allez dans les{' '}
                <a href="#/ai-settings" className="underline hover:text-yellow-400">
                  paramètres IA
                </a>
              </p>
            )}
          </div>
        </Card>

        {/* Suggestions rapides */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">Suggestions de questions :</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Comment améliorer ma précision ?',
              'Quel exercice pour mon coude ?',
              'Plan d\'entraînement 30 jours',
              'Analyse mes dernières sessions',
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setInput(suggestion)}
                disabled={loading || !aiService}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
