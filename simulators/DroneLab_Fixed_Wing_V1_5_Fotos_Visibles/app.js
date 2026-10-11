/* DroneLab Fixed Wing V1.0 · simulador didáctico tridimensional de ala fija.
 * Renderizador WebGL nativo, sin dependencias: funciona localmente incluso sin conexión.
 * Geometrías educativas; NO son modelos CAD certificados ni planos de fabricación.
 * Referencia conceptual: controlador de ala fija Matek H743-WING V3 (ArduPilot Plane).
 */
'use strict';
const $=id=>document.getElementById(id);
const STORAGE='dronelab-fixedwing-v1-progress';
// Fotografías generadas localmente: no dependen de Internet.
// Las tablas PHOTO_REF / PHOTO_LOCAL de la v1.5 se han eliminado:
// aquellas fotografias salian blancas, azuladas o mostraban la pieza
// equivocada. Su lugar lo ocupan los modelos GLB de assets/models.
function photoMarkup(item,kind='bank'){
 const safeAlt=String(item.name||'').replaceAll('"','&quot;');
 // Las fotografias de la v1.5 se han retirado: salian blancas o desincronizadas.
 // La tarjeta muestra una miniatura renderizada del MISMO GLB que usa el visor.
 const archivo=window.DroneLab3D&&window.DroneLab3D.archivoDe(item.id);
 if(archivo){
  return `<span class="photo-frame photo-${kind} model3d" title="${safeAlt}">
    <img class="photo-img" alt="Modelo 3D de Blender: ${safeAlt}" data-model-img="${item.id}"/>
    <span class="photo-tag">MODELO 3D</span>
   </span>`;
 }
 // Componentes aun no migrados a GLB: esquema vectorial legible, nunca una foto rota.
 return componentSVG(item,kind==='bank'?'card':'ref');
}
function fillModelThumbs(root){
 const D=window.DroneLab3D;if(!D)return;
 (root||document).querySelectorAll('img[data-model-img]').forEach(img=>{
  if(img.dataset.filled)return;
  const archivo=D.archivoDe(img.dataset.modelImg);if(!archivo)return;
  img.dataset.filled='1';
  D.renderThumbnail(archivo,192)
   .then(u=>{img.src=u;const f=img.closest('.photo-frame');if(f)f.classList.add('loaded')})
   .catch(e=>{img.dataset.filled='';console.warn('miniatura 3D',img.dataset.modelImg,e.message)});
 });
}
document.addEventListener('load',()=>{},true);
document.addEventListener('error',()=>{},true);

