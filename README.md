# Configuración Inicial del Proyecto

Sigue estos pasos para clonar el repositorio y configurar la rama principal en tu entorno local.

---

## 1. Clonar el repositorio

Ejecuta el siguiente comando en tu terminal para obtener una copia local del proyecto:

```bash
git clone [https://github.com/EduardoC06/IntegradorII.git](https://github.com/EduardoC06/IntegradorII.git)
2. Ingresar a la carpeta del proyecto
Muévete al directorio que se acaba de crear:

Bash
cd IntegradorII
3. Establecer la rama principal
Para asegurar que la rama actual sea reconocida como la principal (main), ejecuta:

Bash
git branch -M main
4. Verificar la rama actual
Para comprobar en qué rama te encuentras y ver el estado del último commit:

Bash
git branch -v
Salida esperada:
Deberías ver algo similar a esto:
* main 123abc7 Mensaje del último commit
