export interface Message {
  id: string;
  sender: 'user' | 'jack';
  text: string;
  pills?: string[];
  avatar?: string;
  isInitial?: boolean;
}

export interface ServiceCard {
  id: string;
  iconName: 'ShoppingBag' | 'MessageCircle' | 'Send' | 'TrendingUp' | 'BarChart2' | 'Zap';
  title: string;
  description: string;
}

export interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
}
