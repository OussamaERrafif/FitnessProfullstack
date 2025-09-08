/**
 * Statistics service for backend integration
 */

import { apiRequest } from './api-client';
import { authService } from './auth-service';

export interface TrainerStats {
  total_clients: number;
  active_clients: number;
  todays_sessions: number;
  monthly_revenue: number;
  progress_completion: number;
  client_growth: number;
  engagement_rate: number;
}

export interface ClientProgress {
  client_id: string;
  client_name: string;
  last_session: string;
  progress_percentage: number;
  goals_completed: number;
  total_goals: number;
}

export interface RevenueStats {
  monthly_revenue: number;
  yearly_revenue: number;
  revenue_growth: number;
  average_session_value: number;
  payment_trends: {
    month: string;
    amount: number;
  }[];
}

export const statisticsService = {
  /**
   * Get overall trainer dashboard statistics
   */
  async getTrainerStats(): Promise<TrainerStats> {
    try {
      const response = await apiRequest<TrainerStats>(
        '/statistics/trainer',
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch trainer statistics:', error);
      // Return default stats if API fails
      return {
        total_clients: 0,
        active_clients: 0,
        todays_sessions: 0,
        monthly_revenue: 0,
        progress_completion: 0,
        client_growth: 0,
        engagement_rate: 0,
      };
    }
  },

  /**
   * Get client progress summary
   */
  async getClientProgress(limit: number = 10): Promise<ClientProgress[]> {
    try {
      const response = await apiRequest<ClientProgress[]>(
        `/statistics/client-progress?limit=${limit}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch client progress:', error);
      return [];
    }
  },

  /**
   * Get revenue statistics
   */
  async getRevenueStats(): Promise<RevenueStats> {
    try {
      const response = await apiRequest<RevenueStats>(
        '/statistics/revenue',
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch revenue statistics:', error);
      return {
        monthly_revenue: 0,
        yearly_revenue: 0,
        revenue_growth: 0,
        average_session_value: 0,
        payment_trends: [],
      };
    }
  },

  /**
   * Get dashboard overview data (combines multiple stats)
   */
  async getDashboardOverview(): Promise<{
    stats: TrainerStats;
    recentProgress: ClientProgress[];
    revenue: RevenueStats;
  }> {
    try {
      // Fetch all data in parallel
      const [stats, recentProgress, revenue] = await Promise.all([
        this.getTrainerStats(),
        this.getClientProgress(5),
        this.getRevenueStats(),
      ]);

      return {
        stats,
        recentProgress,
        revenue,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
      throw error;
    }
  },
};