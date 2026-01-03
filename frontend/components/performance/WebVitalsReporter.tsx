"use client";

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

export function WebVitalsReporter() {
    useReportWebVitals((metric) => {
        switch (metric.name) {
            case 'FCP':
                console.log(`FCP: ${metric.value.toFixed(2)}ms`);
                break;
            case 'LCP':
                console.log(`LCP: ${metric.value.toFixed(2)}ms`);
                break;
            case 'CLS':
                console.log(`CLS: ${metric.value.toFixed(4)}`);
                break;
            case 'FID':
                console.log(`FID: ${metric.value.toFixed(2)}ms`);
                break;
            case 'TTFB':
                console.log(`TTFB: ${metric.value.toFixed(2)}ms`);
                break;
            case 'INP':
                console.log(`INP: ${metric.value.toFixed(2)}ms`); // Interaction to Next Paint
                break;
            default:
                console.log(`${metric.name}: ${metric.value.toFixed(2)}`);
                break;
        }
    });

    return null;
}
