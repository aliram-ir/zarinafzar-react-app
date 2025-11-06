// src/utils/toast.tsx
import { toast } from "react-toastify"

/* هشدار ملایم */
export const toastSoftWarn = (msg: string) => {
    toast(msg, {
        type: "warning",
        icon: <>⚠️</>,
        style: {
            background: "#ffffff",
            border: "1px solid #F1C232",
            color: "#C27C0E",
            borderRadius: "12px",
            fontFamily: "Vazirmatn",
            direction: "rtl",
        },
        autoClose: 4000,
    })
}

/* موفقیت ملایم */
export const toastSoftSuccess = (msg: string) => {
    toast(msg, {
        type: "success",
        icon: <>✅</>,
        style: {
            background: "#ffffff",
            border: "1px solid #00a65a",
            color: "#008a4a",
            borderRadius: "12px",
            fontFamily: "Vazirmatn",
            direction: "rtl",
        },
        autoClose: 4000,
    })
}

/* خطا ملایم */
export const toastSoftError = (msg: string) => {
    toast(msg, {
        type: "error",
        icon: <>❌</>,
        style: {
            background: "#ffffff",
            border: "1px solid #cc0017",
            color: "#b60014",
            borderRadius: "12px",
            fontFamily: "Vazirmatn",
            direction: "rtl",
        },
        autoClose: 4000,
    })
}

/* اطلاع رسانی ملایم */
export const toastSoftInfo = (msg: string) => {
    toast(msg, {
        type: "info",
        icon: <>ℹ️</>,
        style: {
            background: "#ffffff",
            border: "1px solid #0073ec",
            color: "#0059b8",
            borderRadius: "12px",
            fontFamily: "Vazirmatn",
            direction: "rtl",
        },
        autoClose: 4000,
    })
}
