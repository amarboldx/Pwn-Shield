export type CategoryType = 'Login' | 'Credit Card' | 'Secure Note' | 'Identity';

export interface VaultItem {
  id: string;  
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  category: CategoryType;
  updatedAt: string;
}