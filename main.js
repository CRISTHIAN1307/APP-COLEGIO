let aulas = JSON.parse(localStorage.getItem("aulas")) || [];

function guardarDatos() {
  localStorage.setItem("aulas", JSON.stringify(aulas));
  cargarSelects();
  cargarBotonesCursos();
}

function agregarAula() {
  const nombre = document.getElementById("nuevaAula").value.trim();
  if (!nombre) return alert("Escribe el nombre del aula");
  if (aulas.some(a => a.nombre === nombre)) {
    return alert("El aula ya existe");
  }
  aulas.push({ nombre, cursos: [] });
  guardarDatos();
  document.getElementById("nuevaAula").value = "";
}

function agregarCurso() {
  const aulaIndex = document.getElementById("aulaCursoSelect").value;
  const nombre = document.getElementById("nuevoCurso").value.trim();
  if (!nombre) return alert("Escribe el nombre del curso");
  const aula = aulas[aulaIndex];
  if (aula.cursos.some(c => c.nombre === nombre)) {
    return alert("Ese curso ya existe en este aula");
  }
  aula.cursos.push({ nombre, alumnos: [], preguntas: [], puntajes: {}, respuestas: {}, respuestasTotales: {} });
  guardarDatos();
  document.getElementById("nuevoCurso").value = "";
}

function agregarAlumno() {
  const aulaIndex = document.getElementById("aulaAlumnoSelect").value;
  const cursoIndex = document.getElementById("cursoAlumnoSelect").value;
  const nombre = document.getElementById("nuevoAlumno").value.trim();
  if (!nombre) return alert("Escribe el nombre del alumno");
  const curso = aulas[aulaIndex].cursos[cursoIndex];
  if (curso.alumnos.some(a => a === nombre)) {
    return alert("Ese alumno ya existe en este curso");
  }
  curso.alumnos.push(nombre);
  guardarDatos();
  document.getElementById("nuevoAlumno").value = "";
}

function mostrarAlumnos() {
  const aulaIndex = document.getElementById("aulaVerSelect").value;
  const cursoIndex = document.getElementById("cursoVerSelect").value;
  const curso = aulas[aulaIndex].cursos[cursoIndex];
  const cont = document.getElementById("alumnosContainer");
  cont.innerHTML = `<h3>Alumnos de ${curso.nombre} - Aula ${aulas[aulaIndex].nombre}</h3><ul>` +
    curso.alumnos.map(nombre => `<li>${nombre}</li>`).join("") +
    `</ul>`;
}

function cargarSelects() {
  const aulaSelects = [
    "aulaCursoSelect", 
    "aulaAlumnoSelect", 
    "aulaVerSelect"
  ];
  aulaSelects.forEach(id => {
    const select = document.getElementById(id);
    select.innerHTML = "";
    aulas.forEach((aula, index) => {
      const opt = document.createElement("option");
      opt.value = index;
      opt.textContent = aula.nombre;
      select.appendChild(opt);
    });
  });
  cargarCursos("cursoAlumnoSelect", "aulaAlumnoSelect");
  cargarCursos("cursoVerSelect", "aulaVerSelect");
}

function cargarCursos(cursoSelectId, aulaSelectId) {
  const cursoSelect = document.getElementById(cursoSelectId);
  const aulaIndex = document.getElementById(aulaSelectId).value;
  cursoSelect.innerHTML = "";
  if (!aulas[aulaIndex]) return;
  aulas[aulaIndex].cursos.forEach((curso, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = curso.nombre;
    cursoSelect.appendChild(opt);
  });
}

["aulaAlumnoSelect", "aulaVerSelect", "aulaCursoSelect"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    if (id === "aulaAlumnoSelect") cargarCursos("cursoAlumnoSelect", id);
    if (id === "aulaVerSelect") cargarCursos("cursoVerSelect", id);
  });
});

function cargarBotonesCursos() {
  const container = document.getElementById("botonesCursosContainer");
  if (!container) return;
  container.innerHTML = "";
  aulas.forEach((aula, aulaIndex) => {
    const aulaDiv = document.createElement("div");
    aulaDiv.innerHTML = `<h3>Aula: ${aula.nombre}</h3>`;
    aula.cursos.forEach((curso, cursoIndex) => {
      const btn = document.createElement("button");
      btn.textContent = curso.nombre;
      btn.onclick = () => abrirCursoAvanzado(aulaIndex, cursoIndex);
      btn.className = "curso-btn";
      aulaDiv.appendChild(btn);
    });
    container.appendChild(aulaDiv);
  });
}

let aulaActual = null;
let cursoActual = null;

function abrirCursoAvanzado(aulaIndex, cursoIndex) {
  aulaActual = aulaIndex;
  cursoActual = cursoIndex;
  document.getElementById("principalSection").style.display = "none";
  document.getElementById("interfazAvanzada").style.display = "block";
  mostrarCursoAvanzado();
}

