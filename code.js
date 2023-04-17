// ################################################## URLS ##################################################
const url = "http://127.0.0.1:3000/";
// const url = "http://172.16.16.16:3000/";
(""); // Esto es nada más para que no se junten los comentarios, no hace nada en el código

// ################################################## VARIABLES ##################################################

// ========================= CLASE =========================
/**
 * Esta es la info que está dentro de una celda, todas llevan Asignatura, Grupo y Maestro y en ese orden.
 * Si le pasamos datos por el constructor va a agregarlos, pero no son nedcesarios porque va a usar -1 como default.
 * Otro punto importante es que toda la información necesita estar presente, no puede faltarle nada. Entonces, lo que
 * vamos a hacer es que si alguna de la información es inválida, todo es inválido.
 */
class Clase {
  /**
   * La asignatura y el maestro van a ser números que hagan referencia a un índice de un arreglo de maestros y materias.
   * En lugar de estar guardando "JALIL" en la base de datos, vamos a guardar un 2, porque (por ejemplo) los profes son
   * Maestros = ["JULIÁN", "PATRICIA", "JALIL", "ANDUAGA", "ETC"]; y así podemos hacer Maestros[2] para "JALIL".
   * (y para las materias es lo mismo)
   *
   * Entonces, si tenemos -1 es inválido porque nunca habrá Maestros[-1], pero 0 en adelante si es válido.
   */
  Asignatura = -1;
  /**
   * El grupo es numérico desde el 1 hasta el infinito prácticamente, solo hay que recordar que no existe grupo 0.
   */
  Grupo = -1;
  /**
   * Igual que la asignatura
   */
  Maestro = -1;

  constructor(aa = -1, gg = -1, mm = -1) {
    if (aa >= 0 && gg > 0 && mm >= 0) {
      // Todo es válido, entonces ok
      this.Asignatura = aa;
      this.Grupo = gg;
      this.Maestro = mm;
    }
  }
}

// ========================= HORARIO =========================
/**
 * Este va a ser nuestro objeto principal para ver la información de cada hora. La estructura es idéntica a la del servidor web,
 * por lo que es importante no modificarla porque está hecha a la medida.
 *
 * No soy para nada fan de colocar variables importantes en español y mucho menos colocarle acentos, pero #1 en JS si te deja,
 * y #2 vamos a usar ese nombre para mostrarlo directamente en pantalla, así que es mejor que esté bien escrito. (me refiero a
 * lo que está en mayúsculas)
 */
var _horario = {
  dias: {
    /**
     * @type {Clase[]} esta anotación es para que me detecte el tipo de dato y me autocomplete el VScode, pero no deja de ser
     * comentario, se puede borrar perfectamente y no pasa nada.
     */
    Lunes: [],
    /**
     * @type {Clase[]}
     */
    Martes: [],
    /**
     * @type {Clase[]}
     */
    Miércoles: [],
    /**
     * @type {Clase[]}
     */
    Jueves: [],
    /**
     * @type {Clase[]}
     */
    Viernes: [],
  },
  campos: {
    /**
     * @type {string[]}
     */
    Asignatura: [],
    /**
     * @type {string[]}
     */
    Maestro: [],
  },
};

// ========================= OBJETOS HTML =========================
/**
 * @type {HTMLTableElement}
 */
var obj_schedule = null;
/**
 * @type {HTMLDivElement}
 */
var obj_info = null;

// ========================= INPUTS =========================
/**
 * Almacenar los controles, ya sean de admin o de búsqueda para poder manipularlos más fácilmente.
 */
var _input = {
  admin: {
    /**
     * @type {HTMLSelectElement}
     */
    Asignatura: null,
    /**
     * @type {HTMLInputElement}
     */
    Grupo: null,
    /**
     * @type {HTMLSelectElement}
     */
    Maestro: null,
  },
  search: {
    /**
     * @type {HTMLInputElement}
     */
    Asignatura: null,
    /**
     * @type {HTMLInputElement}
     */
    Grupo: null,
    /**
     * @type {HTMLInputElement}
     */
    Maestro: null,
  },
  edit: {
    /**
     * @type {HTMLSelectElement}
     */
    Asignatura: null,
    /**
     * @type {HTMLInputElement}
     */
    Grupo: null,
    /**
     * @type {HTMLSelectElement}
     */
    Maestro: null,
  },
};

// ========================= POPUP =========================
/**
 * Guardamos la información con respecto al popup, tanto el elemento principal, como el contenido y botón de cierre
 */
var _popup = {
  /**
   * @type {HTMLDivElement} Guardamos el elemento principal del popup para mostarlo y ocultarlo
   */
  main: null,
  /**
   * @type {HTMLDivElement} Guardamos el elemento contenedor para meterle información, datos y cualquier cosa
   */
  content: null,
  /**
   * @type {HTMLButtonElement} Guardamos el botón de 'Aceptar' para que el popup pueda ejecutar acciones especiales
   */
  button: null,
};

// ========================= MISCELÁNEOS =========================
/**
 * Guardamos la información referente a la última celda que se hizo clic, para saber dónde modificar los datos y eso.
 */
var _current = {
  /**
   * Referencia a la última celda a la que se hizo clic, en este caso vamos a crear un elemento para que no crashee en caso de
   * que tratemos de actualizar accidentalmente algo.
   */
  cell: document.createElement("td"),
  /**
   * En qué día se encuentra la celda, por ejemplo "Lunes"
   */
  day: "Lunes",
  /**
   * En qué posición del día se encuentra la celda, por ejemplo posición 0
   */
  pos: -1,
};
/**
 * @type {HTMLTableCellElement[]} Guardar todas las celdas de la tabla para actualizar su valor rápidamente.
 */
var _cells = [];
/**
 * Variable que nos dice si el usuario es admin o no, de momento se va a encender y apagar con los controles, pero se
 * necesita de una verificación al servidor, para saber si es admin o no (le mandas la contraseña y te responde 0 o 1).
 * Esta variable se puede activar desde el inspeccionar de google, pero la comprobación de actualizar el server todavía
 * requiere de la contraseña nuevamente, y eso si no se puede inspeccionar.
 */
var _admin = false;

// ################################################## INICIO ##################################################
/**
 * Esto hace que se ejecute las instrucciones cuando el documento termine de cargar sus contenidos. Esto es básicamente
 * para que luego no haya problemas de que no encuentra una ID porque el elemento no se ha generado aún.
 */
document.addEventListener("DOMContentLoaded", () => {
  // ========================= CARGAR ELEMENTOS =========================
  obj_schedule = document.getElementById("schedule");
  obj_info = document.getElementById("info");

  /**
   * Guardar los inputs correctamente. Para esto estructuramos el objeto de los inputs de esa manera, para que sea
   * "factorizable", pues es más sencillo irse de lo general a lo específico, sobretodo cuando hablamos de instrucciones.
   *
   * El concepto de factorizar es algo que se puede profundizar muchísimo, pero a grandes rasgos es como la factorización
   * de matemáticas. Convertir la ecuación (2yx + 10x + y + 5)  -- a la forma --> (y + 5) (2x + 1), que es más sencilla de
   * evaluar independientemente.
   *
   * Al final la ventaja que tenemos es que escribimos 3 líneas como máximo para modificar X cantidad de inputs en este caso,
   * en lugar de hacerlo manual que se reduciría a copiar y pegar.
   *
   * El ciclo for-in recorre todos los campos de un objeto, el primer ciclo se mueve por "admin", "search" y "edit", mientras
   * que el siguiente sub-ciclo se mueve por "Asignatura", "Grupo" y "Maestro".
   */
  for (const type in _input) {
    for (const field in _input[type]) {
      /**
       * Ahora (por ejemplo), 'type' representa "admin" y 'field' representa "Asignatura", por lo que 'type'-'field' se construye
       * como 'admin-Asignatura', y esta es la razón por la que en el HTML le pusimos así a las IDs, para este ciclo.
       *
       * La notación de los backticks estos ( ` ) es para poder ingresar valores de variables directamente a un string, en C#
       * el equivalente sería lo siguiente: $"{type}-{field}"
       */
      _input[type][field] = document.getElementById(`${type}-${field}`);
    }
  }

  // ========================= INPUTS DE BÚSQUEDA =========================
  // Recorremos los inputs de búsqueda, poniéndoles la misma función de buscar
  for (const field in _input.search) {
    _input.search[field].oninput = buscar;
  }

  // El botón de limpiar búsqueda nada más lo ocupamos una vez
  const Limpiar = document.getElementById("search-Limpiar");
  Limpiar.onclick = () => {
    // Recorremos los inputs de búsqueda, borrando sus valores
    for (const field in _input.search) _input.search[field].value = "";

    // Actualizamos el buscador una última vez, para deseleccionar todo.
    buscar();
  };

  // ========================= BOTÓN DE ACTUALIZAR DESDE EL ADMIN =========================
  // El botón de actualizar nada más lo ocupamos una vez, no tiene caso hacerlo variable global
  const obj_actualizar = document.getElementById("Actualizar");
  /**
   * Le ponemos una función para cuando le hagamos clic en Actualizar desde el admin, recordemos que lo que queremos hacer con el
   * actualizar, es agarrar la información de los controles de admin para ponerlo en la celda que seleccionamos (o mejor dicho,
   * dentro de la última celda que hicimos clic). Para esto vamos a actualizar el _horario y refrescar nada más la celda y los
   * selects, porque es realmente lo único importante (y lo único que modificamos).
   */
  obj_actualizar.onclick = () => {
    /**
     * Almacenamos en variables los datos del admin, para los selects, tenemos que considerar que el primer índice representa
     * ningún valor (vacío), por lo que tenemos que restar 1 para obtener el valor real del arreglo del horario.
     *
     * Por ejemplo, nuestro select tiene las opciones ["VACÍO", "Web", "Seguridad", "Calidad", "Medios"]; y cuando seleccionamos
     * la clase de "Seguridad" nos marca un índice de 2 que representa la posición del arreglo, pero cuando tratamos de buscar
     * el índice 2 dentro de las materias reales del horario que son ["Web", "Seguridad", "Calidad", "Medios"], el índice número
     * 2 nos regresa "Calidad". De ahí que necesitamos restarle 1 (así también cuando seleccionemos "vacío", nos marcará -1)
     */
    const materia = _input.admin.Asignatura.selectedIndex - 1;
    const grupo = parseNumber(_input.admin.Grupo.value);
    const maestro = _input.admin.Maestro.selectedIndex - 1;

    // Creamos un objeto de Clase para ver si la información está toda correcta, recordemos que la verificación la hace el constructor
    const celldata = new Clase(materia, grupo, maestro);
    _horario.dias[_current.day][_current.pos] = celldata;

    refresh();
  };

  // ========================= POPUP =========================
  _popup.main = document.getElementById("popup");
  _popup.content = document.getElementById("popup-content");
  _popup.button = document.getElementById("popup-button");
  /**
   * El background solo lo usamos una vez. Vamos a hacer que cuando se haga click en el fondo oscuro del popup se
   * oculte el cuadro (como si quisieras salirte de la acción). Hacemos porque es intuitivo pensar que hacer click
   * afuera del sitio nos saca, y para que no estemos forzados a mandar información por el cuadro de diálogo.
   * Si queremos mostrar de nuevo el popup, necesariamente necesitamos reiniciar toda la información (función 'popup')
   */
  const _popup_background = document.getElementById("popup-background");
  _popup_background.onclick = (e) => _popup.main.classList.add("hidden");

  // ========================= TOGGLE ADMIN =========================
  /**
   * Este link es el encargado de "iniciar sesión como admin", para esto vamos a mostrar un popup que solicite una
   * contraseña y le pregunte al servidor (si es que está activo) si es válida o no, entonces el servidor va a
   * regresar un valor de verdadero o falso y con eso activamos o desactivamos el admin.
   *
   * Como admins vamos a poder modificar la información del horario como si fuera un CRUD, modificando también
   * los profesores y asignaturas que aparecen. Finalmente, vamos a mostrar también un botón de guardar cambios
   * para mandar la info modificada al server y que ahí se guarde (y vamos a pedir la contraseña nuevamente como
   * medida de seguridad extra y confirmación)
   */
  const toggle = document.getElementById("toggle");
  toggle.onclick = () => {
    // Si la sesión de admin está activa, sencillamente la desactivamos
    if (_admin) {
      _admin = false;
      toggle.textContent = "Acceder";
      obj_info.classList.add("hidden"); // Hacemos que los controles sean invisibles
    } else {
      // Si el admin está desactivado, vamos a mostrar el popup y pedir la contraseña

      // Creamos una función para mostrar el PopUp una y otra vez siempre que la contraseña sea incorrecta
      const passPopUp = (err) => {
        popup(
          err
            ? "Contraseña incorrecta, intente de nuevo: "
            : "Ingrese la contraseña para acceder: ",
          null,
          { Contraseña: "" },
          "Acceder",
          async ({ Contraseña }) => {
            const resp = await fetch(url + "admin", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ password: Contraseña }),
            });

            if (resp.status === 200) {
              _admin = true;
              toggle.textContent = "Cerrar sesión";
              obj_info.classList.remove("hidden"); // Hacemos que los controles sean visibles
              popup("Contraseña correcta"); // PopUp de confirmación
            } else passPopUp(true); // Repetimos esta función marcando un error
          },
          true
        );
      };

      passPopUp(false); // Ejecutamos por primera vez
    }

    refresh(); // Refrescamos para que las celdas se combinen o separen
  };

  // Con todas las variables establecidas, ahora si comenzamos con el proceso de verdad
  getHorario();
});

// ################################################## GET HORARIO ##################################################
/**
 * Actualizamos el horario haciendo lo siguiente:
 * 1. Borramos todo lo que haya en el horario actual,
 * 2. Le preguntamos al servidor que nos mande el horario actualizado
 * 3. Si el servidor no funciona, vamos a preguntarle a otra página de github para sacar uno de prueba
 * 4. Creamos la tabla desde cero, y le agregamos las funciones a cada celda
 * 5. Actualizamos los selects de los controles
 * 6. Fin
 */
async function getHorario() {
  // Antes de recuperar la información, vamos a borrar todo lo de la tabla
  obj_schedule.replaceChildren("Cargando...");
  /**
   * Creamos una variable para manejar las funciones asíncronas (o promesas) que realicemos al servidor
   */
  let response;

  // ========================= COSAS DEL SERVER =========================

  /**
   * Vamos a contactar al servidor con 'fetch()', pero como es asíncrono y puede que se generen errores por que no hay internet
   * o porque el servidor no está encendido, vamos a poner todo dentro de un try-catch para evitar esto y reaccionar adecuadamente.
   */
  try {
    // Vamos a pedirle al servidor original que traiga la información
    response = await fetch(url + "horario");
  } catch (error) {
    // El servidor original no está disponible
    console.log(error);
    obj_schedule.textContent = "Accediendo servidor auxiliar...";
    response = null;

    try {
      // Intentamos con el servidor auxiliar
      response = await fetch("https://brian101016.github.io/database.json");
    } catch (error2) {
      console.log(error2);
      obj_schedule.textContent = "No se pudo conectar al servidor...";
      response = null;

      return; // No funcionó ningún servidor, entonces no mostramos nada
    }
  }

  // Tal vez el server si nos responda, pero con un código de error
  if (!response.ok) {
    obj_schedule.textContent = "Error " + response.status + "!";
    return; // en ese caso, también salimos
  }

  // Si llegamos hasta aquí significa que todo bien, metemos la información al _horario
  _horario = await response.json();

  // ========================= REINICIAR LA TABLA =========================
  obj_schedule.replaceChildren();
  _cells = [];

  // Creamos una lista de encabezados que nos servirá para colocar las horas
  const encabezados = [
    "Día/Hora",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
  ];

  // ========================= CREAR LOS ENCABEZADOS =========================
  const thead = document.createElement("thead");

  for (let i = 0; i < encabezados.length; i++) {
    const th = document.createElement("th"); // creamos (en blanco)
    th.textContent = encabezados[i]; // modificamos
    thead.appendChild(th); // guardamos
  }

  obj_schedule.appendChild(thead); // Guardamos los encabezados

  // ========================= CREAR EL CUERPO =========================
  const tbody = document.createElement("tbody");

  /**
   * Lo que vamos a hacer es ciclar primero desde Lunes en la hora 1, después el Martes en la hora 1 y así sucesivamente.
   * Para esto, necesitamos movernos entre las filas (horas) primero porque es lo que más lento cambia, después nos vamos
   * entre cada día con otro ciclo interno.
   *
   * Podemos ponerle que corre mientras 'hour < 14', pero el 14 lo podemos obtener de otra manera usando
   * '_horario.dias.Lunes.length', esto es mejor que "hardcode-dear" (que significa, ponerlo a la fuerza manualmente) el número,
   * porque en caso de que tengamos que reducir o aumentar horas, tendríamos que modificar uno a uno todos los números 14.
   */
  for (let hour = 0; hour < _horario.dias.Lunes.length; hour++) {
    const row = document.createElement("tr");

    /**
     * Este For-Of funciona igual que el forEach(), solo que podemos usar la palabra clave 'continue' dentro de él (que, para
     * quienes no lo sepan, es como un 'break' pero en lugar de saltarnos el ciclo completo, nos saltamos una vuelta del ciclo).
     */
    for (const encabezado of encabezados) {
      const cell = document.createElement("td"); // Creamos una celda

      // Revisamos si es que el encabezado existe o no dentro de '_horario.dias'
      if (!_horario.dias[encabezado]) {
        /**
         * Si no existe, significa que el encabezado es "Día/Hora", porque si nos fijamos es el único que no es un día como tal,
         * en ese caso, quiere decir que estamos en la columna de las horas y necesitamos marcar el tiempo comenzando a las 7am.
         */
        cell.textContent = `${hour + 7}:00 - ${hour + 7}:55`;
      } else {
        /**
         * En caso de que si exista el encabezado, quiere decir que estamos en algún día de la semana válido, pero nos limitaremos
         * a nada más crear el método de hacer clic, porque no es necesario mostrar la información en la celda ya que de eso se
         * encarga otra función de 'refresh'
         */
        cell.textContent = "..."; // Ponemos cualquier cosa nada más de prueba

        // ========================= CLICK EN UNA CELDA =========================

        // Ponerle que cuando se haga click, actualice la información actual
        cell.onclick = () => {
          _current.cell.classList.remove("selected-cell"); // Primero, desactivamos la celda anterior

          _current.cell = cell;
          _current.day = encabezado;
          _current.pos = hour;
          _current.cell.classList.add("selected-cell"); // Activamos esta nueva celda

          // Si no somos admin, mostramos el popup
          if (!_admin) {
            // Extraemos la información de la misma forma que hacemos en 'refresh'
            const data = _horario.dias[encabezado][hour];
            const materia = _horario.campos.Asignatura[data.Asignatura] || "";
            const profe = _horario.campos.Maestro[data.Maestro] || "";
            const grupo = data.Grupo > 0 ? data.Grupo : "";

            // Mostramos el popup si es que hay información a mostrar, sino pues no hacemos nada
            if (materia) {
              popup(
                "Información de la clase seleccionada",
                {
                  Asignatura: materia,
                  Grupo: grupo,
                  Maestro: profe,
                  Horario: `${encabezado} a las ${hour + 7}:00 - ${
                    hour + 7 + cell.rowSpan - 1
                  }:55`,
                },
                undefined,
                "Cerrar"
              );
            } else {
              // NOTA: Se podría poner un ELSE para que muestre un popup de que "Esta clase está desocupada".
            }
          } else {
            // Si somos admin, ponemos los datos de la celda en los controles de admin
            for (const field in _input.admin) {
              _input.admin[field].value =
                _horario.dias[encabezado][hour][field];
              _input.admin[field].selectedIndex =
                _horario.dias[encabezado][hour][field] + 1;
            }
          }
        };

        // Guardamos la celda en el arreglo con todas las celdas (solamente las que no sean horas)
        _cells.push(cell);
      }

      row.appendChild(cell); // Guardamos la celda en la fila
    } // Se cierra el ciclo de day

    tbody.appendChild(row); // Guardamos la fila completa en el cuerpo
  } // Se cierra el ciclo de horas

  // Ahora que ya terminamos los ciclos, guardamos todo en la tabla
  obj_schedule.appendChild(tbody);

  // Ahora que tenemos la estructura hecha, necesitamos refrescar toda la info correctamente, tanto celdas como selects
  refresh();
}

