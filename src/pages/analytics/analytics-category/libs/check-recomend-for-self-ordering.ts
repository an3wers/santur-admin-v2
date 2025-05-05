export const checkRecomendForSelfOrdering = (
  sumOrders: number,
  sumOrdersSelf: number,
  sumRealizedOrders: number,
  ordersQty: number
): boolean => {
  const HIGH_WEBSITE_SHARE = 0.5 // 50% заказов через сайт
  const LOW_COMPLETION_RATE = 0.1 // 10% завершенных заказов
  const SMALL_ORDER_THRESHOLD = 10000 // Порог для "маленьких" заказов
  const MAX_ORDERS_QTY = 10 // Максимальное количество заказов для рекомендации

  if (ordersQty < MAX_ORDERS_QTY) {
    return false
  }

  // Доли заказов через сайт и завершенные заказы
  const selfOrdersPercent = sumOrders > 0 ? sumOrdersSelf / sumOrders : 0
  const realizedOrdersPercent = sumOrders > 0 ? sumRealizedOrders / sumOrders : 0

  if (sumOrders === 0) {
    // "Клиент не совершал заказов. Недостаточно данных для рекомендации.";
    return false
  }

  // Клиент уже хорошо использует сайт
  if (selfOrdersPercent > HIGH_WEBSITE_SHARE) {
    return false
  }

  // Клиент делает заказы, но завершают их не часто
  // Рекомендация перевести на сайт
  if (realizedOrdersPercent < LOW_COMPLETION_RATE) {
    return true
  }

  // Клиент делает маленькие заказы
  // Рекомендация перевести на сайт
  if (sumOrders < SMALL_ORDER_THRESHOLD) {
    return true
  }

  return false
}