function volverAPrincipal() {
  aulaActual = null;
  cursoActual = null;
  document.getElementById("interfazAvanzada").style.display = "none";
  document.getElementById("principalSection").style.display = "block";
}

function mostrarCursoAvanzado() {
  const curso = aulas[aulaActual].cursos[cursoActual];
  document.getElementById("tituloCursoAvanzado").textContent = `Curso: ${curso.nombre} - Aula: ${aulas[aulaActual].nombre}`;
  const contenedorCorrecta = document.getElementById("contenedorSeleccionCorrecta");
if (curso.pregunta) {
  contenedorCorrecta.innerHTML = `
    <label><strong>Alternativa correcta:</strong></label>
    <select id="correctaSeleccionada">
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
      <option value="E">E</option>
    </select>
    <button onclick="establecerAlternativaCorrecta()">Establecer correcta y evaluar</button>
  `;
}

  document.getElementById("formPregunta").style.display = "none";
  document.getElementById("inputPregunta").value = "";
  document.getElementById("inputRespuestaCorrecta").value = "";
  if (!curso.puntajes) curso.puntajes = {};
  if (!curso.respuestas) curso.respuestas = {};
  if (!curso.pregunta) curso.pregunta = null;
  if (!curso.respuestasTotales) curso.respuestasTotales = {};
  mostrarAlumnosAvanzado();
}

function mostrarAlumnosAvanzado() {
  const curso = aulas[aulaActual].cursos[cursoActual];
  const cont = document.getElementById("listaAlumnosAvanzado");
  cont.innerHTML = "";
  if (!curso.pregunta) {
    cont.textContent = "No hay pregunta creada aún.";
    return;
  }
  const p = document.createElement("p");
  p.innerHTML = `<strong>Pregunta:</strong> ${curso.pregunta.texto}`;
  cont.appendChild(p);

  curso.alumnos.forEach(nombre => {
    const fila = document.createElement("div");
    fila.style.marginBottom = "8px";

    const nombreSpan = document.createElement("span");
    nombreSpan.textContent = nombre;
    nombreSpan.style.display = "inline-block";
    nombreSpan.style.width = "150px";

    const puntajeSpan = document.createElement("span");
    const correctas = (curso.correctasTotales && curso.correctasTotales[nombre]) || 0;
    const totalResp = curso.respuestasTotales[nombre] || 0;
    puntajeSpan.textContent = ` Puntaje: ${correctas} | Respondidas: ${totalResp}`;
    puntajeSpan.style.marginRight = "15px";

    fila.appendChild(nombreSpan);
    fila.appendChild(puntajeSpan);

    const opcionesCont = document.createElement("span");
    const respuestaAlumno = curso.respuestas[nombre] || null;
    const correcta = curso.pregunta.correcta.toUpperCase();

    ["A", "B", "C", "D", "E"].forEach(letra => {
        const btn = document.createElement("button");
        btn.textContent = letra;
        btn.style.marginRight = "5px";
        btn.style.color = "black";
      
        // Pinta amarillo si es la selección temporal antes de evaluar
        if (curso.selecciones?.[nombre] === letra) {
          btn.style.backgroundColor = "yellow";
        } else {
          btn.style.backgroundColor = "";
        }
      
        // Pinta verde/rojo después de evaluar, solo si ya hay respuesta guardada
        const evaluado = curso.pregunta && curso.pregunta.correcta && curso.respuestas && Object.keys(curso.respuestas).length > 0;

        if (evaluado) {
          if (respuestaAlumno === letra) {
            if (letra === correcta) {
              btn.style.backgroundColor = "#4CAF50"; // verde
              btn.style.color = "blue";
            } else {
              btn.style.backgroundColor = "#f44336"; // rojo
              btn.style.color = "blue";
            }
          }
        } else {
          // Solo pintar amarillo si es selección temporal, pero no rojo/verde antes de evaluar
          if (curso.selecciones?.[nombre] === letra) {
            btn.style.backgroundColor = "yellow";
          } else {
            btn.style.backgroundColor = "";
            btn.style.color = "black";
          }
        }
        
      
        btn.onclick = () => {
          curso.selecciones = curso.selecciones || {};
          curso.selecciones[nombre] = letra;  // Guardar selección temporal
          guardarDatos();
          mostrarAlumnosAvanzado();
        };
      
        opcionesCont.appendChild(btn);
      });
      

    fila.appendChild(opcionesCont);
    cont.appendChild(fila);
  });
}

