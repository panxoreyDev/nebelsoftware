from fastapi import FastAPI, Query, HTTPException
import asyncpg
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
app = FastAPI()



async def connect_to_db():
    conn = await asyncpg.connect(
        user='postgres',
        password='12345',
        database='postgres',
        host='localhost'
    )
    return conn

@app.on_event("startup")
async def startup():
    app.state.db = await connect_to_db()

@app.on_event("shutdown")
async def shutdown():
    await app.state.db.close()


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir acceso desde cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/data_dia/")
async def get_data():
    query = """
        SELECT
            codigo_tienda,
            codigo_barras,
            EXTRACT(YEAR FROM TO_DATE(fecha, 'DD/MM/YYYY')) AS ano,
            EXTRACT(WEEK FROM TO_DATE(fecha, 'DD/MM/YYYY')) AS semana,
            EXTRACT(DAY FROM TO_DATE(fecha, 'DD/MM/YYYY')) AS dia,
            SUM(CAST(venta_unidades AS INTEGER)) AS total_venta_unidades
        FROM
            city_club
        GROUP BY
            dia,
            codigo_tienda,
            codigo_barras,
            ano,
            semana
        ORDER BY
            ano, semana, dia
        LIMIT 9000;
    """
    rows = await app.state.db.fetch(query)
    
    # Convertir el resultado a una lista de diccionarios
    result = [
        {   
            "codigo_tienda": row["codigo_tienda"],
            "dia": row["dia"],
            "codigo_barras": row["codigo_barras"],
            "ano": row["ano"],
            "semana": row["semana"],
            "total_venta_unidades": row["total_venta_unidades"]
        }
        for row in rows
    ]
    return result



#------------------------------------------------------------------------------------------------------------------------------------------------


@app.get("/data_filt/")
async def get_ventas_por_mes(mes: int, ano: Optional[int] = Query(None)):
    if mes < 1 or mes > 12:
        raise HTTPException(status_code=400, detail="Mes inválido. Debe estar entre 1 y 12.")
    

    
    try:
        # Conexión a la base de datos
        conn = await connect_to_db()

        # Construir la consulta SQL
        query = """
            SELECT 
                EXTRACT(YEAR FROM TO_DATE(fecha, 'DD/MM/YYYY')) AS ano,
                fecha, 
                codigo_tienda, 
                codigo_barras, 
                CAST(venta_unidades AS NUMERIC) AS venta_unidades,
                CAST(inventario_actual AS NUMERIC) AS inventario_actual,
                venta_pesos,
                CASE 
                    WHEN CAST(venta_unidades AS NUMERIC) > 0 THEN CAST(inventario_actual AS NUMERIC) / CAST(venta_unidades AS NUMERIC)
                    ELSE NULL
                END AS doh
            FROM city_club
            WHERE EXTRACT(MONTH FROM TO_DATE(fecha, 'DD/MM/YYYY')) = $1
        """
        
        # Si se especifica un año, añadir el filtro de año a la consulta
        params = [mes]
        if ano is not None:
            query += " AND EXTRACT(YEAR FROM TO_DATE(fecha, 'DD/MM/YYYY')) = $2"
            params.append(ano)

        # Ejecutar la consulta con los parámetros adecuados
        rows = await conn.fetch(query, *params)


        # Cerrar la conexión
        await conn.close()
        
        # Retornar los resultados
        return rows

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

