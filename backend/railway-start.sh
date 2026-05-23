#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "${BOOTSTRAP_CATALOG:-false}" = "true" ] || [ "${BOOTSTRAP_CATALOG:-false}" = "True" ]; then
  python manage.py bootstrap_catalog --products "${BOOTSTRAP_PRODUCTS:-420}"
fi

exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