const PARTS=[
 {id:'body',name:'Fuselaje',sub:'Estructura del entrenador',stage:0,pos:[0,.99,0],icon:'✈',kind:'Estructura',spec:['Cuerpo principal','Nariz → frente','Ala alta'],desc:'Cuerpo central que sostiene ala, cola, electrónica y sistema de propulsión.'},
 {id:'spar',name:'Larguero / unión de alas',sub:'Refuerzo central',stage:1,pos:[0,1.52,.10],icon:'━',kind:'Estructura',spec:['Unión transversal','Refuerzo del ala'],desc:'Elemento resistente que une ambas semialas con el fuselaje.'},
 {id:'wingL',name:'Ala izquierda',sub:'Semiala portante',stage:1,pos:[-2.75,1.56,.05],icon:'◀',kind:'Aerodinámica',spec:['Perfil alar','Ala alta','Lado izquierdo'],desc:'Genera parte de la sustentación. Debe fijarse alineada con el larguero.'},
 {id:'wingR',name:'Ala derecha',sub:'Semiala portante',stage:1,pos:[2.75,1.56,.05],icon:'▶',kind:'Aerodinámica',spec:['Perfil alar','Ala alta','Lado derecho'],desc:'Completa la superficie sustentadora y debe conservar la simetría.'},
 {id:'gear',name:'Tren principal',sub:'Dos ruedas bajo el fuselaje',stage:2,pos:[0,.12,-.45],icon:'◉',kind:'Estructura',spec:['Dos ruedas principales','Alambre de acero','Vía 176 mm'],desc:'Soporta el peso del avión en rodaje y aterrizaje. Va por detrás del centro de gravedad.'},
 {id:'gearNose',name:'Tren de morro',sub:'Rueda delantera orientable',stage:2,pos:[0,.30,-2.55],icon:'○',kind:'Estructura',spec:['Rueda Ø37 mm','Orientable','Brazo al servo de timón'],desc:'Rueda delantera de la configuración triciclo. Su brazo se acopla al mando de dirección, de modo que el avión puede guiarse durante el rodaje.'},
 {id:'tailH',name:'Estabilizador horizontal',sub:'Conjunto de cola',stage:2,pos:[0,1.14,3.10],icon:'═',kind:'Estabilidad',spec:['Plano de cola','Paso del elevador'],desc:'Ayuda a estabilizar el cabeceo. Va alineado con el ala principal.'},
 {id:'tailV',name:'Deriva vertical',sub:'Estabilizador de dirección',stage:2,pos:[0,1.73,3.18],icon:'▲',kind:'Estabilidad',spec:['Alineación vertical','Soporte del timón'],desc:'Superficie fija que contribuye a la estabilidad direccional.'},
 {id:'ailL',name:'Alerón izquierdo',sub:'Superficie móvil',stage:3,pos:[-3.75,1.53,.77],icon:'↖',kind:'Control',spec:['Bisagras','Alabeo'],desc:'Se deflecta de manera complementaria al alerón derecho para inclinar el avión.'},
 {id:'ailR',name:'Alerón derecho',sub:'Superficie móvil',stage:3,pos:[3.75,1.53,.77],icon:'↗',kind:'Control',spec:['Bisagras','Alabeo'],desc:'Trabaja con el alerón izquierdo, normalmente moviéndose en sentido opuesto.'},
 {id:'elevator',name:'Elevador',sub:'Superficie de cabeceo',stage:3,pos:[0,1.15,3.73],icon:'⇅',kind:'Control',spec:['Bisagra horizontal','Cabeceo'],desc:'Modifica la actitud de morro arriba o abajo.'},
 {id:'rudder',name:'Timón de dirección',sub:'Superficie de guiñada',stage:3,pos:[0,1.85,3.79],icon:'⇆',kind:'Control',spec:['Bisagra vertical','Guiñada'],desc:'Controla la guiñada y puede ayudar en maniobras coordinadas.'},
 {id:'servoL',name:'Servo alerón izquierdo',sub:'Servo RC 5 V',stage:4,pos:[-3.0,1.40,.29],icon:'▣',kind:'Actuador',spec:['3 conductores','PWM','5 V Vx'],desc:'Convierte la señal PWM en el movimiento del alerón izquierdo.'},
 {id:'servoR',name:'Servo alerón derecho',sub:'Servo RC 5 V',stage:4,pos:[3.0,1.40,.29],icon:'▣',kind:'Actuador',spec:['3 conductores','PWM','5 V Vx'],desc:'Actuador dedicado al alerón derecho.'},
 {id:'servoE',name:'Servo del elevador',sub:'Servo RC 5 V',stage:4,pos:[-.27,1.07,2.83],icon:'▣',kind:'Actuador',spec:['3 conductores','PWM','5 V Vx'],desc:'Acciona el elevador mediante una varilla de empuje.'},
 {id:'servoRud',name:'Servo del timón',sub:'Servo RC 5 V',stage:4,pos:[.28,1.10,2.87],icon:'▣',kind:'Actuador',spec:['3 conductores','PWM','5 V Vx'],desc:'Acciona el timón de dirección.'},
 {id:'rodL',name:'Varilla alerón izquierdo',sub:'Pushrod + horn',stage:5,pos:[-3.55,1.44,.57],icon:'⟋',kind:'Transmisión',spec:['Varilla rígida','Sin holgura'],desc:'Transmite el movimiento del servo al alerón mediante un horn.'},
 {id:'rodR',name:'Varilla alerón derecho',sub:'Pushrod + horn',stage:5,pos:[3.55,1.44,.57],icon:'⟍',kind:'Transmisión',spec:['Varilla rígida','Sin holgura'],desc:'Une servo derecho y alerón derecho.'},
 {id:'rodE',name:'Varilla del elevador',sub:'Pushrod + horn',stage:5,pos:[-.28,1.10,3.32],icon:'╱',kind:'Transmisión',spec:['Horn','Bisagra libre'],desc:'Conecta el servo del elevador con su superficie móvil.'},
 {id:'rodRud',name:'Varilla del timón',sub:'Pushrod + horn',stage:5,pos:[.22,1.50,3.46],icon:'╲',kind:'Transmisión',spec:['Horn','Bisagra libre'],desc:'Conecta el servo del timón con la superficie vertical.'},
 {id:'motorMount',name:'Soporte del motor',sub:'Mamparo delantero',stage:6,pos:[0,.94,-3.55],icon:'⬡',kind:'Propulsión',spec:['Alineación','Tornillería'],desc:'Soporte rígido del motor. Debe respetar la incidencia prevista por el fabricante.'},
 {id:'motor',name:'Motor brushless',sub:'Un solo motor tractor',stage:6,pos:[0,.94,-3.86],icon:'◉',kind:'Propulsión',spec:['Motor trifásico','1 unidad','Hélice retirada'],desc:'Un motor impulsa el avión desde la nariz; no necesita cuatro ESC.'},
 {id:'esc',name:'ESC individual',sub:'Regulador de motor 40 A (ej.)',stage:6,pos:[.23,.83,-2.10],icon:'▤',kind:'Potencia',spec:['1 ESC','Señal PWM','LiPo compatible'],desc:'Regula la velocidad del único motor. Su alimentación proviene de la batería; su señal PWM, de la FC.'},
 {id:'fc',name:'FC de ala fija',sub:'Matek H743-WING V3',stage:7,pos:[0,1.01,.03],icon:'▦',kind:'Control de vuelo',spec:['FC + PDB','BEC 5V','Vx para servos'],desc:'Controladora de ala fija con salidas PWM y BEC separados para periféricos y servos. Diseño referencial, no pinout CAD.'},
 {id:'rx',name:'Receptor RC',sub:'Receptor serial compatible',stage:7,pos:[-.33,.87,.93],icon:'⌁',kind:'Radio',spec:['UART','5 V','Enlace RC'],desc:'Recibe las órdenes de la emisora del piloto y las comunica a la FC.'},
 {id:'gpsMast',name:'Soporte de GPS',sub:'Mástil de posicionamiento',stage:7,pos:[0,1.40,1.72],icon:'│',kind:'Navegación',spec:['Elevado','Alejado de EMI'],desc:'Aleja el receptor GNSS de cables de potencia y antenas de radio.'},
 {id:'gps',name:'GNSS M10 + brújula',sub:'GPS UART + compás I²C',stage:7,pos:[0,1.79,1.72],icon:'◎',kind:'Navegación',spec:['UART TX/RX','I²C compás','5 V'],desc:'Módulo de ejemplo con GNSS y magnetómetro externo; requiere alimentación y conexiones de datos.'},
 {id:'pitot',name:'Sensor de velocidad',sub:'Tubo Pitot + módulo I²C',stage:7,pos:[3.3,1.58,-.81],icon:'➞',kind:'Sensores',spec:['Airspeed','I²C','Opcional'],desc:'Mide presión diferencial para estimar velocidad relativa del aire. Didáctico/opcional, no requisito para un vuelo manual básico.'},
 {id:'battery',name:'Batería LiPo',sub:'3S · conector XT60 (ej.)',stage:8,pos:[0,.99,-1.20],icon:'▰',kind:'Alimentación',spec:['3S 11,1 V nominal','Desconectada'],desc:'Se fija cerca del centro de gravedad. La compatibilidad eléctrica depende del ESC, motor, FC y reguladores.'},
 {id:'camera',name:'Cámara FPV',sub:'Video analógico frontal',stage:8,pos:[0,1.42,-2.40],icon:'◉',kind:'Video',spec:['Frontal','5 V compatible'],desc:'Cámara educativa analógica que observa por la nariz del avión.'},
 {id:'vtx',name:'Transmisor de video',sub:'VTX analógico 5,8 GHz',stage:8,pos:[0,.98,1.46],icon:'▧',kind:'Video',spec:['5,8 GHz','9 V compatible'],desc:'Envía video a la estación del piloto. Alimentación según rango real del VTX instalado.'},
 {id:'antenna',name:'Antena del VTX',sub:'Antena 5,8 GHz compatible',stage:8,pos:[.24,1.74,2.17],icon:'⌁',kind:'RF',spec:['5,8 GHz','Conector correcto'],desc:'La antena se instala antes de energizar el VTX.'},
 {id:'connectors',name:'Juego de conectores',sub:'XT60, bullet 3,5 mm y JST',stage:9,pos:[2.70,-.26,-1.45],icon:'⚯',kind:'Conexiones',spec:['XT60 macho y hembra','Bullet 3,5 mm','JST de 3 vías'],desc:'Conectores de potencia, de motor y de señal. Cada familia tiene su propia corriente admisible y su forma de polarizar: no son intercambiables entre sí.'},
 {id:'prop',name:'Hélice tractora',sub:'Una sola hélice delantera',stage:13,pos:[0,.94,-4.28],icon:'✣',kind:'Propulsión',spec:['1 hélice','Sentido compatible','Instalar al final'],desc:'Se instala únicamente después de la prueba de motor sin hélice, la inspección y el control de balance.'}
];
const PILOT=[
 {id:'goggles',name:'Gafas FPV',sub:'Equipo de visión',pos:[0,4.12,-.24],icon:'▣',desc:'Las gafas permiten ver el video analógico de la cámara del avión.',spec:['5,8 GHz','En el rostro']},
 {id:'goggleAntenna',name:'Antena receptora',sub:'Antena de las gafas',pos:[.49,4.44,-.20],icon:'⌁',desc:'Antena del lado del piloto, compatible con receptor y polarización del enlace de video.',spec:['5,8 GHz','Polarización correcta']},
 {id:'radio',name:'Radio transmisora',sub:'Control orientado hacia el piloto',pos:[0,2.37,-.78],icon:'▦',desc:'La parte frontal del control queda orientada hacia el piloto; el observador ve su parte trasera.',spec:['En las manos','Protocolo RC compatible']},
 {id:'goggleBattery',name:'Batería de las gafas',sub:'Batería personal',pos:[-.73,1.55,.16],icon:'▰',desc:'Batería externa en cinturón/lateral. Aparece sobre el piloto después de colocarla.',spec:['Tensión compatible','Cable a las gafas']}
];
const STAGES=[
 {tag:'ESTRUCTURA',title:'Comienza con el fuselaje',desc:'Prepara la estructura central del avión entrenador.',instruction:'Pulsa el punto verde sobre el fuselaje. También puedes tocar su tarjeta.',req:['body'],tip:'Define desde el inicio qué extremo es la nariz y cuál es la cola.'},
 {tag:'ALAS',title:'Monta ambas semialas',desc:'Instala el larguero y después el ala izquierda y derecha.',instruction:'Coloca primero el larguero; luego las dos alas resaltadas.',req:['spar','wingL','wingR'],tip:'Comprueba encaje del larguero y simetría de las alas.'},
 {tag:'TREN Y COLA',title:'Tren de aterrizaje y estabilizadores',desc:'Instala el tren triciclo completo, la cola horizontal y la deriva.',instruction:'Monta el tren principal y el de morro, y después los dos estabilizadores.',req:['gear','gearNose','tailH','tailV'],tip:'El estabilizador horizontal debe permanecer alineado con las alas.'},
 {tag:'SUPERFICIES MÓVILES',title:'Instala alerones, elevador y timón',desc:'Cuatro superficies móviles permiten gobernar el avión.',instruction:'Coloca los dos alerones, el elevador y el timón de dirección.',req:['ailL','ailR','elevator','rudder'],tip:'Las bisagras tienen que desplazarse sin roces ni resistencia excesiva.'},
 {tag:'ACTUADORES',title:'Coloca los cuatro servos',desc:'Los servos accionan las superficies de control.',instruction:'Pulsa las ubicaciones indicadas para instalar cada servo.',req:['servoL','servoR','servoE','servoRud'],tip:'Utiliza servos con torque suficiente y alimentación compatible con la línea Vx.'},
 {tag:'TRANSMISIÓN MECÁNICA',title:'Conecta las varillas de mando',desc:'Los pushrods unen los servos y las superficies móviles.',instruction:'Instala una varilla con su horn en cada superficie.',req:['rodL','rodR','rodE','rodRud'],tip:'Evita holguras y verifica que los horns estén firmemente sujetos.'},
 {tag:'PROPULSIÓN',title:'Monta el motor y un ESC',desc:'Un ala fija convencional utiliza un motor principal y un ESC compatible.',instruction:'Instala soporte, motor y ESC. La hélice todavía NO se coloca.',req:['motorMount','motor','esc'],tip:'Las pruebas iniciales del motor se efectúan sin hélice.'},
 {tag:'CONTROL Y NAVEGACIÓN',title:'Instala la electrónica de vuelo',desc:'Controladora Matek H743-WING V3, receptor RC, GPS y sensor Pitot educativo.',instruction:'Coloca la FC, receptor, mástil, GNSS y sensor de velocidad del aire.',req:['fc','rx','gpsMast','gps','pitot'],tip:'La controladora de ala fija incluye líneas separadas de alimentación y servos; no se conecta la LiPo directamente a un servo.'},
 {tag:'ALIMENTACIÓN Y FPV',title:'Coloca batería y sistema FPV',desc:'Sujeta la LiPo y monta cámara, VTX y su antena.',instruction:'Instala cada componente en la posición destacada. La batería permanece desconectada.',req:['battery','camera','vtx','antenna'],tip:'No energices un VTX que requiere antena si todavía no la tiene conectada.'},
 {tag:'CONECTORES',title:'Prepara el juego de conectores',desc:'Antes de cablear hay que reconocer cada familia de conectores.',instruction:'Instala el juego de conectores sobre la mesa de montaje.',req:['connectors'],tip:'La forma del conector es la primera defensa contra un error de polaridad.'},
 {tag:'CONEXIONES COMPATIBLES',title:'Identifica cada conector',desc:'Cada familia de conector une dos puntos concretos del avión.',instruction:'Pulsa el punto naranja de ORIGEN y después el azul de DESTINO; o usa los botones.',type:'connectors',tip:'Si un conector entra a la fuerza o necesita un adaptador improvisado, es que no es el correcto.'},
 {tag:'CABLEADO',title:'Realiza las conexiones guiadas',desc:'Cada conexión tiene su propio origen, destino y advertencias de compatibilidad.',instruction:'Pulsa primero el punto naranja ORIGEN y después el azul DESTINO en el avión; o utiliza los botones.',type:'wiring',tip:'El cableado es un esquema de aprendizaje. El pinout físico y el voltaje de cada módulo se deben confirmar en los manuales exactos.'},
 {tag:'INSPECCIÓN',title:'Verifica la instalación eléctrica',desc:'Revisa alimentación, polaridad, señales, antena y libertad de movimiento.',instruction:'Marca todos los puntos de inspección y pulsa Validar inspección.',type:'checks',tip:'Los voltajes de las líneas de la FC, 5 V y Vx (servo) no son intercambiables.'},
 {tag:'PRUEBA SIN HÉLICE',title:'Comprueba virtualmente el motor y servos',desc:'Prueba el sentido de las superficies y la señal al ESC sin una hélice instalada.',instruction:'Ejecuta la prueba virtual: el modelo moverá las superficies de control.',type:'test',tip:'En equipo real: retira físicamente la hélice y mantén un área de trabajo segura.'},
 {tag:'CENTRO DE GRAVEDAD',title:'Equilibra el avión virtualmente',desc:'Ajusta la posición longitudinal simulada de la batería.',instruction:'Mueve la batería hasta la zona ilustrativa de equilibrio y confirma el resultado.',type:'cg',tip:'No hay una posición de CG universal: debe medirse contra el valor recomendado por el fabricante del fuselaje.'},
 {tag:'HÉLICE',title:'Instala la hélice tractora',desc:'La hélice se instala una sola vez, en la nariz, después de las comprobaciones.',instruction:'Haz clic directamente en el punto destacado del motor delantero para instalarla.',req:['prop'],tip:'Confirma sentido de giro, orientación y fijación de la hélice; nunca pruebes motores reales con personas cerca.'},
 {tag:'COMPLETADO',title:'¡Avión de ala fija ensamblado!',desc:'Has terminado el recorrido educativo del montaje.',instruction:'Gira el modelo final, visita la estación del piloto o reinicia para practicar.',type:'done',tip:'Antes de cualquier vuelo real se necesitan calibraciones, failsafe, pruebas de control, verificación estructural y cumplimiento normativo.'}
];
const WIRES=[
 {id:'battFC',title:'Batería → distribución / FC',from:'LiPo · XT60',to:'FC / PDB · VBAT y GND',a:'battery',b:'fc',kind:'potencia',voltage:'VBAT 3S nominal 11,1 V; rango compatible de la FC',note:'El H743-WING incorpora distribución y reguladores. Confirma la conexión exacta de entrada y la polaridad.',color:'#fa967d'},
 {id:'battEsc',title:'Alimentación de ESC',from:'Distribución · VBAT / GND',to:'ESC · + / −',a:'fc',b:'esc',kind:'potencia',voltage:'VBAT 3S · no 5 V de servo',note:'El ESC recibe tensión de batería por la distribución de potencia, no del BEC de 5 V.',color:'#fa967d'},
 {id:'motorPhase',title:'Tres fases del motor',from:'ESC · fases A/B/C',to:'Motor · tres conductores',a:'esc',b:'motor',kind:'motor',voltage:'Tres fases AC del ESC',note:'Un único ESC regula el motor brushless. El giro debe verificarse sin hélice.',color:'#e3bc70'},
 {id:'escPWM',title:'Señal de acelerador',from:'FC · salida PWM motor',to:'ESC · señal / tierra',a:'fc',b:'esc',kind:'PWM',voltage:'Señal PWM de control',note:'La asignación de salida del motor depende de SERVOx_FUNCTION / configuración del firmware; no assumes números fijos.',color:'#6ed4ef'},
 {id:'aL',title:'Servo del alerón izquierdo',from:'FC · PWM alerón izq. + Vx/G',to:'Servo izquierdo · señal/V+/G',a:'fc',b:'servoL',kind:'servo',voltage:'Vx 5 V configurado en este ejercicio',note:'Tres conductores: señal, positivo del BEC de servos (Vx) y tierra. No usar VBAT.',color:'#82d6f2'},
 {id:'aR',title:'Servo del alerón derecho',from:'FC · PWM alerón der. + Vx/G',to:'Servo derecho · señal/V+/G',a:'fc',b:'servoR',kind:'servo',voltage:'Vx 5 V',note:'Configura dos salidas de alerones en firmware para trabajar de forma independiente.',color:'#82d6f2'},
 {id:'elev',title:'Servo elevador',from:'FC · PWM elevador + Vx/G',to:'Servo elevador · señal/V+/G',a:'fc',b:'servoE',kind:'servo',voltage:'Vx 5 V',note:'Comprueba que la dirección física del elevador sea correcta.',color:'#82d6f2'},
 {id:'rudder',title:'Servo timón',from:'FC · PWM timón + Vx/G',to:'Servo timón · señal/V+/G',a:'fc',b:'servoRud',kind:'servo',voltage:'Vx 5 V',note:'Comprueba que el timón gire hacia el lado ordenado.',color:'#82d6f2'},
 {id:'rcUART',title:'Receptor de radio RC',from:'Receptor · 5V/G/TX/RX',to:'FC · 5V/G/RX/TX UART',a:'rx',b:'fc',kind:'serial',voltage:'5 V periféricos (según receptor)',note:'TX de un dispositivo hacia RX del otro. Configura el protocolo y UART correctos.',color:'#b7d98f'},
 {id:'gnssUART',title:'GPS GNSS por UART',from:'GNSS · VCC/G/TX/RX',to:'FC · 5V/G/RX/TX UART',a:'gps',b:'fc',kind:'GPS',voltage:'5 V si el módulo admite esta tensión',note:'TX GNSS → RX FC; RX GNSS ← TX FC. Configurar el puerto como GPS.',color:'#d5dc83'},
 {id:'compass',title:'Brújula GPS por I²C',from:'Módulo GNSS · SCL/SDA',to:'FC · I²C SCL/SDA',a:'gps',b:'fc',kind:'I²C',voltage:'I²C lógico compatible',note:'Este módulo de ejemplo incluye compás. Si usas un GNSS sin compás, omite esta conexión en montaje real.',color:'#d5dc83'},
 {id:'airspeed',title:'Sensor de aire por I²C',from:'Airspeed · I²C / alimentación',to:'FC · I²C / tensión compatible',a:'pitot',b:'fc',kind:'I²C',voltage:'Según sensor; comprobar lógica y alimentación',note:'El módulo digital del Pitot usa el bus I²C. La toma de presión debe estar orientada al flujo de aire.',color:'#b3dd92'},
 {id:'camPower',title:'Alimentación cámara FPV',from:'FC · BEC 5 V / G',to:'Cámara · 5 V / G',a:'fc',b:'camera',kind:'regulada',voltage:'5 V regulados, solo si cámara compatible',note:'Nunca aplicar VBAT a una cámara de 5 V.',color:'#b3f1b1'},
 {id:'camVideo',title:'Video de cámara a FC',from:'Cámara · VIDEO OUT',to:'FC · CAM IN',a:'camera',b:'fc',kind:'video',voltage:'Señal de video analógica',note:'Permite pasar por el OSD de una FC compatible.',color:'#dbabe9'},
 {id:'vtxVideo',title:'Señal de video hacia VTX',from:'FC · VTX OUT',to:'VTX · VIDEO IN',a:'fc',b:'vtx',kind:'video',voltage:'Señal analógica',note:'El transmisor debe ser compatible con el sistema de video elegido.',color:'#dbabe9'},
 {id:'vtxPower',title:'Alimentación VTX',from:'FC · salida BEC 9 V/G',to:'VTX · 9 V/G',a:'fc',b:'vtx',kind:'regulada',voltage:'9 V solo si admite ese rango',note:'Este ejercicio usa VTX apto para 9 V; comprueba el manual y estado del jumper antes de usar el BEC.',color:'#b3f1b1'},
 {id:'vtxRF',title:'Antena de video',from:'VTX · conector RF',to:'Antena · RF compatible',a:'vtx',b:'antenna',kind:'RF',voltage:'Enlace RF, no alimentación',note:'Conector y polarización deben coincidir. Instalar antes de energizar el VTX.',color:'#e4c18b'}
];
/* Conectores del avion. Mismo formato que el cableado: cada uno tiene su
 * origen y su destino fisicos, y se confirma eligiendo ambos extremos.
 * Aqui se trabaja la FAMILIA del conector (forma, polarizacion, corriente
 * admisible); en la etapa de cableado se trabaja el circuito. */
