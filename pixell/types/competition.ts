export interface Competition {
  id: string;
  title: string;
  description: string;
  mascot: string;
  registerUrl: string;
  guidebookUrl: string;
  color: "yellow" | "pink" | "cyan";
}