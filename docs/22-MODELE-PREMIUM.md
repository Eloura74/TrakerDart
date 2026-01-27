# 💎 Modèle Premium

## 🎯 Objectif

Créer un modèle freemium avec fonctionnalités premium pour monétiser l'application.

## 💰 Stratégie de Monétisation

### Modèle Freemium

```typescript
interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: 'EUR' | 'USD';
  interval: 'month' | 'year';
  features: Feature[];
  limits: Limits;
}

const PRICING_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    features: [
      { id: 'basic_analysis', enabled: true },
      { id: 'sessions_limit', value: 10 },
      { id: 'export_pdf', enabled: false },
      { id: 'ai_coaching', enabled: false },
      { id: 'video_export', enabled: false },
      { id: 'comparison', sessions: 2 }
    ],
    limits: {
      sessionsPerMonth: 10,
      throwsPerSession: 3,
      storageMB: 100,
      exportsPDF: 0,
      aiRecommendations: 0
    }
  },
  
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      { id: 'unlimited_sessions', enabled: true },
      { id: 'advanced_analytics', enabled: true },
      { id: 'export_pdf', unlimited: true },
      { id: 'ai_coaching', enabled: true },
      { id: 'video_export_720p', enabled: true },
      { id: 'comparison', unlimited: true },
      { id: 'priority_support', enabled: true }
    ],
    limits: {
      sessionsPerMonth: Infinity,
      throwsPerSession: Infinity,
      storageMB: 5000,
      exportsPDF: Infinity,
      aiRecommendations: 100
    }
  },
  
  {
    id: 'elite',
    name: 'Elite',
    price: 19.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      { id: 'all_pro_features', enabled: true },
      { id: 'video_export_1080p', enabled: true },
      { id: 'custom_branding', enabled: true },
      { id: 'api_access', enabled: true },
      { id: 'coach_collaboration', enabled: true },
      { id: 'advanced_ai', unlimited: true },
      { id: 'multi_device', enabled: true },
      { id: 'white_label', enabled: true }
    ],
    limits: {
      sessionsPerMonth: Infinity,
      throwsPerSession: Infinity,
      storageMB: Infinity,
      exportsPDF: Infinity,
      aiRecommendations: Infinity
    }
  }
];
```

### Feature Gating

```typescript
class FeatureGate {
  private userTier: SubscriptionTier;
  
  constructor(userId: string) {
    this.userTier = this.getUserTier(userId);
  }
  
  canAccess(featureId: string): boolean {
    const feature = this.userTier.features.find(f => f.id === featureId);
    return feature?.enabled || false;
  }
  
  checkLimit(limitType: keyof Limits): { allowed: boolean; remaining: number } {
    const limit = this.userTier.limits[limitType];
    const used = this.getUsageCount(limitType);
    
    return {
      allowed: used < limit,
      remaining: Math.max(0, limit - used)
    };
  }
  
  async requestFeature(featureId: string) {
    if (this.canAccess(featureId)) {
      return { granted: true };
    }
    
    // Afficher paywall
    return {
      granted: false,
      requiresTier: this.getRequiredTier(featureId),
      upgradeUrl: this.getUpgradeUrl(featureId)
    };
  }
}
```

### Paywall UI

