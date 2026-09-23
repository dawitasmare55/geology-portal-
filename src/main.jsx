import React, {useMemo, useState, useRef, useEffect} from "react";
import {createRoot} from "react-dom/client";
import {
  BookOpen, Users, FlaskConical, FileText, Search, Menu, X, ChevronRight, ChevronLeft,
  GraduationCap, ShieldCheck, ToggleLeft, ToggleRight, Upload,
  Newspaper, Microscope, Map, LogIn, LogOut, UserRound,
  Download, PlayCircle, Headphones, Mail, Phone, MapPin, ExternalLink
} from "lucide-react";
import "./styles.css";
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';

// ============================================
// UPLOAD / DELETE helpers
// ============================================
async function uploadToStorage(bucket, file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) { console.error('Upload error:', error); return null; }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

async function deleteFromStorage(bucket, path) {
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}

const YEARS = [1,2,3,4];

// ============================================
// COURSE DATA
// ============================================
const courseNames = [
  "Communicative English Language Skills I","General Physics","General Psychology","History of Ethiopia and the Horn","Logic and Critical Thinking","Mathematics for Natural Sciences","Geography of Ethiopia and the Horn","Physical Fitness","Moral and Civic Education",
  "Communicative English Language Skills II","Social Anthropology","General Biology","General Chemistry","Introduction to Emerging Technologies","Inclusiveness","Introduction to Economics","Global Trends",
  "General Geology","Paleontology","Practical Paleontology","Crystallography and Mineral Optics","Practical Crystallography and Mineral Optics","Mathematics for Geologists","Geomorphology","Stratigraphy and Earth History",
  "Mineralogy","Practical Mineralogy","Structural Geology","Practical Structural Geology","Tectonics","Sedimentary Petrology","Practical Sedimentary Petrology","Physical Chemistry","Geological Mapping Techniques and Report Writing",
  "Introduction to Computer Science","Remote Sensing and GIS","Statistics for Geologists","Igneous Petrology","Practical Igneous Petrology","Mapping Sedimentary Terrain","Geochemistry",
  "Mapping Igneous Terrain","Geophysics","Principles of Hydrogeology","Fundamentals of Soil and Rock Mechanics","Petroleum and Coal Geology","Metamorphic Petrology","Practical Metamorphic Petrology",
  "Exploration Geophysics","Engineering Geology","Economic Geology","Practical Economic Geology","Geology and Geologic Resources of Ethiopia","Mapping Metamorphic Terrain","Research Methods in Geosciences","Internship","Elective I",
  "Mineral Exploration and Mining","Volcanology and Geothermal Resources","Entrepreneurship","Environmental Geology","Senior Project","Groundwater Exploration and Development","Elective II"
];

const courseDescriptions = {
  // Year I, Semester I
  "Communicative English Language Skills I": "Develops foundational English communication skills for academic and professional contexts, focusing on reading, writing, speaking, and listening comprehension.",
  "General Physics": "Introduces the fundamental principles of physics, including mechanics, thermodynamics, waves, electricity, and magnetism, with applications in geological sciences.",
  "General Psychology": "Explores the basic concepts of human behavior, cognition, perception, learning, memory, motivation, and personality, with emphasis on psychological principles in everyday life.",
  "History of Ethiopia and the Horn": "Examines the historical evolution, political developments, cultural heritage, and socio-economic transformations of Ethiopia and the Horn of Africa from ancient times to the present.",
  "Logic and Critical Thinking": "Develops skills in logical reasoning, argument analysis, critical thinking, problem-solving, and decision-making, with applications in scientific inquiry and everyday life.",
  "Mathematics for Natural Sciences": "Covers mathematical concepts essential for natural sciences, including algebra, functions, calculus, trigonometry, and statistical methods for scientific applications.",
  "Geography of Ethiopia and the Horn": "Explores the physical, human, environmental, and regional geography of Ethiopia and the Horn of Africa, including landforms, climate, population, and economic activities.",
  "Physical Fitness": "Promotes physical health, wellness, fitness, and motor skills through structured physical activities, exercise programs, and health education.",
  "Moral and Civic Education": "Examines ethical principles, civic responsibilities, social values, human rights, democracy, and good governance, fostering responsible citizenship and moral development.",

  // Year I, Semester II
  "Communicative English Language Skills II": "Builds advanced communication skills in English, including academic writing, presentation skills, technical communication, and professional correspondence.",
  "Social Anthropology": "Introduces the study of human societies, cultures, social structures, traditions, beliefs, and cultural diversity, emphasizing anthropological perspectives and methods.",
  "General Biology": "Covers the fundamental concepts of biology, including cell structure, genetics, evolution, ecology, biodiversity, and physiological processes, with relevance to earth and environmental sciences.",
  "General Chemistry": "Explores the basic principles of chemistry, including atomic structure, chemical bonding, reactions, stoichiometry, thermodynamics, and chemical equilibrium, with applications in geosciences.",
  "Introduction to Emerging Technologies": "Examines emerging technologies including artificial intelligence, blockchain, IoT, cloud computing, and their applications, impacts, and ethical considerations across various sectors.",
  "Inclusiveness": "Addresses the principles of social inclusion, equity, diversity, and accessibility, exploring strategies for creating inclusive environments for people with disabilities and diverse backgrounds.",
  "Introduction to Economics": "Introduces the fundamental concepts of microeconomics and macroeconomics, including supply and demand, market structures, national income, inflation, unemployment, and economic policy.",
  "Global Trends": "Analyzes contemporary global issues, trends, and challenges including globalization, climate change, migration, technology, security, development, and international cooperation.",

  // Year II, Semester I
  "General Geology": "Introduces the fundamental concepts of geology, including the Earth's origin, structure, composition, geological materials, internal and external processes, plate tectonics, geological time, minerals, rocks, fossils, and basic geological hazards.",
  "Paleontology": "Introduces fossils, fossilization processes, major groups of ancient organisms, and their distribution through geological time. Develops knowledge of fossil identification, evolution, extinction, paleoecology, and biostratigraphy.",
  "Practical Paleontology": "Provides hands-on training in identification, classification, description, and interpretation of fossils using specimens, photographs, and geological samples.",
  "Crystallography and Mineral Optics": "Introduces geometric principles of crystal structures, crystal symmetry, crystallographic systems, and the optical properties of minerals, including interaction with polarized light.",
  "Practical Crystallography and Mineral Optics": "Provides practical training in crystal identification, crystallographic measurements, and microscopic examination of minerals using a polarizing microscope.",
  "Mathematics for Geologists": "Applies mathematical concepts and techniques to geological problems, including statistics, calculus, differential equations, and data analysis methods used in geological research.",
  "Geomorphology": "Examines the origin, evolution, and characteristics of landforms produced by geological, climatic, tectonic, and surface processes, with emphasis on interpreting landforms and their environmental significance.",
  "Stratigraphy and Earth History": "Explores the principles of stratigraphy and the geological history of the Earth through rock sequences, geological time, correlation, unconformities, sedimentary environments, and biostratigraphy.",

  // Year II, Semester II
  "Mineralogy": "Studies the composition, structure, physical and chemical properties, classification, occurrence, and formation of minerals, emphasizing major mineral groups and identification techniques.",
  "Practical Mineralogy": "Develops practical skills for identifying and describing minerals using their physical, chemical, and optical properties.",
  "Structural Geology": "Examines the deformation of rocks and the structures produced by tectonic forces, including folds, faults, joints, foliations, lineations, and shear zones.",
  "Practical Structural Geology": "Provides practical training in measuring, plotting, analyzing, and interpreting geological structures using maps, compass-clinometers, and stereographic projections.",
  "Tectonics": "Studies the large-scale processes responsible for the formation and deformation of the Earth's crust and lithosphere, including plate tectonics, continental drift, mountain building, and rifting.",
  "Sedimentary Petrology": "Examines the origin, classification, composition, textures, structures, and diagenesis of sedimentary rocks, focusing on sediment production, transportation, deposition, and interpretation.",
  "Practical Sedimentary Petrology": "Develops practical skills in identifying, classifying, describing, and interpreting sedimentary rocks using hand specimens and thin sections.",
  "Physical Chemistry": "Explores the principles of physical chemistry relevant to geological processes, including thermodynamics, kinetics, phase equilibria, and chemical reactions in geological systems.",
  "Geological Mapping Techniques and Report Writing": "Introduces principles and techniques of geological field mapping, including observation, measurement, sampling, map preparation, and scientific report writing.",

  // Year III, Semester I
  "Introduction to Computer Science": "Introduces the fundamentals of computer science, programming, algorithms, data structures, and computational thinking with applications in geological data processing.",
  "Remote Sensing and GIS": "Introduces remote sensing technologies and Geographic Information Systems for acquiring, processing, analyzing, and presenting spatial geological information.",
  "Statistics for Geologists": "Covers statistical methods and data analysis techniques used in geology, including descriptive statistics, probability, hypothesis testing, regression, and spatial statistics.",
  "Igneous Petrology": "Studies the origin, composition, classification, textures, structures, and evolution of igneous rocks and magmas, including magma generation, crystallization, and differentiation.",
  "Practical Igneous Petrology": "Provides hands-on training in identifying and interpreting igneous rocks using hand specimens and thin sections.",
  "Mapping Sedimentary Terrain": "Provides field-based training in geological mapping of areas dominated by sedimentary rocks, including stratigraphic section measurement and map preparation.",
  "Geochemistry": "Studies the distribution, abundance, movement, and behavior of chemical elements and isotopes within the Earth, with applications in petrology, mineral exploration, and environmental studies.",

  // Year III, Semester II
  "Mapping Igneous Terrain": "Focuses on geological field mapping in regions dominated by igneous rocks, including identification of intrusive and volcanic units and structural interpretation.",
  "Geophysics": "Introduces the physical principles and methods used to investigate the Earth's subsurface, including gravity, magnetic, electrical, and seismic methods.",
  "Principles of Hydrogeology": "Introduces the fundamental principles governing the occurrence, movement, recharge, discharge, and quality of groundwater.",
  "Fundamentals of Soil and Rock Mechanics": "Introduces the engineering properties and mechanical behavior of soils and rocks under natural and applied loading conditions.",
  "Petroleum and Coal Geology": "Examines the geological origin, occurrence, accumulation, exploration, and development of petroleum and coal resources.",
  "Metamorphic Petrology": "Examines the mineralogical, textural, and chemical changes that occur in rocks under changing temperature, pressure, and fluid conditions.",
  "Practical Metamorphic Petrology": "Develops practical skills for identifying, classifying, and interpreting metamorphic rocks using hand specimens and thin sections.",

  // Year IV, Semester I
  "Exploration Geophysics": "Focuses on the application of geophysical techniques to locate and characterize subsurface geological resources and structures.",
  "Engineering Geology": "Applies geological principles to engineering design, construction, and infrastructure development, including dams, roads, tunnels, foundations, and slopes.",
  "Economic Geology": "Studies geological processes responsible for the formation, distribution, characteristics, and economic significance of mineral deposits.",
  "Practical Economic Geology": "Provides practical training in identification, description, and interpretation of ore minerals, alteration, and mineral associations.",
  "Geology and Geologic Resources of Ethiopia": "Provides an overview of Ethiopia's geological evolution, major rock units, tectonic history, mineral resources, groundwater resources, and geological hazards.",
  "Mapping Metamorphic Terrain": "Provides practical field training in mapping regions characterized by metamorphic rocks and complex geological structures.",
  "Research Methods in Geosciences": "Introduces the principles and procedures involved in conducting scientific research in the geosciences, including research design, data analysis, and scientific writing.",
  "Internship": "Provides students with supervised practical experience in professional geological environments such as geological surveys, mining companies, and consulting firms.",
  "Elective I": "Allows students to explore specialized topics in geology, mineral exploration, or related fields through focused study from available elective courses offered by the department.",

  // Year IV, Semester II
  "Mineral Exploration and Mining": "Introduces the principles and techniques used to discover, evaluate, develop, and extract mineral resources.",
  "Volcanology and Geothermal Resources": "Studies volcanic processes, volcanic landforms, magma behavior, eruption mechanisms, volcanic hazards, and the geological controls of geothermal systems.",
  "Entrepreneurship": "Develops entrepreneurial skills and business knowledge for geoscience professionals, including business planning, project management, and financial analysis.",
  "Environmental Geology": "Examines the interaction between geological processes and human activities, with emphasis on environmental problems and sustainable resource use.",
  "Senior Project": "Provides students with an opportunity to conduct an independent or supervised geological research project addressing a defined scientific or applied problem.",
  "Groundwater Exploration and Development": "Examines methods used to locate, evaluate, develop, and manage groundwater resources.",
  "Elective II": "Provides students with an opportunity to further explore specialized topics in geology or related fields, selected from available elective courses within the department."
};

