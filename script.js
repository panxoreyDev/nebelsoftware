

// Colores específicos para cada año
const yearColors = {
    2022: '#008000',      // 
    2023: '#ffa600',      //  
    2024: '#337aff',      // 
    2025: '#000000'       // Negro o cualquier color que desees para un año adicional
};

// Cambiar pestañas al hacer clic
        $(".nav-link").click(function() {
            $(".tab-content").hide();
            var target = $(this).attr("href");
            $(target).show();
        });


// Función para mostrar el spinner
async function showLoadingSpinner() {
    document.getElementById("loadingSpinner").style.display = "block";
}

// Función para ocultar el spinner
async function hideLoadingSpinner() {
    document.getElementById("loadingSpinner").style.display = "none";
}


// Función para ocultar el div de ventascontainer 
async function hideventascont() {
    document.getElementById('ventasdiarias-container').style.display = 'none';
    document.getElementById('ventasChartfiltered').style.display = 'none';
}

// Función para ocultar el div de ventascontainer 
async function showventascont() {
    document.getElementById('ventasdiarias-container').style.display = 'block';
    document.getElementById('ventasChartfiltered').style.display = 'none';
}

// Función para mostrar el div de ventascontainer filtered
async function showventascontfilt() {
    document.getElementById('ventasdiarias-container').style.display = 'none';
    document.getElementById('ventasChartfiltered').style.display = 'block';
}

// Función para ocultar el div de ventascontainer 
async function HideTableResumen() {
    document.getElementById('TableContainer').style.display = 'none';
}

// Función para mostrar el div de ventascontainer filtered
async function ShowTableResumen() {
    document.getElementById('TableContainer').style.display = 'block';
}


// Definir charts en el ámbito global para que esté disponible en todas las funciones
let charts = []; // Lista para almacenar todas las instancias de gráficos activos

// Definir funciones para cada pestaña
const tabFunctions = {
    "#tab1": [ 
        hideventascont, 
        inicializarDropdowns, 
        destroyAllCharts, 
        createDailySalesChart1,
    ],

    
    "#tab2": [ShowTableResumen, fillResumenTable],
    // Añade más pestañas y funciones aquí según sea necesario
};

// Ejecuta las funciones correspondientes al mostrar la pestaña
$(".nav-link").click(function() {
    const target = $(this).attr("href");
    if (tabFunctions[target]) {
        // Itera sobre la lista de funciones y las ejecuta
        tabFunctions[target].forEach(func => func());
    }
});

// Función para destruir todos los gráficos
async function destroyAllCharts() {
    charts.forEach(chart => {
        if (chart) {
            chart.destroy();  // Destruye cada instancia de gráfico
        }
    });
    charts = []; // Limpia la lista después de destruir todos los gráficos

    // Limpia todos los canvas en la página para asegurarse de que estén listos
    $('canvas').each(function() {
        const context = this.getContext('2d');
        context.clearRect(0, 0, this.width, this.height); // Limpia el canvas
    });
}


//Función que anima el submenu del submenu de opciones

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar el botón que alterna el submenú
    const submenuToggle = document.querySelector('.submenu-toggle');

    // Verificar que submenuToggle existe
    if (submenuToggle) {
        submenuToggle.addEventListener('click', function(event) {
            event.preventDefault(); // Evitar el comportamiento por defecto del enlace
            
            // Seleccionar el submenú y alternar la clase 'active'
            const submenu = document.querySelector('.submenu');
            if (submenu) {
                submenu.classList.toggle('active');
            }

            // Si el submenú está activo, agregar eventos de clic a las opciones del submenú
            if (submenu && submenu.classList.contains('active')) {
                submenu.querySelectorAll('.nav-link').forEach(option => {
                    option.addEventListener('click', function(event) {
                        event.preventDefault();
                        console.log(`Click en la opción: ${this.textContent}`);
                    });
                });
            }
        });
    }
});



//------------------------------------------------------------------------------------------------------------------------------------------------------------

const apiUrl_city = "http://127.0.0.1:8000/data_dia/";
// Función para obtener datos de la API y crear el gráfico
async function createDailySalesChart1() {
    showLoadingSpinner();
    try {
        const response = await fetch(apiUrl_city);  // Realiza la solicitud a la API
        const data = await response.json();    // Convierte la respuesta en JSON
        
        // Estructurar los datos por año y fecha
        const dataByYear = {};
        data.forEach(item => {
            const year = item.ano;
            const fecha = item.dia;
            const sales = item.total_venta_unidades;

            // Inicializar el año en el objeto si no existe
            if (!dataByYear[year]) {
                dataByYear[year] = {};
            }

            // Guardar ventas para cada fecha en el año correspondiente
            dataByYear[year][fecha] = sales;
        });

        // Crear conjuntos de datos para Chart.js con los colores asignados
        const datasets = Object.keys(dataByYear).map(year => {
            return {
                label: `Ventas ${year}`,
                data: Object.values(dataByYear[year]),
                backgroundColor: yearColors[year] || '#cccccc',  // Usa el color especificado o un color por defecto
                borderColor: yearColors[year] || '#cccccc',
                borderWidth: 1
            };
        });

        // Generar etiquetas (fechas) tomando las fechas de un año como referencia
        const etiquetas = Object.keys(dataByYear[Object.keys(dataByYear)[0]]);

        // Configuración del gráfico
        const ctx = document.getElementById('ventasdiarias').getContext('2d');
        const ventasdiariasChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetas,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'día'
                        },
                        ticks: {
                            autoSkip: true,
                            maxRotation: 90,
                            minRotation: 90,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ventas en Unidades'
                        }
                    }
                }
            }
        });
        charts.push(ventasdiariasChart); // Añade el gráfico a la lista de instancias
    } catch (error) {
        console.error("Error al obtener los datos de la API:", error);
    } finally {
        hideLoadingSpinner();
        showventascont();
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------

// Definir la función para inicializar los dropdowns con valores predeterminados
async function inicializarDropdowns() {
    document.getElementById('dropdownMenuButtonYear').textContent = "Año";
    document.getElementById('dropdownMenuButtonMonth').textContent = "Mes";
}

// Llamar a la función cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    inicializarDropdowns(); // Inicializar los botones con el texto predeterminado
});


