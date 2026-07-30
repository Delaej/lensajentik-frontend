import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import KaderLayout from '@/layouts/KaderLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Public views
import HomeView from '@/views/public/HomeView.vue'
import RiskMapView from '@/views/public/RiskMapView.vue'
import ReportView from '@/views/public/ReportView.vue'
import StatisticsView from '@/views/public/StatisticsView.vue'
import NotificationView from '@/views/public/NotificationView.vue'
import EducationView from '@/views/public/EducationView.vue'
import QuizView from '@/views/public/QuizView.vue'
import ArticleDetailView from '@/views/public/ArticleDetailView.vue'

// Kader views
import KaderLoginView from '@/views/kader/KaderLoginView.vue'
import ForgotPasswordView from '@/views/kader/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/kader/ResetPasswordView.vue'
import KaderDashboardView from '@/views/kader/KaderDashboardView.vue'
import KaderAbjView from '@/views/kader/KaderAbjView.vue'
import KaderHistoryView from '@/views/kader/KaderHistoryView.vue'
import KaderReportsView from '@/views/kader/KaderReportsView.vue'
import KaderNotificationsView from '@/views/kader/KaderNotificationsView.vue'
import KaderSettingsView from '@/views/kader/KaderSettingsView.vue'

const routes = [
  // Public Routes (Warga)
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: 'LensaJentik - Pemetaan & Mitigasi Risiko DBD & Malaria' },
      },
      {
        path: 'peta-resiko',
        name: 'peta-resiko',
        component: RiskMapView,
        meta: { title: 'Peta Risiko Web-GIS - LensaJentik' },
      },
      {
        path: 'laporan',
        name: 'laporan',
        component: ReportView,
        meta: { title: 'Lapor Genangan Jentik - LensaJentik' },
      },
      {
        path: 'statistik',
        name: 'statistik',
        component: StatisticsView,
        meta: { title: 'Statistik & Tren ABJ Publik - LensaJentik' },
      },
      {
        path: 'notifikasi',
        name: 'notifikasi-publik',
        component: NotificationView,
        meta: { title: 'Pusat Notifikasi - LensaJentik' },
      },
      {
        path: 'edukasi',
        name: 'edukasi',
        component: EducationView,
        meta: { title: 'Hub Edukasi & Mitigasi - LensaJentik' },
      },
      {
        path: 'edukasi/kuis',
        name: 'edukasi-kuis',
        component: QuizView,
        meta: { title: 'Kalkulator Risiko Personal - LensaJentik' },
      },
      {
        path: 'edukasi/artikel/:id',
        name: 'edukasi-artikel',
        component: ArticleDetailView,
        meta: { title: 'Detail Artikel Kesehatan - LensaJentik' },
      },
    ],
  },

  // Auth Route (Kader Login)
  {
    path: '/kader/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'kader-login',
        component: KaderLoginView,
        meta: { title: 'Login Kader Kesehatan - LensaJentik' },
      },
      {
        path: 'lupa-password',
        name: 'kader-lupa-password',
        component: ForgotPasswordView,
        meta: { title: 'Lupa Kata Sandi - LensaJentik' },
      },
      {
        path: 'reset-password',
        name: 'kader-reset-password',
        component: ResetPasswordView,
        meta: { title: 'Reset Kata Sandi - LensaJentik' },
      },
    ],
  },

  // Kader Portal Routes
  {
    path: '/kader',
    component: KaderLayout,
    children: [
      {
        path: 'dashboard',
        name: 'kader-dashboard',
        component: KaderDashboardView,
        meta: { title: 'Dashboard Kader - LensaJentik' },
      },
      {
        path: 'abj',
        name: 'kader-abj',
        component: KaderAbjView,
        meta: { title: 'Kelola Data ABJ - LensaJentik' },
      },
      {
        path: 'riwayat',
        name: 'kader-riwayat',
        component: KaderHistoryView,
        meta: { title: 'Riwayat & Tren ABJ - LensaJentik' },
      },
      {
        path: 'laporan',
        name: 'kader-laporan',
        component: KaderReportsView,
        meta: { title: 'Rekap Laporan Kader - LensaJentik' },
      },
      {
        path: 'notifikasi',
        name: 'kader-notifikasi',
        component: KaderNotificationsView,
        meta: { title: 'Notifikasi & Pengingat - LensaJentik' },
      },
      {
        path: 'pengaturan',
        name: 'kader-pengaturan',
        component: KaderSettingsView,
        meta: { title: 'Pengaturan Profil Kader - LensaJentik' },
      },
    ],
  },

  // Catch-all 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }
})

export default router
