// ######################### URLS
const url = "http://127.0.0.1:3000/Horario";
// const url = "http://172.16.16.16:3000/Horario";

// #region ################################################## VARIABLES ##################################################
/** Qué información va a contener una celda de clase */
class Clase {
  Asignatura = "";
  Maestro = "";
  Grupo = 0;
}

/** Guardar todo el Horario para poder manipularlo después */
var Horario = {
  Lunes: [new Clase()], // Información de prueba para que identifique el tipo de dato
  Martes: [new Clase()],
  Miércoles: [new Clase()],
  Jueves: [new Clase()],
  Viernes: [new Clase()],
  Asignaturas: [""],
  Maestros: [""],
};

// Almacenar los elementos de HTML para no tener que buscarlos a cada rato
var obj_schedule = document.createElement("table");
var obj_info = document.createElement("div");

/** Almacenar los controles, ya sean de admin o de búsqueda */
var Input = {
  admin: {
    Asignatura: document.createElement("select"),
    Maestro: document.createElement("select"),
    Grupo: document.createElement("input"),
  },
  search: {
    Asignatura: document.createElement("select"),
    Maestro: document.createElement("select"),
    Grupo: document.createElement("input"),
  },
};

/** Guardar información para las celdas actuales */
var current = {
  /** Referencia a la última celda a la que se hizo clic */
  cell: document.createElement("td"),
  /** En qué día se encuentra la celda */
  day: "Lunes",
  /** En qué posición del día se encuentra la celda */
  pos: 0,
};
//#endregion

// #region ################################################## INICIO ##################################################
// Esto hace que se ejecute las instrucciones cuando el documento termine de cargar sus contenidos
// esto basicamente para que luego no haya problemas de que no encuentra una ID porque el elemento
// no se ha generado aun
document.addEventListener("DOMContentLoaded", () => {
  // Cuando haya cargado el documento, buscar ahora si los elementos
  obj_schedule = document.getElementById("schedule");
  obj_info = document.getElementById("info");

  // Guardar los inputs correctamente
  for (const type in Input) {
    for (const field in Input[type]) {
      Input[type][field] = document.getElementById(`${type}-${field}`);
    }
  }

  // El botón de actualizar nada más lo ocupamos una vez, no tiene caso hacerlo variable
  const Actualizar = document.getElementById("Actualizar");
  // Le ponemos una función para cuando le hagamos clic
  Actualizar.onclick = () => {
    const valAsignatura = Input.admin.Asignatura.value || "";
    const valGrupo = Input.admin.Grupo.value || "";
    const valMaestro = Input.admin.Maestro.value || "";

    // Primero, actualizamos el texto de la celda con el texto de los valores
    current.cell.textContent = `${valAsignatura} ${valGrupo} ${valMaestro}`;

    // Después, actualizamos el horario en el día y la posición de la celda (la actual)
    Horario[current.day][current.pos] = {
      Asignatura: valAsignatura,
      Grupo: parseNumber(valGrupo),
      Maestro: valMaestro,
    };
  };

  // Actualizamos el horario
  getHorario();
});
//#endregion

