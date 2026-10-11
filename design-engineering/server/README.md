# Receptor de contribuciones de Diseño e Ingeniería

Este servicio recibe un único archivo PDF, RAR o ZIP de hasta 3 MB, valida su firma binaria sin extraerlo y lo envía al correo administrativo configurado por SMTP.

## Configuración

1. Copia `.env.example` como `.env` fuera del control de versiones o configura las variables en el proveedor de alojamiento.
2. Define `ADMIN_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM`.
3. Mantén `CONTRIBUTION_TEST_MODE=false` en producción.
4. Instala dependencias con `npm install` y ejecuta `npm start` desde esta carpeta. El script carga `.env` cuando existe.

El sitio principal actual es estático. Antes de publicar esta función, el alojamiento debe enrutar `POST /api/design-contributions` hacia este servicio. No se incluye ninguna dirección ni credencial inventada.

## Seguridad

- No guarda archivos en disco.
- No ejecuta ni extrae archivos comprimidos.
- Comprueba extensión y firma binaria.
- Rechaza más de 3 MB y más de un archivo.
- Aplica honeypot, tiempo mínimo de llenado y límite de frecuencia por IP.
- Ninguna contribución se publica automáticamente.
