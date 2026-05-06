import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    appName: 'EduGami ROOT',
    bootReady: false,
    sidebarPinned: localStorage.getItem('edugami_sidebar_pinned') === 'true',
    sidebarOpen: localStorage.getItem('edugami_sidebar_open') !== 'false' // Default true
  }),
  actions: {
    setBootReady(value) {
      this.bootReady = value
    },
    toggleSidebarPinned() {
      this.sidebarPinned = !this.sidebarPinned
      localStorage.setItem('edugami_sidebar_pinned', this.sidebarPinned)
    },
    toggleSidebarOpen() {
      this.sidebarOpen = !this.sidebarOpen
      localStorage.setItem('edugami_sidebar_open', this.sidebarOpen)
    },
    setSidebarOpen(value) {
      this.sidebarOpen = value
      localStorage.setItem('edugami_sidebar_open', this.sidebarOpen)
    }
  }
})