const CONNECTOR_PAIRS=[
 {id:'cnXT60',title:'XT60 de potencia',from:'Batería · XT60 macho',to:'ESC · XT60 hembra',
  a:'battery',b:'esc',kind:'potencia',color:'#f0c674',
  note:'El chaflán de la carcasa solo permite una orientación: impide invertir + y −.'},
 {id:'cnPhase',title:'Bullet 3,5 mm de fases',from:'Motor · 3 bullets macho',to:'ESC · 3 bullets hembra',
  a:'motor',b:'esc',kind:'motor',color:'#e3bc70',
  note:'Tres conductores idénticos y sin polaridad: si el giro sale invertido se intercambian dos.'},
 {id:'cnServo',title:'JST de 3 vías del servo',from:'Servo de alerón · JST',to:'FC · regleta PWM con línea Vx',
  a:'servoL',b:'fc',kind:'señal',color:'#9fd3df',
  note:'Masa, positivo de servo y señal. La línea Vx de la FC es la que alimenta los servos.'},
 {id:'cnGps',title:'JST de 6 vías del GNSS',from:'Módulo GPS · JST',to:'FC · UART e I²C',
  a:'gps',b:'fc',kind:'datos',color:'#a9c9a2',
  note:'Lleva alimentación, el UART del GNSS y el bus I²C del compás en un solo mazo.'}
];
const CHECKS=[
 'Batería desconectada durante todo el montaje.',
 'Polaridad de VBAT y masas comprobada; ausencia de cortocircuitos.',
 'BEC 5 V periféricos y línea Vx de servos identificados correctamente.',
 'ESC conectado al motor y su salida PWM asignada en firmware.',
 'Alerones, elevador y timón se desplazan libremente, sin holguras peligrosas.',
 'GNSS/compás y UART configurados según el módulo instalado.',
 'Antena compatible conectada al VTX antes de cualquier energización.',
 'Prueba de motor pendiente: hélice ausente físicamente.'
];
const TOTAL=PARTS.length+WIRES.length+CONNECTOR_PAIRS.length+3;
let state={items:[],pilot:[],wires:[],pairs:[],checked:false,tested:false,cg:false};
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved&&typeof saved==='object'){state={...state,...saved};}}catch{}
state.items=[...new Set((state.items||[]).filter(id=>PARTS.some(p=>p.id===id)))];
state.pilot=[...new Set((state.pilot||[]).filter(id=>PILOT.some(p=>p.id===id)))];
state.wires=[...new Set((state.wires||[]).filter(id=>WIRES.some(w=>w.id===id)))];
// Un progreso guardado por una version anterior no trae los conectores.
state.pairs=[...new Set((state.pairs||[]).filter(id=>CONNECTOR_PAIRS.some(c=>c.id===id)))];
if(state.wires.length<WIRES.length){state.checked=false;state.tested=false;state.cg=false;}
let view='plane',undoHistory=[],portSelected=false,wirePauseId=null,connPauseId=null,connSelected=false,previewMotion=0,previewUntil=0,phase=0,cgValue=50,lastActiveStage=-1;
const has=id=>state.items.includes(id),hasPilot=id=>state.pilot.includes(id);
const store=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}};
const currentStage=()=>{for(let i=0;i<STAGES.length-1;i++){const s=STAGES[i];if(s.req&&s.req.some(id=>!has(id)))return i;if(s.type==='wiring'&&(state.wires.length<WIRES.length||wirePauseId))return i;
  if(s.type==='connectors'&&(state.pairs.length<CONNECTOR_PAIRS.length||connPauseId))return i;if(s.type==='checks'&&!state.checked)return i;if(s.type==='test'&&!state.tested)return i;if(s.type==='cg'&&!state.cg)return i;}return STAGES.length-1;};
const nextPart=()=>{const s=STAGES[currentStage()];return s.req?.find(id=>!has(id))||null;};
const nextWire=()=>WIRES.find(w=>!state.wires.includes(w.id))||null;
const activeWire=()=>wirePauseId?WIRES.find(w=>w.id===wirePauseId)||null:nextWire();
const nextPair=()=>CONNECTOR_PAIRS.find(c=>!state.pairs.includes(c.id))||null;
const activePair=()=>connPauseId?CONNECTOR_PAIRS.find(c=>c.id===connPauseId)||null:nextPair();
const totalDone=()=>state.items.length+state.wires.length+state.pairs.length+Number(state.checked)+Number(state.tested)+Number(state.cg);
function toast(msg,bad=false){const el=$('toast');el.textContent=msg;el.classList.toggle('bad',bad);el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),3300);}
function addPart(id){if(view==='pilot'){if(!PILOT.some(p=>p.id===id)||hasPilot(id))return;state.pilot.push(id);undoHistory.push(['pilot',id]);store();refresh();toast(state.pilot.length===PILOT.length?'✓ Piloto equipado.':'✓ Accesorio del piloto colocado.');return;}
 const expected=nextPart();if(id!==expected){toast(`Sigue la secuencia: ahora corresponde ${PARTS.find(p=>p.id===expected)?.name||'la siguiente operación'}.`,true);return;}state.items.push(id);undoHistory.push(['part',id]);store();refresh();toast(`✓ ${PARTS.find(p=>p.id===id).name} instalado.`);}
function chooseWirePort(which){const w=nextWire();if(!w||view!=='plane'||STAGES[currentStage()].type!=='wiring')return;if(wirePauseId){toast('Pulsa Continuar para pasar a la siguiente conexión.',true);return;}if(which==='from'){portSelected=true;refreshWire();toast(`Origen seleccionado: ${w.from}. Ahora toca DESTINO.`);return;}if(!portSelected){toast('Primero selecciona el puerto ORIGEN (naranja).',true);return;}state.wires.push(w.id);undoHistory.push(['wire',w.id]);portSelected=false;wirePauseId=w.id;store();refresh();toast(`✓ Conexión ${state.wires.length}/${WIRES.length}: ${w.title}.`);}
/* Emparejado de conectores: identico al cableado. Se elige el extremo de
 * origen, despues el de destino, y se continua. Sin preguntas. */
function refreshConn(){
 const c=activePair();if(!c)return;
 const hecho=connPauseId===c.id;
 $('connCounter').textContent=`${String(hecho?state.pairs.length:state.pairs.length+1).padStart(2,'0')} / ${CONNECTOR_PAIRS.length}`;
 $('connFrom').textContent=c.from;
 $('connTo').textContent=c.to;
 $('connType').textContent=`${c.title} · ${c.kind.toUpperCase()}`;
 $('connNote').textContent=c.note;
 $('connSwatch').style.background=c.color;
 $('connFromBtn').disabled=hecho;
 $('connToBtn').disabled=hecho;
 $('connFromBtn').classList.toggle('ready',connSelected&&!hecho);
 $('connToBtn').classList.toggle('ready',connSelected&&!hecho);
 $('connContinueBtn').hidden=!hecho;
 $('connState').className='wire-state '+(hecho?'done':connSelected?'wait':'');
 $('connState').textContent=hecho
  ?'✓ Conector identificado. Pulsa Continuar para pasar al siguiente.'
  :(connSelected?'✓ Origen elegido. Ahora toca el extremo DESTINO (azul).'
                :'Haz clic primero en el conector de ORIGEN (naranja).');
}
function chooseConnPort(cual){
 const c=nextPair();
 if(!c||view!=='plane'||STAGES[currentStage()].type!=='connectors')return;
 if(connPauseId){toast('Pulsa Continuar para pasar al siguiente conector.',true);return}
 if(cual==='from'){connSelected=true;refreshConn();toast(`Origen seleccionado: ${c.from}.`);return}
 if(!connSelected){toast('Primero selecciona el extremo ORIGEN (naranja).',true);return}
 state.pairs.push(c.id);undoHistory.push(['pair',c.id]);connSelected=false;connPauseId=c.id;
 store();refresh();
 toast(`✓ Conector ${state.pairs.length}/${CONNECTOR_PAIRS.length}: ${c.title}.`);
}
function continueConnector(){
 if(!connPauseId)return;connPauseId=null;connSelected=false;refresh();
 toast(state.pairs.length<CONNECTOR_PAIRS.length?'Siguiente conector.':'Conectores identificados.');
}
function continueWire(){if(!wirePauseId)return;wirePauseId=null;portSelected=false;refresh();toast(state.wires.length<WIRES.length?'Siguiente conexión lista.':'Cableado completado.');}
function doUndo(){const type=view==='pilot'?'pilot':'plane';let i=-1;for(let k=undoHistory.length-1;k>=0;k--)if((type==='pilot')===(undoHistory[k][0]==='pilot')){i=k;break;}
 if(i>=0){const [t,id]=undoHistory.splice(i,1)[0];if(t==='part'){state.items=state.items.filter(x=>x!==id)}else if(t==='pilot'){state.pilot=state.pilot.filter(x=>x!==id)}else if(t==='wire'){state.wires=state.wires.filter(x=>x!==id);state.checked=false;state.tested=false;state.cg=false;if(wirePauseId===id)wirePauseId=null;}else if(t==='pair'){state.pairs=state.pairs.filter(x=>x!==id);if(connPauseId===id)connPauseId=null;}else if(t==='checked')state.checked=false;else if(t==='tested')state.tested=false;else if(t==='cg')state.cg=false;portSelected=false;store();refresh();toast('↶ Última acción deshecha.');return;}
 if(view==='pilot'&&state.pilot.length){state.pilot.pop();store();refresh();toast('↶ Último accesorio retirado.');return;}
 if(view==='plane'){if(state.cg){state.cg=false;}else if(state.tested){state.tested=false;}else if(state.checked){state.checked=false;}else if(state.wires.length){const removed=state.wires.pop();if(wirePauseId===removed)wirePauseId=null;}else if(state.pairs.length){const quitado=state.pairs.pop();if(connPauseId===quitado)connPauseId=null;}else if(state.items.length){const id=state.items.pop();if(id!=='prop'&&state.items.includes('prop'))state.items=state.items.filter(x=>x!=='prop');}else{toast('No hay nada que deshacer.');return}portSelected=false;store();refresh();toast('↶ Última tarea deshecha.');return;}toast('No hay nada que deshacer.');}
function reset(){const pilot=view==='pilot';if(!confirm(pilot?'¿Reiniciar solamente el equipo del piloto?':'¿Reiniciar todo el montaje del avión? El equipo del piloto permanecerá intacto.'))return;if(pilot)state.pilot=[];else{state.items=[];state.wires=[];state.pairs=[];state.checked=false;state.tested=false;state.cg=false;portSelected=false;wirePauseId=null;connPauseId=null;connSelected=false;cgValue=50;previewUntil=0;}undoHistory=[];store();refresh();toast('Montaje reiniciado.');}
function switchView(which){if(view===which)return;view=which;portSelected=false;resetCamera();refresh();toast(which==='pilot'?'Vista piloto: equipo independiente del avión.':'Vista avión: continúa el montaje del ala fija.');}