// ################################################## SET HORARIO ##################################################

/**
 * Agarra el Horario actual y se lo manda al servidor para ver si se puede actualizar la información
 * @param {string} password Contraseña para poder modificar la información desde el admin
 */
async function setHorario(password) {
  let response;

  // Intentamos acceder al servidor, las opciones son para hacer la solicitud
  try {
    response = await fetch(url + "horario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        ..._horario,
      }),
    });
  } catch (error) {
    console.log(error);
    obj_schedule.textContent = "No se pudo conectar al servidor...";
    return; // El servidor no está disponible
  }

  // El servidor si está disponible, pero tal vez no pasamos la contraseña correcta
  if (response.ok) {
    console.log("La información se actualizó con éxito!");
  } else {
    console.log("Error " + response.status);
  }
}

// ################################################## PARSE NUMBER ##################################################
/** Revisa si un valor `string` puede ser convertido a `number` correctamente, sino regresa `0`
 * @param {string} num número a evaluar
 */
function parseNumber(num) {
  if (typeof num === "number") return num;
  return parseFloat(num.match(/\-?\d*\.?\d+/)) || 0;
}

// ################################################## REFRESH ##################################################
/**
 * Actualizamos toda la información mostrada con respecto a la tabla y los selects de profesores y asignaturas.
 * Funciona de manera similar a cuando en C# usamos la funcion 'listar()'.
 */
