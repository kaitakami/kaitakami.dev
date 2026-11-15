---
title: "Por qué no deberías comprar Gravity"
description: "Qué salió mal con el boilerplate y qué habríamos hecho diferente."
---

## Introducción

Después de meses trabajando con Gravity, quiero contarte por qué ha sido una experiencia tan frustrante para nosotros. Si estás pensando en usar este boilerplate de SaaS, espero que nuestra historia te ayude a tomar una decisión más informada.

## Problemas de fondo con Gravity

### 1. **Documentación incompleta y desorganizada**

La documentación de Gravity prácticamente no existe. No hay lineamientos claros de input/output, y las funcionalidades principales no están documentadas para nada. Esta falta de claridad hace que sea muy difícil trabajar con él.

### 2. **Faltan funcionalidades básicas**

Gravity dice ser un boilerplate de SaaS completo, pero le falta muchísimo:
   - **Logging:** No tiene un logging como tal, solo console logs regados por todo el código.
   - **Soporte para TypeScript:** No tiene soporte para TypeScript, así que tuvimos que configurarlo nosotros, lo que agregó complejidad innecesaria.
   - **Rate limits y configuración de Swagger:** No trae opciones integradas para definir rate limits personalizados ni para configurar Swagger para la documentación de la API.
   - **Docker y linters:** No tiene soporte para Docker ni ningún tipo de linting de código (ESLint o Biome).
   - **Tests confiables:** Los tests que trae son insuficientes y se rompen con cualquier implementación compleja.
   - **Servicios de IA y de correo:** Endpoints de IA desactualizados y un servicio de correo que no funciona bien se suman a los problemas.
   - **Middleware:** No hay soporte para middleware, que es algo básico que se espera en cualquier aplicación moderna. Esto hace que manejar requests y responses sea más complicado de lo que debería.

### 3. **Limitaciones del backend**

La estructura del backend de Gravity se ve organizada al principio, pero se desmorona en cuanto necesitas hacerle cambios. Agregar o modificar funcionalidad muchas veces rompe el sistema, lo que lo vuelve rígido y difícil de trabajar.

### 4. **Retos en el frontend**

El frontend tiene varios retos:
   - **Manejo de datos del usuario:** Usa local storage para los datos del usuario, lo cual es ineficiente y no escala bien. Guardar todo en el user context significa que cada vez que un usuario abre el sitio, se traen todos sus datos, lo cual es innecesario y costoso. Un mejor enfoque sería usar cookies o solo guardar el ID del usuario e ir trayendo los datos adicionales conforme se necesiten.
   - **Auth context:** El auth context no regresa el ID del usuario por defecto, lo que complica identificar al usuario. Saber el ID del usuario es clave para muchísimas operaciones, y aun así este dato tan básico no está disponible de entrada.
   - **Dificultades para migrar:** La mezcla de TailwindCSS y SASS hace que sea complicado migrar a un solo framework de estilos. Y no es solo el CSS: toda la implementación hace que migrar a otras soluciones o frameworks sea difícil y tardado.
   - **Demasiados wrappers:** El abuso de componentes wrapper aumenta la complejidad y hace más difícil migrar. Componentes sencillos como los botones tienen wrappers de más que agregan funcionalidad innecesaria, y hasta los cambios más pequeños se vuelven un dolor de cabeza.
   - **Custom hooks:** Usar un hook personalizado `useAPI` en lugar de soluciones estándar agrega complejidad innecesaria. Este hook usa Axios por debajo, pero eso no se menciona claramente, lo que genera confusión y métodos inconsistentes para comunicarse con el backend.

### 5. **Problemas de rendimiento y de actualización**

Gravity no está pensado para tener un rendimiento óptimo ni para actualizarse fácilmente:
   - **Server components:** No está listo para server components, lo que complica las actualizaciones a futuro. Con un precio de $500 - $3000, esperábamos soporte para features recientes como los server components.
   - **Mal rendimiento:** La aplicación no le da prioridad al rendimiento, lo que provoca ineficiencias.

### 6. **Producto sin reembolso**

El hecho de que Gravity no tenga reembolso dice mucho sobre la confianza en el producto. Aunque puede que el autor no piense que el producto es malo, nuestra experiencia ha sido tan negativa que creemos que esta política existe porque el producto tiene fallas importantes.

### 7. **Es difícil implementar features nuevas**

Implementar features nuevas en Gravity es una batalla. Por ejemplo, agregar componentes de shadcn/ui le tomó meses al autor, algo que debió haber tomado unos cuantos días. Esta dificultad se debe a la mala arquitectura tanto del frontend como del backend.

## Frustraciones personales

1. **Cambios dolorosos:** Hasta los cambios más simples muchas veces requerían horas de debugging y pruebas. Era desmoralizante invertir tanto tiempo en tareas que deberían ser sencillas.

2. **Estructura confusa:** La estructura de archivos tan confusa y la mezcla de tecnologías nos hacían sentir que estábamos reinventando la rueda todo el tiempo. Esto era especialmente frustrante cuando intentábamos implementar soluciones estándar de la industria.

3. **Falta de claridad:** Con tantas features sin documentar y procesos poco claros, nos tocaba adivinar cómo se suponía que debían funcionar las cosas. Tanto adivinar nos llevó a un sinfín de errores y tiempo perdido.

## Nuestra recomendación

Con base en nuestra experiencia, no podemos recomendarle Gravity a nadie. Hay muchas alternativas mejores, incluyendo opciones gratuitas, que son mucho más confiables y eficientes. Gravity nos frenó, nos dio un montón de dolores de cabeza e hizo que nuestro código fuera más propenso a errores.

## Qué habríamos hecho diferente

Si pudiéramos regresar el tiempo, nos habríamos alejado de Gravity por completo. Construir nuestra propia solución o usar otro boilerplate habría sido mucho más productivo. Soluciones como Supabase para auth o NextAuth para Next.js habrían sido opciones mucho mejores.

## De aquí en adelante

Decidimos dejar Gravity atrás. Vamos a mantener los endpoints actuales de Gravity como legacy y construir un backend nuevo para las implementaciones futuras. El frontend se va a quedar en Gravity por ahora, porque es más fácil migrarlo después.

## Nota final

Al final del día, esta es nuestra opinión y no representa la verdad absoluta. No creemos para nada que el autor sea malo; Gravity pudo haber sido un muy buen boilerplate hace 4 años, pero no ahora en 2024.

Nuestra experiencia con Gravity ha sido abrumadoramente negativa. Te recomendamos ampliamente no usar ni comprar Gravity. Hay opciones mucho mejores que te van a ahorrar tiempo, dinero y frustraciones. Evita Gravity a toda costa.
