# Cierre de Turno — Operacion Minera

Aplicacion web para registrar cierres de turno de las plantas.
Los registros se guardan localmente y se envian al OneDrive del usuario via Microsoft Graph API.

---

## Requisitos

- Tener **Node.js** instalado (version 16 o superior).
  Descarga: https://nodejs.org
- Conexion a internet (para cargar las librerias y autenticarse con Microsoft).

---

## Como iniciar la aplicacion

Abra **PowerShell** en la carpeta de la aplicacion y ejecute:

```powershell
npx serve .
```

Luego abra su navegador y vaya a:

```
http://localhost:3000
```

> La primera vez que ejecute el comando, npx descargara el paquete `serve` automaticamente.
> Esto puede tardar unos segundos.

---

## Alternativa con npm start

Si prefiere, puede ejecutar:

```powershell
npm start
```

Esto hace lo mismo que `npx serve .` pero usa el script definido en `package.json`.

---

## Por que necesita servidor local

La autenticacion con Microsoft (MSAL) requiere que la aplicacion corra en
`http://localhost` y no como archivo local (`file://`).

El URI de redireccion que debe registrar en Azure AD es:

```
http://localhost:3000/app.html
```

Para registrarlo vaya a:
**Azure AD → Registros de aplicaciones → su app → Autenticacion →
Agregar una plataforma → Aplicacion de pagina unica (SPA)**
y pegue la URL de arriba.

---

## Estructura de archivos

```
APP CT/
├── app.html        # Aplicacion principal (abrir este archivo)
├── package.json    # Script de inicio
└── README.md       # Este archivo
```

---

## Envio a OneDrive

Al confirmar un formulario la app:

1. Solicita inicio de sesion con su cuenta Microsoft (ventana emergente, solo la primera vez).
2. Descarga `Cierres_de_Turno.xlsx` desde la raiz del OneDrive del usuario.
3. Agrega la fila nueva en la hoja correspondiente a la planta.
4. Sube el archivo actualizado.

Si el archivo no existe, lo crea automaticamente con una hoja por cada planta.

No se requieren permisos de administrador. Solo se usa el permiso `Files.ReadWrite`
sobre el OneDrive del usuario autenticado.

Los registros tambien quedan guardados localmente en el navegador
y se pueden exportar como CSV desde la pantalla de Historial.