// #region ################################################## GET HORARIO ##################################################
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
  // Borramos toda la tabla
  obj_schedule.replaceChildren("Cargando...");
  let response;

  // Vamos a contactar al servidor con `fetch()`, pero como es asíncrono y puede dar error por Internet...
  // ######################### SERVER #########################

  // ... vamos a poner todo dentro de un try-catch para manejar los errores
  try {
    // Vamos a pedirle al servidor original que traiga la información
    response = await fetch(url);
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

  // Si llegamos hasta aquí significa que todo bien, metemos la información al Horario
  Horario = await response.json();
  obj_schedule.innerText = "";

  // Ahora que tenemos la información, vamos a crear la tabla desde cero
  // ######################### TABLE #########################
  const encabezados = [
    "Día/Hora",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
  ];

  // Creamos los encabezados de la tabla
  const thead = document.createElement("thead");
  for (let i = 0; i < encabezados.length; i++) {
    const th = document.createElement("th"); // creamos (en blanco)
    th.innerText = encabezados[i]; // modificamos
    thead.appendChild(th); // guardamos
  }

  // Guardamos los encabezados dentro de la tabla
  obj_schedule.appendChild(thead);

  // Creamos el cuerpo de la tabla
  const tbody = document.createElement("tbody");

  // Ciclamos una X cantidad de veces según las clases que tenemos el Lunes (por ejemplo)
  for (let pos = 0; pos < Horario.Lunes.length; pos++) {
    const row = document.createElement("tr");

    // Ciclamos para cada encabezados que tengamos
    encabezados.forEach((day) => {
      const cell = document.createElement("td"); // Creamos una celda

      // La variable day representa un elemento dentro de `encabezados`, entonces podemos hacer:
      // Si no existe ese encabezado dentro de Horario
      if (!Horario[day]) {
        // Significa que day == "Día/Hora", porque es el único que no existe dentro de Horario
        cell.innerText = `${pos + 7}:00 - ${pos + 7}:55`; // guardamos la hora (comenzamos a las 7am)
      } else {
        // En caso de que si exista el encabezado, estamos en algún día de la semana
        /** @type {Clase} Datos guardados de la posición `pos` */
        const dd = Horario[day][pos];

        // Mostar la información en la celda
        cell.innerText = `${dd.Asignatura} ${dd.Grupo || ""} ${dd.Maestro}`;

        // Ponerle que cuando se haga click, actualice la información actual
        cell.onclick = () => {
          current.cell = cell;
          current.day = day;
          current.pos = pos;
          obj_info.style.display = ""; // Hacemos que los controles sean visibles

          // Ponemos los datos de la celda en los controles de admin
          Input.admin.Asignatura.selectedIndex = Horario.Asignaturas.indexOf(
            Horario[day][pos].Asignatura
          );
          Input.admin.Maestro.selectedIndex = Horario.Maestros.indexOf(
            Horario[day][pos].Maestro
          );
          Input.admin.Grupo.value = Horario[day][pos].Grupo || "";
        };
      }

      row.appendChild(cell); // Guardamos la celda en la fila
    });
    tbody.appendChild(row); // Guardamos la fila completa en el cuerpo
  }

  // Ahora que ya terminamos los ciclos, guardamos todo en la tabla
  obj_schedule.appendChild(tbody);

  // Cremos los selects, para solo admitir maestros y asignaturas que ya existan
  // ######################### SELECTS #########################

  Input.admin.Maestro.replaceChildren("Cargando..."); // Limpiamos las opciones
  Horario.Maestros.forEach((profe) => {
    const opt = document.createElement("option"); // creamos
    opt.text = profe; // modificamos
    opt.value = profe;
    Input.admin.Maestro.appendChild(opt); // guardamos
  });
  Input.admin.Maestro.selectedIndex = -1; // des-seleccionamos

  Input.admin.Asignatura.replaceChildren("Cargando..."); // Limpiamos las opciones
  Horario.Asignaturas.forEach((materia) => {
    const opt = document.createElement("option"); // creamos
    opt.text = materia; // modificamos
    opt.value = materia;
    Input.admin.Asignatura.appendChild(opt); // guardamos
  });
  Input.admin.Asignatura.selectedIndex = -1; // des-seleccionamos
}
//#endregion

// #region ################################################## SET HORARIO ##################################################
/**
 * Agarra el Horario actual y se lo manda al servidor para ver si se puede actualizar la información
 * @param {string} password Contraseña para poder modificar la información desde el admin
 */
async function setHorario(password) {
  let response;

  // Intentamos acceder al servidor, las opciones son para hacer la solicitud
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        ...Horario,
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
// #endregion

// #region ################################################## PARSE NUMBER ##################################################
/** Revisa si un valor `string` puede ser convertido a `number` correctamente, sino regresa `0`
 * @param {string} num número a evaluar
 */
function parseNumber(num) {
  return parseFloat(num.match(/\-?\d*\.?\d+/)) || 0;
}
// #endregion