function escHtml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function plate(inner){return `<svg viewBox="0 0 132 116" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#1e4458"/><stop offset="1" stop-color="#10283a"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#00121f" flood-opacity=".45"/></filter></defs><rect width="132" height="116" rx="11" fill="url(#bg)"/><ellipse cx="66" cy="96" rx="38" ry="7" fill="#091824" opacity=".35"/>${inner}</svg>`}
function componentSVG(item,mode='ref'){const id=item.id||'';
 const wing = plate(`<g filter="url(#shadow)" transform="translate(66 58)"><path d="M-50 5 L-6 -6 L-2 3 L-40 13 Z" fill="#edf4f7"/><path d="M50 5 L6 -6 L2 3 L40 13 Z" fill="#edf4f7"/><rect x="-8" y="-8" width="16" height="18" rx="2" fill="#1c5f79"/><rect x="-45" y="1" width="36" height="3" fill="#35c3c8" opacity=".9"/><rect x="9" y="1" width="36" height="3" fill="#35c3c8" opacity=".9"/></g>`);
 const fuselage = plate(`<g filter="url(#shadow)"><path d="M66 18 C78 22 82 30 82 46 L82 73 C82 86 77 95 66 98 C55 95 50 86 50 73 L50 46 C50 30 54 22 66 18Z" fill="#e8eff3"/><path d="M63 20 H69 V95 H63Z" fill="#31c3c8" opacity=".9"/><path d="M57 37 C57 30 61 27 66 27 C71 27 75 30 75 37 V46 H57Z" fill="#315870"/><rect x="55" y="58" width="22" height="10" rx="2" fill="#3d76ba"/><rect x="59" y="58" width="6" height="10" fill="#e8c17a"/></g>`);
 const tail = plate(`<g filter="url(#shadow)"><rect x="50" y="24" width="32" height="58" rx="4" fill="#e8eff2"/><path d="M24 76 L108 76 L96 94 L36 94 Z" fill="#eef5f7"/><path d="M62 17 L83 25 L75 58 L57 58 Z" fill="#eef5f7"/><rect x="56" y="76" width="20" height="4" fill="#35c3c8"/></g>`);
 const servo = plate(`<g filter="url(#shadow)"><rect x="39" y="42" width="54" height="30" rx="6" fill="#314a5d"/><rect x="46" y="36" width="40" height="10" rx="4" fill="#d2e0e8"/><circle cx="66" cy="41" r="7" fill="#93aab7"/><path d="M66 41 L86 33" stroke="#dce6ec" stroke-width="4" stroke-linecap="round"/><path d="M42 72 C30 78 25 82 20 92" stroke="#f15d5d" stroke-width="4" fill="none"/><path d="M47 72 C34 79 31 83 26 93" stroke="#1f2428" stroke-width="4" fill="none"/><path d="M52 72 C40 79 37 83 32 93" stroke="#f3ca57" stroke-width="4" fill="none"/></g>`);
 const rod = plate(`<g filter="url(#shadow)"><line x1="24" y1="84" x2="98" y2="34" stroke="#c8d6dd" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="84" r="6" fill="#f0b26f"/><circle cx="98" cy="34" r="6" fill="#f0b26f"/><path d="M20 80 l-8 8" stroke="#9ec6d0" stroke-width="3"/><path d="M102 38 l8 -8" stroke="#9ec6d0" stroke-width="3"/></g>`);
 const motor = plate(`<g filter="url(#shadow)"><circle cx="66" cy="58" r="28" fill="#263848"/><circle cx="66" cy="58" r="18" fill="#d98532"/><circle cx="66" cy="58" r="8" fill="#e4e8eb"/><line x1="48" y1="44" x2="58" y2="54" stroke="#f17e46" stroke-width="3"/><line x1="84" y1="44" x2="74" y2="54" stroke="#f17e46" stroke-width="3"/><line x1="48" y1="72" x2="58" y2="62" stroke="#f17e46" stroke-width="3"/><line x1="84" y1="72" x2="74" y2="62" stroke="#f17e46" stroke-width="3"/><path d="M66 30 L66 18" stroke="#9db4c1" stroke-width="4" stroke-linecap="round"/></g>`);
 const escBoard = plate(`<g filter="url(#shadow)"><rect x="39" y="34" width="54" height="50" rx="6" fill="#236e63"/><rect x="48" y="42" width="36" height="10" rx="2" fill="#1a3442"/><g fill="#e8bf78"><rect x="44" y="56" width="6" height="6"/><rect x="54" y="56" width="6" height="6"/><rect x="64" y="56" width="6" height="6"/><rect x="74" y="56" width="6" height="6"/></g><path d="M39 52 C24 44 18 40 12 36" stroke="#e15c5c" stroke-width="4" fill="none"/><path d="M39 58 C22 58 16 58 9 58" stroke="#1f2428" stroke-width="4" fill="none"/><path d="M39 64 C24 72 18 76 12 80" stroke="#e9d76c" stroke-width="4" fill="none"/><path d="M93 46 C106 40 111 36 119 31" stroke="#d98532" stroke-width="4" fill="none"/><path d="M93 56 C108 56 114 56 122 56" stroke="#d98532" stroke-width="4" fill="none"/><path d="M93 66 C106 72 112 76 120 81" stroke="#d98532" stroke-width="4" fill="none"/></g>`);
 const fc = plate(`<g filter="url(#shadow)"><rect x="30" y="22" width="72" height="72" rx="8" fill="#245e79"/><rect x="47" y="39" width="38" height="26" rx="4" fill="#162f3f"/><g fill="#dfbf7a"><circle cx="42" cy="33" r="4"/><circle cx="90" cy="33" r="4"/><circle cx="42" cy="83" r="4"/><circle cx="90" cy="83" r="4"/></g><path d="M66 13 v14" stroke="#52dfe0" stroke-width="3"/><path d="M25 58 h12 M95 58 h12" stroke="#7bcfcd" stroke-width="3"/></g>`);
 const rx = plate(`<g filter="url(#shadow)"><rect x="38" y="45" width="56" height="28" rx="5" fill="#246864"/><rect x="48" y="50" width="18" height="8" rx="2" fill="#183443"/><path d="M44 45 C31 32 24 28 18 24" stroke="#d5eef3" stroke-width="3" fill="none"/><path d="M88 45 C101 32 108 28 114 24" stroke="#d5eef3" stroke-width="3" fill="none"/></g>`);
 const gps = plate(`<g filter="url(#shadow)"><circle cx="66" cy="58" r="28" fill="#243646"/><circle cx="66" cy="58" r="18" fill="#e6f0f3"/><path d="M66 31 V22 M66 94 V85 M39 58 H30 M102 58 H93" stroke="#74dfe6" stroke-width="3"/><path d="M66 58 L78 46" stroke="#f0b26f" stroke-width="3"/><circle cx="66" cy="58" r="4" fill="#f0b26f"/></g>`);
 const battery = plate(`<g filter="url(#shadow)"><rect x="28" y="40" width="64" height="32" rx="6" fill="#356fb3"/><rect x="33" y="45" width="54" height="8" rx="2" fill="#69ade6"/><rect x="53" y="38" width="10" height="36" fill="#d8c06c"/><path d="M92 50 C104 50 107 50 114 52" stroke="#ee6b6b" stroke-width="4" fill="none"/><path d="M92 57 C106 57 110 58 118 61" stroke="#1e2327" stroke-width="4" fill="none"/><rect x="115" y="48" width="8" height="16" rx="1" fill="#e7b95a"/></g>`);
 const camera = plate(`<g filter="url(#shadow)"><rect x="37" y="41" width="42" height="32" rx="6" fill="#2d4050"/><circle cx="83" cy="57" r="17" fill="#1a2a39"/><circle cx="83" cy="57" r="9" fill="#58b3cf"/><path d="M36 57 C26 57 21 57 13 58" stroke="#f1c55f" stroke-width="4" fill="none"/><path d="M36 63 C24 66 18 69 12 73" stroke="#f15d5d" stroke-width="4" fill="none"/></g>`);
 const antenna = plate(`<g filter="url(#shadow)"><path d="M36 79 C54 62 77 40 96 28" stroke="#1a2833" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M95 28 L108 18" stroke="#1a2833" stroke-width="7" stroke-linecap="round"/><ellipse cx="35" cy="79" rx="8" ry="7" fill="#d4b670"/><circle cx="99" cy="26" r="8" fill="#2b3946"/></g>`);
 const prop = plate(`<g filter="url(#shadow)"><path d="M66 58 C44 41 27 41 17 50 C25 56 42 60 61 60 Z" fill="#1d2730"/><path d="M66 58 C88 41 105 41 115 50 C107 56 90 60 71 60 Z" fill="#1d2730"/><circle cx="66" cy="58" r="7" fill="#748995"/></g>`);
 const radio = plate(`<g filter="url(#shadow)"><rect x="30" y="36" width="72" height="52" rx="10" fill="#203746"/><circle cx="50" cy="57" r="11" fill="#152532"/><circle cx="82" cy="57" r="11" fill="#152532"/><circle cx="50" cy="57" r="5" fill="#4db7d7"/><circle cx="82" cy="57" r="5" fill="#4db7d7"/><path d="M43 36 L39 17 M89 36 L93 17" stroke="#a7bfcb" stroke-width="3" stroke-linecap="round"/></g>`);
 const goggles = plate(`<g filter="url(#shadow)"><rect x="34" y="47" width="64" height="22" rx="10" fill="#1f3544"/><rect x="39" y="49" width="22" height="18" rx="5" fill="#58b3cf"/><rect x="71" y="49" width="22" height="18" rx="5" fill="#58b3cf"/><path d="M34 58 H20 M98 58 H112" stroke="#677f8c" stroke-width="4" stroke-linecap="round"/></g>`);
 const support = plate(`<g filter="url(#shadow)"><rect x="62" y="26" width="8" height="48" rx="4" fill="#92a8b7"/><rect x="47" y="69" width="38" height="10" rx="4" fill="#4f6778"/><path d="M66 26 L52 36 M66 26 L80 36" stroke="#92a8b7" stroke-width="4" stroke-linecap="round"/></g>`);
 const cable = (wire)=>plate(`<g filter="url(#shadow)"><rect x="10" y="18" width="42" height="20" rx="6" fill="#123349"/><rect x="80" y="18" width="42" height="20" rx="6" fill="#123349"/><text x="31" y="31" text-anchor="middle" class="wire-legend">ORIGEN</text><text x="101" y="31" text-anchor="middle" class="wire-legend">DESTINO</text><path d="M30 60 C48 44 57 44 66 58 C76 73 86 74 102 58" stroke="${wire.color}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30 65 C49 52 57 52 66 64 C74 74 86 77 102 65" stroke="#1f2326" stroke-width="6" fill="none" stroke-linecap="round"/><text x="66" y="89" text-anchor="middle" font-size="11" font-weight="700" fill="#d7edf7">${escHtml(wire.title)}</text><text x="66" y="102" text-anchor="middle" font-size="8" fill="#98b9c8">${escHtml(wire.from)} → ${escHtml(wire.to)}</text></g>`);
 if(item.__wire) return cable(item.__wire);
 if(id==='body') return fuselage; if(['spar','wingL','wingR'].includes(id)) return wing; if(['gear','tailH','tailV'].includes(id)) return tail; if(id.startsWith('servo')) return servo; if(id.startsWith('rod')) return rod; if(id==='motorMount'||id==='gpsMast') return support; if(id==='motor') return motor; if(id==='esc') return escBoard; if(id==='fc') return fc; if(id==='rx'||id==='vtx') return rx; if(id==='gps'||id==='pitot') return gps; if(id==='battery'||id==='goggleBattery') return battery; if(id==='camera') return camera; if(id==='antenna'||id==='goggleAntenna') return antenna; if(id==='prop') return prop; if(id==='radio') return radio; if(id==='goggles') return goggles; return wing;}
let partViewer=null,partViewerCanvas=null,partViewerId=null;
function setReferenceGraphic(ref,isCable=false){
 const art=$('refArt'),D=window.DroneLab3D;
 document.querySelector('.reference-head').classList.toggle('cable',!!isCable);
 $('refPhotoSource').hidden=true;

 // Componente con modelo GLB: visor giratorio real, no una imagen fija.
 const archivoRef=!isCable&&ref&&D&&D.archivoDe(ref.id);
 if(archivoRef){
  // Un solo renderer para toda la sesion: crear uno por componente agota
  // el limite de contextos WebGL del navegador y la escena deja de pintarse.
  if(!partViewer){
   partViewerCanvas=document.createElement('canvas');
   partViewerCanvas.className='part-viewer';
   partViewer=new D.PartViewer(partViewerCanvas);
  }
  if(partViewerId!==ref.id){
   art.classList.add('ref-art-3d');
   art.innerHTML='<span class="viewer-hint">ARRASTRA PARA GIRAR</span>';
   art.insertBefore(partViewerCanvas,art.firstChild);
   partViewer.show(archivoRef)
     .catch(e=>{console.warn('visor 3D',ref.id,e.message);
                art.classList.remove('ref-art-3d');
                art.innerHTML=componentSVG(ref,'ref')});
   partViewerId=ref.id;
  }else if(partViewerCanvas.parentNode!==art){
   art.insertBefore(partViewerCanvas,art.firstChild);
  }
  return;
 }
 if(partViewer){partViewer.stop();partViewerId=null;
                if(partViewerCanvas&&partViewerCanvas.parentNode)
                 partViewerCanvas.parentNode.removeChild(partViewerCanvas)}
 art.classList.remove('ref-art-3d');
 art.innerHTML=isCable?componentSVG({__wire:ref.__wire,id:'wire'},'ref'):photoMarkup(ref,'guide');
 fillModelThumbs(art);
}

