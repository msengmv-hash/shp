# Railway Deployment

Проект является монорепозиторием, поэтому на Railway его нужно деплоить как два отдельных сервиса из одного GitHub-репозитория:

- backend service с root directory `/backend`;
- frontend service с root directory `/frontend`;
- отдельно добавить PostgreSQL database service.

Railway поддерживает такой сценарий через настройку Root Directory у каждого service.

## 1. Подготовка

Код уже подготовлен под Railway:

- backend читает `DATABASE_URL`;
- backend слушает порт из переменной `PORT`;
- backend запускает `migrate`, `collectstatic`, затем `gunicorn`;
- backend раздает Django static через WhiteNoise;
- frontend собирается через `npm run build`;
- frontend запускает `vite preview` на Railway `PORT`;
- Dockerfile есть отдельно в `backend/` и `frontend/`.

## 2. Создать проект в Railway

1. Открой Railway.
2. Создай новый project.
3. Выбери Deploy from GitHub repo.
4. Выбери репозиторий:

```text
https://github.com/msengmv-hash/shp
```

## 3. Добавить PostgreSQL

В Railway project добавь database:

```text
New -> Database -> PostgreSQL
```

После этого Railway создаст PostgreSQL service. Его `DATABASE_URL` нужно передать backend-сервису.

## 4. Backend service

Создай service из GitHub repo и укажи:

```text
Root Directory: /backend
```

Railway должен обнаружить `backend/Dockerfile`.

Backend variables:

```env
DEBUG=False
SECRET_KEY=replace-with-long-random-secret
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL_REQUIRE=False
ALLOWED_HOSTS=.up.railway.app,.railway.app
BOOTSTRAP_CATALOG=True
BOOTSTRAP_PRODUCTS=420
```

Если PostgreSQL service в Railway называется не `Postgres`, выбери переменную через UI Railway или замени reference на актуальное имя service.

После первого успешного деплоя можно поменять:

```env
BOOTSTRAP_CATALOG=False
```

Так демо-данные не будут пересоздаваться на каждом redeploy. Если оставить `True`, команда в целом идемпотентная, но пароль demo-admin будет снова сбрасываться на `admin12345`.

Backend start command задавать не нужно: он уже прописан в Dockerfile через:

```text
/app/railway-start.sh
```

## 5. Backend domain

После первого deploy открой backend service:

```text
Settings -> Networking -> Generate Domain
```

Получится URL примерно такого вида:

```text
https://your-backend.up.railway.app
```

API будет доступен:

```text
https://your-backend.up.railway.app/api/
https://your-backend.up.railway.app/api/docs/
https://your-backend.up.railway.app/admin/
```

## 6. Frontend service

Создай второй service из того же GitHub repo и укажи:

```text
Root Directory: /frontend
```

Railway должен обнаружить `frontend/Dockerfile`.

Frontend variables:

```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

Важно: для Vite переменная должна начинаться с `VITE_`, потому что она попадает в frontend bundle на этапе build.

После deploy frontend service тоже сгенерируй public domain:

```text
Settings -> Networking -> Generate Domain
```

Например:

```text
https://your-frontend.up.railway.app
```

## 7. Связать frontend и backend

Когда frontend domain известен, вернись в backend service variables и добавь/обнови:

```env
FRONTEND_URL=https://your-frontend.up.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.up.railway.app
```

После изменения variables сделай redeploy backend.

## 8. Проверка после деплоя

Проверить backend:

```text
https://your-backend.up.railway.app/api/storefront/
```

Ожидаемый результат: JSON со статистикой витрины.

Проверить Swagger:

```text
https://your-backend.up.railway.app/api/docs/
```

Проверить admin:

```text
https://your-backend.up.railway.app/admin/
```

Если `BOOTSTRAP_CATALOG=True`, demo admin:

```text
username: admin
password: admin12345
```

Проверить frontend:

```text
https://your-frontend.up.railway.app/
```

На главной должны загрузиться категории и товары. Если frontend открылся, но данные не грузятся, почти всегда причина в одном из пунктов:

- неверный `VITE_API_URL` во frontend service;
- не сделан redeploy frontend после изменения `VITE_API_URL`;
- backend `CORS_ALLOWED_ORIGINS` не содержит frontend domain;
- backend упал из-за отсутствующего `DATABASE_URL`;
- migrations не прошли, смотри backend deploy logs.

## 9. CLI

Railway CLI установлен, но сейчас на машине он не авторизован:

```text
railway whoami -> Unauthorized
```

Для deploy через CLI нужно выполнить:

```bash
railway login
```

Дальше можно линковать проект и сервисы, но для этого монорепозитория проще и надежнее настроить deploy через Railway UI с Root Directory для каждого сервиса.
