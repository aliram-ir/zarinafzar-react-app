// 📁 src/config/env.ts

/**
 * مدیریت متغیرهای محیطی
 * تمام تنظیمات پروژه از اینجا خونده میشه
 */

interface EnvConfig {
    /** آدرس پایه API */
    apiBaseUrl: string
    /** تایم‌اوت درخواست‌ها (میلی‌ثانیه) */
    apiTimeout: number
    /** آیا در حالت توسعه هستیم؟ */
    isDevelopment: boolean
    /** آیا در حالت production هستیم؟ */
    isProduction: boolean
}

/**
 * خواندن متغیر محیطی با مقدار پیش‌فرض
 */
function getEnvVar(key: string, defaultValue: string): string {
    return import.meta.env[key] || defaultValue
}

/**
 * تبدیل رشته به عدد با مقدار پیش‌فرض
 */
function getEnvNumber(key: string, defaultValue: number): number {
    const value = import.meta.env[key]
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
}

/**
 * تنظیمات نهایی برنامه
 */
export const env: EnvConfig = {
    apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'https://localhost:7009/api/'),
    apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
}

/**
 * بررسی اعتبار تنظیمات در هنگام بارگذاری
 */
if (env.isDevelopment) {
    console.log('🔧 Environment Config:', env)
}

// بررسی اینکه baseURL با / تموم بشه
if (!env.apiBaseUrl.endsWith('/')) {
    console.warn('⚠️ API Base URL باید با / تمام شود')
    env.apiBaseUrl += '/'
}

export default env