function refresh(){const pilot=view==='pilot',stage=currentStage(),s=STAGES[stage],pNext=pilot?PILOT.find(p=>!hasPilot(p.id)):PARTS.find(p=>p.id===nextPart());const count=pilot?state.pilot.length:state.items.length;const all=pilot?PILOT:PARTS;const done=pilot?state.pilot.length:totalDone();const max=pilot?PILOT.length:TOTAL;
 $('planeViewBtn').classList.toggle('active',!pilot);$('pilotViewBtn').classList.toggle('active',pilot);$('noseLabel').hidden=pilot;$('axisLabel').hidden=pilot;
 $('overallLabel').textContent=`${totalDone()} / ${TOTAL} tareas del avión`;$('overallFill').style.width=totalDone()/TOTAL*100+'%';$('overallPercent').textContent=Math.round(totalDone()/TOTAL*100)+'%';
 $('benchCount').textContent=`${count} / ${all.length}`;$('partTypes').textContent=`${all.length} PIEZAS`; $('bankHint').textContent=pNext?`SIGUIENTE: ${pNext.name.toUpperCase()}`:'MONTAJE LISTO';
 $('stageTag').textContent=pilot?'ESTACIÓN DE CONTROL':`ETAPA ${String(stage+1).padStart(2,'0')} · ${s.tag}`;$('stepIndex').textContent=pilot?`${state.pilot.length} / ${PILOT.length}`: `${String(Math.min(stage+1,STAGES.length)).padStart(2,'0')} / ${STAGES.length}`;
 $('stepTitle').textContent=pilot?(state.pilot.length===PILOT.length?'¡Piloto equipado!':'Equipa al piloto'):s.title;
 $('stepDescription').textContent=pilot?'La radio, las gafas, la antena receptora y su batería se instalan sobre el piloto en 3D y no cuentan como piezas del avión.':s.desc;
 $('instructionNo').textContent=pilot?String(Math.min(state.pilot.length+1,PILOT.length)).padStart(2,'0'):String(Math.min(stage+1,STAGES.length)).padStart(2,'0');$('stepInstruction').textContent=pilot?(pNext?`Haz clic en el punto sobre el piloto para colocar ${pNext.name.toLowerCase()} o pulsa su tarjeta.`:'Todos los accesorios del piloto están colocados.'):s.instruction;
 $('stageTip').textContent=pilot?'La antena de las gafas es independiente de la antena transmisora del avión. La batería es personal, no la LiPo del motor.':s.tip;
 let ref=pNext||(pilot?PILOT.at(-1):PARTS.find(p=>p.id===s.req?.at(-1)))||PARTS[0];
 if(!pilot&&!pNext){
  if(s.type==='wiring'){const w=activeWire();ref={id:'wire',__wire:w,name:w?.title||'Arnés de cableado',desc:w?`${w.from} → ${w.to}. ${w.note}`:'Revisión de arneses',spec:w?[w.kind,w.voltage]:[],kind:'CABLEADO'};}
  else if(s.type==='connectors'){const c=activePair();const base=PARTS.find(p=>p.id==='connectors');ref={id:'connectors',name:c?c.title:'Juego de conectores',desc:c?`${c.from} → ${c.to}. ${c.note}`:(base&&base.desc)||'',spec:c?[c.kind,'Familia propia','No intercambiable']:[],kind:'CONECTORES'};}
  else if(s.type==='checks')ref={icon:'✓',name:'Inspección eléctrica',desc:'Revisa el circuito y las superficies de control antes de realizar pruebas.',spec:['Polaridad','BEC / Vx','Sin hélice'],kind:'SEGURIDAD'};
  else if(s.type==='test')ref={icon:'◉',name:'Comprobación virtual de mandos',desc:'Animación de motor sin hélice y de los cuatro controles aerodinámicos.',spec:['Motor sin hélice','Alerones','Elevador / timón'],kind:'VERIFICACIÓN'};
  else if(s.type==='cg')ref={icon:'⚖',name:'Centro de gravedad del avión',desc:'Desplaza la LiPo para estudiar cómo cambia el balance longitudinal.',spec:['Balance virtual','Batería','CG del fabricante'],kind:'BALANCE'};
  else if(s.type==='done')ref={icon:'✈',name:'Avión de ala fija completo',desc:'34 componentes, 4 conectores identificados, 17 arneses educativos y tres verificaciones. El modelo es ilustrativo, no un CAD exacto.',spec:['Ala alta','Un motor','GPS y FPV'],kind:'COMPLETADO'};
 }
 setReferenceGraphic(ref,!pilot&&s.type==='wiring');$('refTitle').textContent=ref.name;$('refDesc').textContent=ref.desc||ref.sub;$('refSpecs').innerHTML=(ref.spec||[]).map(x=>`<span>${x}</span>`).join('');$('refBadge').textContent=ref.kind||'EQUIPO';
 $('sceneStatus').textContent=pilot?`${state.pilot.length} de ${PILOT.length} accesorios equipados.`:stage===14?'Avión completo. Revisar con documentación técnica antes de montar uno real.':stage===9?(wirePauseId?`Cableado: ${state.wires.length}/${WIRES.length} conexiones. Pulsa Continuar.`:`Cableado: ${state.wires.length}/${WIRES.length} arneses conectados.`):pNext?`Siguiente componente: ${pNext.name}.`:'Sigue las indicaciones de la guía de montaje.';
 $('connUI').hidden=pilot||s.type!=='connectors';if(!$('connUI').hidden)refreshConn();
 $('wiringUI').hidden=pilot||s.type!=='wiring';$('checksUI').hidden=pilot||s.type!=='checks';$('testUI').hidden=pilot||s.type!=='test';$('cgUI').hidden=pilot||s.type!=='cg';
 const prog=pilot?done/max:s.req?s.req.filter(has).length/s.req.length:s.type==='wiring'?state.wires.length/WIRES.length:s.type==='checks'?Number(state.checked):s.type==='test'?Number(state.tested):s.type==='cg'?Number(state.cg):1;
 $('stageProgress').textContent=pilot?`${done} / ${max}`:s.req?`${s.req.filter(has).length} / ${s.req.length}`:s.type==='wiring'?`${state.wires.length} / ${WIRES.length}`:`${Math.round(prog)} / 1`;
 $('stageFill').style.width=(pilot?done/max:prog)*100+'%';$('nextNote').textContent=pilot?'Equipo del piloto independiente del avión.':stage===14?'✓ Recorrido del avión completado':s.type==='wiring'?(wirePauseId?'Conexión realizada. Continúa cuando quieras.':'Conecta primero origen y después destino.'):'La siguiente etapa se desbloquea automáticamente.';
 renderStages();renderBank();refreshWire();refreshHud();drawScene();}
function renderStages(){const stage=currentStage();$('stagesRow').innerHTML=STAGES.map((s,i)=>`<span class="phase-item ${i<stage?'done':i===stage?'current':''}" title="${i+1} · ${s.tag}"></span>`).join('');}
function renderBank(){const all=view==='pilot'?PILOT:PARTS,act=view==='pilot'?PILOT.find(p=>!hasPilot(p.id))?.id:nextPart(),el=$('bankItems');let existingScroll=$('bankWindow').scrollLeft;el.innerHTML=all.map((p,i)=>{const done=view==='pilot'?hasPilot(p.id):has(p.id),selected=p.id===act;return `<button class="part-card ${done?'done':selected?'active':'locked'}" data-id="${p.id}" ${done?'disabled':''} aria-label="${p.name}${selected?' componente actual':''}"><span class="part-num">${done?'✓':`${i+1}/${all.length}`}</span><span class="part-icon"><span>${photoMarkup(p,'bank')}</span></span><b>${p.name}</b><small>${p.sub}</small></button>`}).join('');
 const active=el.querySelector('.part-card.active');if(active&&lastActiveStage!==`${view}:${act}`){lastActiveStage=`${view}:${act}`;requestAnimationFrame(()=>{const box=$('bankWindow');box.scrollTo({left:Math.max(0,active.offsetLeft-el.offsetLeft-12),behavior:'smooth'});syncBank()})}else{$('bankWindow').scrollLeft=existingScroll;syncBank();}fillModelThumbs(el);}
function syncBank(){let el=$('bankWindow');let max=Math.max(0,el.scrollWidth-el.clientWidth);$('bankScroll').max=Math.max(1,max);$('bankScroll').value=Math.min(max,el.scrollLeft);$('bankPrev').disabled=el.scrollLeft<3;$('bankNext').disabled=el.scrollLeft>=max-3;}
function refreshWire(){const w=activeWire();if(!w)return;const completed=wirePauseId===w.id;$('wireCounter').textContent=`${String(completed?state.wires.length:state.wires.length+1).padStart(2,'0')} / ${WIRES.length}`;$('wireFrom').textContent=w.from;$('wireTo').textContent=w.to;$('wireType').textContent=`${w.title} · ${w.kind.toUpperCase()}`;$('wireNote').textContent=w.note+' | '+w.voltage;$('wireColor').style.background=w.color;$('fromBtn').disabled=completed;$('toBtn').disabled=completed;$('fromBtn').classList.toggle('ready',portSelected&&!completed);$('toBtn').classList.toggle('ready',portSelected&&!completed);$('wireContinueBtn').hidden=!completed;$('wireState').className='wire-state '+(completed?'done':portSelected?'wait':'');$('wireState').textContent=completed?'✓ Conexión realizada. Pulsa Continuar para avanzar a la siguiente conexión.':(portSelected?'✓ Origen elegido. Ahora toca el punto DESTINO (azul).':'Primero selecciona el puerto ORIGEN (naranja).');}
function refreshHud(){const hud=$('sceneHud');hud.innerHTML='';let buttons=[];if(view==='plane'){let st=STAGES[currentStage()];if(st.req){const p=PARTS.find(x=>x.id===nextPart());if(p)buttons.push({kind:'part',id:p.id,label:p.name,pos:p.pos});}else if(st.type==='wiring'&&!wirePauseId){const w=nextWire();if(w){const a=PARTS.find(p=>p.id===w.a),b=PARTS.find(p=>p.id===w.b);buttons.push({kind:'from',id:w.id,label:'① ORIGEN',pos:a.pos});buttons.push({kind:'to',id:w.id,label:'② DESTINO',pos:b.pos});}}
  else if(st.type==='connectors'&&!connPauseId){const c=nextPair();if(c){const a=PARTS.find(p=>p.id===c.a),b=PARTS.find(p=>p.id===c.b);if(a&&b){buttons.push({kind:'cfrom',id:c.id,label:'① ORIGEN',pos:a.pos});buttons.push({kind:'cto',id:c.id,label:'② DESTINO',pos:b.pos});}}}}else{const p=PILOT.find(p=>!hasPilot(p.id));if(p)buttons.push({kind:'pilot',id:p.id,label:p.name,pos:p.pos});}
 const rect=$('sceneWrap').getBoundingClientRect();for(const b of buttons){const q=project(b.pos);if(!q||q.z<0||q.x<0||q.x>rect.width||q.y<0||q.y>rect.height)continue;const btn=document.createElement('button');btn.className='hotspot '+((b.kind==='from'||b.kind==='cfrom')?'wireA':(b.kind==='to'||b.kind==='cto')?'wireB':'');btn.type='button';btn.dataset.label=b.label;btn.setAttribute('aria-label',`Colocar o conectar: ${b.label}`);btn.style.left=q.x+'px';btn.style.top=q.y+'px';btn.textContent=(b.kind==='from'||b.kind==='cfrom')?'①':(b.kind==='to'||b.kind==='cto')?'②':'+';btn.addEventListener('click',()=>{if(b.kind==='part'||b.kind==='pilot')addPart(b.id);else if(b.kind==='cfrom')chooseConnPort('from');else if(b.kind==='cto')chooseConnPort('to');else chooseWirePort(b.kind)});hud.appendChild(btn);}}
