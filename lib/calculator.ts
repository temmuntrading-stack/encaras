// lib/calculator.ts

// Export calculation constants (can be moved to DB settings later)
const EXCHANGE_RATE_KRW_TO_MNT = 2.6; // 1 KRW ~= 2.6 MNT
const SHIPPING_COST_USD = 1500; // Estimated shipping to Mongolia
const USD_TO_MNT = 3400; // 1 USD ~= 3400 MNT
const CUSTOMS_RATE = 0.05; // 5% Customs fee approximate
const VAT_RATE = 0.10; // 10% VAT
const SERVICE_FEE_KRW = 500000; // Flat service fee in KRW

export interface CostBreakdown {
  krwPrice: number;
  krwPriceMnt: number;
  shippingMnt: number;
  customsMnt: number;
  vatMnt: number;
  serviceFeeMnt: number;
  totalMnt: number;
}

export function calculateExportCost(carPriceKrw: number): CostBreakdown {
  const krwPriceMnt = carPriceKrw * EXCHANGE_RATE_KRW_TO_MNT;
  const shippingMnt = SHIPPING_COST_USD * USD_TO_MNT;
  const serviceFeeMnt = SERVICE_FEE_KRW * EXCHANGE_RATE_KRW_TO_MNT;

  const subtotalMnt = krwPriceMnt + shippingMnt;
  
  // Customs & VAT usually applied over (Car + Shipping)
  const customsMnt = subtotalMnt * CUSTOMS_RATE;
  const vatMnt = (subtotalMnt + customsMnt) * VAT_RATE;

  const totalMnt = krwPriceMnt + shippingMnt + customsMnt + vatMnt + serviceFeeMnt;

  return {
    krwPrice: carPriceKrw,
    krwPriceMnt,
    shippingMnt,
    customsMnt,
    vatMnt,
    serviceFeeMnt,
    totalMnt
  };
}

export function formatMNT(mnt: number): string {
    return new Intl.NumberFormat('mn-MN', { 
        style: 'currency', 
        currency: 'MNT', 
        maximumFractionDigits: 0 
    }).format(mnt);
}