// Manejar clics en el dropdown de Año
document.querySelectorAll('[data-year]').forEach(function (element) {
    element.addEventListener('click', function (event) {
        event.preventDefault(); // Evitar recarga de la página

        // Obtener el valor del atributo data-year
        const añoSeleccionado = event.target.getAttribute('data-year');
        const nombreAño = event.target.textContent;

        // Actualizar el botón del dropdown con el texto del año seleccionado
        document.getElementById('dropdownMenuButtonYear').textContent = nombreAño;

        // Guardar en localStorage: si el valor de "data-year" está vacío, guardar null
        if (añoSeleccionado === "") {
            localStorage.setItem('añoSeleccionado', null); // Guardar como null si se selecciona "YTD"
        } else {
            localStorage.setItem('añoSeleccionado', añoSeleccionado); // Guardar el valor del año normalmente
        }
    });
});

// Manejar clics en el dropdown de Mes
document.querySelectorAll('[data-month]').forEach(function (element) {
    element.addEventListener('click', function (event) {
        event.preventDefault(); // Evitar recarga de la página

        // Obtener el valor del atributo data-month (el número del mes)
        const mesSeleccionado = event.target.getAttribute('data-month');
        const nombreMes = event.target.textContent;

        // Actualizar el botón del dropdown con el nombre del mes seleccionado
        const dropdownButtonMonth = document.getElementById('dropdownMenuButtonMonth');
        dropdownButtonMonth.textContent = nombreMes;

        // Guardar solo el valor del mes (como número) en localStorage
        localStorage.setItem('mesSeleccionado', mesSeleccionado);
    });
});





//------------------------------------------------------------------------------------------------------------------------------------------------------------
// Función para crear un gráfico con los datos filtrados
async function createFilteredSalesChart(data) {
    destroyAllCharts();
    showventascontfilt();
    // Estructurar los datos por año y fecha
    const dataByYear = {};
    data.forEach(item => {
        const year = item.ano;
        const fecha = item.fecha;
        const sales = item.venta_unidades;

        // Inicializar el año en el objeto si no existe
        if (!dataByYear[year]) {
            dataByYear[year] = {};
        }

        // Guardar ventas para cada fecha en el año correspondiente
        dataByYear[year][fecha] = sales;
    });

    // Crear conjuntos de datos para Chart.js con los colores asignados
    const datasets = Object.keys(dataByYear).map(year => {
        return {
            label: `Ventas ${year}`,
            data: Object.values(dataByYear[year]),
            backgroundColor: yearColors[year] || '#cccccc',  // Usa el color especificado o un color por defecto
            borderColor: yearColors[year] || '#cccccc',
            borderWidth: 1
        };
    });

    // Generar etiquetas (fechas) tomando las fechas de un año como referencia
    const etiquetas = Object.keys(dataByYear[Object.keys(dataByYear)[0]]);

    // Configuración del gráfico
    const ctx = document.getElementById('ventasChartfiltered').getContext('2d');
    const ventasChartfilteredChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 90,
                        minRotation: 90,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ventas en Unidades'
                    }
                }
            }
        }
    });
    charts.push(ventasChartfilteredChart); // Añade el gráfico a la lista de instancias
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
        // Añadir evento para el botón "Buscar"
        document.getElementById('buscarBtn').addEventListener('click', async function () {

            const añoSeleccionado = localStorage.getItem('añoSeleccionado');
            const mesSeleccionado = localStorage.getItem('mesSeleccionado');
        
            if (añoSeleccionado && mesSeleccionado) {
                // Realizar solicitud a FastAPI con los parámetros seleccionados
                let apiUrlFiltered = `http://127.0.0.1:8000/data_filt/`;
        // Solo agregar el año si no es null
                if (mesSeleccionado && mesSeleccionado !== "null") {
                    apiUrlFiltered += `?mes=${mesSeleccionado}`;
                }
                if (añoSeleccionado && añoSeleccionado !== "null") {
                    apiUrlFiltered += `&ano=${añoSeleccionado}`;                            
                }
                try {
                    const response = await fetch(apiUrlFiltered);
                    if (!response.ok) {
                        throw new Error('Error en la solicitud');
                    }
                    const data = await response.json();
                    // Crear gráfico con los datos filtrados
                    createFilteredSalesChart(data);
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                alert('Por favor, selecciona un mes y un año antes de buscar.');
            }
        });


//------------------------------------------------------------------------------------------------------------------------------------------------------------
//LLENA LA TABLA CON LA INFORMACION DE LA API.

            // URL de tu API
    const apiUrl = "http://127.0.0.1:8000/data_dia/";

    // Función para llenar la tabla de resumen (DOH Data)
    async function fillResumenTable() {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        const resumenTableBody = document.querySelector("#resumenTable tbody");
        resumenTableBody.innerHTML = ""; // Limpia contenido previo

        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.ano}</td>
                <td>${row.semana}</td>
                <td>${row.codigo_tienda}</td>
                <td>${row.codigo_barras}</td>
                <td>${row.total_venta_unidades}</td>
                <td>${row.inventario_actual}</td>
                <td>${row.total_ventas_en_pesos}</td>
                <td>${row.doh}</td>
            `;
            resumenTableBody.appendChild(tr);
        });
    }