const initialCourses = courseNames.map((name, i) => {
  const codes = ["FLEn 1011","Phys 1011","Psch 1011","Hist1012","Phil 1011","Math 1011","GeES 1011","SpSc 1011","MCiE 1012","FLEn 1012","Anth 1012","Biol 1012","Chem 1012","EmTe 1012","Incl 2011","Econ 1012","GlTr 1012","Geol 2011","Geol 2021","Geol 2022","Geol 2031","Geol 2032","Math 2011","Geol 2012","Geol 2023","Geol 2033","Geol 2034","Geol 2041","Geol 2042","Geol 2043","Geol 2051","Geol 2052","Chem 2171","Geol 3061","Comp1011","Geol 3062","Stat 2101","Geol 3053","Geol 3054","Geol 3071","Geol 3081","Geol 3072","Geol 3091","Geol 3101","Geol 3111","Geol 3131","Geol 3055","Geol 3056","Geol 4092","Geol 4112","Geol 4121","Geol 4122","Geol 4151","Geol 4073","Geol 4161","Geol4124","Geol xxxx","Geol 4123","Geol 4132","MGMT 4011","Geol 4141","Geol 4162","Geol 4102","Geol xxxx"];
  const credits = [3,3,3,3,3,3,3,0,2,3,2,3,3,3,2,3,2,3,2,1,2,1,4,2,2,2,1,3,1,2,2,1,3,3,3,3,3,2,1,3,3,3,2,3,3,2,2,1,3,3,3,1,2,3,3,1,2,3,2,3,3,2,3,2];
  const instructorNames = ["Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Staff Member","Birkitu Alemayehu","Abraham Nigusie","Birtukan Yalew","Ajebush Wuletaw","Ajebush Wuletaw","Staff Member","Birkitu Alemayehu","Abraham Nigusie","Ajebush Wuletaw","Ajebush Wuletaw","Temesgen Kinde","Temesgen Kinde","Bishaw Mihret","Siham Adem","Siham Adem","Staff Member","Yohannes Gashu","Staff Member","Likinaw Mengstie","Staff Member","Biniyam Fentie","Biniyam Fentie","Siham Adem","Birhane Girm","Biniyam Fentie","Abraham Mulualem","Amare Getaneh","Dawit Asmare","Birtukan Yalew","Yaregal Bayih","Yaregal Bayih","Abraham Mulualem","Dawit Asmare","Amare Kassie","Amare Kassie","Birhane Girm","Yaregal Bayih","Amare Kassie","Yalemtsehay Tesfaw","Belay Fentahun","Belay Fentahun","Biniyam Fentie","Staff Member","Dawit Asmare","Bishaw Mihret","Amare Getaneh","Temesgen Kinde"];
  let year, semester;
  if (i < 9) { year = 1; semester = "I"; }
  else if (i < 17) { year = 1; semester = "II"; }
  else if (i < 25) { year = 2; semester = "I"; }
  else if (i < 34) { year = 2; semester = "II"; }
  else if (i < 41) { year = 3; semester = "I"; }
  else if (i < 48) { year = 3; semester = "II"; }
  else if (i < 57) { year = 4; semester = "I"; }
  else { year = 4; semester = "II"; }
  return { id: i + 1, code: codes[i] || `GEO ${i + 101}`, title: name, year, semester, credits: credits[i] || 3, ects: 5, active: i < 64, instructor: instructorNames[i] || "Staff Member" };
});
const initialStudents = [
  {id:"DMU-GEO-0201",name:"Asefa Yimenu",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0202",name:"Bageru Minalu",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0203",name:"Balemlay Teshome",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0204",name:"Habtamu Zelalem",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0205",name:"Manaye Kassa",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0206",name:"Samuel Yeshambel",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0207",name:"Solomon Teferi",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0208",name:"Tadele Delie",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0209",name:"Tiruneh Andualema",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0210",name:"Wondmne Getaye",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0211",name:"Yibeltal Birhanu",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0212",name:"Ykeber Dagnaw",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0213",name:"Yohannis Yenew",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0214",name:"Yoseph Litgeb",year:2,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0301",name:"Abebe Zewdu",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0302",name:"Alem Aschale",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0303",name:"Anduamlak Yismaw",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0304",name:"Beireket Molla",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0305",name:"Belayneh Ewnetu",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0306",name:"Fentahun Eshetie",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0307",name:"Friezer Akemach",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0308",name:"Genet Endawoke",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0309",name:"Gzachew Gucho",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0310",name:"Kibru Gashew",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0311",name:"Molla Wubet",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0312",name:"Simegnew Tadlo",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0313",name:"Surafiel Tadele",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0314",name:"Tesfaye Getachew",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0315",name:"Teshome Mengst",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0316",name:"Tilahun Dessie",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0317",name:"Yalew Gedie",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0318",name:"Yibeltal Adamu",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0319",name:"Yichalal Tesfa",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0320",name:"Yohannes Ayalew",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0321",name:"Yohannis Getaw",year:3,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0401",name:"Baynesagn Dessie",year:4,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0402",name:"Bimrew Ayele",year:4,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0403",name:"Chale Shitu",year:4,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0404",name:"Dessie Bialfew",year:4,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0405",name:"Matiwos Eshete",year:4,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0406",name:"Simegnew Mekonen",year:4,program:"BSc in Geology",status:"Active"},
  {id:"DMU-GEO-0407",name:"Tegegne Tienaw",year:4,program:"BSc in Geology",status:"Active"}
];
// ============================================
// MAIN APP
// ============================================
function App(){
  const [page,setPage]=useState("homepage");
  const [mobile,setMobile]=useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [courses,setCourses]=useState(initialCourses);
  const [user, setUser] = useState(null);
  const [meta, setMeta] = useState(null);
  const [selectedCourse,setSelectedCourse]=useState(null);
  const [search,setSearch]=useState("");
  const [yearFilter,setYearFilter]=useState("all");
  const [activeFilter,setActiveFilter]=useState("all");
  const [loginOpen,setLoginOpen]=useState(false);
  const [materials, setMaterials] = useState({});
  const [newsItems, setNewsItems] = useState([]);
  const [publications, setPublications] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // ===== Auth =====
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadMeta(session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadMeta(session.user.id);
      else { setMeta(null); setProfilePic(null); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadMeta = async (uid) => {
    const { data } = await supabase.from('user_metadata').select('*').eq('id', uid).maybeSingle();
    setMeta(data);
  };

  // ===== Data loads =====
  useEffect(() => { (async () => {
    const { data } = await supabase.from('publications').select('*').order('created_at', { ascending: false });
    if (data) setPublications(data);
  })(); }, []);

  useEffect(() => { (async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNewsItems(data);
  })(); }, []);

  useEffect(() => { (async () => {
    const { data } = await supabase.from('course_status').select('*');
    if (data) {
      const map = {};
      data.forEach(r => { map[r.course_id] = r.active; });
      setCourses(cs => cs.map(c => map[c.id] !== undefined ? { ...c, active: map[c.id] } : c));
    }
  })(); }, []);
  useEffect(() => {
  if (!meta) { setMustChangePassword(false); return; }
  setMustChangePassword(meta.password_changed === false);
  }, [meta]);

  useEffect(() => {
    if (!user) { setProfilePic(null); return; }
    (async () => {
      const { data } = await supabase.from('profiles').select('profile_pic').eq('user_id', user.id).maybeSingle();
      setProfilePic(data?.profile_pic || null);
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedCourse) return;
    (async () => {
      const { data } = await supabase.from('course_materials').select('*').eq('course_id', selectedCourse.id).order('created_at', { ascending: false });
      if (data) setMaterials(prev => ({ ...prev, [selectedCourse.id]: data }));
    })();
  }, [selectedCourse]);
  
  // ===== Save profile pic =====
  const saveProfilePic = async (file) => {
    if (!file || !user) return;
    const res = await uploadToStorage('profiles', file);
    if (!res) { alert('Upload failed'); return; }
    setProfilePic(res.url);
    await supabase.from('profiles').upsert({
      user_id: user.id, user_email: meta?.email, user_name: meta?.name, profile_pic: res.url
    }, { onConflict: 'user_id' });
    alert('✅ Profile picture saved!');
  };

  const removeProfilePic = async () => {
    if (!user) return;
    setProfilePic(null);
    await supabase.from('profiles').upsert({ user_id: user.id, profile_pic: null }, { onConflict: 'user_id' });
  };
const markPasswordChanged = async () => {
  if (!user) return;
  const { error } = await supabase
    .from('user_metadata')
    .update({ password_changed: true })
    .eq('id', user.id);
  if (error) { alert('Could not update flag: ' + error.message); return; }
  setMeta(m => m ? { ...m, password_changed: true } : m);
  setMustChangePassword(false);
};
  const activeCourses = courses.filter(c => c.active);
  const filteredCourses = useMemo(() => courses.filter(c => {
    const q = search.toLowerCase();
    return (!q || `${c.code} ${c.title} ${c.instructor}`.toLowerCase().includes(q))
      && (yearFilter === "all" || c.year === Number(yearFilter))
      && (activeFilter === "all" || (activeFilter === "active" ? c.active : !c.active));
  }), [courses, search, yearFilter, activeFilter]);

  const navigate = (p) => { setPage(p); setMobile(false); window.scrollTo(0, 0); };

  const toggleCourse = async (id) => {
    const current = courses.find(c => c.id === id);
    if (!current) return;
    const newActive = !current.active;
    setCourses(cs => cs.map(c => c.id === id ? { ...c, active: newActive } : c));
    await supabase.from('course_status').upsert({ course_id: id, active: newActive, user_id: user?.id }, { onConflict: 'course_id' });
  };

  const uploadMaterial = async (courseId, file, category) => {
    if (meta?.role !== 'staff') return alert('Only staff can upload.');
    const res = await uploadToStorage('materials', file);
    if (!res) return alert('Upload failed.');
    const row = { course_id: courseId, name: file.name, type: file.type, size: file.size, category, url: res.url, locked: false, uploaded_by: meta?.name, user_id: user.id };
    const { data, error } = await supabase.from('course_materials').insert([row]).select();
    if (error) return alert(error.message);
    setMaterials(prev => ({ ...prev, [courseId]: [...(data || []), ...(prev[courseId] || [])] }));
    alert('✅ Uploaded!');
  };

  const toggleLock = async (courseId, materialId) => {
    if (meta?.role !== 'staff') return;
    const list = materials[courseId] || [];
    const item = list.find(m => m.id === materialId);
    if (!item) return;
    await supabase.from('course_materials').update({ locked: !item.locked }).eq('id', materialId);
    setMaterials(prev => ({ ...prev, [courseId]: list.map(m => m.id === materialId ? { ...m, locked: !m.locked } : m) }));
  };

  async function doLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    setLoginOpen(false);
    return null;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null); setMeta(null);
    setLoginOpen(false); setProfilePic(null);
    navigate("homepage");
  }
  // Force password change gate — must run BEFORE the normal app UI
  if (user && meta && mustChangePassword) {
    return (
      <ForcePasswordChange
        meta={meta}
        onChanged={markPasswordChanged}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
  {/* 2. Brand logo on the far left */}
  <div className="brand" onClick={()=>navigate("homepage")} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
    <img src="/Geology.jpg" alt="DMU Logo" className="logo-img" />
    <div className="brand-text">
      <b>DEBRE MARKOS UNIVERSITY</b>
      <span>Department of Geology</span>
    </div>
  </div>

  <button className="menuBtn" onClick={()=>setMobile(!mobile)}>
    {mobile ? <X color="white" size={24}/> : <Menu color="white" size={24}/>}
  </button>

  <nav className={mobile ? "nav open" : "nav"}>
    {["homepage","about","academics","students","staff","research","activities","resources","news"].map(p => (
      <button key={p} className={page === p ? "active" : ""} onClick={() => navigate(p)}>
        {p === "homepage" ? "Homepage" : p.replace(/^\w/, m => m.toUpperCase())}
      </button>
    ))}

    {user ? (
      <>
        {/* 3. Badge ABOVE the name */}
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 10px',
          color: 'white',
          lineHeight: '1.1'
        }}>
          <span style={{
            background: meta?.role === 'staff' ? '#e1b84b' : '#1769aa',
            color: meta?.role === 'staff' ? '#102a43' : 'white',
            fontSize: '9px',
            padding: '1px 8px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            fontWeight: '700',
            letterSpacing: '0.5px',
            marginBottom: '3px',
            lineHeight: '14px'
          }}>
            {meta?.role || '...'}
          </span>
          <span style={{
            fontWeight: '600',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            lineHeight: '16px'
          }}>
            <UserRound size={14} />
            {meta?.name || 'Loading...'}
          </span>
        </div>

        <button className="logout-nav-btn" onClick={logout}>
          <LogOut size={16}/> Logout
        </button>
      </>
    ) : (
      <button className="loginBtn" onClick={() => setLoginOpen(true)}>
        <LogIn size={16}/> Portal Login
      </button>
    )}

    <img
      src="/DMU logo.webp"
      alt="DMU Logo"
      className="circular-logo"
      onClick={() => navigate("homepage")}
    />
  </nav>
</header>

      {page==="homepage" && <Homepage navigate={navigate} activeCourses={activeCourses.length} students={42}/>}
      {page==="about" && <About/>}
      {page==="academics" && <Academics navigate={navigate} user={user} meta={meta}/>}
      {page==="courses" && <CoursesPage courses={filteredCourses} search={search} setSearch={setSearch} yearFilter={yearFilter} setYearFilter={setYearFilter} activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSelectedCourse={setSelectedCourse} meta={meta}/>}
      {page==="staff" && <Staff profilePic={profilePic} saveProfilePic={saveProfilePic} removeProfilePic={removeProfilePic} user={user} meta={meta}/>}
      {page==="research" && <Research publications={publications} setPublications={setPublications} user={user} meta={meta}/>}
      {page==="news" && <News newsItems={newsItems} setNewsItems={setNewsItems} user={user} meta={meta}/>}
      {page==="activities" && <Activities user={user} meta={meta}/>}
      {page==="resources" && <Resources navigate={navigate}/>}
      {page==="contact" && <Contact/>}
      {page==="student" && <StudentPortal user={user} meta={meta} courses={courses} navigate={navigate} setSelectedCourse={setSelectedCourse}/>}
      {page==="students" && <Students navigate={navigate} />}
      {selectedCourse && <CourseModal course={selectedCourse} close={()=>setSelectedCourse(null)} uploadMaterial={uploadMaterial} materials={materials} toggleLock={toggleLock} user={user} meta={meta}/>}
      {loginOpen && <LoginModal close={() => setLoginOpen(false)} doLogin={doLogin}/>}

      <footer>
        <div><div className="logo small">DMU</div><h3>Department of Geology</h3><p>Debre Markos University</p></div>
        <div><h4>Contact</h4><p><MapPin size={15}/> Debre Markos, Ethiopia</p></div>
        <div><h4>University</h4><a href="https://www.dmu.edu.et" target="_blank" rel="noreferrer">Main Website</a></div>
      </footer>
    </div>
  );
}

