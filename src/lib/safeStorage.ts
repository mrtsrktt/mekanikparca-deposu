/**
 * localStorage'dan güvenli JSON parse.
 * Bozuk veri varsa boş array döner ve localStorage'ı temizler.
 */
export function getStorageArray(key: string): any[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    // Array değilse bozuk veri, temizle
    localStorage.removeItem(key)
    return []
  } catch {
    // Parse hatası, bozuk veri temizle
    localStorage.removeItem(key)
    return []
  }
}
