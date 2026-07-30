import apiClient from './apiClient'

export const notificationService = {
  /**
   * Fetch user notifications
   */
  async fetchNotifications() {
    const response = await apiClient.get('/notifikasi')
    return response.data
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id) {
    const response = await apiClient.patch(`/notifikasi/${id}/baca`)
    return response.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await apiClient.patch('/notifikasi/baca-semua')
    return response.data
  },
}