// ============================================
// HOMEPAGE / SLIDER / SMALL COMPONENTS
// ============================================
function Homepage({ navigate, activeCourses, students }) {
  const images = ['/Amethyst.jpg','/Opal.webp','/GERD.webp','/sapphire.avif','/bridge-over-blue-nile.webp','/choke mountains1.jpg','/choke mountains2.jpg','/my-background.jpg.jpg'];
  window.navigate = navigate;
  return (
    <main>
      <HeroSlider images={images} />
      <section className="stats">
        <Stat icon={<BookOpen/>} n={activeCourses} label="Active Courses"/>
        <Stat icon={<Users/>} n={students} label="Students"/>
        <Stat icon={<FlaskConical/>} n="4" label="Academic Years"/>
        <Stat icon={<FileText/>} n="100+" label="Course Capacity"/>
      </section>
      <section className="section">
        <SectionTitle kicker="WELCOME TO DMU GEOLOGY" title="A Center for Geological Education & Research"/>
        <div className="cards four">
          <Feature icon={<GraduationCap/>} title="Academic Programs" text="Explore our BSc geology curriculum." onClick={()=>navigate("academics")}/>
          <Feature icon={<BookOpen/>} title="Courses & Materials" text="Access active courses and resources." onClick={()=>navigate("courses")}/>
          <Feature icon={<Microscope/>} title="Research" text="Discover geological research." onClick={()=>navigate("research")}/>
          <Feature icon={<Users/>} title="Our Students" text="Student services." onClick={()=>navigate("students")}/>
        </div>
      </section>
    </main>
  );
}