function refresh() {
  /**
   * Antes de refrescar la info, necesitamos saber cómo es que están almacenados los datos dentro de 'cells', recordemos que
   * usamos dos ciclos, primero para ir de arriba hacia abajo (por filas) y despues para ir de izquierda a derecha (columnas),
   * entonces, el orden de creación de la primera fila se ve algo así:
   * [1]  [2]  [3]  [4]  [5]     ; y la segunda fila debajo, y así hasta que termine:
   * [6]  [7]  [8]  [9]  [10]
   * ...
   * [66] [67] [68] [69] [70]
   *
   * por lo que tenemos que recorrer las celdas de la misma forma en las que las guardamos (de arriba hacia abajo, de izq a der).
   */

  // ========================= ACTUALIZAR TODAS LAS CELDAS =========================
  // Ponemos un contador para ir recorriendo las celdas existentes
  let numeroCelda = 0;

  // De arriba hacia abajo, todas las filas
  for (let hour = 0; hour < _horario.dias.Lunes.length; hour++) {
    // para cada uno de los dias disponibles
    for (const day in _horario.dias) {
      // ========================= METER INFORMACIÓN BASE =========================
      /**
       * @type {Clase} Datos que deberían ir en la celda, para acceder a ellos más rápido (son todos números)
       */
      const data = _horario.dias[day][hour];

      /**
       * Con los índices de 'data' agarramos el valor tal cual buscándolos desde los campos (listas) del '_horario', y le ponemos
       * que en caso de que no los encuentre (porque vale -1) le ponemos un default vacío de "" (y el grupo solo si es mayor a 0)
       */
      const materia = _horario.campos.Asignatura[data.Asignatura] || "";
      const profe = _horario.campos.Maestro[data.Maestro] || "";
      const grupo = data.Grupo > 0 ? data.Grupo : "";

      // Guardamos la celda actual para modificarse cosas, y de paso le reestablecemos otras
      const cell = _cells[numeroCelda];
      cell.rowSpan = 1; // Esto es para que, si estaba combinada, se descombine...
      cell.classList.remove("hidden"); // ...y esto también

      // Anotamos como texto dentro de la celda actual, en caso de que todo esté vacío ("") pues no va a mostrar nada
      cell.textContent = `${materia} ${grupo} ${profe}`;

      // ========================= COMBINAMOS CELDAS IGUALES EN VERTICAL =========================
      /**
       * Verificamos si una clase es de dos horas o más, para esto usaremos la propiedad 'rowspan', que nos permite
       * combinar celdas en vertical. Técnicamente, lo que hace es que la celda abarque dos o más espacios, y si nosotros
       * le ponemos a la celda que sigue un 'display: none;', la "eliminamos" y se "combinan".
       *
       * Esto de mostrar las horas combinadas únicamente se va a ver cuando el usuario no sea admin, porque el admin
       * debe ser capaz de modificar las horas individualmente.
       *
       * Para combinar celdas necesitamos verificar la clase de arriba (excepto si es la primera del día) y si su
       * información es igual a la de la clase actual (si es el mimso 'textContent' es la misma info).
       */
      if (!_admin && materia) {
        /**
         * @type {HTMLTableCellElement}
         * Como estamos guardando las celdas en un arreglo, y sabemos que el arreglo se acomoda en esta forma:
         * [1]  [2]  [3]  [4]  [5]
         * [6]  [7]  [8]  [9]  [10]
         * ...
         * [66] [67] [68] [69] [70]
         *
         * Si queremos obtener la celda que está arriba de nosotros (por ejemplo, estamos en la #10 y queremos obtener
         * la #5), podemos hacer _cells[numeroCelda - 5], porque esto nos da [10 - 5] = 5
         */
        let prevCell = null;
        let count = 1; // Cuántas horas retocedimos

        /**
         * Vamos a retroceder las celdas en caso de que haya más de dos horas seguidas, mientras que la hora de arriba
         * tenga la misma información que la hora actual (y también, mientras no intentemos regresar más de la cuenta
         * y sacar horas que no existan)
         */
        while (
          numeroCelda >= count * 5 &&
          _cells[numeroCelda - count * 5].textContent === cell.textContent
        ) {
          prevCell = _cells[numeroCelda - count * 5]; // Guardamos la última hora que tiene la misma info
          count++; // Tratamos de regresar otra hora más
        }

        // Si existe una celda anterior con la info exactamente igual
        if (prevCell) {
          prevCell.rowSpan++; // La hora anterior la extendemos una celda más abajo
          cell.classList.add("hidden"); // Ocultamos la celda actual
        }
      }

      // pasamos a la siguiente celda
      numeroCelda++;
    }
  }

  // ========================= ACTUALIZAR TODOS LOS INPUTS & SELECTS =========================
  // Recorremos todos los inputs que tengamos para limpiarlos y colocarles la info correctamente
  for (const field in _input.admin) {
    // Para cada input de búsqueda, vamos a habilitarlos porque se supone que ya tiene info la tabla con la que trabajar
    _input.search[field].disabled = false;

    // De aquí en adelante, solo vamos a trabajar con los Selects, y como 'Grupo' no está en ningún select, nos lo saltamos
    if (field === "Grupo") continue;

    // Limpiamos las opciones de ambos selects, para volver a crearlas
    _input.admin[field].replaceChildren();
    _input.edit[field].replaceChildren();

    // ========================= ADMIN SELECT - OPCIÓN INICIAL =========================
    // Antes de comenzar, agregamos una opción para representar 'Vacío' dentro de los selects. Esto aplica nada más para 'admin'.
    const opt_inicial = document.createElement("option"); // creamos
    opt_inicial.text = "<Vacío>"; // modificamos
    opt_inicial.selected = true; // marcamos como seleccionada default
    _input.admin[field].appendChild(opt_inicial); // guardamos

    // ========================= ADMIN & EDIT SELECT - COMIENZA EL CICLO INTERNO =========================
    // Recorremos por todos los campos de Asignaturas/Maestros que tengamos almacenados en el '_horario'
    for (let i = 0; i < _horario.campos[field].length; i++) {
      /**
       * @type {string} Guardamos para poder leerla más fácil y rápido
       */
      const data = _horario.campos[field][i];

      // ========================= ADMIN SELECT - OPCIONES INTERNAS =========================
      const opt = document.createElement("option"); // creamos
      opt.text = data; // modificamos
      _input.admin[field].appendChild(opt); // guardamos

      // ========================= EDIT SELECT - OPCIONES INTERNAS =========================
      /**
       * Ahora hacemos para que se puedan editar las opciones del select, este no es un elemento select como tal sino una lista de
       * inputs y un boton de eliminar. Entonces, para ello necesitamos las siguientes variables:
       */
      const li = document.createElement("li"); // elemento de lista
      const inp = document.createElement("input");
      const btn = document.createElement("button");

      inp.value = data;
      inp.placeholder = "<Vacío>";
      btn.textContent = "[Eliminar]";

      // ========================= EDIT SELECT - MODIFICAR UN CAMPO =========================
      // Actualizar el valor del profe/materia cuando cambie el input
      inp.onchange = (e) => {
        const newval = e.target.value; // agarramos el valor nuevo
        _horario.campos[field][i] = newval; // le cambiamos a la info
        refresh(); // refrescamos tanto la tabla como los selects para que se actualicen
      };

      // ========================= EDIT SELECT - ELIMINAR UN CAMPO (Y AGREGAR A LA LISTA) =========================
      btn.onclick = () => {
        // removemos 1 elemento en la posicion i
        _horario.campos[field].splice(i, 1);

        /**
         * Recorremos todas las celdas, reajustando los indices para el arreglo recortado.
         * Esto es porque imaginemos que tenemos el siguiente arreglo:
         *    arr = [uno, dos, tres, cuatro, cinco, seis];
         * si yo quiero sacar el valor "cuatro" hago 'arr[3]' y me regresa el "cuatro".
         *
         * Supongamos que remuevo el valor "tres" con la función 'arr.splice(2, 1)', para quitar 1 elemento a partir del indice 2.
         * entonces, mi arreglo quedaria asi:
         *    arr = [uno, dos, cuatro, cinco, seis];
         * pero para obtener el valor "cuatro" ya no me funciona decir 'arr[3]' (que es "cinco"), sino 'arr[2]'.
         *
         * Entonces tengo que restarle 1 al indice para agarrar el valor de atrás.
         * Pero si quiero obtener el "uno" todavia me funciona el 'arr[0]', no necesito moverle nada.
         *
         * De aqui sacamos que si removí el índice X, para aquellos índices mayores a X tengo que restarles 1,
         * pero a los que estén antes de X no necesito moverle nada. Y eso es lo que vamos a hacer:
         */
        for (let hour = 0; hour < 14; hour++) {
          for (const day in _horario.dias) {
            // Si estamos justo en el índice que se eliminó, pues borramos la información de la celda
            if (_horario.dias[day][hour][field] === i)
              _horario.dias[day][hour] = new Clase();
            // Si estamos después del índice que se eliminó, vamos a retroceder 1
            else if (_horario.dias[day][hour][field] > i)
              _horario.dias[day][hour][field]--;
            // Si estamos detrás no hacemos nada porque no es necesario
          }
        }

        // Con el '_horario' actualizado, refrescamos todo otra vez para mostrar cambios
        refresh();
      };

      li.append(inp, btn); // meter dentro del elemento de lista, el input y el button
      _input.edit[field].appendChild(li); // guardar en la lista de profe/materia
    }

    // ========================= EDIT SELECT - OPCIÓN FINAL =========================
    // Cuando terminemos de colocar todos los elementos dentro de la lista del 'edit', vamos a crear una última para crear nuevos
    const li = document.createElement("li"); // elemento de lista
    const inp = document.createElement("input");
    const btn = document.createElement("button");

    inp.placeholder = "<Ingrese un valor>";
    btn.textContent = `[Agregar ${field.toLowerCase()}]`;

    // ========================= EDIT SELECT - CREAR UN CAMPO NUEVO (Y AGREGAR A LA LISTA) =========================
    btn.onclick = () => {
      if (inp.value === "") return;

      _horario.campos[field].push(inp.value); // agregar al final
      refresh(); // refrescar todo, para actualizar los selects principalmente
    };

    li.append(inp, btn); // meter dentro del elemento de lista, el input y el button
    _input.edit[field].appendChild(li); // guardar en la lista
  }

  /**
   * @type {Clase} Vamos a buscar si hay una celda activa y si tiene datos correctos, el operador ?. funciona de manera muy peculiar
   * en JS, básicamente funciona como un try-catch, pues en caso de que _horario.dias no exista, entonces deja de procesar.
   *
   * Esto soluciona el hecho de que muchas veces tenemos un objeto con muchas propiedades pero ni siquiera sabemos si dichas
   * propiedades son reales o no. Por ejemplo, si tengo el objeto _horario, yo puedo hacer desde JS:
   *
   * _horario.dias.Lunes[0].tostring(); porque en teoría todas esas insctrucciones/propiedades/métodos existen, pero si yo quiero:
   *
   * _horario.dias.mañana.Domingo.find(); no sé si vaya a funcionar porque JS me dice que todo es posible y eso está feo (tipo de
   * dato 'any', es decir, cualquier cosa)
   *
   * Lo de arriba por su puesto que me va a dar error, porque _horario.dias.mañana no existe, y cuando quiero buscar
   * 'undefined'.Domingo, salta un error de consola y pues crashea todo. Para solucionar esto, o mejor dicho, prevenirlo, se usa '?.'
   *
   * tomemos el objeto a = { b: 5 }, si ponemos 'a.b -> 5'; y todo bien, pero si ponemos 'a.b.c -> undefined' todavía está bien,
   * si ponemos 'a.b.c.d.e.f.g -> error' y explota; el operador '?.' verfifica si el objeto existe, y si no regresa 'undefined' y ya
   * 'a.b?.c?.d?.e?.f?.g -> undefined', porque el a.b si existe, pero el c no y de ahí ya simplemente no regresa nada, es igual que
   *
   * if (a.b !== undefined && a.b.c !== undefined && a.b.c.d !== undefined ... etc)
   *  return a.b.c.d.e.f.g.etc
   * else return undefined;
   */
  const act = _horario.dias?.[_current.day]?.[_current.pos];

  // Ponemos los datos de la celda en los controles de admin de nuevo, porque los selects se van a reiniciar, pero solo si hay datos
  if (act) {
    for (const field in _input.admin) {
      _input.admin[field].value = act[field];
      _input.admin[field].selectedIndex = act[field] + 1;
    }
  }
}

