# Bot de Telegram - Indicadores Financieros Banxico 🇲🇽

Este bot obtiene indicadores financieros (Tipo de Cambio, TIIE, Cetes, INPC) directamente del sitio web de Banxico y los envía por Telegram.

## 🚀 Instrucciones de Instalación y Uso

### 1. Crear el Bot en Telegram
1. Abre Telegram y busca a **@BotFather**.
2. Envía el mensaje `/newbot`.
3. Sigue las instrucciones:
   - Asigna un nombre (ej. `FinanzasMXBot`).
   - Asigna un usuario (debe terminar en `bot`, ej. `FinanzasMX_bot`).
4. **@BotFather** te dará un **Token** (una cadena larga de caracteres). **¡Cópialo!**

### 2. Configurar el Proyecto
1. En la carpeta del proyecto, crea un archivo llamado `.env`.
2. Pega tu token dentro del archivo con el siguiente formato:

```env
TELEGRAM_BOT_TOKEN=tu_token_aqui_pegado
```

### 3. Instalar Dependencias (si no lo has hecho)
Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

### 4. Ejecutar el Bot
Para iniciar el bot, ejecuta:

```bash
node index.js
```

Verás el mensaje: `Bot is running...`

### 5. Probar
1. Ve a tu bot en Telegram.
2. Envía el comando `/start` o `/indicadores`.
3. El bot te responderá con los datos actualizados.

## 📋 Indicadores Soportados
- **TC (Fix)**: Tipo de cambio Fix.
- **TIIE (28 días)**: Tasa de Interés Interbancaria de Equilibrio.
- **Cetes (28 días)**: Certificados de la Tesorería.
- **INPC**: Índice Nacional de Precios al Consumidor.
- *Nota: La Mezcla Mexicana no está disponible en el sitio de Banxico por este método.*
