/**
 * Plan d'entraînement progressif sur 4 semaines
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, TrendingUp, Trophy, Lightbulb } from "lucide-react";

interface TrainingPlanProps {
  plan: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  };
  compact?: boolean;
}

export function TrainingPlan({ plan, compact = false }: TrainingPlanProps) {
  const weeks = [
    {
      number: 1,
      content: plan.week1,
      icon: Target,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      number: 2,
      content: plan.week2,
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      number: 3,
      content: plan.week3,
      icon: Calendar,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      number: 4,
      content: plan.week4,
      icon: Trophy,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  if (compact) {
    return (
      <div className="space-y-4">
        {weeks.slice(0, 2).map((week) => {
          const Icon = week.icon;
          return (
            <div
              key={week.number}
              className="p-3 rounded border border-white/10 bg-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${week.color}`} />
                <span className={`text-xs font-bold ${week.color} uppercase`}>
                  Semaine {week.number}
                </span>
              </div>
              <ul className="space-y-1">
                {week.content.slice(0, 2).map((line, index) => (
                  <li key={index} className="text-xs text-gray-400 truncate">
                    {line.replace(/^[•-]\s*/, "")}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            + 2 semaines supplémentaires
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Plan d'entraînement progressif
        </CardTitle>
        <CardDescription>
          Programme sur 4 semaines pour corriger vos points faibles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeks.map((week) => {
            const Icon = week.icon;
            return (
              <div
                key={week.number}
                className={`p-4 rounded-lg border-2 ${week.bgColor} border-border`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-5 w-5 ${week.color}`} />
                  <Badge variant="outline" className={week.color}>
                    Semaine {week.number}
                  </Badge>
                </div>

                <ul className="space-y-2">
                  {week.content.map((line, index) => (
                    <li
                      key={index}
                      className={`text-sm ${
                        line.startsWith("🎯")
                          ? "font-semibold mb-2"
                          : line.startsWith("•")
                            ? "ml-4"
                            : ""
                      }`}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Conseils généraux */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Conseils pour réussir votre entraînement
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>
              • <strong>Régularité :</strong> Mieux vaut 20 min par jour que 2h
              le dimanche
            </li>
            <li>
              • <strong>Qualité &gt; Quantité :</strong> Focus sur la technique,
              pas le score
            </li>
            <li>
              • <strong>Échauffement :</strong> 5 min d'étirements avant chaque
              session
            </li>
            <li>
              • <strong>Repos :</strong> 1 jour de pause par semaine minimum
            </li>
            <li>
              • <strong>Progression :</strong> Ne passez à la semaine suivante
              que quand vous êtes à l'aise
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