// ################################################## BUSCAR ##################################################
/**
 * Vamos a crear una expresión regular que busque la información de los inputs 'search' dentro de cada una de las celdas.
 * Y aquellas celdas en las que se encuentre el texto, se van a marcar con rojo.
 */
function buscar() {
  // Creamos una variable para guardar los valores, la iniciamos con ".*" para que antes del string nos agarre cualquier cosa (REGEX)
  let findstr = ".*";
  /**
   * Esta expresion regular busca todos los signos de puntuación de acentos, como ´ ¨ y los demás. El método que vamos a utilizar es
   * una combinación de funciones con 'normalize("NFD")' y 'replace(rr ,"")', la primera básicamente convierte un texto (por ejemplo)
   * "á" en "a´", quitándoles el acento a la letra, pero todavía los deja ahí; es por esto que usamos 'replace(rr, "")' para agarrar
   * todos los acentos y reemplazarlos con "" (es decir, eliminándolos).
   *
   * Esto es para que el buscador interprete "nömbré dé PróFESÓr" == "nombre de profesor" y que de igual como lo escribas.
   */
  const rr = /[\u0300-\u036f]/g;

  // Recorremos los inputs, agarrando su valor y agregándolo al 'findstr'
  for (const field in _input.search) {
    const newval = _input.search[field].value
      .normalize("NFD") // esto es para omitir acentos
      .replace(rr, "") // esto es para quitar acentos
      .replace(/[^\d\w]/g, "\\$&"); // esto es para escapar caracteres raros, como por ejemplo "{", "." o "/"

    // Lo acumulamos dentro del string de búsqueda, agregando ".*" para agarrar cualquier texto después
    findstr += newval + ".*";
  }

  // Creamos la expresion de búsqueda, y le ponemos la "i" para que las mayúsculas y minúsculas las tome por iguales "A" == "a"
  const regex = new RegExp(findstr, "i");

  // Recorremos todas las celdas y ejecutamos la función dentro de ellas
  for (const cell of _cells) {
    cell.classList.remove("selected-cell"); // Antes que nada, la deseleccionamos por si estaba activa

    // Verificamos si el tamaño de 'findstr' es mayor a 8 porque significa que los inputs 'search' no están vacíos.
    if (
      findstr.length > 8 &&
      regex.test(cell.textContent.normalize("NFD").replace(rr, ""))
    ) {
      cell.classList.add("selected-cell"); // En caso de que la expresión regular haya encontrado algo, entonces activamos la celda
    }
  }
}