function mostrarFormularioPregunta() {
  const form = document.getElementById("formPregunta");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function guardarPreguntaAvanzada() {
  const texto = document.getElementById("inputPregunta").value.trim();
  if (!texto) return alert("Escribe la pregunta");

  const curso = aulas[aulaActual].cursos[cursoActual];

  // Si ya existe una pregunta previa, conserva su alternativa correcta
  const correctaAnterior = curso.pregunta?.correcta || null;

  // Solo actualiza el texto de la pregunta y conserva lo demás
  curso.pregunta = {
    texto: texto,
    correcta: correctaAnterior
  };
  
  
  guardarDatos();
  mostrarCursoAvanzado();
}

  
function establecerAlternativaCorrecta() {
    const curso = aulas[aulaActual].cursos[cursoActual];
    const correcta = document.getElementById("correctaSeleccionada").value;
    curso.pregunta.correcta = correcta;
  
    // Reiniciar contadores
    
    curso.alumnos.forEach(nombre => {
      const seleccion = curso.selecciones?.[nombre];
      if (!seleccion) return;
  
      // Registrar respuesta
      curso.respuestas[nombre] = seleccion;
  
      // Contar respuestas totales
      curso.respuestasTotales[nombre] = (curso.respuestasTotales[nombre] || 0) + 1;
  
      // Contar puntajes (correctas)
      if (seleccion === correcta) {
        curso.puntajes[nombre] = (curso.puntajes[nombre] || 0) + 1;
        curso.correctasTotales[nombre] = (curso.correctasTotales[nombre] || 0) + 1;
      } else {
        curso.puntajes[nombre] = curso.puntajes[nombre] || 0;
        curso.correctasTotales[nombre] = curso.correctasTotales[nombre] || 0;
      }
    });
  
    guardarDatos();
    mostrarAlumnosAvanzado();
  }
  

function registrarRespuesta(nombreAlumno, respuesta) {
  const curso = aulas[aulaActual].cursos[cursoActual];
  const respAnterior = curso.respuestas[nombreAlumno] || null;
  

  curso.respuestas[nombreAlumno] = respuesta;

  const correcta = curso.pregunta.correcta.toUpperCase();
  if (respAnterior === correcta && respuesta !== correcta) {
    curso.puntajes[nombreAlumno] = (curso.puntajes[nombreAlumno] || 1) - 1;
  } else if (respAnterior !== correcta && respuesta === correcta) {
    curso.puntajes[nombreAlumno] = (curso.puntajes[nombreAlumno] || 0) + 1;
  } else if (!(nombreAlumno in curso.puntajes)) {
    curso.puntajes[nombreAlumno] = (respuesta === correcta) ? 1 : 0;
  }
  if (curso.puntajes[nombreAlumno] < 0) curso.puntajes[nombreAlumno] = 0;

// Registrar total de respuestas
  if (!curso.respuestasTotales) curso.respuestasTotales = {};
  if (!curso.respuestasTotales[nombreAlumno]) curso.respuestasTotales[nombreAlumno] = 0;
  if (!respAnterior) {
  curso.respuestasTotales[nombreAlumno] += 1;
 }

// Registrar correctas acumuladas
  if (!curso.correctasTotales) curso.correctasTotales = {};
  if (!curso.correctasTotales[nombreAlumno]) curso.correctasTotales[nombreAlumno] = 0;
  if (!respAnterior && respuesta === correcta) {
  curso.correctasTotales[nombreAlumno] += 1;
 }

  

  guardarDatos();
  mostrarAlumnosAvanzado();
}


  

function reiniciarContadores() {
    const curso = aulas[aulaActual].cursos[cursoActual];
  
    if (confirm("¿Estás seguro que deseas reiniciar las respuestas, puntajes y la pregunta actual?")) {
      curso.respuestasTotales = {};
      curso.correctasTotales = {};
      curso.puntajes = {};
      curso.respuestas = {};
      curso.pregunta = null;
  
      guardarDatos();
      mostrarAlumnosAvanzado();
      alert("Se han reiniciado las respuestas, el puntaje acumulado y la pregunta.");
    }
  }
  
  function calcularNotas() {
    const curso = aulas[aulaActual].cursos[cursoActual];
    const resultados = [];
  
    curso.alumnos.forEach(nombre => {
      const correctasT = curso.correctasTotales[nombre] || 0;
      const respondidas = curso.respuestasTotales[nombre] || 0;
      const nota = respondidas > 0 ? ((correctasT * 20) / (respondidas-1)).toFixed(2) : "N/A";
  
      resultados.push({ nombre, nota: nota === "N/A" ? -1 : parseFloat(nota), mostrar: nota });
    });
  
    // Ordenar de mayor a menor
    resultados.sort((a, b) => b.nota - a.nota);
  
    // Mostrar en pantalla
    const contenedor = document.getElementById("resultadosNotas");
    contenedor.innerHTML = "<h3>Notas de los alumnos (mayor a menor):</h3><ul style='list-style: none; padding: 0;'>";
  
    resultados.forEach(res => {
      contenedor.innerHTML += `<li style="margin-bottom: 5px;"><strong>${res.nombre}:</strong> ${res.mostrar}</li>`;
    });
  
    contenedor.innerHTML += "</ul>";
  }
  
  

window.onload = () => {
  cargarSelects();
  cargarBotonesCursos();
};
