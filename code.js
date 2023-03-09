// Esto hace que se ejecute las instrucciones cuando el documento termine de cargar sus contenidos
// esto basicamente para que luego no haya problemas de que no encuentra una ID porque el elemento
// no se ha generado aun
document.addEventListener("DOMContentLoaded", () => {
  console.log("Live!");
  const horario = document.getElementById("asdasd");
});

// yo puedo escribir cosas que no tengan nada uqe ver con el DOM (html)
const vaasa = 23; //glbal
