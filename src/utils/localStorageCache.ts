// 📁 مسیر فایل: src/utils/localStorageCache.ts
// این ماژول توابع کمکی برای مدیریت Client-Side Caching با استفاده از localStorage را فراهم می‌کند.

/**
 * ساختار داده‌ای که در localStorage ذخیره می‌شود
 * شامل داده‌ی اصلی و یک مهر زمانی برای بررسی انقضا.
 */
interface CacheEntry<T> {
  data: T
  timestamp: number // زمان ذخیره بر حسب میلی‌ثانیه (Date.now())
}

/**
 * 💾 داده را به صورت رشته JSON به همراه مهر زمانی در localStorage ذخیره می‌کند.
 * @param key کلید ذخیره سازی در localStorage.
 * @param data داده‌ای که باید ذخیره شود.
 */
export function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    }
    // استفاده از JSON.stringify برای ذخیره objectها
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    // در صورت بروز خطا (مثلاً پر شدن فضای localStorage)، لاگ خطا نمایش داده شود
    console.error('⛔️ خطای ذخیره Cache در localStorage:', error)
  }
}

/**
 * 📥 داده را از localStorage بازیابی می‌کند و زمان انقضا را بر اساس durationMinutes بررسی می‌کند.
 * اگر کش منقضی شده باشد یا خطایی رخ دهد، null برمی‌گرداند.
 * @param key کلید ذخیره سازی.
 * @param durationMinutes مدت زمان انقضای کش بر حسب دقیقه.
 * @returns { data: T | null, isExpired: boolean }
 */
export function getCache<T>(
  key: string,
  durationMinutes: number
): { data: T | null; isExpired: boolean } {
  try {
    const item = localStorage.getItem(key)
    if (!item) {
      // کشی با این کلید وجود ندارد
      return { data: null, isExpired: true }
    }

    // تبدیل رشته JSON به شیء CacheEntry
    const entry: CacheEntry<T> = JSON.parse(item)
    const now = Date.now()
    // محاسبه زمان انقضا: زمان ذخیره شده + (مدت زمان بر حسب دقیقه * ۶۰ ثانیه * ۱۰۰۰ میلی‌ثانیه)
    const expirationTime = entry.timestamp + durationMinutes * 60 * 1000

    if (now > expirationTime) {
      // 🕰️ کش منقضی شده است. پاک کردن آن و گزارش منقضی شدن.
      localStorage.removeItem(key)
      return { data: null, isExpired: true }
    }

    // ✅ کش معتبر است
    return { data: entry.data, isExpired: false }
  } catch (error) {
    // اگر داده در localStorage خراب یا غیرقابل Pars کردن باشد
    console.error('❌ خطای بازیابی یا Parsing کش از localStorage:', error)
    localStorage.removeItem(key) // پاک کردن داده‌ی خراب
    return { data: null, isExpired: true }
  }
}
