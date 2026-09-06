export interface Speaker {
  id: string;
  name: string;
  role: string;
  category: "guest-star" | "speaker";
  photo?: string;
  photoPosition?: string;
  cv?: string;
  color: "yellow" | "pink" | "cyan";
}