// ################################################## POPUP ##################################################
/**
 * Con esta función vamos a poder mostrar el popup en pantalla siempre que queramos. Con una descripción, información
 * enlistada, serie de inputs para cualquier cosa y hasta un callback personalizado con el botón aceptar. Ningún parámetro
 * es necesario.
 *
 * @param {string | undefined} desc Descripción del popup, cualquier tipo de texto válido. Es lo primero que se muestra.
 *
 * @param {object | undefined} listData Objeto con la información a mostrar en forma de lista. Por ejemplo, si le pasamos
 * un objeto como { maestro: "Jalil", grupo: 32, materia: "Redes" }, entonces va a mostrar una lista de elementos
 * a modo de:
 * - maestro: Jalil
 * - grupo: 32
 * - materia: Redes
 *
 * @param {object | undefined} inputData Objeto con la información a recuperar del input. Es similar al `listData`.
 * Por cada propiedad del objeto se va a crear un input para el cual ingresar datos, si dicha propiedad ya tiene algún
 * valor 'string', entonces ese valor se va a poner en el input como default (autocompletado).
 *
 * @param {string | undefined} buttonDesc Texto que se muestra dentro del botón del popup. El default es "Aceptar".
 *
 * @param {() => {} | undefined} callback Representa una función/serie de instrucciones a realizar cuando se pulse el
 * botón de 'Aceptar'. En caso de que existan inputs, los valores de los inputs se van a pasar como parametro del
 * callback como si fuera el objeto 'inputData', pero con los valores actualizados.
 *
 * @param {boolean | undefined} repeat Significa si el PopUp debería permanecer abierto después del callback, en caso
 * de que el mismo callback genere otro PopUp o modifique su información. Por default es falso, y esto evita que el
 * botón de "Aceptar" cierre el PopUp (aunque seguirá ocultándose siempre que se haga clic fuera de él).
 */