```typescript
export function PaywallModal({ feature, onClose, onUpgrade }: PaywallModalProps) {
  const requiredTier = getRequiredTier(feature);
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            🚀 Passez à {requiredTier.name}
          </DialogTitle>
          <DialogDescription>
            Cette fonctionnalité nécessite un abonnement {requiredTier.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-4 my-6">
          {PRICING_TIERS.map(tier => (
            <PricingCard
              key={tier.id}
              tier={tier}
              highlighted={tier.id === requiredTier.id}
              onSelect={() => onUpgrade(tier)}
            />
          ))}
        </div>
        
        <FeatureComparison />
      </DialogContent>
    </Dialog>
  );
}

function PricingCard({ tier, highlighted, onSelect }: PricingCardProps) {
  return (
    <Card className={cn(
      "relative",
      highlighted && "border-2 border-primary scale-105"
    )}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
          Recommandé
        </div>
      )}
      
      <CardHeader>
        <CardTitle>{tier.name}</CardTitle>
        <div className="text-3xl font-bold">
          {tier.price === 0 ? 'Gratuit' : `${tier.price}€`}
          {tier.price > 0 && <span className="text-sm text-muted-foreground">/mois</span>}
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2">
          {tier.features.map(feature => (
            <li key={feature.id} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{getFeatureName(feature.id)}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onSelect}
          className="w-full mt-6"
          variant={highlighted ? 'default' : 'outline'}
        >
          {tier.price === 0 ? 'Actuel' : 'Souscrire'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Intégration Stripe

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

class SubscriptionManager {
  async createCheckoutSession(
    userId: string,
    tierId: string
  ): Promise<string> {
    const tier = PRICING_TIERS.find(t => t.id === tierId);
    if (!tier || tier.price === 0) throw new Error('Invalid tier');
    
    const session = await stripe.checkout.sessions.create({
      customer_email: await getUserEmail(userId),
      line_items: [{
        price_data: {
          currency: tier.currency.toLowerCase(),
          product_data: {
            name: `TrakerDart ${tier.name}`,
            description: `Abonnement ${tier.interval === 'month' ? 'mensuel' : 'annuel'}`
          },
          unit_amount: tier.price * 100,
          recurring: {
            interval: tier.interval
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      metadata: {
        userId,
        tierId
      }
    });
    
    return session.url!;
  }
  
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.activateSubscription(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.updateSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelSubscription(event.data.object);
        break;
    }
  }
  
  private async activateSubscription(session: Stripe.Checkout.Session) {
    const userId = session.metadata!.userId;
    const tierId = session.metadata!.tierId;
    
    await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier_id: tierId,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
  }
}
```

### Usage Tracking

```typescript
class UsageTracker {
  async trackFeatureUsage(
    userId: string,
    featureId: string
  ) {
    await supabase
      .from('feature_usage')
      .insert({
        user_id: userId,
        feature_id: featureId,
        timestamp: new Date().toISOString()
      });
    
    // Vérifier limites
    const usage = await this.getMonthlyUsage(userId);
    const tier = await this.getUserTier(userId);
    
    if (usage[featureId] >= tier.limits[featureId]) {
      throw new UsageLimitError(featureId, tier);
    }
  }
  
  async getMonthlyUsage(userId: string): Promise<Record<string, number>> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data } = await supabase
      .from('feature_usage')
      .select('feature_id')
      .eq('user_id', userId)
      .gte('timestamp', startOfMonth.toISOString());
    
    return data.reduce((acc, row) => {
      acc[row.feature_id] = (acc[row.feature_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
```

### Analytics & Conversion

```typescript
interface ConversionMetrics {
  freemiumUsers: number;
  paidUsers: number;
  conversionRate: number;
  monthlyRevenue: number;
  churnRate: number;
  ltv: number;
}

class ConversionAnalytics {
  async trackConversion(userId: string, fromTier: string, toTier: string) {
    await analytics.track('subscription_upgrade', {
      user_id: userId,
      from_tier: fromTier,
      to_tier: toTier,
      revenue: PRICING_TIERS.find(t => t.id === toTier)?.price || 0
    });
  }
  
  async getMetrics(): Promise<ConversionMetrics> {
    const users = await this.getAllUsers();
    const subscriptions = await this.getActiveSubscriptions();
    
    const freeUsers = users.filter(u => u.tier === 'free').length;
    const paidUsers = subscriptions.length;
    
    return {
      freemiumUsers: freeUsers,
      paidUsers,
      conversionRate: (paidUsers / users.length) * 100,
      monthlyRevenue: subscriptions.reduce((sum, s) => sum + s.amount, 0),
      churnRate: await this.calculateChurn(),
      ltv: await this.calculateLTV()
    };
  }
}
```

## 📦 Dépendances

```json
{
  "stripe": "^14.10.0",
  "@stripe/stripe-js": "^2.4.0",
  "@stripe/react-stripe-js": "^2.4.0"
}
```

## ✅ Checklist

- [ ] 3 tiers de pricing
- [ ] Feature gating système
- [ ] Paywall UI/UX
- [ ] Intégration Stripe
- [ ] Webhooks subscriptions
- [ ] Usage tracking
- [ ] Analytics conversion
- [ ] Customer portal
- [ ] Invoice management
- [ ] Free trial (14 jours)

## 🎯 Objectifs

- ✅ Conversion free→paid: 5%
- ✅ Churn rate < 5%/mois
- ✅ LTV > 200€
- ✅ MRR +20%/mois

---

**Difficulté** : ⭐ Faible  
**Durée** : 1-2 semaines  
**Impact** : 💰💰💰 Très élevé (Monétisation)
