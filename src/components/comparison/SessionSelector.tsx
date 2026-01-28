import { TrainingSession } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SessionSelectorProps {
  sessions: TrainingSession[];
  selectedSessionId1: string;
  selectedSessionId2: string;
  onSelectSession1: (id: string) => void;
  onSelectSession2: (id: string) => void;
}

export function SessionSelector({
  sessions,
  selectedSessionId1,
  selectedSessionId2,
  onSelectSession1,
  onSelectSession2,
}: SessionSelectorProps) {
  // Trier les sessions par date décroissante
  const sortedSessions = [...sessions].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  const formatSessionLabel = (session: TrainingSession) => {
    const date = format(new Date(session.createdAt), "d MMMM yyyy 'à' HH:mm", {
      locale: fr,
    });
    const stats = session.stats
      ? ` - ${session.stats.totalThrows} lancers, ${session.stats.averageConsistency.toFixed(
          0,
        )}% rég.`
      : "";
    return `${date}${stats}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Session A</label>
        <Select value={selectedSessionId1} onValueChange={onSelectSession1}>
          <SelectTrigger className="w-full border-white/10 bg-card/50 text-white backdrop-blur-sm">
            <SelectValue placeholder="Sélectionner une session" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-card text-white backdrop-blur-xl">
            {sortedSessions.map((session) => (
              <SelectItem
                key={session.id}
                value={session.id}
                disabled={session.id === selectedSessionId2}
                className="focus:bg-white/10 focus:text-white"
              >
                {formatSessionLabel(session)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Session B</label>
        <Select value={selectedSessionId2} onValueChange={onSelectSession2}>
          <SelectTrigger className="w-full border-white/10 bg-card/50 text-white backdrop-blur-sm">
            <SelectValue placeholder="Sélectionner une session" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-card text-white backdrop-blur-xl">
            {sortedSessions.map((session) => (
              <SelectItem
                key={session.id}
                value={session.id}
                disabled={session.id === selectedSessionId1}
                className="focus:bg-white/10 focus:text-white"
              >
                {formatSessionLabel(session)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