function setCheckUI(){const c=$('checksList');c.innerHTML=CHECKS.map((v,i)=>`<label><input type="checkbox" data-check="${i}"><span>${v}</span></label>`).join('');}
function confirmChecks(){const boxes=[...$('checksList').querySelectorAll('input[type=checkbox]')];if(boxes.some(b=>!b.checked)){toast('Completa todas las verificaciones antes de continuar.',true);return}if(has('prop')){toast('Las pruebas previas deben realizarse sin hélice.',true);return;}state.checked=true;undoHistory.push(['checked','']);store();refresh();toast('✓ Inspección virtual completada.');}
function runTest(){if(has('prop')){toast('Retira la hélice antes de probar el motor.',true);return;}previewUntil=performance.now()+3300;previewMotion=1;state.tested=true;undoHistory.push(['tested','']);store();refresh();toast('✓ Prueba virtual de motor y mandos completada (sin hélice).');}
function updateCG(){cgValue=Number($('cgSlider').value);const offset=(cgValue-50)/50;const ok=Math.abs(offset)<=.24;$('cgReadout').textContent=ok?'● ZONA ILUSTRATIVA DE BALANCE · TENDENCIA ESTABLE':offset<0?'◀ BATERÍA MUY ADELANTADA · TENDENCIA MORRO PESADO':'▶ BATERÍA MUY ATRÁS · TENDENCIA COLA PESADA';$('cgReadout').style.color=ok?'#a6f1bd':'#ffce9d';drawScene();}
function confirmCG(){if(Math.abs((cgValue-50)/50)>.24){toast('Desplaza la batería hacia la zona central ilustrativa de equilibrio.',true);return}state.cg=true;undoHistory.push(['cg','']);store();refresh();toast('✓ Centro de gravedad virtual revisado.');}
$('bankItems').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)addPart(b.dataset.id)});
$('connFromBtn').addEventListener('click',()=>chooseConnPort('from'));
$('connToBtn').addEventListener('click',()=>chooseConnPort('to'));
$('connContinueBtn').addEventListener('click',continueConnector);
$('bankWindow').addEventListener('scroll',syncBank,{passive:true});$('bankScroll').addEventListener('input',e=>{$('bankWindow').scrollLeft=Number(e.target.value)});for(const [id,dir] of [['bankPrev',-1],['bankNext',1]])$(id).addEventListener('click',()=>{$('bankWindow').scrollBy({left:dir*276,behavior:'smooth'})});
$('planeViewBtn').onclick=()=>switchView('plane');$('pilotViewBtn').onclick=()=>switchView('pilot');$('undoBtn').onclick=doUndo;$('resetBtn').onclick=reset;if($('resetTopBtn'))$('resetTopBtn').onclick=reset;if($('resetSideBtn'))$('resetSideBtn').onclick=reset;$('homeViewBtn').onclick=resetCamera;
$('fromBtn').onclick=()=>chooseWirePort('from');$('toBtn').onclick=()=>chooseWirePort('to');$('wireContinueBtn').onclick=continueWire;$('checkBtn').onclick=confirmChecks;$('testBtn').onclick=runTest;$('cgSlider').addEventListener('input',updateCG);$('cgBtn').onclick=confirmCG;
$('helpBtn').onclick=()=>{$('helpModal').hidden=false};$('closeHelp').onclick=$('closeHelpBtn').onclick=()=>{$('helpModal').hidden=true};$('helpModal').addEventListener('click',e=>{if(e.target===$('helpModal'))$('helpModal').hidden=true});
$('sceneWrap').addEventListener('contextmenu',e=>e.preventDefault());document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{setCamera(b.dataset.camera)});
/* ========= Renderizador 3D WebGL local ========= */
const canvas=$('scene'),wrap=$('sceneWrap');
let gl=null,glProg=null,bufPosition=null,bufNormal=null,bufColor=null,ctx2d=null,renderMode="webgl";
let P=[],N=[],COL=[],LINES=[],lastPV=null,camera={az:-2.58,el:.43,dist:13.8,target:[0,1.04,0]},rotationBusy=false;
const RGB={foam:'#e6edf0',foamShadow:'#a9c3ca',foamTop:'#f5f8f5',foamTrim:'#39bdc6',trim:'#f1a758',dark:'#162b39',motor:'#5c6974',carbon:'#34495a',metal:'#899faf',circuit:'#256f63',nav:'#e9bd75',battery:'#4379ba',skin:'#ca9670',fabric:'#244457'};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rgb=h=>{h=String(h||'#ffffff').replace('#','');if(h.length===3)h=h.split('').map(s=>s+s).join('');let n=parseInt(h,16)||0;return [(n>>16)/255,(n>>8&255)/255,(n&255)/255]};
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),scale=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>scale(a,1/(Math.hypot(...a)||1));
function tri(a,b,c,color){const cc=rgb(color),n=norm(cross(sub(b,a),sub(c,a)));for(let q of [a,b,c]){P.push(...q);N.push(...n);COL.push(...cc)}}
function quad(a,b,c,d,color){tri(a,b,c,color);tri(a,c,d,color)}
function box(x,y,z,sx,sy,sz,color){let X=sx/2,Y=sy/2,Z=sz/2;let v=[[x-X,y-Y,z-Z],[x+X,y-Y,z-Z],[x+X,y+Y,z-Z],[x-X,y+Y,z-Z],[x-X,y-Y,z+Z],[x+X,y-Y,z+Z],[x+X,y+Y,z+Z],[x-X,y+Y,z+Z]];[[0,1,2,3],[1,5,6,2],[5,4,7,6],[4,0,3,7],[3,2,6,7],[4,5,1,0]].forEach(a=>quad(...a.map(i=>v[i]),color));}
function polygonFlat(points,y,color,depth=.09){let t=points.map(q=>[q[0],y+depth/2,q[1]]),b=points.map(q=>[q[0],y-depth/2,q[1]]);for(let i=1;i<t.length-1;i++){tri(t[0],t[i],t[i+1],color);tri(b[0],b[i+1],b[i],shade(color,.70))}for(let i=0;i<t.length;i++){let k=(i+1)%t.length;quad(t[i],b[i],b[k],t[k],shade(color,.72))}}
function polygonVertical(points,x,color,depth=.065){let a=points.map(q=>[x-depth/2,q[0],q[1]]),b=points.map(q=>[x+depth/2,q[0],q[1]]);for(let i=1;i<points.length-1;i++){tri(a[0],a[i],a[i+1],color);tri(b[0],b[i+1],b[i],shade(color,.87))}for(let i=0;i<a.length;i++){let k=(i+1)%a.length;quad(a[i],b[i],b[k],a[k],shade(color,.76))}}
function shade(h,f){const ar=rgb(h);return '#'+ar.map(c=>Math.round(clamp(c*f,0,1)*255).toString(16).padStart(2,'0')).join('')}
function cylinderY(x,y,z,r,ht,col,steps=12){let a=[],b=[];for(let i=0;i<steps;i++){let t=2*Math.PI*i/steps;a.push([x+Math.cos(t)*r,y-ht/2,z+Math.sin(t)*r]);b.push([x+Math.cos(t)*r,y+ht/2,z+Math.sin(t)*r]);}for(let i=0;i<steps;i++){let j=(i+1)%steps;quad(a[i],a[j],b[j],b[i],shade(col,.88));tri([x,y+ht/2,z],b[j],b[i],col);tri([x,y-ht/2,z],a[i],a[j],shade(col,.62));}}
function cylinderZ(x,y,z,r,ht,col,steps=16){let a=[],b=[];for(let i=0;i<steps;i++){let t=2*Math.PI*i/steps;a.push([x+Math.cos(t)*r,y+Math.sin(t)*r,z-ht/2]);b.push([x+Math.cos(t)*r,y+Math.sin(t)*r,z+ht/2]);}for(let i=0;i<steps;i++){let j=(i+1)%steps;quad(a[i],a[j],b[j],b[i],shade(col,.87));tri([x,y,z-ht/2],a[i],a[j],col);tri([x,y,z+ht/2],b[j],b[i],shade(col,.65));}}
function ellipsoid(x,y,z,rx,ry,rz,col,steps=14,rings=8){for(let r=0;r<rings;r++){let u1=-Math.PI/2+Math.PI*r/rings,u2=-Math.PI/2+Math.PI*(r+1)/rings;for(let i=0;i<steps;i++){let v1=2*Math.PI*i/steps,v2=2*Math.PI*(i+1)/steps;let pt=(u,v)=>[x+rx*Math.cos(u)*Math.cos(v),y+ry*Math.sin(u),z+rz*Math.cos(u)*Math.sin(v)];quad(pt(u1,v1),pt(u1,v2),pt(u2,v2),pt(u2,v1),col)}}}
function tube(a,b,r,col,n=7){let d=norm(sub(b,a)),tmp=Math.abs(dot(d,[0,1,0]))>.9?[1,0,0]:[0,1,0],u=norm(cross(d,tmp)),v=norm(cross(d,u));let ring=(p,k)=>add(add(p,scale(u,Math.cos(k)*r)),scale(v,Math.sin(k)*r));for(let i=0;i<n;i++){const k=i*2*Math.PI/n,l=(i+1)*2*Math.PI/n;quad(ring(a,k),ring(a,l),ring(b,l),ring(b,k),col)}}
function path(points,r,col){for(let i=1;i<points.length;i++)tube(points[i-1],points[i],r,col)}
function buildFuselage(ghost=false){const rings=[[-3.72,.22,.20,.96],[-3.37,.41,.38,.93],[-2.5,.53,.48,.94],[-1.3,.56,.51,1],[-.1,.58,.48,1.02],[1,.47,.43,1.00],[2.15,.33,.34,1.07],[3.18,.22,.24,1.16],[3.90,.16,.18,1.18],[4.25,.09,.13,1.17]],N=16,color=ghost?'#31485a':'#e7eef0';for(let i=0;i<rings.length-1;i++){let [z,r,h,c]=rings[i],[z2,r2,h2,c2]=rings[i+1];for(let j=0;j<N;j++){let a=2*Math.PI*j/N,b=2*Math.PI*(j+1)/N;let pt=(zz,rr,hh,cy,t)=>[rr*Math.cos(t),cy+hh*Math.sin(t),zz];quad(pt(z,r,h,c,a),pt(z,r,h,c,b),pt(z2,r2,h2,c2,b),pt(z2,r2,h2,c2,a),j%6===0?shade(color,.90):color)}}
 if(ghost)return;
 // top canopy and longitudinal accent stripe (trainer style)
 ellipsoid(0,1.42,-1.65,.39,.18,.87,'#24576a',16,7);
 ellipsoid(0,1.55,-1.58,.23,.045,.61,'#5fa5ad',12,5);
 path([[0,1.43,-2.65],[0,1.48,-2.25],[0,1.43,-.75],[0,1.38,1.85]],.045,'#39bfc6');
 for(let z of [-2.8,-1.6,0,1.4,2.65]){box(0,1.35,z,.13,.016,.13,'#91a9b5');}
}
function makeWing(side){const s=side==='left'?-1:1,outline=[[s*.42,-.70],[s*5.50,-.30],[s*5.60,.42],[s*.44,1.16]];polygonFlat(outline,1.57,'#e8f1f1',.13);
 polygonFlat([[s*.54,-.57],[s*5.28,-.21],[s*5.33,-.04],[s*.54,-.29]],1.644,'#399bb0',.012);
 polygonFlat([[s*1.28,-.29],[s*4.66,-.09],[s*4.73,.08],[s*1.28,-.12]],1.655,'#ffc17c',.012);
 for(let x of [1.1,2.3,3.7,5.15]){const xx=s*x;box(xx,1.65,-.27,.15,.018,.09,'#e1e8e4')}
}
function makeGear(){for(let sign of [-1,1]){path([[sign*.50,.71,-.42],[sign*1.38,.13,-.50]],.055,'#a9bac3');ellipsoid(sign*1.42,.08,-.50,.16,.29,.29,'#1b2b38',12,7);ellipsoid(sign*1.55,.08,-.50,.04,.115,.115,'#8a9eaf',12,6)}path([[0,.65,-2.76],[0,.07,-2.92]],.048,'#9baebc');ellipsoid(0,.06,-2.94,.23,.22,.14,'#1e3040',12,6);}
function makeTailH(){polygonFlat([[-2.12,2.85],[-.18,2.68],[.18,2.68],[2.12,2.85],[1.95,3.66],[-1.95,3.66]],1.26,'#edf3f0',.095);polygonFlat([[-1.78,2.89],[1.78,2.89],[1.77,3.06],[-1.77,3.06]],1.318,'#4ab9bc',.012)}
function makeTailV(){polygonVertical([[1.14,2.87],[2.50,3.12],[2.65,3.53],[1.34,3.90]],0,'#ebf2f0',.12);polygonVertical([[1.85,3.20],[2.42,3.24],[2.45,3.44],[1.85,3.50]],0,'#4cb3bf',.13)}
function makeSurface(id){const t=previewUntil>performance.now()?Math.sin(performance.now()*.006):0,d=t*.11;switch(id){case'ailL':polygonFlat([[-2.65,.79],[-5.25,.46],[-5.32,.77],[-2.65,1.15]],1.58+d,'#c0dce1',.065);break;case'ailR':polygonFlat([[2.65,.79],[5.25,.46],[5.32,.77],[2.65,1.15]],1.58-d,'#c0dce1',.065);break;case'elevator':polygonFlat([[-1.85,3.56],[1.85,3.56],[1.95,3.90],[-1.95,3.90]],1.26+d,'#c7dce3',.065);break;case'rudder':polygonVertical([[1.4,3.75],[2.55,3.48],[2.62,3.82],[1.40,4.1]],d*.7,'#bddde1',.06);break;}}
function makeServo(id){const p=PARTS.find(x=>x.id===id).pos;box(...p,.45,.22,.31,'#394e62');box(p[0],p[1]+.14,p[2],.28,.055,.16,'#b9c8c9');cylinderY(p[0],p[1]+.20,p[2],.095,.07,'#667d8e',10);path([[p[0],p[1]+.24,p[2]],[p[0]+(p[0]<0?-.24:.24),p[1]+.25,p[2]+.09]],.027,'#d5dce0')}
function makeRod(id){let coords={rodL:[[-3.05,1.64,.36],[-3.55,1.55,.65],[-3.79,1.57,.76]],rodR:[[3.05,1.64,.36],[3.55,1.55,.65],[3.79,1.57,.76]],rodE:[[-.27,1.24,2.83],[-.31,1.27,3.32],[-.29,1.30,3.73]],rodRud:[[.28,1.21,2.87],[.29,1.48,3.45],[.18,1.78,3.80]]};path(coords[id],.018,'#c6d3d7')}
function makeMotorMount(){box(0,.96,-3.56,.68,.74,.14,'#566477');for(let x of [-.22,.22])for(let y of [.74,1.18])cylinderZ(x,y,-3.62,.041,.10,'#b2cbd3',8)}
function makeMotor(){cylinderZ(0,.96,-3.93,.32,.52,'#425667',16);cylinderZ(0,.96,-4.22,.20,.10,'#c5a06d',16);for(let a=0;a<8;a++){let t=2*Math.PI*a/8;box(Math.cos(t)*.22,.96+Math.sin(t)*.22,-3.91,.085,.085,.29,'#98a7ad')}}
function makeEsc(){box(.24,.82,-2.09,.76,.15,.72,'#21786a');box(.24,.92,-2.10,.45,.04,.45,'#1a333f');for(let i=0;i<4;i++)box(-.04+i*.17,.95,-1.85,.07,.04,.05,'#dbba7c')}
function makeFC(){box(0,1.00,.04,.79,.15,.63,'#215d7a');box(0,1.09,.04,.43,.07,.29,'#163346');for(let x of [-.3,.3])for(let z of [-.15,.21])cylinderY(x,1.095,z,.055,.026,'#dbbd7a',7);path([[0,1.13,-.13],[0,1.13,-.28]],.028,'#52dcd8')}
function makeRX(){box(-.34,.88,.94,.46,.13,.26,'#266a67');path([[-.48,.89,1.04],[-.87,1.00,1.29],[-1.12,1.20,1.31]],.012,'#bfeee7');path([[-.24,.89,1.03],[.20,1.02,1.35],[.42,1.18,1.55]],.012,'#bfeee7')}
function makeGPSMast(){cylinderY(0,1.50,1.73,.055,.65,'#8398ab',10);box(0,1.32,1.73,.38,.09,.38,'#485f74')}
function makeGPS(){cylinderY(0,1.89,1.72,.27,.11,'#27394b',16);cylinderY(0,1.96,1.72,.20,.03,'#e4eff0',16);box(0,1.984,1.72,.23,.009,.13,'#67d2d3')}
function makePitot(){path([[3.30,1.58,-.72],[3.32,1.64,-.92],[3.35,1.65,-1.47]],.028,'#bec8cc');box(3.35,1.62,-.78,.27,.10,.17,'#2d5773')}
function makeBattery(){const z=-1.2+(cgValue-50)*.008;box(0,1.00,z,.63,.38,1.18,'#3169b0');box(0,1.215,z,.57,.035,.96,'#64a8e2');box(0,1.235,z,.42,.013,.34,'#164987');path([[.30,1.13,z-.33],[.53,1.08,z-.69],[.70,.93,z-.82]],.042,'#e97977');path([[.31,1.10,z-.28],[.57,1.04,z-.53],[.73,.92,z-.77]],.038,'#1d2a30');box(0,1.21,z,.13,.052,1.22,'#e8c07a')}
function makeCamera(){box(0,1.44,-2.43,.37,.30,.43,'#293b4b');cylinderZ(0,1.46,-2.75,.155,.16,'#1b2939',14);cylinderZ(0,1.46,-2.85,.088,.025,'#4ea5bf',14)}
function makeVTX(){box(0,.98,1.48,.52,.12,.58,'#246d65');box(0,1.06,1.45,.30,.06,.31,'#1a3948')}
function makeAntenna(){tube([.24,1.10,2.0],[.24,1.80,2.18],.036,'#a95765');ellipsoid(.24,1.90,2.2,.095,.14,.095,'#233846',10,6)}
function makeProp(){const theta=previewUntil>performance.now()?performance.now()*.008:0,c=Math.cos(theta),s=Math.sin(theta),cy=.96,z=-4.34;for(let sign of [-1,1]){let f=(u,v)=>[c*u-s*v,cy+s*u+c*v,z];let blade=[[.11,-.095],[.35,-.15],[.90,-.12],[1.19,-.035],[1.19,.06],[.95,.13],[.45,.19],[.11,.10]].map(q=>f(q[0]*sign,q[1]*sign));for(let j=1;j<blade.length-1;j++)tri(blade[0],blade[j],blade[j+1],'#273947')}cylinderZ(0,.96,z-.05,.13,.16,'#a9ac9d',14)}
function makePilot(){
 // Human figure: true 3D separate volumetric parts, hands and radio aligned toward chest.
 ellipsoid(0,3.02,.14,.67,1.06,.36,'#28485b');ellipsoid(0,3.22,-.20,.46,.60,.27,'#385e70');
 cylinderY(0,3.95,.12,.21,.38,'#c28d6b');ellipsoid(0,4.33,0,.45,.58,.40,'#cd9b79');ellipsoid(0,4.68,.08,.47,.30,.40,'#253140');
 ellipsoid(-.47,4.35,-.20,.09,.12,.06,'#8c5b4b');ellipsoid(.47,4.35,-.20,.09,.12,.06,'#8c5b4b');
 for(let x of [-.17,.17])ellipsoid(x,4.39,-.38,.035,.043,.021,'#1d2c38');
 path([[-.13,4.08,-.35],[0,4.04,-.41],[.13,4.08,-.35]],.018,'#845e50');
 ellipsoid(-.30,1.37,.13,.29,1.08,.31,'#1b3549');ellipsoid(.30,1.37,.13,.29,1.08,.31,'#1b3549');
 for(let x of [-.30,.30])ellipsoid(x,.28,-.19,.34,.19,.52,'#182c3a');
 path([[-.55,3.55,.10],[-.95,3.10,-.20],[-.72,2.45,-.68]],.23,'#2b5266');path([[.55,3.55,.10],[.95,3.10,-.20],[.72,2.45,-.68]],.23,'#2b5266');
 for(let x of [-.72,.72])ellipsoid(x,2.42,-.70,.19,.21,.17,'#c89873');
 box(0,2.02,.14,1.22,.18,.48,'#1c3040');
 if(hasPilot('goggles')){box(0,4.39,-.48,.91,.38,.20,'#1a2b37');box(0,4.41,-.603,.68,.26,.055,'#3980a0');}
 if(hasPilot('goggleAntenna'))path([[.42,4.54,-.57],[.67,4.96,-.61],[.73,5.12,-.61]],.055,'#91c8d5');
 if(hasPilot('radio')){
   // Controller front faces the PILOT (+Z); the observer in front sees controller back.
   box(0,2.40,-.78,1.02,.53,.40,'#192b3a');box(0,2.42,-.998,.78,.38,.045,'#34506a');
   ellipsoid(-.37,2.33,-.80,.16,.15,.20,'#162633');ellipsoid(.37,2.33,-.80,.16,.15,.20,'#162633');
   path([[0,2.70,-.65],[0,2.90,-.56]],.025,'#859bac');
 }
 if(hasPilot('goggleBattery')){box(-.72,1.65,.19,.41,.54,.24,'#285d80');box(-.72,1.67,.035,.27,.30,.02,'#56b4d1');path([[-.69,1.97,.12],[-.76,2.68,.25],[-.57,3.73,.20],[-.48,4.25,-.36]],.031,'#182d38');}
}
function buildModel(){P=[];N=[];COL=[];
 if(view==='pilot'){makePilot();return;}
 // Cada pieza con modelo GLB se dibuja en Three.js; aqui solo queda la
 // geometria de las que todavia no se han migrado, para que el simulador
 // siga completo durante la transicion.
 if(!usaGLB('body'))buildFuselage(!has('body'));
 if(has('spar')&&!usaGLB('spar'))tube([-5.15,1.51,.13],[5.15,1.51,.13],.09,'#8fa3a9');
 if(has('wingL')&&!usaGLB('wingL'))makeWing('left');
 if(has('wingR')&&!usaGLB('wingR'))makeWing('right');
 if(has('gear')&&!usaGLB('gear'))makeGear();
 if(has('tailH')&&!usaGLB('tailH'))makeTailH();
 if(has('tailV')&&!usaGLB('tailV'))makeTailV();
 for(let id of ['ailL','ailR','elevator','rudder'])if(has(id)&&!usaGLB(id))makeSurface(id);
 for(let id of ['servoL','servoR','servoE','servoRud'])if(has(id)&&!usaGLB(id))makeServo(id);
 for(let id of ['rodL','rodR','rodE','rodRud'])if(has(id)&&!usaGLB(id))makeRod(id);
 if(has('motorMount')&&!usaGLB('motorMount'))makeMotorMount();
 if(has('motor')&&!usaGLB('motor'))makeMotor();
 if(has('esc')&&!usaGLB('esc'))makeEsc();
 if(has('fc')&&!usaGLB('fc'))makeFC();
 if(has('rx')&&!usaGLB('rx'))makeRX();
 if(has('gpsMast')&&!usaGLB('gpsMast'))makeGPSMast();
 if(has('gps')&&!usaGLB('gps'))makeGPS();
 if(has('pitot')&&!usaGLB('pitot'))makePitot();
 if(has('battery')&&!usaGLB('battery'))makeBattery();
 if(has('camera')&&!usaGLB('camera'))makeCamera();
 if(has('vtx')&&!usaGLB('vtx'))makeVTX();
 if(has('antenna')&&!usaGLB('antenna'))makeAntenna();
 if(has('prop')&&!usaGLB('prop'))makeProp();
 // Representar solo el cable activo: evita cruces enganosos.
 const cur=nextWire(),st=STAGES[currentStage()];
 if(st.type==='wiring'&&cur){
  const a=PARTS.find(p=>p.id===cur.a).pos,b=PARTS.find(p=>p.id===cur.b).pos;
  let middle=[(a[0]+b[0])/2,Math.max(a[1],b[1])+.28,(a[2]+b[2])/2];
  path([a,middle,b],.018,cur.color);
 }
}
function compileShader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function initGL(){try{gl=canvas.getContext('webgl',{antialias:true,alpha:false,preserveDrawingBuffer:true})||canvas.getContext('experimental-webgl');if(!gl)throw Error('WebGL no disponible');const vertex=`attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform mat4 mvp;varying vec3 vN;varying vec3 vC;void main(){vN=n;vC=c;gl_Position=mvp*vec4(p,1.0);}`;const fragment=`precision mediump float;varying vec3 vN;varying vec3 vC;void main(){vec3 light=normalize(vec3(-0.4,0.95,-0.25));float brightness=0.47+0.42*abs(dot(normalize(vN),light));gl_FragColor=vec4(vC*brightness+vec3(0.035,0.045,0.055),1.0);}`;glProg=gl.createProgram();gl.attachShader(glProg,compileShader(gl.VERTEX_SHADER,vertex));gl.attachShader(glProg,compileShader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(glProg);if(!gl.getProgramParameter(glProg,gl.LINK_STATUS))throw Error('Error al enlazar shaders');gl.useProgram(glProg);bufPosition=gl.createBuffer();bufNormal=gl.createBuffer();bufColor=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(.055,.114,.173,1);gl.disable(gl.CULL_FACE);$('renderWarning').hidden=true;return true}catch(e){console.warn('WebGL no disponible, activando visualización tridimensional por Canvas 2D:',e.message);renderMode='software';ctx2d=canvas.getContext('2d',{alpha:false});$('renderWarning').hidden=!!ctx2d;return !!ctx2d}}
function perspective(fov,asp,near,far){let f=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=f/asp;o[5]=f;o[10]=(far+near)/(near-far);o[11]=-1;o[14]=(2*far*near)/(near-far);return o}
function lookAt(eye,target){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])}
function matMultiply(a,b){let c=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)c[j*4+i]+=a[k*4+i]*b[j*4+k];return c}
function calculatePV(width,height){const elev=camera.el,az=camera.az,eye=add(camera.target,[Math.sin(az)*Math.cos(elev)*camera.dist,Math.sin(elev)*camera.dist,Math.cos(az)*Math.cos(elev)*camera.dist]);return matMultiply(perspective(Math.PI/3,width/height,.1,100),lookAt(eye,camera.target))}
function project(a){const r=wrap.getBoundingClientRect(),M=lastPV||calculatePV(r.width||800,r.height||500);let t=[a[0],a[1],a[2],1],v=[];for(let i=0;i<4;i++)v[i]=M[i]*t[0]+M[i+4]*t[1]+M[i+8]*t[2]+M[i+12]*t[3];if(v[3]<.1)return null;return{x:(v[0]/v[3]+1)*r.width/2,y:(1-v[1]/v[3])*r.height/2,z:v[2]/v[3]}}
function uploadAttrib(buffer,name,array){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(array),gl.DYNAMIC_DRAW);let loc=gl.getAttribLocation(glProg,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)}
function projected3D(pt,M,width,height){const x=pt[0],y=pt[1],z=pt[2];let w=M[3]*x+M[7]*y+M[11]*z+M[15];if(w<=.01)return null;return{x:(1+(M[0]*x+M[4]*y+M[8]*z+M[12])/w)*width/2,y:(1-(M[1]*x+M[5]*y+M[9]*z+M[13])/w)*height/2,z:(M[2]*x+M[6]*y+M[10]*z+M[14])/w};}
function renderSoftware(){if(!ctx2d)return;const r=wrap.getBoundingClientRect(),width=Math.max(1,Math.floor(r.width)),height=Math.max(1,Math.floor(r.height)),dpr=Math.min(window.devicePixelRatio||1,1.4);if(canvas.width!==Math.floor(width*dpr)||canvas.height!==Math.floor(height*dpr)){canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr)}ctx2d.setTransform(dpr,0,0,dpr,0,0);const bg=ctx2d.createRadialGradient(width*.53,height*.42,10,width*.5,height*.5,width*.68);bg.addColorStop(0,'#224056');bg.addColorStop(.66,'#122739');bg.addColorStop(1,'#091625');ctx2d.fillStyle=bg;ctx2d.fillRect(0,0,width,height);lastPV=calculatePV(width,height);buildModel();
 // Retícula del plano de trabajo, con proyección real en perspectiva.
 for(let x=-10;x<=10;x++){let a=projected3D([x,-.45,-9],lastPV,width,height),b=projected3D([x,-.45,9],lastPV,width,height);if(a&&b){ctx2d.strokeStyle='#5d829019';ctx2d.lineWidth=.9;ctx2d.beginPath();ctx2d.moveTo(a.x,a.y);ctx2d.lineTo(b.x,b.y);ctx2d.stroke()}}for(let z=-9;z<=9;z++){let a=projected3D([-10,-.45,z],lastPV,width,height),b=projected3D([10,-.45,z],lastPV,width,height);if(a&&b){ctx2d.strokeStyle='#5d829019';ctx2d.beginPath();ctx2d.moveTo(a.x,a.y);ctx2d.lineTo(b.x,b.y);ctx2d.stroke()}}
 // Proyección de triángulos a partir de las mismas geometrías 3D que usa WebGL.
 const faces=[];for(let i=0;i<P.length;i+=9){const a=projected3D(P.slice(i,i+3),lastPV,width,height),b=projected3D(P.slice(i+3,i+6),lastPV,width,height),c=projected3D(P.slice(i+6,i+9),lastPV,width,height);if(!a||!b||!c)continue;const normX=N[i],normY=N[i+1],normZ=N[i+2],brightness=.52+.46*Math.abs(normX*(-.40)+normY*.84+normZ*(-.25));const col=COL.slice(i,i+3);let color='#'+col.map(v=>Math.round(clamp((v*brightness+.03)*255,0,255)).toString(16).padStart(2,'0')).join('');faces.push({a,b,c,color,z:(a.z+b.z+c.z)/3})}faces.sort((a,b)=>b.z-a.z);for(const f of faces){ctx2d.fillStyle=f.color;ctx2d.beginPath();ctx2d.moveTo(f.a.x,f.a.y);ctx2d.lineTo(f.b.x,f.b.y);ctx2d.lineTo(f.c.x,f.c.y);ctx2d.closePath();ctx2d.fill()} }
