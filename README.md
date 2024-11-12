# pfm-web3-nov24-2
### Proyecto Fin de Máster: Sistema de Trazabilidad de Donaciones con Blockchain para la DANA en Valencia

#### Introducción

La transparencia y confiabilidad en la gestión de donaciones son fundamentales en situaciones de emergencia. En este contexto, la tecnología blockchain ofrece un marco inmutable, verificable y transparente para la trazabilidad de bienes y servicios. Este proyecto plantea el desarrollo de un sistema de trazabilidad en blockchain para gestionar donaciones destinadas a ayudar a los afectados por la DANA en Valencia. A través de un flujo de validación en cadena de bloques, se garantiza la integridad y seguimiento de los bienes donados, desde el donante hasta su destino final, permitiendo a los donantes comprobar de forma clara cómo y dónde se emplea su aportación.

Este proyecto se presenta como una Prueba de Concepto (PoC) en la que se define un flujo de trazabilidad acotado y modular para facilitar futuras ampliaciones.

---

### Objetivos

1. **Desarrollar un sistema de trazabilidad de donaciones** que permita a los donantes conocer el estado de su aportación en tiempo real y a través de un código QR, promoviendo la transparencia.
2. **Implementar una solución de gestión de donaciones en blockchain** que registre cada paso del proceso de transporte, clasificación y distribución, asegurando la integridad y transparencia de los datos.
3. **Validar la PoC en un entorno controlado** con los pasos definidos para evaluar su eficacia y potencial escalabilidad en situaciones de emergencia.

---

### Descripción del Proyecto

#### Cadena de Pasos de la Trazabilidad

El sistema de trazabilidad propuesto para esta ONG ficticia de ayuda para la DANA en Valencia consta de varios pasos detallados a continuación:

1. **Donación de Producto y registor de productoss**: 
    - El donante selecciona uno o varios tipos de productos de un listado definido (comida, productos de limpieza y herramientas).
    - Tras seleccionar la cantidad de productos que desea donar se simularia la entrega en un lugar de recogida, el personal verifica la entrega y genera un código QR que identifica la donación y el tipo de productos. Este QR permite al donante realizar un seguimiento de su donación a lo largo del proceso.
    - Una vez entregados y validados, los productos se agrupan en lotes de entre 3 y 10 unidades para facilitar su transporte y gestión.

3. **Agrupación en Lotes**:
    - Se generan lotes de entre 3 y 10 donaciones individuales en el mismo punto de recogida.
    - Cada lote es registrado en blockchain con un QR específico, que contendrá información detallada de los productos incluidos y el lugar de recogida.
    
4. **Transporte a Valencia**:
    - Cada lote es asignado a un conductor, quien valida los productos del lote escaneando el QR y registrando el movimiento en la blockchain. Este paso asegura que todos los productos correspondientes al lote se mantienen intactos durante el transporte.
    - La validación de este paso activa el siguiente evento en la blockchain, notificando su envío.

5. **Recepción y Distribución**:
    - El lote es recibido en Valencia en un único centro de distribución (por simplicidad del alcance).
    - El receptor verifica la información del QR y registra en blockchain la validación de que el lote entregado coincide con el lote esperado.
    - Este lote se destina directamente a una de las áreas de distribución designadas: Paiporta, Chiva, Massanassa o Catarroja.
    
Cada paso del proceso queda registrado en la blockchain, permitiendo que el donante, al escanear su QR, consulte la trayectoria de su donación y conozca el destino final de su contribución.

---

### Alcance y Limitaciones

- **Divisibilidad**: Las donaciones individuales no son divisibles y se identifican con un único QR al ser registradas por primera vez.
- **Lotes de Productos**: Los productos se agrupan en lotes de entre 3 y 10 unidades. Cada lote se mueve conjuntamente al siguiente paso sin separarse.
- **Productos Aceptados**: Los productos aceptados en esta PoC son tres categorías: comida, productos de limpieza y herramientas.
- **Puntos de Recogida**: El alcance está limitado a dos puntos de recogida en total Madrid y Barcelona, para simplificar la PoC.
- **Transporte**: Se asume que el transporte tiene capacidad ilimitada, por lo que no se especifican detalles de la compañía de transporte ni limitaciones de carga.
- **Áreas de Distribución**: Las zonas de distribución final se limitan a tres localidades específicas en la Comunidad Valenciana: Paiporta, Chiva, Massanassa y Catarroja.
- **Eventos en Blockchain**: Para garantizar la validación de cada paso, se utilizarán eventos que se activan desde el contrato inteligente para indicar la finalización de una etapa y la disponibilidad de la siguiente.


---

### Desarrollo e Implementación Técnica

WIP
