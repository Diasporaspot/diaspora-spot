import type { WorkshopPaymentType } from '@/content/types';

type WorkshopPrice = {
  currency: string;
  paymentType: WorkshopPaymentType;
  price: number;
};

type WorkshopSeriesPrice = WorkshopPrice & {
  pricingConflict: boolean;
  workshops: WorkshopPrice[];
};

export type WorkshopSeriesPricingComparison = {
  individualStartingPrice: WorkshopPrice | null;
  individualTotal: number | null;
  perSessionPrice: number | null;
  saving: number;
};

function numericPrice(product: WorkshopPrice) {
  return product.paymentType === 'paid' && product.price > 0 ? product.price : 0;
}

export function getWorkshopSeriesPricingComparison(
  series: WorkshopSeriesPrice,
): WorkshopSeriesPricingComparison {
  const individualStartingPrice =
    series.workshops.reduce<WorkshopPrice | null>((lowest, workshop) => {
      if (!lowest || numericPrice(workshop) < numericPrice(lowest)) {
        return workshop;
      }

      return lowest;
    }, null);

  const paidWorkshops = series.workshops.filter(
    (workshop) => workshop.paymentType === 'paid' && workshop.price > 0,
  );
  const hasComparableCurrencies = paidWorkshops.every(
    (workshop) => workshop.currency.toLowerCase() === series.currency.toLowerCase(),
  );
  const individualTotal = hasComparableCurrencies
    ? paidWorkshops.reduce((total, workshop) => total + workshop.price, 0)
    : null;
  const hasPaidSeriesPrice =
    series.paymentType === 'paid' && series.price > 0 && !series.pricingConflict;
  const saving =
    hasPaidSeriesPrice && individualTotal !== null && individualTotal > series.price
      ? individualTotal - series.price
      : 0;

  return {
    individualStartingPrice,
    individualTotal,
    perSessionPrice:
      hasPaidSeriesPrice && series.workshops.length > 0
        ? series.price / series.workshops.length
        : null,
    saving,
  };
}