function drawScene(){if(!gl){renderSoftware();return;}const r=wrap.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.6),width=Math.max(1,Math.floor(r.width*dpr)),height=Math.max(1,Math.floor(r.height*dpr));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}gl.viewport(0,0,width,height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);lastPV=calculatePV(r.width||1,r.height||1);buildModel();gl.useProgram(glProg);gl.uniformMatrix4fv(gl.getUniformLocation(glProg,'mvp'),false,lastPV);uploadAttrib(bufPosition,'p',P);uploadAttrib(bufNormal,'n',N);uploadAttrib(bufColor,'c',COL);gl.drawArrays(gl.TRIANGLES,0,P.length/3);}
function resetCamera(){camera=view==='pilot'?{az:-Math.PI,el:.13,dist:10.6,target:[0,2.68,0]}:{az:-2.58,el:.43,dist:13.8,target:[0,1.04,0]};setSelectedCam('iso');drawScene();refreshHud()}
function setSelectedCam(v){document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('selected',b.dataset.camera===v));}
function setCamera(v){let base=view==='pilot'?{dist:10.5,target:[0,2.68,0]}:{dist:14.0,target:[0,1.04,0]};camera={...base,az:v==='side'?Math.PI/2:v==='front'?Math.PI:v==='top'?-Math.PI/2:-2.58,el:v==='top'?1.53:v==='iso'?.43:.15};setSelectedCam(v);drawScene();refreshHud()}
let dragging=false,lastPX=0,lastPY=0,hadDrag=false;wrap.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging=true;hadDrag=false;lastPX=e.clientX;lastPY=e.clientY;wrap.setPointerCapture(e.pointerId)});wrap.addEventListener('pointermove',e=>{if(!dragging)return;let dx=e.clientX-lastPX,dy=e.clientY-lastPY;if(Math.abs(dx)+Math.abs(dy)>2)hadDrag=true;camera.az+=dx*.010;camera.el=clamp(camera.el+dy*.006,-.28,1.53);lastPX=e.clientX;lastPY=e.clientY;setSelectedCam('');drawScene();refreshHud()});wrap.addEventListener('pointerup',e=>dragging=false);wrap.addEventListener('pointercancel',e=>dragging=false);wrap.addEventListener('wheel',e=>{e.preventDefault();camera.dist=clamp(camera.dist+Math.sign(e.deltaY)*.85,view==='pilot'?5:7,35);drawScene();refreshHud()},{passive:false});
window.addEventListener('resize',()=>{drawScene();refreshHud();syncBank()});
function animate(t){if(previewUntil>t){drawScene();refreshHud();}else if(previewMotion){previewMotion=0;drawScene();}requestAnimationFrame(animate)}
setCheckUI();initGL();resetCamera();refresh();updateCG();requestAnimationFrame(animate);
/* ========= Motor de render Three.js con modelos GLB de Blender =========
 * Sustituye al renderizador WebGL propio. Todo es local: three r169 y el
 * decodificador Draco estan en assets/vendor, sin CDN ni servidor externo.
 * Si el modulo ES no carga, el render local anterior sigue intacto.
 */
