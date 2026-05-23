import logging

from django.core.mail import send_mail
from django.conf import settings

from apps.orders.models import Order

logger = logging.getLogger(__name__)


def notify_order_created(order: Order) -> None:
    subject = f"Заказ #{order.id} оформлен"
    message = (
        f"{order.customer_name}, спасибо за заказ.\n"
        f"Сумма: {order.total} ₽\n"
        f"Статус оплаты: {order.get_payment_status_display()}"
    )
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [order.email], fail_silently=True)
    except Exception:
        logger.exception("Failed to send order notification", extra={"order_id": order.id})