function popup(desc, listData, inputData, buttonDesc, callback, repeat) {
  // ========================= REINICIAR POPUP =========================
  // Reiniciamos las cosas, primero necesitamos borrar todo lo de 'popup-content'
  _popup.content.replaceChildren();
  // Cambiamos el contenido del botón del popup y lo rehabilitamos en caso de que no esté activo.
  _popup.button.textContent = buttonDesc || "Aceptar"; // Default
  _popup.button.disabled = false;

  // ========================= DESCRIPCIÓN DEL POPUP =========================
  // Después, agregamos la descripción del popup
  const p = document.createElement("p");
  p.textContent = desc || "Hola mundo!"; // Texto default
  _popup.content.appendChild(p); // Guardamos

  // ========================= LISTA DE DATOS =========================
  const ul = document.createElement("ul");
  // En caso de que sea 'undefined' pues sencillamente no hace nada y ya
  for (const prop in listData) {
    const li = document.createElement("li"); // Creamos el elemento de lista
    const title = document.createElement("b"); // Creamos el título en negritas
    title.textContent = prop + ": "; // Le agregamos el nombre de la propiedad 'prop'
    li.append(title, listData[prop].toString()); // Agregamos tanto el título como el contenido (con .toString por si acaso)

    ul.appendChild(li); // Guardamos el elemento en la lista y repetimos
  }
  _popup.content.appendChild(ul); // Guardamos

  // ========================= LISTA DE INPUTS =========================
  const ul2 = document.createElement("ul");
  // En caso de que sea 'undefined' pues sencillamente no hace nada y ya
  for (const prop in inputData) {
    const li = document.createElement("li"); // Creamos el elemento de lista
    const label = document.createElement("label"); // Creamos la etiqueta correspondiente
    label.textContent = prop + ": "; // Le agregamos el nombre de la propiedad 'prop'
    label.htmlFor = "popup-input-" + prop; // Le ponemos una ID personalizada

    const input = document.createElement("input"); // Creamos el input
    input.value = inputData[prop].toString(); // Guardamos la info default dentro del input (con .toString por si acaso)
    input.id = "popup-input-" + prop; // Le ponemos una ID personalizada

    /**
     * Podríamos guardar los inputs en un arreglo, pero también podemos hacer que los inputs modifiquen en casi
     * tiempo real los valores del objeto 'inputData'. Así podemos mandar la info directamente sin necesidad de volver
     * a buscar dentro de los inputs a cada rato.
     */
    input.onchange = (e) => (inputData[prop] = e.target.value);

    li.append(label, input); // Guardamos todo en el elemento de lista
    ul2.appendChild(li); // Guardamos el elemento en la lista y repetimos
  }
  _popup.content.appendChild(ul2); // Guardamos

  // ========================= BOTON DE ACEPTAR =========================
  _popup.button.onclick = async (e) => {
    _popup.button.textContent = "En proceso..."; // Mostramos info de que se está ejecutando el código
    _popup.button.disabled = true; // Deshabilitamos el botón para que no se hagan muchos clicks

    // Ejecutamos el callback (si existe) y le pasamos el 'inputData' como parámetro
    if (callback) {
      try {
        await callback(inputData); // En caso de que el callback sea asíncrono, lo esperamos
      } catch (error) {
        console.error("Error in popup event: ", error);
      }
    }

    // Cuando termine el callback ocultamos el popup y eliminamos el click del botón por si acaso (solo si no hay repeat)
    if (!repeat) {
      _popup.button.onclick = () => console.log("disabled!");
      _popup.main.classList.add("hidden");
    }
  };

  // ========================= MOSTRAR POPUP =========================
  // Mostramos el popup, le quitamos la clase 'hidden'
  _popup.main.classList.remove("hidden");
}

/*
  TODO:

  1.- FORMA DE ACCEDER AL ADMIN
  3.- DESDE EL ADMIN, SUBIR LOS CAMBIOS AL SERVIDOR (PROBAR SI FUNCIONA)

*/