function HeroSlider({ images }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(p => (p + 1) % images.length), 2000); return () => clearInterval(t); }, [images.length]);
  return (
    <div className="hero-slider">
      <div className="hero-slide" style={{ backgroundImage: `url(${images[i]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="eyebrow">DEBRE MARKOS UNIVERSITY</div>
          <h1>Department of <span>Geology</span></h1>
          <p>Advancing geological education, research and innovation.</p>
          <div className="actions">
            <button className="primary" onClick={() => window.navigate && window.navigate("courses")}>Explore Courses <ChevronRight/></button>
            <button className="secondary" onClick={() => window.navigate && window.navigate("research")}>Research</button>
          </div>
        </div>
      </div>
      <button className="slider-arrow prev" onClick={() => setI(p => (p - 1 + images.length) % images.length)}><ChevronLeft size={30}/></button>
      <button className="slider-arrow next" onClick={() => setI(p => (p + 1) % images.length)}><ChevronRight size={30}/></button>
      <div className="slider-dots">{images.map((_, k) => (<button key={k} className={`dot ${k === i ? 'active' : ''}`} onClick={() => setI(k)} />))}</div>
    </div>
  );
}

function Stat({icon,n,label}){return <div className="stat"><div className="statIcon">{icon}</div><strong>{n}</strong><span>{label}</span></div>}
function Feature({icon,title,text,onClick}){return <button className="feature" onClick={onClick}><div>{icon}</div><h3>{title}</h3><p>{text}</p><ChevronRight/></button>}
function SectionTitle({kicker,title,text}){return <div className="sectionTitle"><div className="eyebrow">{kicker}</div><h2>{title}</h2>{text&&<p>{text}</p>}</div>}
function Students({ navigate }) {
  const now = new Date();
// Ethiopian academic calendar:
// Semester I:   September 1 – January 1
// Semester II:  January 2 – June 20
// Break:        June 21 – August 31
  const month = now.getMonth() + 1; // 1–12
  const day = now.getDate();
  const isSemOne =
  (month === 9) ||
  (month >= 10 && month <= 12) ||
  (month === 1 && day === 1);
  const isSemTwo =
  (month === 1 && day >= 2) ||
  (month >= 2 && month <= 5) ||
  (month === 6 && day <= 20);
  const currentSemester = isSemOne ? 'I' : isSemTwo ? 'II' : 'BREAK';
  
  const [selectedYear, setSelectedYear] = useState(null);

  const students = initialStudents;

  return (
    <Page title="Students" kicker="STUDENT COMMUNITY">

      <div className="adminStats" style={{ marginBottom: '30px' }}>
        {YEARS.map(y => (
          <Stat
            key={y}
            icon={<Users />}
            n={students.filter(s => s.year === y).length}
            label={`Year ${y}`}
          />
        ))}
      </div>

      <div style={{
        background: currentSemester === 'BREAK' ? '#fff3cd' : '#eaf4fb',
        borderLeft: currentSemester === 'BREAK' ? '4px solid #856404' : '4px solid #1769aa',
        padding: '14px 18px', borderRadius: '8px',
        marginBottom: '25px', fontSize: '14px', color: '#102a43'
       }}>
  {currentSemester === 'BREAK'
    ? '🎉 Semester Break — no classes in session. Courses shown are for the upcoming semester.'
    : <>📅 <strong>Current Semester: {currentSemester}</strong> — courses for this semester are shown below. Updates automatically.</>}
</div>

      {YEARS.map(y => {
        const yearStudents = students.filter(s => s.year === y);
        const isOpen = selectedYear === y;
        const displaySemester = currentSemester === 'BREAK' ? 'I' : currentSemester;
        const currentCourses = initialCourses.filter(c => c.year === y && c.semester === displaySemester);
        const otherCourses = initialCourses.filter(c => c.year === y && c.semester !== currentSemester);
        const totalCredits = currentCourses.reduce((n, c) => n + (c.credits || 0), 0);
        const totalECTS = currentCourses.reduce((n, c) => n + (c.ects || 0), 0);

        return (
          <article key={y} className="yearCard" style={{
            background: 'white', border: '1px solid #dbe4ec',
            borderRadius: '12px', padding: '20px', marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#102a43' }}>
                   Year {y} — Batch {new Date().getFullYear() - (y - 1)}
                    </h2>
                <p style={{ margin: '4px 0 0', color: '#66788a', fontSize: '13px' }}>
                  {yearStudents.length} students • Semester {currentSemester} • {currentCourses.length} courses ({totalCredits} cr, {totalECTS} ECTS)
                </p>
              </div>
              <button className={isOpen ? 'secondary' : 'primary'} onClick={() => setSelectedYear(isOpen ? null : y)}>
                {isOpen ? '📕 Show Less' : '📖 View Details'}
              </button>
            </div>

            {isOpen && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                  <h3 style={{ marginTop: 0, fontSize: '15px', color: '#102a43' }}>👤 Students ({yearStudents.length})</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '320px', overflowY: 'auto' }}>
                    {yearStudents.map(s => (
                      <li key={s.id} style={{ padding: '6px 0', borderBottom: '1px solid #e9ecef', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{s.name}</span>
                        <span style={{ color: '#66788a', fontSize: '11px' }}>{s.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#eaf4fb', padding: '15px', borderRadius: '10px' }}>
                  <h3 style={{ marginTop: 0, fontSize: '15px', color: '#102a43' }}>📚 Semester {currentSemester} Courses ({currentCourses.length})</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '320px', overflowY: 'auto' }}>
                    {currentCourses.map(c => (
                      <li key={c.id} style={{ padding: '6px 0', borderBottom: '1px solid #cfe0ec', fontSize: '13px' }}>
                        <strong style={{ color: '#1769aa' }}>{c.code}</strong> — {c.title}
                        <br/>
                        <span style={{ fontSize: '11px', color: '#66788a' }}>{c.credits} Cr · {c.ects} ECTS</span>
                      </li>
                    ))}
                  </ul>
                  {otherCourses.length > 0 && (
                    <details style={{ marginTop: '12px' }}>
                      <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#1769aa', fontWeight: '600' }}>
                        📚 Show Semester {currentSemester === 'I' ? 'II' : 'I'} courses ({otherCourses.length})
                      </summary>
                      <ul style={{ listStyle: 'none', padding: '8px 0 0', margin: 0, fontSize: '12px' }}>
                        {otherCourses.map(c => (
                          <li key={c.id} style={{ padding: '4px 0', color: '#66788a' }}>
                            <strong>{c.code}</strong> — {c.title} ({c.credits} Cr)
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </Page>
  );
}
function Page({title,kicker,children}){return <main className="page"><div className="pageHero"><div className="eyebrow">{kicker}</div><h1>{title}</h1></div><section className="section">{children}</section></main>}

function About(){return <Page title="About the Department" kicker="WHO WE ARE"><SectionTitle kicker="DEPARTMENT OVERVIEW" title="Geology at Debre Markos University"/><div className="twoCol"><article><h3>Overview</h3><p>The Department of Geology prepares graduates with strong geological knowledge.</p></article><article className="infoBox"><h3>Vision</h3><p>To become a leading center of geological education.</p></article></div></Page>}

function Activities({ user, meta }) {
  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Field Trip',
    date: '', location: '', imageFile: null,
  });

  const isStaff = meta?.role === 'staff';

  // Load uploaded activities
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setActivities(data);
    })();
  }, []);

  const submit = async () => {
    if (!form.title.trim()) return alert('Please enter a title.');
    if (!form.imageFile) return alert('Please choose an image.');
    setBusy(true);
    const up = await uploadToStorage('activity-images', form.imageFile);
    if (!up) { setBusy(false); return alert('Image upload failed.'); }
    const row = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      activity_date: form.date,
      location: form.location.trim(),
      image_url: up.url,
      uploaded_by: meta?.name,
      user_id: user.id,
    };
    const { data, error } = await supabase.from('activities').insert([row]).select();
    setBusy(false);
    if (error) return alert(error.message);
    if (data) setActivities(prev => [...data, ...prev]);
    setForm({ title: '', description: '', category: 'Field Trip', date: '', location: '', imageFile: null });
    setShowForm(false);
    alert('✅ Activity posted!');
  };

  const del = async (id) => {
    if (!confirm('Delete this activity?')) return;
    await supabase.from('activities').delete().eq('id', id);
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // The 6 fixed category cards — always shown
  const staticCategories = [
    { label: 'Field Trips', icon: '🚌' },
    { label: 'Seminars', icon: '🎤' },
    { label: 'Lab Training', icon: '🔬' },
    { label: 'Community Service', icon: '🤝' },
    { label: 'Workshops', icon: '🛠️' },
    { label: 'Industrial Visits', icon: '🏭' },
  ];

  return (
    <Page title="Department Activities" kicker="ENGAGEMENT">

      {/* ===== STATIC CATEGORY CARDS (always visible) ===== */}
      <div className="activityGrid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {staticCategories.map((c, i) => (
          <article className="activity" key={c.label} style={{
            background: 'white',
            border: '1px solid #dbe4ec',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div className="activityNo" style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#dbe4ec',
              lineHeight: 1
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <h3 style={{ margin: '15px 0 5px', color: '#102a43', fontSize: '18px' }}>
              {c.icon} {c.label}
            </h3>
            <p style={{ color: '#66788a', fontSize: '14px', margin: 0 }}>
              Department activity, training and academic engagement.
            </p>
          </article>
        ))}
      </div>

      {/* ===== HEADER FOR UPLOADED ACTIVITIES ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #dbe4ec'
      }}>
        <div>
          <div className="eyebrow" style={{ color: '#c99a2e', fontSize: '11px', fontWeight: '800', letterSpacing: '2px' }}>
            RECENT ACTIVITIES
          </div>
          <h2 style={{ margin: '8px 0 0', color: '#102a43' }}>
            Department Activities ({activities.length})
          </h2>
        </div>

        {isStaff && (
          <button
            className="primary"
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#28a745' }}
          >
            {showForm ? '📕 Close Form' : '📝 Post New Activity'}
          </button>
        )}
      </div>

      {/* ===== POST FORM (staff only) ===== */}
      {isStaff && showForm && (
        <div style={{
          background: '#f8f9fa', padding: '20px',
          borderRadius: '12px', marginBottom: '25px',
          border: '1px solid #dbe4ec'
        }}>
          <h3 style={{ color: '#102a43', marginBottom: '15px' }}>📝 New Activity</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Title *</label>
              <input type="text" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Geological Field Trip to the Blue Nile Gorge"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Category</label>
              <select value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option>Field Trip</option>
                <option>Lab Training</option>
                <option>Seminar</option>
                <option>Workshop</option>
                <option>Community Service</option>
                <option>Industrial Visit</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Location</label>
              <input type="text" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Blue Nile Gorge, Dejen"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Description</label>
              <textarea value={form.description} rows="4"
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What happened? Who attended?"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Photo *</label>
              <input type="file" accept="image/*"
                onChange={e => setForm({ ...form, imageFile: e.target.files[0] })}
                style={{ padding: '8px' }} />
            </div>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button className="primary" onClick={submit} disabled={busy} style={{ background: '#28a745' }}>
              {busy ? 'Uploading...' : '✅ Publish Activity'}
            </button>
            <button className="secondary"
              onClick={() => {
                setShowForm(false);
                setForm({ title: '', description: '', category: 'Field Trip', date: '', location: '', imageFile: null });
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== UPLOADED ACTIVITIES ===== */}
      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px',
          background: '#f8f9fa', borderRadius: '12px'
        }}>
          <Microscope size={48} color="#1769aa" />
          <h3 style={{ color: '#102a43', marginTop: '15px' }}>No Activities Posted Yet</h3>
          <p style={{ color: '#66788a' }}>
            {isStaff
              ? 'Click "Post New Activity" above to share a field trip, seminar, or workshop with photos.'
              : 'Check back later for upcoming and past department activities.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {activities.map(a => (
            <article key={a.id} style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #dbe4ec',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {a.image_url ? (
                <img src={a.image_url} alt={a.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '200px',
                  background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '42px'
                }}>📷</div>
              )}

              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{
                    background: '#1769aa', color: 'white',
                    padding: '2px 10px', borderRadius: '12px',
                    fontSize: '11px', fontWeight: '600'
                  }}>{a.category}</span>
                  {a.activity_date && (
                    <small style={{ color: '#66788a' }}>📅 {a.activity_date}</small>
                  )}
                </div>

                <h3 style={{ margin: '4px 0 8px', color: '#102a43', fontSize: '17px' }}>{a.title}</h3>

                {a.location && (
                  <p style={{ color: '#66788a', fontSize: '12px', margin: '0 0 8px' }}>
                    📍 {a.location}
                  </p>
                )}

                <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
                  {a.description}
                </p>

                <p style={{ fontSize: '11px', color: '#999', marginTop: '12px' }}>
                  Posted by {a.uploaded_by} {a.created_at ? `• ${new Date(a.created_at).toLocaleDateString()}` : ''}
                </p>

                {isStaff && user.id === a.user_id && (
                  <button className="secondary" onClick={() => del(a.id)}
                    style={{ marginTop: '10px', color: '#dc3545' }}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

    </Page>
  );
}
function Resources({navigate}){return <Page title="Resources" kicker="LEARNING"><div className="resourceGrid">{[{t:"Lecture Notes"},{t:"Video Lectures"},{t:"Audio"},{t:"Maps"}].map(x=><article className="resource" key={x.t}><h3>{x.t}</h3><button className="secondary" onClick={()=>navigate("courses")}>Browse</button></article>)}</div></Page>}
function Contact(){return <Page title="Contact" kicker="GET IN TOUCH"><div><h2>Department of Geology</h2><p>Debre Markos University, Ethiopia</p></div></Page>}

function Academics({ navigate, user, meta }) {
  const [showExam, setShowExam] = useState(false);
  return (
    <Page title="Academic Programs" kicker="ACADEMICS">
      <div className="program">
        <div><GraduationCap size={48}/></div>
        <div>
          <h2>BSc in Geology</h2>
          <p>A comprehensive undergraduate program.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="primary" onClick={() => navigate("courses")}>View Courses <ChevronRight/></button>
            <button className={showExam ? 'primary' : 'secondary'} onClick={() => setShowExam(!showExam)} style={{ background: showExam ? '#28a745' : '#1769aa' }}>{showExam ? '📕 Hide Exam' : '📋 Exam System'}</button>
          </div>
        </div>
      </div>
      {showExam && <ExamSystem user={user} meta={meta} />}
    </Page>
  );
}

function CoursesPage({ courses, search, setSearch, yearFilter, setYearFilter, activeFilter, setActiveFilter, setSelectedCourse, meta }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <Page title="Course Catalog" kicker="EXPLORE OUR COURSES">
      <div className="toolbar">
        <div className="search"><Search/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."/></div>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}><option value="all">All Years</option>{YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}</select>
        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>
      <div className="courseGrid">
        {courses.map(c => {
          const d = courseDescriptions[c.title] || "Description not available.";
          const isOpen = expanded === c.id;
          return (
            <article className={"courseCard " + (!c.active ? "inactive" : "")} key={c.id}>
              <div className="courseTop"><span>{c.code}</span><span className={c.active ? "status active" : "status"}>{c.active ? "Active" : "Inactive"}</span></div>
              <h3>{c.title}</h3>
              <p><strong>{c.instructor}</strong></p>
              <div className="courseMeta"><span>Year {c.year}</span><span>Sem {c.semester}</span><span>{c.credits} Cr</span></div>
              <button onClick={() => setExpanded(isOpen ? null : c.id)}>{isOpen ? '📕 Hide' : '📖 Description'}</button>
              {isOpen && <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>{d}</div>}
              <button disabled={!c.active} onClick={() => setSelectedCourse(c)} style={{ marginTop: '15px' }}>
               {meta?.role === 'staff' ? 'Upload Materials' : 'View Materials'} <ChevronRight size={16}/>
               </button>
            </article>
          );
        })}
      </div>
    </Page>
  );
}

// ============================================
// LOGIN MODAL (Supabase Auth)
// ============================================
function LoginModal({ close, doLogin }) {
  const [type, setType] = useState('student');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr('');
    setBusy(true);
    let loginEmail = email.trim();
    // Allow students to type username instead of email
    if (type === 'student' && !loginEmail.includes('@')) {
      loginEmail = `${loginEmail}@student.dmu.edu.et`;
    }
    const msg = await doLogin(loginEmail, pw);
    setBusy(false);
    if (msg) setErr(msg);
  };

  return (
    <div className="modalBackdrop" onClick={close}>
      <div className="modal login" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={close}><X/></button>
        <h2>Portal Login</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button className={type === 'student' ? 'primary' : 'secondary'} onClick={() => { setType('student'); setErr(''); }} style={{ flex: 1 }}>Student</button>
          <button className={type === 'staff' ? 'primary' : 'secondary'} onClick={() => { setType('staff'); setErr(''); }} style={{ flex: 1 }}>Staff</button>
        </div>
        {err && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>{err}</div>}
        <label>{type === 'student' ? 'Username' : 'Email'}</label>
        <input
          type={type === 'student' ? 'text' : 'email'}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={type === 'student' ? 'Enter your username' : 'Enter your email'}
          style={{ width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
        />
        <label>Password</label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && submit()}
          placeholder="Password"
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
        />
        <button className="primary full" onClick={submit} disabled={busy}>
          {busy ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ fontSize: '12px', color: '#66788a', marginTop: '10px', textAlign: 'center' }}>
         {type === 'student'
         ? 'Use your username (e.g. asefa.y). Default password: student123'
          : 'Use your registered email address. Default password: staff123'}
      </p>
      </div>
    </div>
  );
}

// ============================================
// EXAM SYSTEM
// ============================================
function ExamSystem({ user, meta }) {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ id: 1, text: '', choices: ['','','',''], correctAnswer: '', points: 1 }]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [duration, setDuration] = useState(30);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [examType, setExamType] = useState('Midterm');
  const [targetYear, setTargetYear] = useState(2);
  const [currentExam, setCurrentExam] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [filterYear, setFilterYear] = useState('all');

  const isStaff = meta?.role === 'staff';
  const isStudent = meta?.role === 'student';

  const refresh = async () => {
    const { data: e } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    const { data: r } = await supabase.from('exam_results').select('*').order('submitted_at', { ascending: false });
    setExams(e || []); setResults(r || []);
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!currentExam || submitted || timeLeft === null || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); doSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [currentExam, timeLeft, submitted]);

  const addQ = () => {
    const nid = Math.max(...questions.map(q => q.id)) + 1;
    setQuestions([...questions, { id: nid, text: '', choices: ['','','',''], correctAnswer: '', points: 1 }]);
  };
  const rmQ = (id) => { if (questions.length > 1) setQuestions(questions.filter(q => q.id !== id)); };
  const updQ = (id, f, v) => setQuestions(questions.map(q => q.id === id ? { ...q, [f]: v } : q));
  const updC = (qid, ci, v) => setQuestions(questions.map(q => q.id === qid ? { ...q, choices: q.choices.map((c, i) => i === ci ? v : c) } : q));

  const saveExam = async () => {
    if (!title.trim()) return alert('Enter exam title.');
    if (!courseCode.trim()) return alert('Enter course code.');
    if (!courseName.trim()) return alert('Enter course name.');
    if (!targetYear) return alert('Choose target year.');
    const row = {
      title: title.trim(), duration, released: false, questions,
      course_code: courseCode.trim(), course_name: courseName.trim(),
      exam_type: examType, target_year: targetYear, user_id: user.id,
    };
    if (editingId) await supabase.from('exams').update(row).eq('id', editingId);
    else await supabase.from('exams').insert([row]);
    resetForm(); refresh();
    alert('✅ Exam saved!');
  };

  const resetForm = () => {
    setTitle(''); setQuestions([{ id: 1, text: '', choices: ['','','',''], correctAnswer: '', points: 1 }]);
    setEditingId(null); setShowForm(false);
    setCourseCode(''); setCourseName(''); setExamType('Midterm'); setTargetYear(2);
  };

  const editE = (e) => {
    setEditingId(e.id);
    setTitle(e.title); setDuration(e.duration || 30);
    setQuestions(e.questions || []);
    setCourseCode(e.course_code || '');
    setCourseName(e.course_name || '');
    setExamType(e.exam_type || 'Midterm');
    setTargetYear(e.target_year || 2);
    setShowForm(true);
  };

  const delE = async (id) => {
    if (confirm('Delete this exam?')) {
      await supabase.from('exams').delete().eq('id', id);
      refresh();
    }
  };

  const relE = async (id, v) => {
    await supabase.from('exams').update({ released: v }).eq('id', id);
    refresh();
  };

  const startExam = async (exam) => {
    const { data } = await supabase.from('exam_progress').select('*').eq('user_id', user.id).eq('exam_id', exam.id).maybeSingle();
    setCurrentExam(exam);
    setSubmitted(false); setQIndex(0); setAnswers({});
    setStartTime(Date.now());
    if (data) {
      setAnswers(data.answers || {});
      setQIndex(data.current_index || 0);
      setTimeLeft(data.time_left || exam.duration * 60);
    } else {
      setTimeLeft(exam.duration * 60);
      await supabase.from('exam_progress').insert([{
        user_id: user.id, student: meta?.name,
        exam_id: exam.id, answers: {}, current_index: 0,
        time_left: exam.duration * 60
      }]);
    }
  };

  useEffect(() => {
    if (!currentExam || submitted) return;
    const t = setInterval(async () => {
      await supabase.from('exam_progress').upsert({
        user_id: user.id, student: meta?.name,
        exam_id: currentExam.id,
        answers, current_index: qIndex, time_left: timeLeft
      }, { onConflict: 'user_id,exam_id' });
    }, 5000);
    return () => clearInterval(t);
  }, [currentExam, answers, qIndex, timeLeft, submitted]);

  const computeGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 85) return 'A';
    if (pct >= 80) return 'A-';
    if (pct >= 75) return 'B+';
    if (pct >= 70) return 'B';
    if (pct >= 65) return 'B-';
    if (pct >= 60) return 'C+';
    if (pct >= 50) return 'C';
    if (pct >= 45) return 'D';
    return 'F';
  };

  const doSubmit = async (auto = false) => {
    if (submitted) return;
    const total = currentExam.questions.length;
    const answered = Object.keys(answers).length;
    if (!auto && answered < total && !confirm(`Answered ${answered}/${total}. Submit anyway?`)) return;
    let totalPts = 0, earned = 0, correct = 0, wrong = 0;
    currentExam.questions.forEach(q => {
      const p = q.points || 1;
      totalPts += p;
      if (answers[q.id] === q.correctAnswer) { correct++; earned += p; }
      else if (answers[q.id] != null) { wrong++; }
    });
    const unanswered = total - correct - wrong;
    const pct = Math.round((earned / totalPts) * 100);
    const grade = computeGrade(pct);
    const status = pct >= 50 ? 'Passed' : 'Failed';
    const timeTaken = currentExam.duration * 60 - (timeLeft || 0);

    const { count } = await supabase.from('exam_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('exam_id', currentExam.id);
    const attempt = (count || 0) + 1;

    await supabase.from('exam_results').insert([{
      exam_id: currentExam.id, exam_title: currentExam.title,
      student: meta?.name, student_id: meta?.student_id, student_year: meta?.year,
      course_code: currentExam.course_code, course_name: currentExam.course_name,
      exam_type: currentExam.exam_type,
      score: pct, correct, total, wrong, unanswered,
      total_points: totalPts, earned_points: earned,
      grade, status, time_taken: timeTaken, attempt_number: attempt,
      answers, user_id: user.id
    }]);
    await supabase.from('exam_progress').delete().eq('user_id', user.id).eq('exam_id', currentExam.id);
    setSubmitted(true);
    setTimeout(() => { setCurrentExam(null); setSubmitted(false); refresh(); }, 2000);
  };

  const fmt = (s) => {
    if (s === null || s === undefined) return '--:--';
    const m = Math.floor(s / 60); const x = s % 60;
    return `${m}:${x.toString().padStart(2,'0')}`;
  };
  const fmtTime = (sec) => {
    if (!sec) return '0m 0s';
    const m = Math.floor(sec / 60); const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // ============ EXCEL EXPORT ============
  const downloadExcel = () => {
    const rows = (filterYear === 'all'
      ? results
      : results.filter(r => r.student_year === filterYear)
    ).map((r, i) => ({
      '#': i + 1,
      'Student Name': r.student || '',
      'Student ID': r.student_id || '',
      'Year / Batch': r.student_year ? `Year ${r.student_year}` : '',
      'Course Code': r.course_code || '',
      'Course Name': r.course_name || '',
      'Exam Title': r.exam_title || '',
      'Exam Date': r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '',
      'Total Questions': r.total || 0,
      'Correct Answers': r.correct || 0,
      'Wrong Answers': r.wrong || 0,
      'Unanswered': r.unanswered || 0,
      'Score': `${r.earned_points || 0} / ${r.total_points || 0}`,
      'Percentage': `${r.score || 0}%`,
      'Grade': r.grade || '',
      'Status': r.status || '',
      'Time Taken': fmtTime(r.time_taken),
      'Attempt Number': r.attempt_number || 1,
      'Submitted At': r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 4 }, { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 28 },
      { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
      { wch: 14 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
      { wch: 20 }
    ];
    const workbook = XLSX.utils.book_new();
    const sheetName = filterYear === 'all' ? 'All Results' : `Year ${filterYear}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const timestamp = new Date().toISOString().slice(0,10);
    XLSX.writeFile(workbook, `exam_results_${sheetName.replace(/\s/g,'_')}_${timestamp}.xlsx`);
  };

  // ============ STUDENT TAKING EXAM ============
  if (currentExam && isStudent && !submitted) {
    const q = currentExam.questions[qIndex];
    return (
      <div style={{ marginTop: '30px', background: 'white', padding: '25px', borderRadius: '12px' }}>
        <h3>{currentExam.title}</h3>
        <p style={{ color: '#66788a' }}>
          {currentExam.course_code} — {currentExam.course_name} • {currentExam.exam_type}
        </p>
        <p>Q {qIndex+1}/{currentExam.questions.length} • ⏱️ {fmt(timeLeft)}</p>
        <p style={{ fontSize: '18px' }}>{q.text}</p>
        {q.choices.map((c,i) => (
          <label key={i} style={{
            display: 'block', padding: '10px', margin: '5px 0',
            border: answers[q.id]===c ? '2px solid #1769aa' : '1px solid #dbe4ec',
            borderRadius: '6px', cursor: 'pointer'
          }}>
            <input type="radio" checked={answers[q.id]===c}
              onChange={()=>setAnswers(a=>({...a,[q.id]:c}))}/> {c}
          </label>
        ))}
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button className="secondary" onClick={()=>setQIndex(qIndex-1)} disabled={qIndex===0}>← Prev</button>
          <button className="secondary" onClick={()=>setQIndex(qIndex+1)} disabled={qIndex===currentExam.questions.length-1}>Next →</button>
          <button className="primary" onClick={()=>doSubmit(false)} style={{background:'#28a745'}}>Submit</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{textAlign:'center',padding:'40px',background:'white',borderRadius:'12px'}}>
        <h2 style={{color:'#28a745'}}>✅ Exam Submitted!</h2>
        <p style={{color:'#66788a'}}>Your answers are saved. Staff can now see your result.</p>
      </div>
    );
  }

  // ============ FILTERED RESULTS ============
  const filteredResults = filterYear === 'all'
    ? results
    : results.filter(r => r.student_year === filterYear);

  // ============ MAIN VIEW ============
  return (
    <div style={{ marginTop: '40px', padding: '20px', background: 'white', borderRadius: '12px' }}>
      <h2 style={{ color: '#102a43' }}>📋 Exam System</h2>

      {!user ? <p>Please login.</p> : (
        <>
          {isStaff && (
            <div>
              <button className="primary" onClick={()=>setShowForm(!showForm)} style={{marginBottom:'20px'}}>
                {showForm ? '📕 Close' : '📝 Create Exam'}
              </button>

              {showForm && (
                <div style={{background:'#f8f9fa',padding:'20px',borderRadius:'12px',marginBottom:'20px'}}>
                  <h3>New Exam</h3>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                    <div>
                      <label style={{fontSize:'13px',fontWeight:'600'}}>Exam Title</label>
                      <input type="text" value={title} onChange={e=>setTitle(e.target.value)}
                        placeholder="e.g. Midterm Exam"
                        style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'13px',fontWeight:'600'}}>Exam Type</label>
                      <select value={examType} onChange={e=>setExamType(e.target.value)}
                        style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}}>
                        <option>Midterm</option><option>Final</option><option>Quiz</option>
                        <option>Assignment</option><option>Practical</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:'13px',fontWeight:'600'}}>Course Code</label>
                      <input type="text" value={courseCode} onChange={e=>setCourseCode(e.target.value)}
                        placeholder="e.g. Geol 2011"
                        style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'13px',fontWeight:'600'}}>Course Name</label>
                      <input type="text" value={courseName} onChange={e=>setCourseName(e.target.value)}
                        placeholder="e.g. General Geology"
                        style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'13px',fontWeight:'600'}}>Target Year (batch)</label>
                      <select value={targetYear} onChange={e=>setTargetYear(parseInt(e.target.value))}
                        style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}}>
                        <option value={1}>Year 1</option><option value={2}>Year 2</option>
                        <option value={3}>Year 3</option><option value={4}>Year 4</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:'13px',fontWeight:'600'}}>Duration (min)</label>
                      <input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value)||30)}
                        style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}}/>
                    </div>
                  </div>
                  <hr style={{margin:'15px 0'}}/>
                  {questions.map((q,qi)=>(
                    <div key={q.id} style={{background:'white',padding:'12px',marginBottom:'8px',borderRadius:'6px'}}>
                      <strong>Q{qi+1}</strong>
                      <input type="text" value={q.text} onChange={e=>updQ(q.id,'text',e.target.value)}
                        placeholder="Question text" style={{width:'100%',padding:'8px',marginTop:'5px'}}/>
                      {q.choices.map((c,ci)=>(
                        <input key={ci} type="text" value={c} onChange={e=>updC(q.id,ci,e.target.value)}
                          placeholder={`Choice ${ci+1}`} style={{width:'100%',padding:'8px',marginTop:'5px'}}/>
                      ))}
                      <input type="text" value={q.correctAnswer}
                        onChange={e=>updQ(q.id,'correctAnswer',e.target.value)}
                        placeholder="Correct answer (must match a choice)"
                        style={{width:'100%',padding:'8px',marginTop:'5px'}}/>
                      <input type="number" value={q.points||1}
                        onChange={e=>updQ(q.id,'points',parseInt(e.target.value)||1)}
                        placeholder="Points" min="1" style={{width:'80px',padding:'8px',marginTop:'5px'}}/>
                    </div>
                  ))}
                  <button className="secondary" onClick={addQ}>+ Question</button>
                  <button className="primary" onClick={saveExam} style={{marginLeft:'10px'}}>
                    {editingId?'Update':'Create'}
                  </button>
                </div>
              )}

              <h3>Manage Exams</h3>
              {exams.length === 0 && <p style={{color:'#66788a'}}>No exams created yet.</p>}
              {exams.map(e => (
                <div key={e.id} style={{padding:'15px',border:'1px solid #dbe4ec',borderRadius:'8px',marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
                    <div>
                      <strong>{e.title}</strong> {e.released?'✅ Released':'🔒 Draft'}
                      <p style={{margin:'4px 0',color:'#66788a',fontSize:'13px'}}>
                        {e.course_code} — {e.course_name} • {e.exam_type} • Year {e.target_year}
                      </p>
                    </div>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      <button className="secondary" onClick={()=>editE(e)}>Edit</button>
                      <button className="secondary" onClick={()=>delE(e.id)} style={{color:'#dc3545'}}>Delete</button>
                      <button className={e.released?'secondary':'primary'}
                        onClick={()=>relE(e.id,!e.released)}
                        style={{background:e.released?'#ffc107':'#28a745',color:e.released?'#333':'white'}}>
                        {e.released?'Unrelease':'Release'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isStudent && (
            <div>
              <h3>📚 Available Exams for Year {meta?.year}</h3>
              {exams.filter(e => e.released && e.target_year === meta?.year).length === 0 && (
                <p style={{color:'#66788a'}}>No exams released for your year yet.</p>
              )}
              {exams.filter(e => e.released && e.target_year === meta?.year).map(e => (
                <div key={e.id} style={{padding:'15px',border:'1px solid #dbe4ec',borderRadius:'8px',marginBottom:'10px'}}>
                  <strong>{e.title}</strong>
                  <p style={{margin:'4px 0',color:'#66788a',fontSize:'13px'}}>
                    {e.course_code} — {e.course_name} • {e.exam_type} • {e.questions?.length} questions • {e.duration} min
                  </p>
                  <button className="primary" onClick={()=>startExam(e)} style={{marginTop:'8px'}}>Start Exam</button>
                </div>
              ))}
            </div>
          )}

          {/* ============ RESULTS TABLE ============ */}
          {(isStaff || isStudent) && (
            <div style={{marginTop:'40px'}}>
              <div style={{
                display:'flex', justifyContent:'space-between',
                alignItems:'center', flexWrap:'wrap', gap:'10px',
                marginBottom:'15px'
              }}>
                <h3 style={{margin:0}}>📊 Exam Results ({filteredResults.length})</h3>

                {isStaff && (
                  <div style={{display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
                    <select value={filterYear} onChange={e=>setFilterYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      style={{padding:'8px', borderRadius:'6px', border:'1px solid #ccc'}}>
                      <option value="all">All Years</option>
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
                    </select>

                    <button className="primary" onClick={downloadExcel}
                      style={{background:'#17a2b8', display:'inline-flex', alignItems:'center', gap:'6px'}}>
                      <Download size={16}/> Download Excel
                    </button>
                  </div>
                )}
              </div>

              {filteredResults.length === 0 ? (
                <p style={{color:'#66788a'}}>No results submitted yet.</p>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'1900px'}}>
                    <thead>
                      <tr style={{background:'#102a43',color:'white'}}>
                        <th style={{padding:'8px',textAlign:'left'}}>#</th>
                        <th style={{padding:'8px',textAlign:'left'}}>Student Name</th>
                        <th style={{padding:'8px',textAlign:'left'}}>Student ID</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Year</th>
                        <th style={{padding:'8px',textAlign:'left'}}>Course Code</th>
                        <th style={{padding:'8px',textAlign:'left'}}>Course Name</th>
                        <th style={{padding:'8px',textAlign:'left'}}>Exam Title</th>
                        <th style={{padding:'8px',textAlign:'left'}}>Date</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Total Q</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Correct</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Wrong</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Unans.</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Score</th>
                        <th style={{padding:'8px',textAlign:'center'}}>%</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Grade</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Status</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Time Taken</th>
                        <th style={{padding:'8px',textAlign:'center'}}>Attempt</th>
                        <th style={{padding:'8px',textAlign:'left'}}>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((r,i) => (
                        <tr key={r.id} style={{borderBottom:'1px solid #e0e0e0'}}>
                          <td style={{padding:'8px'}}>{i+1}</td>
                          <td style={{padding:'8px'}}>{r.student}</td>
                          <td style={{padding:'8px'}}>{r.student_id || '—'}</td>
                          <td style={{padding:'8px',textAlign:'center'}}>{r.student_year || '—'}</td>
                          <td style={{padding:'8px'}}>{r.course_code || '—'}</td>
                          <td style={{padding:'8px'}}>{r.course_name || '—'}</td>
                          <td style={{padding:'8px'}}>{r.exam_title}</td>
                          <td style={{padding:'8px'}}>{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—'}</td>
                          <td style={{padding:'8px',textAlign:'center'}}>{r.total}</td>
                          <td style={{padding:'8px',textAlign:'center',color:'#28a745'}}>{r.correct}</td>
                          <td style={{padding:'8px',textAlign:'center',color:'#dc3545'}}>{r.wrong}</td>
                          <td style={{padding:'8px',textAlign:'center'}}>{r.unanswered}</td>
                          <td style={{padding:'8px',textAlign:'center'}}>{r.earned_points}/{r.total_points}</td>
                          <td style={{padding:'8px',textAlign:'center',fontWeight:'bold',color: r.score>=50?'#28a745':'#dc3545'}}>{r.score}%</td>
                          <td style={{padding:'8px',textAlign:'center',fontWeight:'bold'}}>{r.grade}</td>
                          <td style={{padding:'8px',textAlign:'center'}}>
                            <span style={{
                              padding:'2px 8px',borderRadius:'10px',fontSize:'11px',
                              background: r.status==='Passed'?'#d4edda':'#f8d7da',
                              color: r.status==='Passed'?'#155724':'#721c24'
                            }}>{r.status}</span>
                          </td>
                          <td style={{padding:'8px',textAlign:'center'}}>{fmtTime(r.time_taken)}</td>
                          <td style={{padding:'8px',textAlign:'center'}}>{r.attempt_number || 1}</td>
                          <td style={{padding:'8px',fontSize:'11px',color:'#66788a'}}>
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
// ============================================
// STUDENT PORTAL
// ============================================
function StudentPortal({ user, meta, courses, navigate, setSelectedCourse }) {
  if (!user || !meta) return <Page title="Student Portal" kicker="ACCESS"><p>Please login.</p></Page>;
  const isStaff = meta.role === 'staff';
  const mine = isStaff ? courses.filter(c => c.active) : courses.filter(c => c.active && c.year === meta.year);
  return (
    <Page title="Student Portal" kicker={isStaff ? "STAFF VIEW" : "LEARNING"}>
      <h2>{meta.name}</h2>
      <p>{isStaff ? 'Staff View' : `${meta.student_id} • Year ${meta.year}`}</p>
      <div className="courseGrid">
        {mine.map(c => (
          <article className="courseCard" key={c.id}>
            <div className="courseTop"><span>{c.code}</span></div>
            <h3>{c.title}</h3>
            <button onClick={() => setSelectedCourse(c)}>
            {meta?.role === 'staff' ? 'Upload Materials' : 'View Materials'} <ChevronRight/>
              </button>
          </article>
        ))}
      </div>
    </Page>
  );
}

// ============================================
// COURSE MODAL (materials)
// ============================================
function CourseModal({ course, close, uploadMaterial, materials, toggleLock, user, meta }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Lecture Notes');
  const list = materials[course.id] || [];
  const isStaff = meta?.role === 'staff';
  const cats = ['Lecture Notes', 'Videos', 'Audio', 'Assignments', 'References'];
  const ref = useRef(null);
  return (
    <div className="modalBackdrop" onClick={close} style={{position:'fixed',inset:0,background:'rgba(5,19,32,0.75)',zIndex:9999,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'80px 20px 20px',overflowY:'auto'}}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:'14px',width:'min(720px,100%)',maxHeight:'80vh',overflowY:'auto',padding:'30px'}}>
        <button className="close" onClick={close} style={{float:'right'}}><X/></button>
        <h3>{course.code}: {course.title}</h3>
        <p>{course.instructor} • Year {course.year} • Sem {course.semester}</p>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',margin:'10px 0'}}>
          {cats.map(c=>(<button key={c} onClick={()=>setCategory(c)} style={{padding:'6px 12px',background:category===c?'#1a3a5c':'white',color:category===c?'white':'#333',border:'1px solid #dbe4ec',borderRadius:'6px'}}>{c}</button>))}
        </div>
        {isStaff && (
          <div style={{background:'#f8f9fa',padding:'15px',borderRadius:'8px',marginBottom:'15px'}}>
            <input ref={ref} type="file" onChange={e=>setFile(e.target.files[0])} style={{display:'none'}}/>
            <button className="primary" onClick={()=>ref.current?.click()}><Upload size={16}/> Select File</button>
            {file && (<button onClick={()=>{uploadMaterial(course.id,file,category);setFile(null);}} style={{marginLeft:'10px',background:'#28a745',color:'white',border:'none',padding:'8px 16px',borderRadius:'6px'}}>Upload Now</button>)}
          </div>
        )}
        <h4>Materials ({list.length})</h4>
        {list.map(m=>(
          <div key={m.id} style={{padding:'10px',border:'1px solid #dbe4ec',borderRadius:'6px',marginBottom:'6px',display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
            <FileText size={20}/>
            <span style={{flex:1}}>{m.name}</span>
            {isStaff && user.id === m.user_id && (<label><input type="checkbox" checked={m.locked} onChange={() => toggleLock(course.id, m.id)} /> Lock</label>)}
             {!m.locked && user && (
             <a href={m.url} target="_blank" rel="noreferrer" className="textBtn">
              Download
            </a>
          )}

    {!m.locked && !user && (
    <span style={{ color: '#66788a', fontSize: '12px', fontStyle: 'italic' }}>
    Log in to download
   </span>
   )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// STAFF PAGE (with profile upload)
// ============================================
function Staff({ profilePic, saveProfilePic, removeProfilePic, user, meta }) {
  const isStaff = meta?.role === 'staff';
  const [allStaff, setAllStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState({
    bio: '', phone: '', office: '', achievements: []
  });
  const [newAch, setNewAch] = useState('');
  const [busy, setBusy] = useState(false);

  // Load all staff from user_metadata
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('user_metadata')
        .select('*')
        .eq('role', 'staff')
        .order('name');
      if (data) setAllStaff(data);
    })();
  }, []);

  // Load my staff_profile_details
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('staff_profile_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setDetails({
          bio: data.bio || '',
          phone: data.phone || '',
          office: data.office || '',
          achievements: data.achievements || []
        });
      }
    })();
  }, [user]);

  const saveDetails = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from('staff_profile_details').upsert({
      user_id: user.id,
      user_email: meta?.email,
      user_name: meta?.name,
      bio: details.bio,
      phone: details.phone,
      office: details.office,
      achievements: details.achievements,
    }, { onConflict: 'user_id' });
    setBusy(false);
    if (error) return alert(error.message);
    alert('✅ Profile saved!');
    setEditing(false);
  };

  const addAch = () => {
    if (newAch.trim()) {
      setDetails(d => ({
        ...d,
        achievements: [...d.achievements, {
          text: newAch.trim(),
          date: new Date().toLocaleDateString()
        }]
      }));
      setNewAch('');
    }
  };

  const removeAch = (i) => {
    setDetails(d => ({
      ...d,
      achievements: d.achievements.filter((_, k) => k !== i)
    }));
  };

  return (
    <Page title="Academic Staff" kicker="OUR PEOPLE">

      {/* ============ MY STAFF PROFILE (only if logged in as staff) ============ */}
      {isStaff && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          border: '2px solid #e1b84b',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, color: '#102a43' }}>👤 My Staff Profile</h2>
            {!editing ? (
              <button className="primary" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="primary" onClick={saveDetails} disabled={busy} style={{ background: '#28a745' }}>
                  {busy ? 'Saving...' : '✅ Save'}
                </button>
                <button className="secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
            {/* Left: profile picture */}
            <div style={{ textAlign: 'center' }}>
              <ProfileUpload
                user={meta}
                profilePic={profilePic}
                onUpload={saveProfilePic}
                onRemove={removeProfilePic}
              />
              <p style={{ fontSize: '12px', color: '#66788a', marginTop: '10px' }}>
                Click to {profilePic ? 'change' : 'upload'}<br />your profile picture
              </p>
            </div>

            {/* Right: profile info */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <h3 style={{ margin: '0 0 5px', color: '#102a43', fontSize: '22px' }}>{meta?.name}</h3>
              <p style={{ color: '#1769aa', margin: '0 0 3px', fontWeight: '600' }}>{meta?.rank}</p>
              <p style={{ color: '#66788a', margin: '0 0 3px', fontSize: '14px' }}>🔬 {meta?.spec}</p>
              <p style={{ color: '#66788a', margin: '0 0 15px', fontSize: '14px' }}>📧 {meta?.email}</p>

              {/* Editable fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#66788a', marginBottom: '3px' }}>Phone</label>
                  {editing ? (
                    <input type="text" value={details.phone}
                      onChange={e => setDetails({ ...details, phone: e.target.value })}
                      placeholder="+251 ..."
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  ) : (
                    <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>{details.phone || '—'}</p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#66788a', marginBottom: '3px' }}>Office</label>
                  {editing ? (
                    <input type="text" value={details.office}
                      onChange={e => setDetails({ ...details, office: e.target.value })}
                      placeholder="e.g. Block 3, Room 12"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} />
                  ) : (
                    <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>{details.office || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#102a43' }}>Bio / About</label>
            {editing ? (
              <textarea value={details.bio} rows="4"
                onChange={e => setDetails({ ...details, bio: e.target.value })}
                placeholder="Write a short academic bio — research interests, teaching areas, background..."
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
            ) : (
              <p style={{ margin: 0, color: '#333', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {details.bio || 'No bio yet. Click "Edit Profile" to add one.'}
              </p>
            )}
          </div>

          {/* Achievements */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#102a43' }}>
              🏆 Achievements ({details.achievements.length})
            </label>

            {editing && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input type="text" value={newAch}
                  onChange={e => setNewAch(e.target.value)}
                  placeholder="e.g. Published paper in Journal of African Earth Sciences (2025)"
                  onKeyPress={e => e.key === 'Enter' && addAch()}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} />
                <button className="primary" onClick={addAch}>+ Add</button>
              </div>
            )}

            {details.achievements.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic', fontSize: '13px' }}>No achievements added yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {details.achievements.map((a, i) => (
                  <li key={i} style={{
                    padding: '10px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    borderLeft: '3px solid #e1b84b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div>
                      <strong style={{ color: '#102a43' }}>{a.text}</strong>
                      <br />
                      <span style={{ fontSize: '11px', color: '#999' }}>Added {a.date}</span>
                    </div>
                    {editing && (
                      <button
                        onClick={() => removeAch(i)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #dc3545',
                          color: '#dc3545',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ============ ALL STAFF DIRECTORY ============ */}
      <h2 style={{ color: '#102a43', marginBottom: '15px' }}>Department Staff ({allStaff.length})</h2>

      <div className="staffGrid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {allStaff.map(s => (
          <article key={s.id} className="staffCard" style={{
            background: 'white',
            border: '1px solid #dbe4ec',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div className="avatar" style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              {s.name ? s.name.charAt(0) : '?'}
            </div>
            <h3 style={{ margin: '0 0 4px', color: '#102a43', fontSize: '16px' }}>{s.name}</h3>
            <b style={{ color: '#1769aa', fontSize: '13px' }}>{s.rank}</b>
            <p style={{ color: '#66788a', fontSize: '13px', margin: '5px 0 10px' }}>{s.spec}</p>
            <button
              className="textBtn"
              onClick={() => setSelectedStaff(s)}
              style={{
                color: '#1769aa',
                border: '1px solid #1769aa',
                background: 'white',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              View Profile
            </button>
          </article>
        ))}
      </div>

      {/* View other staff modal */}
      {selectedStaff && (
        <StaffViewModal
          staffMember={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </Page>
  );
}

// ============================================
// Staff view modal — shows another staff's bio + achievements
// ============================================
function StaffViewModal({ staffMember, onClose }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('staff_profile_details')
        .select('*')
        .eq('user_id', staffMember.id)
        .maybeSingle();
      setDetails(data);
    })();
  }, [staffMember.id]);

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', background: 'white', borderRadius: '14px', padding: '30px' }}>
        <button className="close" onClick={onClose} style={{ float: 'right' }}><X /></button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
            color: 'white', display: 'grid', placeItems: 'center',
            margin: '0 auto 12px', fontSize: '36px', fontWeight: 'bold'
          }}>
            {staffMember.name?.charAt(0)}
          </div>
          <h2 style={{ margin: '0 0 5px', color: '#102a43' }}>{staffMember.name}</h2>
          <p style={{ color: '#1769aa', margin: 0, fontWeight: '600' }}>{staffMember.rank}</p>
          <p style={{ color: '#66788a', margin: 0, fontSize: '14px' }}>{staffMember.spec}</p>
          <p style={{ color: '#66788a', margin: '5px 0 0', fontSize: '13px' }}>📧 {staffMember.email}</p>
        </div>

        {details ? (
          <>
            {details.bio && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#102a43', marginBottom: '8px' }}>About</h4>
                <p style={{ color: '#333', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{details.bio}</p>
              </div>
            )}

            {(details.phone || details.office) && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#102a43', marginBottom: '8px' }}>Contact</h4>
                {details.phone && <p style={{ margin: '0 0 4px', color: '#333', fontSize: '14px' }}>📞 {details.phone}</p>}
                {details.office && <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>🏢 {details.office}</p>}
              </div>
            )}

            {details.achievements && details.achievements.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#102a43', marginBottom: '8px' }}>🏆 Achievements</h4>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {details.achievements.map((a, i) => (
                    <li key={i} style={{ marginBottom: '6px', color: '#333', fontSize: '14px' }}>
                      {a.text} <span style={{ color: '#999', fontSize: '12px' }}>({a.date})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: '#999', textAlign: 'center', fontStyle: 'italic' }}>
            No profile details shared yet.
          </p>
        )}

        <button className="secondary" onClick={onClose} style={{ width: '100%', marginTop: '20px' }}>
          Close
        </button>
      </div>
    </div>
  );
}

function ProfileUpload({ user, profilePic, onUpload, onRemove }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  return (
    <div style={{position:'relative',display:'inline-block'}}>
      <div onClick={()=>setShow(!show)} style={{cursor:'pointer'}}>
        {profilePic ? (
          <img src={profilePic} alt="Profile" style={{width:'120px',height:'120px',borderRadius:'50%',objectFit:'cover',border:'3px solid #e1b84b'}}/>
        ) : (
          <div style={{width:'120px',height:'120px',borderRadius:'50%',background:'linear-gradient(135deg,#1a3a5c,#1769aa)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'48px',border:'3px solid #e1b84b'}}>{user?.name?.charAt(0)||'📷'}</div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={e=>e.target.files[0]&&onUpload(e.target.files[0])} style={{display:'none'}}/>
      {show && (
        <div style={{position:'absolute',top:'130px',left:'50%',transform:'translateX(-50%)',background:'white',padding:'8px',borderRadius:'10px',boxShadow:'0 4px 20px rgba(0,0,0,0.15)',zIndex:1000}}>
          <button onClick={()=>ref.current?.click()} style={{display:'block',padding:'10px 16px',border:'none',background:'none',width:'100%',cursor:'pointer'}}><Upload size={16}/> Upload</button>
          {profilePic && (<button onClick={onRemove} style={{display:'block',padding:'10px 16px',border:'none',background:'none',color:'#dc3545',width:'100%',cursor:'pointer'}}>Remove</button>)}
        </div>
      )}
    </div>
  );
}

// ============================================
// RESEARCH (publications)
// ============================================
function Research({ publications, setPublications, user, meta }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({title:'',authors:'',year:new Date().getFullYear(),journal:'',link:'',abstract:''});
  const isStaff = meta?.role === 'staff';

  const submit = async () => {
    if (!form.title.trim()) return alert('Enter title.');
    const row = { title: form.title.trim(), authors: form.authors.trim()||'Department of Geology', year: form.year, journal: form.journal.trim(), link: form.link.trim(), abstract: form.abstract.trim()||'No abstract.', uploaded_by: meta?.name, user_id: user.id };
    if (editing) {
      await supabase.from('publications').update(row).eq('id', editing.id);
      setPublications(prev => prev.map(p => p.id===editing.id ? {...p,...row} : p));
    } else {
      const { data } = await supabase.from('publications').insert([row]).select();
      if (data) setPublications(prev => [...data, ...prev]);
    }
    setForm({title:'',authors:'',year:new Date().getFullYear(),journal:'',link:'',abstract:''}); setEditing(null);
    alert('✅ Saved!');
  };
  const del = async (id) => { if (confirm('Delete?')) { await supabase.from('publications').delete().eq('id', id); setPublications(prev => prev.filter(p=>p.id!==id)); } };

  return (
    <Page title="Research" kicker="KNOWLEDGE & INNOVATION">
      <h2>Publications</h2>
      {isStaff && (
        <div style={{background:'#f8f9fa',padding:'20px',borderRadius:'12px',marginBottom:'20px'}}>
          <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" style={{width:'100%',padding:'10px',marginBottom:'8px'}}/>
          <input type="text" value={form.authors} onChange={e=>setForm({...form,authors:e.target.value})} placeholder="Authors" style={{width:'100%',padding:'10px',marginBottom:'8px'}}/>
          <input type="number" value={form.year} onChange={e=>setForm({...form,year:parseInt(e.target.value)||2024})} placeholder="Year" style={{width:'100%',padding:'10px',marginBottom:'8px'}}/>
          <input type="text" value={form.journal} onChange={e=>setForm({...form,journal:e.target.value})} placeholder="Journal" style={{width:'100%',padding:'10px',marginBottom:'8px'}}/>
          <input type="text" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="Link" style={{width:'100%',padding:'10px',marginBottom:'8px'}}/>
          <textarea value={form.abstract} onChange={e=>setForm({...form,abstract:e.target.value})} placeholder="Abstract" style={{width:'100%',padding:'10px',marginBottom:'8px'}}/>
          <button className="primary" onClick={submit} style={{background:'#28a745'}}>{editing?'Update':'Publish'}</button>
        </div>
      )}
      {publications.map(p => (
        <article key={p.id} style={{background:'white',padding:'20px',borderRadius:'10px',marginBottom:'15px',border:'1px solid #dbe4ec'}}>
          <small>{p.year} • {p.journal}</small>
          <h3>{p.title}</h3>
          <p>✍️ {p.authors}</p>
          <p>{p.abstract}</p>
          {p.link && <a href={p.link} target="_blank" rel="noreferrer">🔗 View</a>}
          {isStaff && user.id === p.user_id && (
            <>
              <button className="secondary" onClick={()=>{setEditing(p);setForm(p);}} style={{marginLeft:'10px'}}>Edit</button>
              <button className="secondary" onClick={()=>del(p.id)} style={{marginLeft:'10px',color:'#dc3545'}}>Delete</button>
            </>
          )}
        </article>
      ))}
    </Page>
  );
}

// ============================================
// NEWS
// ============================================
function News({ newsItems, setNewsItems, user, meta }) {
  const isStaff = meta?.role === 'staff';
  const [showForm, setShowForm] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [form, setForm] = useState({
    title: '', category: 'News', content: '',
    imageFile: null, file: null
  });
  const [busy, setBusy] = useState(false);

  // Categories split
  const newsOnly = newsItems.filter(n => n.category !== 'Event');
  const eventsOnly = newsItems.filter(n => n.category === 'Event');

  // For carousel: show 3 at a time
  const visibleCards = 3;
  const maxIndex = Math.max(0, newsOnly.length - visibleCards);

  const next = () => setCarouselIndex(i => Math.min(maxIndex, i + 1));
  const prev = () => setCarouselIndex(i => Math.max(0, i - 1));

  const submit = async () => {
    if (!form.title.trim()) return alert('Please enter a title.');
    setBusy(true);

    let imageUrl = '', fileUrl = '';
    if (form.imageFile) {
      const up = await uploadToStorage('news-files', form.imageFile);
      if (up) imageUrl = up.url;
    }
    if (form.file) {
      const up = await uploadToStorage('news-files', form.file);
      if (up) fileUrl = up.url;
    }

    const row = {
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim() || 'No description.',
      image_url: imageUrl,
      file_url: fileUrl,
      uploaded_by: meta?.name,
      user_id: user.id,
    };

    const { data, error } = await supabase.from('news').insert([row]).select();
    setBusy(false);
    if (error) return alert(error.message);

    if (data) setNewsItems(prev => [...data, ...prev]);
    setForm({ title: '', category: 'News', content: '', imageFile: null, file: null });
    setShowForm(false);
    alert('✅ Posted!');
  };

  const del = async (id) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('news').delete().eq('id', id);
    setNewsItems(prev => prev.filter(n => n.id !== id));
  };

  return (
    <main className="page">
      <div className="pageHero">
        <div className="eyebrow">LATEST UPDATES</div>
        <h1>News &amp; Events</h1>
      </div>

      <section className="section">

        {/* ==================== STAFF POST BUTTON ==================== */}
        {isStaff && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <button
              className="primary"
              onClick={() => setShowForm(!showForm)}
              style={{ background: '#28a745' }}
            >
              {showForm ? '📕 Close Form' : '📝 Create New Post'}
            </button>
          </div>
        )}

        {/* ==================== POST FORM (staff) ==================== */}
        {isStaff && showForm && (
          <div style={{
            background: '#f8f9fa', padding: '20px',
            borderRadius: '12px', marginBottom: '30px',
            border: '1px solid #dbe4ec'
          }}>
            <h3 style={{ color: '#102a43', marginBottom: '15px' }}>📝 New Post</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Headline..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Category</label>
                <select value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option>News</option>
                  <option>Event</option>
                  <option>Seminar</option>
                  <option>Brochure</option>
                  <option>Banner</option>
                  <option>Information</option>
                  <option>Announcement</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Photo</label>
                <input type="file" accept="image/*"
                  onChange={e => setForm({ ...form, imageFile: e.target.files[0] })}
                  style={{ padding: '8px' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Content</label>
                <textarea value={form.content} rows="4"
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the story..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Attachment (optional)</label>
                <input type="file"
                  onChange={e => setForm({ ...form, file: e.target.files[0] })}
                  style={{ padding: '8px' }} />
              </div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button className="primary" onClick={submit} disabled={busy} style={{ background: '#28a745' }}>
                {busy ? 'Uploading...' : '✅ Publish'}
              </button>
              <button className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ==================== NEWS CAROUSEL ==================== */}
        {newsOnly.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '60px' }}>

            {/* Left arrow */}
            {carouselIndex > 0 && (
              <button
                onClick={prev}
                style={{
                  position: 'absolute', left: '-20px', top: '35%',
                  transform: 'translateY(-50%)',
                  background: '#1769aa', color: 'white', border: 'none',
                  borderRadius: '50%', width: '52px', height: '52px',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                  zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <ChevronLeft size={26} />
              </button>
            )}

            {/* Right arrow */}
            {carouselIndex < maxIndex && (
              <button
                onClick={next}
                style={{
                  position: 'absolute', right: '-20px', top: '35%',
                  transform: 'translateY(-50%)',
                  background: '#1769aa', color: 'white', border: 'none',
                  borderRadius: '50%', width: '52px', height: '52px',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                  zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <ChevronRight size={26} />
              </button>
            )}

            {/* Cards container — shows 3 at a time with smooth transform */}
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                gap: '30px',
                transition: 'transform 0.4s ease',
                transform: `translateX(calc(-${carouselIndex} * (33.333% + 10px)))`
              }}>
                {newsOnly.map((n, i) => (
                  <article
                    key={n.id}
                    style={{
                      flex: `0 0 calc(33.333% - 20px)`,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // scroll to details — no separate page, so just expand below
                      const el = document.getElementById(`news-${n.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    {n.image_url ? (
                      <img
                        src={n.image_url}
                        alt={n.title}
                        style={{
                          width: '100%',
                          height: '230px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          marginBottom: '15px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '230px',
                        background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
                        borderRadius: '12px',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'white',
                        fontSize: '42px',
                        marginBottom: '15px'
                      }}>📰</div>
                    )}
                    <h3 style={{
                      color: '#102a43',
                      fontSize: '19px',
                      fontWeight: '700',
                      lineHeight: '1.35',
                      margin: 0
                    }}>
                      {n.title}
                    </h3>
                  </article>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div style={{
              textAlign: 'center',
              marginTop: '35px',
              display: 'flex',
              justifyContent: 'center',
              gap: '10px'
            }}>
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  style={{
                    width: '10px', height: '10px',
                    borderRadius: '50%', border: 'none',
                    background: i === carouselIndex ? '#1769aa' : '#c6d4e0',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ==================== EVENTS SECTION ==================== */}
        {eventsOnly.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '25px'
            }}>
              <h2 style={{
                color: '#102a43',
                fontSize: '32px',
                margin: 0,
                fontWeight: '800'
              }}>
                Events
              </h2>
              <a href="#all-events" style={{
                color: '#1769aa',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                View All <ChevronRight size={16} />
              </a>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }} id="all-events">
              {eventsOnly.map(e => (
                <article key={e.id} style={{
                  background: 'white',
                  border: '1px solid #dbe4ec',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  {e.image_url ? (
                    <img src={e.image_url} alt={e.title}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '180px',
                      background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
                      display: 'grid', placeItems: 'center',
                      color: 'white', fontSize: '36px'
                    }}>📅</div>
                  )}
                  <div style={{ padding: '18px' }}>
                    {e.created_at && (
                      <p style={{ margin: '0 0 8px', color: '#66788a', fontSize: '13px' }}>
                        🗓️ {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    <h3 style={{ margin: '0 0 8px', color: '#102a43', fontSize: '16px' }}>
                      {e.title}
                    </h3>
                    <p style={{ margin: 0, color: '#66788a', fontSize: '13px', lineHeight: '1.6' }}>
                      {e.content?.substring(0, 120)}
                      {e.content?.length > 120 ? '...' : ''}
                    </p>
                    {isStaff && user.id === e.user_id && (
                      <button className="secondary" onClick={() => del(e.id)}
                        style={{ marginTop: '10px', color: '#dc3545', fontSize: '12px' }}>
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ==================== ALL NEWS (FULL LIST) ==================== */}
        {newsOnly.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ color: '#102a43', fontSize: '24px', marginBottom: '20px' }}>
              All News ({newsOnly.length})
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {newsOnly.map(n => (
                <article key={n.id} id={`news-${n.id}`} style={{
                  background: 'white',
                  border: '1px solid #dbe4ec',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  {n.image_url && (
                    <img src={n.image_url} alt={n.title}
                      style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  )}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <small style={{ color: '#66788a' }}>
                      {n.category} • {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Today'}
                    </small>
                    <h3 style={{ margin: '5px 0 10px', color: '#102a43', fontSize: '18px' }}>{n.title}</h3>
                    <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {n.content}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                      Posted by {n.uploaded_by}
                    </p>
                    {isStaff && user.id === n.user_id && (
                      <button className="secondary" onClick={() => del(n.id)}
                        style={{ marginTop: '8px', color: '#dc3545', fontSize: '12px' }}>
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ==================== EMPTY STATE ==================== */}
        {newsItems.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#f8f9fa', borderRadius: '12px'
          }}>
            <Newspaper size={52} color="#1769aa" />
            <h3 style={{ color: '#102a43', marginTop: '15px' }}>No News Yet</h3>
            <p style={{ color: '#66788a' }}>
              {isStaff ? 'Click "Create New Post" to add the first post.' : 'Check back soon.'}
            </p>
          </div>
        )}

      </section>
    </main>
  );
}
// ============================================
// FORCE PASSWORD CHANGE
// ============================================
function ForcePasswordChange({ meta, onChanged, onLogout }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const defaultPw = meta?.role === 'staff' ? 'staff123' : 'student123';

  const submit = async () => {
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword === defaultPw) { setError('Choose a password different from the default.'); return; }

    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);

    if (err) { setError(err.message); return; }
    await onChanged();
    alert('✅ Password changed. Welcome!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #102a43, #1769aa)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '14px',
        padding: '35px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <ShieldCheck size={52} color="#e1b84b" />
          <h2 style={{ color: '#102a43', margin: '10px 0 5px' }}>🔒 Change Your Default Password</h2>
          <p style={{ color: '#66788a', fontSize: '14px', margin: 0 }}>
            You are logged in as <strong>{meta?.name}</strong> ({meta?.email || meta?.username}).
          </p>
        </div>

        <p style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          ⚠️ You must change your default password before using the portal.
        </p>

        {error && (
          <div style={{
            background: '#f8d7da', color: '#721c24',
            padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <label style={{ fontWeight: '600', fontSize: '14px' }}>New Password (min. 6 characters)</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          style={{ width: '100%', padding: '10px', margin: '5px 0 12px', border: '1px solid #ccc', borderRadius: '8px' }}
        />

        <label style={{ fontWeight: '600', fontSize: '14px' }}>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          onKeyPress={e => e.key === 'Enter' && submit()}
          style={{ width: '100%', padding: '10px', margin: '5px 0 18px', border: '1px solid #ccc', borderRadius: '8px' }}
        />

        <button
          className="primary full"
          onClick={submit}
          disabled={busy || !newPassword || !confirmPassword}
          style={{ padding: '12px', width: '100%', marginBottom: '10px' }}
        >
          {busy ? 'Saving...' : 'Change Password & Continue'}
        </button>

        <button
          className="secondary full"
          onClick={onLogout}
          style={{ padding: '12px', width: '100%' }}
        >
          Cancel (Log out)
        </button>
      </div>
    </div>
  );
}
// ============================================
// RENDER
// ============================================
function AppRoot(){ return <App/>; }
createRoot(document.getElementById("root")).render(<AppRoot/>);