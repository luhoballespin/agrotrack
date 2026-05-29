// Base de conocimiento (AR) orientativa. No reemplaza al veterinario.
// Reglas: usar denominaciones generales / principios activos, y citar SENASA como referencia regulatoria.

export const FUENTES_AR = [
  {
    titulo: "SENASA Argentina",
    detalle:
      "Calendarios oficiales, normas y registros de productos veterinarios. Verificar siempre el marbete/etiqueta y el criterio veterinario.",
  },
];

export const PROBLEMAS_POR_ESPECIE = {
  bovino: [
    {
      id: "parasitos_internos",
      nombre: "Parásitos internos (gastrointestinales)",
      señales: ["Baja de condición", "Diarrea intermitente", "Pelo áspero", "Anemia (mucosas pálidas)"],
      que_hacer: [
        "Separar y observar consumo de agua y materia seca.",
        "Revisar si hubo desparasitación en los últimos 90 días.",
        "Si hay debilidad marcada o terneros chicos, consultar veterinario y considerar coproparasitológico.",
      ],
      opciones_tratamiento: [
        "Antiparasitarios según diagnóstico y zona: lactonas macrocíclicas (ivermectina/moxidectina), benzimidazoles (albendazol), levamisol.",
        "Rotar principios activos por resistencia; respetar dosis y tiempos de retiro (carne/leche).",
      ],
      nota: "En ovinos/bovinos la resistencia parasitaria es frecuente; ideal confirmar carga parasitaria antes de rotar.",
    },
    {
      id: "aftosa_plan",
      nombre: "Vacunación Aftosa (planificación)",
      señales: ["No aplica como enfermedad", "Es prevención obligatoria por campañas"],
      que_hacer: [
        "Verificar campaña vigente y categoría alcanzada.",
        "Registrar evento sanitario y fecha próxima (cada 6 meses).",
      ],
      opciones_tratamiento: [
        "Vacuna según campaña oficial y distribución habilitada.",
        "Aplicación por personal habilitado según normativa local.",
      ],
      nota: "Cumplir SENASA / entes sanitarios regionales.",
    },
    {
      id: "neumonia",
      nombre: "Problemas respiratorios (tos/neumonía)",
      señales: ["Tos", "Secreción nasal", "Fiebre", "Decaimiento", "Respiración agitada"],
      que_hacer: [
        "Tomar temperatura (si es posible), aislar del lote y reducir estrés.",
        "Evaluar ambiente: polvo, encierre, cambios bruscos de clima.",
        "Contactar veterinario si hay fiebre o dificultad respiratoria.",
      ],
      opciones_tratamiento: [
        "Antiinflamatorio/antitérmico bajo indicación veterinaria.",
        "Antibiótico solo con diagnóstico veterinario (patógenos y sensibilidad varían).",
      ],
      nota: "Evitar automedicación con antibióticos. Registrar consulta y tratamiento.",
    },
  ],
  porcino: [
    {
      id: "diarrea",
      nombre: "Diarrea (lechones/recría)",
      señales: ["Heces líquidas", "Deshidratación", "Baja de consumo", "Decaimiento"],
      que_hacer: [
        "Rehidratación y control de temperatura ambiente.",
        "Revisar calidad de agua, limpieza y cambios de dieta.",
        "Consultar veterinario si hay sangre, fiebre o alta mortalidad.",
      ],
      opciones_tratamiento: [
        "Sales de rehidratación oral + manejo ambiental.",
        "Antibiótico solo con indicación veterinaria (según agente causal).",
      ],
      nota: "La prevención (bioseguridad y manejo) suele ser más efectiva que el tratamiento tardío.",
    },
    {
      id: "parasitos_internos",
      nombre: "Parásitos internos (plan de desparasitación)",
      señales: ["Bajo crecimiento", "Condición pobre", "Tos (ascaris)"],
      que_hacer: [
        "Revisar desparasitación cada 90 días y rotación de principios activos.",
        "Mejorar higiene de corrales y manejo de estiércol.",
      ],
      opciones_tratamiento: [
        "Antiparasitarios según categoría y diagnóstico: benzimidazoles, lactonas macrocíclicas, etc.",
      ],
      nota: "Respetar retiro y dosis del marbete.",
    },
  ],
  equino: [
    {
      id: "colico",
      nombre: "Cólico (urgencia)",
      señales: ["Se mira el abdomen", "Patea", "Rueda", "No come", "Sudoración"],
      que_hacer: [
        "Urgente: llamar veterinario.",
        "Retirar alimento, ofrecer agua si lo tolera, caminar suave si el veterinario lo indica.",
        "No medicar sin indicación (puede enmascarar signos).",
      ],
      opciones_tratamiento: ["Tratamiento depende de causa (impacción, gas, torsión, etc.)."],
      nota: "El cólico puede ser mortal. Prioridad máxima.",
    },
  ],
  ovino: [
    {
      id: "parasitos_internos",
      nombre: "Parásitos internos (alta frecuencia)",
      señales: ["Anemia", "Edema submandibular", "Baja condición", "Diarrea"],
      que_hacer: [
        "Consultar veterinario; en ovinos la resistencia antihelmíntica es muy frecuente.",
        "Considerar FAMACHA y coproparasitológico según zona.",
      ],
      opciones_tratamiento: [
        "Rotación estratégica de principios activos; evitar subdosificación.",
      ],
      nota: "Manejo de pasturas y carga animal es clave.",
    },
  ],
};

export function problemasPara(especie) {
  return PROBLEMAS_POR_ESPECIE[especie] || [];
}