// var, no let: buildModel() -> usaGLB() se ejecutan durante el arranque,
// antes de esta linea. Con let/const salta ReferenceError por zona muerta
// temporal y el avion no se dibuja. Con var el valor inicial es undefined,
// que es falsy, y el render procedural funciona hasta que Three.js arranca.
var THREE_ENGINE=null;
var glbParts=new Map();
// Declaracion de funcion (no const): buildModel() la invoca durante el
// arranque, antes de llegar a esta linea. Con const saltaba ReferenceError
// por zona muerta temporal y la escena quedaba vacia.
function usaGLB(id){return !!(THREE_ENGINE&&window.DroneLab3D&&window.DroneLab3D.hasModel(id))}

function startThreeIfAvailable(){
 const D=window.DroneLab3D;if(!D||THREE_ENGINE)return;
 try{
  const T=D.THREE,layer=document.createElement('canvas');
  layer.id='threeLayer';layer.setAttribute('aria-hidden','true');
  layer.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block';
  wrap.insertBefore(layer,canvas.nextSibling);
  const renderer=new T.WebGLRenderer({canvas:layer,alpha:true,antialias:true});
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  const scene=new T.Scene();
  scene.environment=D.getEnvironment(renderer);   // reflejos PBR sin HDRI externo
  D.addStudioLights(scene);
  const ground=new T.GridHelper(22,22,0x46768d,0x345068);
  ground.position.y=-.45;ground.material.transparent=true;ground.material.opacity=.26;
  scene.add(ground);
  const cam=new T.PerspectiveCamera(60,1,.1,200);
  const mat=new T.MeshStandardMaterial({vertexColors:true,metalness:.10,roughness:.58,side:T.DoubleSide});
  THREE_ENGINE={D,T,renderer,scene,cam,mat,mesh:null,layer};
  renderMode='three';canvas.style.visibility='hidden';
  // El modulo ES es diferido: cuando llega, el banco ya se pinto sin saber
  // que piezas tienen GLB. Hay que volver a pintarlo para que las tarjetas
  // usen la miniatura 3D en vez del esquema vectorial.
  syncGLBParts();refresh();drawScene();
  console.info('DroneLab: motor Three.js activo con modelos GLB locales.');
 }catch(e){
  console.warn('Three.js no pudo iniciarse; se mantiene el render local:',e.message);
  if(THREE_ENGINE&&THREE_ENGINE.layer)THREE_ENGINE.layer.remove();
  THREE_ENGINE=null;renderMode=gl?'webgl':'software';canvas.style.visibility='visible';
 }
}

/* Anade o retira del avion los componentes que ya tienen modelo GLB. */
function syncGLBParts(){
 const e=THREE_ENGINE;if(!e)return;
 for(const id of Object.keys(e.D.PART_MODELS)){
  const quiere=view==='plane'&&has(id),puesto=glbParts.get(id);
  if(quiere&&!puesto){
   glbParts.set(id,'cargando');
   e.D.buildPart(id).then(obj=>{
    if(!obj||glbParts.get(id)!=='cargando')return;
    glbParts.set(id,obj);e.scene.add(obj);drawScene();
   }).catch(err=>{glbParts.delete(id);console.warn('No se pudo montar',id,err.message)});
  }else if(!quiere&&puesto){
   if(puesto!=='cargando')e.scene.remove(puesto);
   glbParts.delete(id);
  }
 }
}

function drawThree(){
 const e=THREE_ENGINE;if(!e)return;const T=e.T;
 const r=wrap.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);
 e.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
 e.renderer.setSize(w,h,false);
 e.cam.aspect=w/h;e.cam.updateProjectionMatrix();
 const a=camera.az,v=camera.el,d=camera.dist;
 e.cam.position.set(camera.target[0]+Math.sin(a)*Math.cos(v)*d,
                    camera.target[1]+Math.sin(v)*d,
                    camera.target[2]+Math.cos(a)*Math.cos(v)*d);
 e.cam.lookAt(camera.target[0],camera.target[1],camera.target[2]);
 lastPV=calculatePV(w,h);
 buildModel();                      // geometria de los componentes aun no migrados
 if(e.mesh){e.scene.remove(e.mesh);e.mesh.geometry.dispose();e.mesh=null}
 if(P.length){
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(P,3));
  geo.setAttribute('normal',new T.Float32BufferAttribute(N,3));
  geo.setAttribute('color',new T.Float32BufferAttribute(COL,3));
  e.mesh=new T.Mesh(geo,e.mat);e.scene.add(e.mesh);
 }
 e.renderer.render(e.scene,e.cam);
}

const originalDrawScene=drawScene;
drawScene=function(){if(THREE_ENGINE){drawThree();return}originalDrawScene()};

const originalRefresh=refresh;
refresh=function(){originalRefresh.apply(this,arguments);syncGLBParts()};

if(window.DroneLab3D)startThreeIfAvailable();
else window.addEventListener('dronelab3d-ready',startThreeIfAvailable,{once:true});
