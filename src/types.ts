export interface PrayerItem {
  id: number;
  title?: string;
  category: string[];
  description: string;
  userName: string;
  prayCount: number;
  date: string;
  images: string[];
  comments: Comment[];
  status?: 'pending' | 'approved';
}

export interface Comment {
  id: number;
  userName: string;
  content: string;
  date: string;
  prayCount: number;
  replies: Comment[];
  images?: string[];
  audio?: string | null;
}
