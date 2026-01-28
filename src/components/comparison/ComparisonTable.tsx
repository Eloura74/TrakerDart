import { TrainingSession } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface ComparisonTableProps {
  sessions: TrainingSession[];
}

export function ComparisonTable({ sessions }: ComparisonTableProps) {
  // Trier par date décroissante pour l'affichage en colonnes
  const sortedSessions = [...sessions].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 2) return <ArrowUp className="h-4 w-4 text-green-400" />;
    if (diff < -2) return <ArrowDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="rounded-md border border-white/10 bg-card/40 backdrop-blur-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead className="w-[200px] text-gray-300">Métrique</TableHead>
            {sortedSessions.map((session) => (
              <TableHead key={session.id} className="text-center text-gray-300">
                <div className="flex flex-col">
                  <span className="font-bold text-white">
                    {format(new Date(session.createdAt), "d MMM", {
                      locale: fr,
                    })}
                  </span>
                  <span className="text-xs font-normal">
                    {format(new Date(session.createdAt), "HH:mm")}
                  </span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableCell className="font-medium text-gray-300">
              Régularité
            </TableCell>
            {sortedSessions.map((session, index) => {
              const prevSession = sortedSessions[index + 1];
              const value = session.stats?.averageConsistency || 0;
              const prevValue = prevSession?.stats?.averageConsistency || value;

              return (
                <TableCell key={session.id} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-cyan-400">
                      {value.toFixed(0)}%
                    </span>
                    {index < sortedSessions.length - 1 &&
                      getTrendIcon(value, prevValue)}
                  </div>
                </TableCell>
              );
            })}
          </TableRow>

          <TableRow className="border-white/10 hover:bg-white/5">
            <TableCell className="font-medium text-gray-300">
              Score Technique
            </TableCell>
            {sortedSessions.map((session) => (
              <TableCell key={session.id} className="text-center text-white">
                {(session.stats?.averageTechnicalScore || 0).toFixed(1)}
              </TableCell>
            ))}
          </TableRow>

          <TableRow className="border-white/10 hover:bg-white/5">
            <TableCell className="font-medium text-gray-300">Lancers</TableCell>
            {sortedSessions.map((session) => (
              <TableCell key={session.id} className="text-center text-white">
                {session.stats?.totalThrows || 0}
              </TableCell>
            ))}
          </TableRow>

          <TableRow className="border-white/10 hover:bg-white/5">
            <TableCell className="font-medium text-gray-300">Durée</TableCell>
            {sortedSessions.map((session) => (
              <TableCell
                key={session.id}
                className="text-center text-muted-foreground"
              >
                {session.duration
                  ? Math.round(session.duration / 60000) + " min"
                  : "-"}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
