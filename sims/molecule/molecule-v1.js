import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "Molecule Studio",
    "debugModeButton": "🐛 Debug Mode",
    "debugButton": "🔧 Debug",
    "moleculeInputPlaceholder": "Enter molecule name (e.g., water, caffeine, aspirin)",
    "visualizeButton": "Visualize",
    "loadingButton": "Loading...",
    "suggestedMolecules": "Suggested molecules:",
    "debugModeLabel": "Debug Mode:",
    "debugModeDescription": "Enter raw molecular JSON data below",
    "debugJsonPlaceholder": "Enter molecular JSON data...",
    "renderJsonButton": "Render JSON",
    "clearButton": "Clear",
    "formulaLabel": "Formula:",
    "atomsLabel": "Atoms:",
    "bondsLabel": "Bonds:",
    "welcomeIcon": "⚛️",
    "welcomeTitle": "Enter a molecule name to begin",
    "welcomeSubtitle": "Try: water, methane, caffeine, aspirin, glucose",
    "loadingIcon": "⚛️",
    "loadingMessage": "Generating molecular structure...",
    "controlsTitle": "Controls:",
    "dragToRotate": "• Drag to rotate",
    "scrollToZoom": "• Scroll to zoom",
    "errorFetchingMolecule": "Error fetching molecule data:",
    "invalidMolecularStructure": "Invalid molecular data structure",
    "invalidAtomStructure": "Invalid atom data structure",
    "invalidElementsStructure": "Invalid elements data structure",
    "invalidBondData": "Invalid bond data - bonds must reference valid atom IDs",
    "debugJsonError": "Debug JSON Error:",
    "claudePrompt": "You are a molecular data provider. When given a molecule name, respond ONLY with valid JSON in the following format:\n\n{\n  \"formula\": \"chemical formula\",\n  \"elements\": {\n    \"ELEMENT_SYMBOL\": {\n      \"radius\": number_between_0_and_1,\n      \"color\": \"#hexcolor\"\n    }\n  },\n  \"atoms\": [\n    {\n      \"id\": \"element-number\",\n      \"element\": \"element symbol\",\n      \"position\": [x, y, z]\n    }\n  ],\n  \"bonds\": [\n    {\n      \"atom1\": \"atom_id\",\n      \"atom2\": \"atom_id\",\n      \"type\": \"single\" | \"double\" | \"triple\"\n    }\n  ]\n}\n\nMolecule: {moleculeName}\n\nIMPORTANT: \n- Each atom must have a unique ID in format \"ELEMENT-NUMBER\" (e.g., \"O-1\", \"H-1\", \"H-2\", \"C-1\")\n- Use realistic 3D coordinates (Angstroms) in position array [x, y, z]\n- Bonds reference atom IDs, not indices\n- Elements object contains radius (0-1) and color for each element type in the molecule\n- Use standard CPK coloring scheme for elements\n- DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON\n- Your entire response must be a single, valid JSON object\n\nPlease respond in {locale} language"
  },
  /* LOCALE_PLACEHOLDER_START */
  "es-ES": {
    "appTitle": "Estudio de Moléculas",
    "debugModeButton": "🐛 Modo Debug",
    "debugButton": "🔧 Debug",
    "moleculeInputPlaceholder": "Ingrese el nombre de la molécula (ej: agua, cafeína, aspirina)",
    "visualizeButton": "Visualizar",
    "loadingButton": "Cargando...",
    "suggestedMolecules": "Moléculas sugeridas:",
    "debugModeLabel": "Modo Debug:",
    "debugModeDescription": "Ingrese datos JSON moleculares sin procesar a continuación",
    "debugJsonPlaceholder": "Ingrese datos JSON moleculares...",
    "renderJsonButton": "Renderizar JSON",
    "clearButton": "Limpiar",
    "formulaLabel": "Fórmula:",
    "atomsLabel": "Átomos:",
    "bondsLabel": "Enlaces:",
    "welcomeIcon": "⚛️",
    "welcomeTitle": "Ingrese el nombre de una molécula para comenzar",
    "welcomeSubtitle": "Pruebe: agua, metano, cafeína, aspirina, glucosa",
    "loadingIcon": "⚛️",
    "loadingMessage": "Generando estructura molecular...",
    "controlsTitle": "Controles:",
    "dragToRotate": "• Arrastrar para rotar",
    "scrollToZoom": "• Desplazar para hacer zoom",
    "errorFetchingMolecule": "Error al obtener datos de la molécula:",
    "invalidMolecularStructure": "Estructura de datos moleculares inválida",
    "invalidAtomStructure": "Estructura de datos de átomos inválida",
    "invalidElementsStructure": "Estructura de datos de elementos inválida",
    "invalidBondData": "Datos de enlaces inválidos - los enlaces deben referenciar IDs de átomos válidos",
    "debugJsonError": "Error de JSON Debug:",
    "claudePrompt": "Eres un proveedor de datos moleculares. Cuando se te dé el nombre de una molécula, responde SOLO con JSON válido en el siguiente formato:\n\n{\n  \"formula\": \"fórmula química\",\n  \"elements\": {\n    \"SIMBOLO_ELEMENTO\": {\n      \"radius\": numero_entre_0_y_1,\n      \"color\": \"#colorhex\"\n    }\n  },\n  \"atoms\": [\n    {\n      \"id\": \"elemento-numero\",\n      \"element\": \"símbolo del elemento\",\n      \"position\": [x, y, z]\n    }\n  ],\n  \"bonds\": [\n    {\n      \"atom1\": \"id_atomo\",\n      \"atom2\": \"id_atomo\",\n      \"type\": \"single\" | \"double\" | \"triple\"\n    }\n  ]\n}\n\nMolécula: {moleculeName}\n\nIMPORTANTE: \n- Cada átomo debe tener un ID único en formato \"ELEMENTO-NUMERO\" (ej: \"O-1\", \"H-1\", \"H-2\", \"C-1\")\n- Usar coordenadas 3D realistas (Angstroms) en el array de posición [x, y, z]\n- Los enlaces referencian IDs de átomos, no índices\n- El objeto elements contiene radio (0-1) y color para cada tipo de elemento en la molécula\n- Usar esquema de colores CPK estándar para elementos\n- NO GENERES NADA MÁS QUE JSON VÁLIDO\n- Tu respuesta completa debe ser un solo objeto JSON válido\n\nPor favor responde en idioma {locale}"
  }
  /* LOCALE_PLACEHOLDER_END */
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const MoleculeStudio = () => {
  const [moleculeName, setMoleculeName] = useState('');
  const [moleculeData, setMoleculeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugJson, setDebugJson] = useState('');
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameId = useRef(null);
  const rotationSpeed = useRef(0.01);

  // Suggested molecules
  const suggestedMolecules = [
    { name: 'water', formula: 'H₂O' },
    { name: 'ammonia', formula: 'NH₃' },
    { name: 'methane', formula: 'CH₄' },
    { name: 'ethylene', formula: 'C₂H₄' },
    { name: 'carbon dioxide', formula: 'CO₂' }
  ];

  const initializeScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    mountRef.current.appendChild(renderer.domElement);
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Mouse controls
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const onMouseDown = (event) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
      setAutoRotate(false); // Stop auto rotation when user starts dragging
    };
    
    const onMouseUp = () => {
      mouseDown = false;
    };
    
    const onMouseMove = (event) => {
      if (!mouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      if (sceneRef.current) {
        sceneRef.current.rotation.y += deltaX * 0.01;
        sceneRef.current.rotation.x += deltaY * 0.01;
      }
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const onWheel = (event) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(50, camera.position.z));
    };
    
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);
    
    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      
      // Auto-rotate if enabled
      if (autoRotate && sceneRef.current) {
        sceneRef.current.rotation.y += rotationSpeed.current;
      }
      
      renderer.render(scene, camera);
    };
    animate();
  };

  const clearScene = () => {
    if (!sceneRef.current) return;
    
    // Remove all mesh objects (atoms and bonds)
    const objectsToRemove = [];
    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.userData.isAtomOrBond) {
        objectsToRemove.push(child);
      }
    });
    
    objectsToRemove.forEach((obj) => {
      sceneRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  };

  const renderMolecule = (data) => {
    if (!sceneRef.current) return;
    
    clearScene();
    
    // Create a map of atom IDs to atom objects for bond lookup
    const atomMap = new Map();
    
    // Create atoms
    data.atoms.forEach((atom) => {
      const elementInfo = data.elements[atom.element];
      if (!elementInfo) {
        console.warn(`No element info found for ${atom.element}`);
        return;
      }
      
      const color = parseInt(elementInfo.color.replace('#', '0x'));
      const radius = elementInfo.radius;
      const [x, y, z] = atom.position;
      
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshLambertMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.userData = { isAtomOrBond: true, atomId: atom.id, element: atom.element };
      
      sceneRef.current.add(sphere);
      atomMap.set(atom.id, atom);
    });
    
    // Create bonds
    data.bonds.forEach((bond) => {
      const atom1 = atomMap.get(bond.atom1);
      const atom2 = atomMap.get(bond.atom2);
      
      if (!atom1 || !atom2) {
        console.warn(`Bond references invalid atom IDs: ${bond.atom1}, ${bond.atom2}`);
        return;
      }
      
      const start = new THREE.Vector3(...atom1.position);
      const end = new THREE.Vector3(...atom2.position);
      const direction = new THREE.Vector3().subVectors(end, start);
      const distance = direction.length();
      
      // Create bond cylinders based on type
      if (bond.type === 'single') {
        // Single bond - one cylinder
        const geometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder = new THREE.Mesh(geometry, material);
        
        cylinder.position.copy(start).add(end).divideScalar(2);
        cylinder.lookAt(end);
        cylinder.rotateX(Math.PI / 2);
        cylinder.userData = { isAtomOrBond: true };
        sceneRef.current.add(cylinder);
        
      } else if (bond.type === 'double') {
        // Double bond - two parallel cylinders
        const offset = 0.1;
        
        // Calculate a perpendicular vector
        let perpendicular;
        if (Math.abs(direction.y) < 0.9) {
          perpendicular = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
        } else {
          perpendicular = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
        }
        perpendicular.multiplyScalar(offset);
        
        // First cylinder
        const geometry1 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material1 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder1 = new THREE.Mesh(geometry1, material1);
        
        const midpoint = new THREE.Vector3().copy(start).add(end).divideScalar(2);
        cylinder1.position.copy(midpoint).add(perpendicular);
        cylinder1.lookAt(end);
        cylinder1.rotateX(Math.PI / 2);
        cylinder1.userData = { isAtomOrBond: true };
        sceneRef.current.add(cylinder1);
        
        // Second cylinder
        const geometry2 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material2 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder2 = new THREE.Mesh(geometry2, material2);
        
        cylinder2.position.copy(midpoint).sub(perpendicular);
        cylinder2.lookAt(end);
        cylinder2.rotateX(Math.PI / 2);
        cylinder2.userData = { isAtomOrBond: true };
        sceneRef.current.add(cylinder2);
        
      } else if (bond.type === 'triple') {
        // Triple bond - three cylinders
        const offset = 0.08;
        
        // Calculate perpendicular vectors
        let perpendicular1, perpendicular2;
        if (Math.abs(direction.y) < 0.9) {
          perpendicular1 = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
        } else {
          perpendicular1 = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
        }
        perpendicular2 = direction.clone().cross(perpendicular1).normalize();
        
        const midpoint = new THREE.Vector3().copy(start).add(end).divideScalar(2);
        
        // Center cylinder
        const geometry1 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material1 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder1 = new THREE.Mesh(geometry1, material1);
        
        cylinder1.position.copy(midpoint);
        cylinder1.lookAt(end);
        cylinder1.rotateX(Math.PI / 2);
        cylinder1.userData = { isAtomOrBond: true };
        sceneRef.current.add(cylinder1);
        
        // Second cylinder
        const geometry2 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material2 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder2 = new THREE.Mesh(geometry2, material2);
        
        cylinder2.position.copy(midpoint).add(perpendicular1.clone().multiplyScalar(offset));
        cylinder2.lookAt(end);
        cylinder2.rotateX(Math.PI / 2);
        cylinder2.userData = { isAtomOrBond: true };
        sceneRef.current.add(cylinder2);
        
        // Third cylinder
        const geometry3 = new THREE.CylinderGeometry(0.04, 0.04, distance, 8);
        const material3 = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const cylinder3 = new THREE.Mesh(geometry3, material3);
        
        cylinder3.position.copy(midpoint).sub(perpendicular1.clone().multiplyScalar(offset));
        cylinder3.lookAt(end);
        cylinder3.rotateX(Math.PI / 2);
        cylinder3.userData = { isAtomOrBond: true };
        sceneRef.current.add(cylinder3);
      }
    });
    
    // Center the molecule and fit to view
    const box = new THREE.Box3().setFromObject(sceneRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the molecule
    sceneRef.current.position.sub(center);
    
    // Calculate optimal camera distance
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.5; // Add 50% padding
    
    // Set camera position
    cameraRef.current.position.set(0, 0, Math.max(distance, 3)); // Ensure minimum distance
    cameraRef.current.lookAt(0, 0, 0);
    
    // Start auto-rotation
    setAutoRotate(true);
  };

  const fetchMoleculeData = async (name) => {
    setLoading(true);
    setError('');
    
    const prompt = t('claudePrompt').replace('{moleculeName}', name).replace('{locale}', locale);

    try {
      const response = await window.claude.complete(prompt);
      const jsonResponse = JSON.parse(response);
      
      if (!jsonResponse.formula || !jsonResponse.elements || !jsonResponse.atoms || !jsonResponse.bonds) {
        throw new Error(t('invalidMolecularStructure'));
      }
      
      // Validate that atoms have required properties
      const hasValidAtoms = jsonResponse.atoms.every(atom => 
        atom.id && atom.element && Array.isArray(atom.position) && atom.position.length === 3
      );
      
      if (!hasValidAtoms) {
        throw new Error(t('invalidAtomStructure'));
      }
      
      // Validate that elements object contains required properties
      const hasValidElements = Object.values(jsonResponse.elements).every(element =>
        typeof element.radius === 'number' && element.color
      );
      
      if (!hasValidElements) {
        throw new Error(t('invalidElementsStructure'));
      }
      
      // Validate that bonds reference valid atom IDs
      const atomIds = new Set(jsonResponse.atoms.map(atom => atom.id));
      const hasValidBonds = jsonResponse.bonds.every(bond => 
        atomIds.has(bond.atom1) && atomIds.has(bond.atom2)
      );
      
      if (!hasValidBonds) {
        throw new Error(t('invalidBondData'));
      }
      
      setMoleculeData(jsonResponse);
      renderMolecule(jsonResponse);
    } catch (error) {
      setError(`${t('errorFetchingMolecule')} ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (moleculeName.trim()) {
      fetchMoleculeData(moleculeName.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMoleculeName(suggestion.name);
    setShowSuggestions(false);
    fetchMoleculeData(suggestion.name);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleDebugSubmit = () => {
    try {
      const parsedData = JSON.parse(debugJson);
      
      // Basic validation
      if (!parsedData.formula || !parsedData.elements || !parsedData.atoms || !parsedData.bonds) {
        throw new Error(t('invalidMolecularStructure'));
      }
      
      setMoleculeData(parsedData);
      renderMolecule(parsedData);
      setError('');
    } catch (error) {
      setError(`${t('debugJsonError')} ${error.message}`);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    setError('');
    if (!debugMode) {
      // Set example JSON when entering debug mode
      setDebugJson(`{
  "formula": "H2O",
  "elements": {
    "H": {
      "radius": 0.3,
      "color": "#FFFFFF"
    },
    "O": {
      "radius": 0.6,
      "color": "#FF0D0D"
    }
  },
  "atoms": [
    {
      "id": "O-1",
      "element": "O",
      "position": [0.0, 0.0, 0.0]
    },
    {
      "id": "H-1",
      "element": "H",
      "position": [0.757, 0.586, 0.0]
    },
    {
      "id": "H-2",
      "element": "H",
      "position": [-0.757, 0.586, 0.0]
    }
  ],
  "bonds": [
    {
      "atom1": "O-1",
      "atom2": "H-1",
      "type": "single"
    },
    {
      "atom1": "O-1",
      "atom2": "H-2",
      "type": "single"
    }
  ]
}`);
    }
  };

  useEffect(() => {
    initializeScene();
    
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current && mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-light text-gray-900">{t('appTitle')}</h1>
            <button
              onClick={toggleDebugMode}
              className={`px-3 py-1 text-sm rounded-md transition-colors opacity-0 pointer-events-none ${
                debugMode 
                  ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
              style={{ visibility: 'hidden' }}
            >
              {debugMode ? t('debugModeButton') : t('debugButton')}
            </button>
          </div>
          
          
          {!debugMode ? (
            <div className="relative">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={moleculeName}
                  onChange={(e) => setMoleculeName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t('moleculeInputPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading || !moleculeName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? t('loadingButton') : t('visualizeButton')}
                </button>
              </div>
              
              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                    {t('suggestedMolecules')}
                  </div>
                  {suggestedMolecules.map((molecule) => (
                    <button
                      key={molecule.name}
                      onClick={() => handleSuggestionClick(molecule)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex justify-between items-center"
                    >
                      <span className="capitalize text-gray-900">{molecule.name}</span>
                      <span className="text-xs text-gray-500">{molecule.formula}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-orange-700">
                <span className="font-medium">{t('debugModeLabel')}</span>
                <span>{t('debugModeDescription')}</span>
              </div>
              <textarea
                value={debugJson}
                onChange={(e) => setDebugJson(e.target.value)}
                placeholder={t('debugJsonPlaceholder')}
                className="w-full h-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                style={{ resize: 'vertical' }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDebugSubmit}
                  disabled={!debugJson.trim()}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {t('renderJsonButton')}
                </button>
                <button
                  onClick={() => setDebugJson('')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t('clearButton')}
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {moleculeData && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">{t('formulaLabel')}</span> {moleculeData.formula} • 
              <span className="font-medium"> {t('atomsLabel')}</span> {moleculeData.atoms.length} • 
              <span className="font-medium"> {t('bondsLabel')}</span> {moleculeData.bonds.length}
            </div>
          )}
        </div>
      </div>
      
      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />
        
        {!moleculeData && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">{t('welcomeIcon')}</div>
              <p className="text-xl font-light">{t('welcomeTitle')}</p>
              <p className="text-sm mt-2">{t('welcomeSubtitle')}</p>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">{t('loadingIcon')}</div>
              <p className="text-lg text-gray-600">{t('loadingMessage')}</p>
            </div>
          </div>
        )}
        
        {moleculeData && (
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">{t('controlsTitle')}</p>
            <p>{t('dragToRotate')}</p>
            <p>{t('scrollToZoom')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoleculeStudio;