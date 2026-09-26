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
  "Communicative English Language Skills I": "Develops foundational English communication skills for academic and professional contexts, focusing on reading, writing, speaking, and listening comprehension.",
  "General Physics": "Introduces the fundamental principles of physics, including mechanics, thermodynamics, waves, electricity, and magnetism, with applications in geological sciences.",
  "General Psychology": "Explores the basic concepts of human behavior, cognition, perception, learning, memory, motivation, and personality, with emphasis on psychological principles in everyday life.",
  "History of Ethiopia and the Horn": "Examines the historical evolution, political developments, cultural heritage, and socio-economic transformations of Ethiopia and the Horn of Africa from ancient times to the present.",
  "Logic and Critical Thinking": "Develops skills in logical reasoning, argument analysis, critical thinking, problem-solving, and decision-making, with applications in scientific inquiry and everyday life.",
  "Mathematics for Natural Sciences": "Covers mathematical concepts essential for natural sciences, including algebra, functions, calculus, trigonometry, and statistical methods for scientific applications.",
  "Geography of Ethiopia and the Horn": "Explores the physical, human, environmental, and regional geography of Ethiopia and the Horn of Africa, including landforms, climate, population, and economic activities.",
  "Physical Fitness": "Promotes physical health, wellness, fitness, and motor skills through structured physical activities, exercise programs, and health education.",
  "Moral and Civic Education": "Examines ethical principles, civic responsibilities, social values, human rights, democracy, and good governance, fostering responsible citizenship and moral development.",
  "Communicative English Language Skills II": "Builds advanced communication skills in English, including academic writing, presentation skills, technical communication, and professional correspondence.",
  "Social Anthropology": "Introduces the study of human societies, cultures, social structures, traditions, beliefs, and cultural diversity, emphasizing anthropological perspectives and methods.",
  "General Biology": "Covers the fundamental concepts of biology, including cell structure, genetics, evolution, ecology, biodiversity, and physiological processes, with relevance to earth and environmental sciences.",
  "General Chemistry": "Explores the basic principles of chemistry, including atomic structure, chemical bonding, reactions, stoichiometry, thermodynamics, and chemical equilibrium, with applications in geosciences.",
  "Introduction to Emerging Technologies": "Examines emerging technologies including artificial intelligence, blockchain, IoT, cloud computing, and their applications, impacts, and ethical considerations across various sectors.",
  "Inclusiveness": "Addresses the principles of social inclusion, equity, diversity, and accessibility, exploring strategies for creating inclusive environments for people with disabilities and diverse backgrounds.",
  "Introduction to Economics": "Introduces the fundamental concepts of microeconomics and macroeconomics, including supply and demand, market structures, national income, inflation, unemployment, and economic policy.",
  "Global Trends": "Analyzes contemporary global issues, trends, and challenges including globalization, climate change, migration, technology, security, development, and international cooperation.",
  "General Geology": "Introduces the fundamental concepts of geology, including the Earth's origin, structure, composition, geological materials, internal and external processes, plate tectonics, geological time, minerals, rocks, fossils, and basic geological hazards.",
  "Paleontology": "Introduces fossils, fossilization processes, major groups of ancient organisms, and their distribution through geological time. Develops knowledge of fossil identification, evolution, extinction, paleoecology, and biostratigraphy.",
  "Practical Paleontology": "Provides hands-on training in identification, classification, description, and interpretation of fossils using specimens, photographs, and geological samples.",
  "Crystallography and Mineral Optics": "Introduces geometric principles of crystal structures, crystal symmetry, crystallographic systems, and the optical properties of minerals, including interaction with polarized light.",
  "Practical Crystallography and Mineral Optics": "Provides practical training in crystal identification, crystallographic measurements, and microscopic examination of minerals using a polarizing microscope.",
  "Mathematics for Geologists": "Applies mathematical concepts and techniques to geological problems, including statistics, calculus, differential equations, and data analysis methods used in geological research.",
  "Geomorphology": "Examines the origin, evolution, and characteristics of landforms produced by geological, climatic, tectonic, and surface processes, with emphasis on interpreting landforms and their environmental significance.",
  "Stratigraphy and Earth History": "Explores the principles of stratigraphy and the geological history of the Earth through rock sequences, geological time, correlation, unconformities, sedimentary environments, and biostratigraphy.",
  "Mineralogy": "Studies the composition, structure, physical and chemical properties, classification, occurrence, and formation of minerals, emphasizing major mineral groups and identification techniques.",
  "Practical Mineralogy": "Develops practical skills for identifying and describing minerals using their physical, chemical, and optical properties.",
  "Structural Geology": "Examines the deformation of rocks and the structures produced by tectonic forces, including folds, faults, joints, foliations, lineations, and shear zones.",
  "Practical Structural Geology": "Provides practical training in measuring, plotting, analyzing, and interpreting geological structures using maps, compass-clinometers, and stereographic projections.",
  "Tectonics": "Studies the large-scale processes responsible for the formation and deformation of the Earth's crust and lithosphere, including plate tectonics, continental drift, mountain building, and rifting.",
  "Sedimentary Petrology": "Examines the origin, classification, composition, textures, structures, and diagenesis of sedimentary rocks, focusing on sediment production, transportation, deposition, and interpretation.",
  "Practical Sedimentary Petrology": "Develops practical skills in identifying, classifying, describing, and interpreting sedimentary rocks using hand specimens and thin sections.",
  "Physical Chemistry": "Explores the principles of physical chemistry relevant to geological processes, including thermodynamics, kinetics, phase equilibria, and chemical reactions in geological systems.",
  "Geological Mapping Techniques and Report Writing": "Introduces principles and techniques of geological field mapping, including observation, measurement, sampling, map preparation, and scientific report writing.",
  "Introduction to Computer Science": "Introduces the fundamentals of computer science, programming, algorithms, data structures, and computational thinking with applications in geological data processing.",
  "Remote Sensing and GIS": "Introduces remote sensing technologies and Geographic Information Systems for acquiring, processing, analyzing, and presenting spatial geological information.",
  "Statistics for Geologists": "Covers statistical methods and data analysis techniques used in geology, including descriptive statistics, probability, hypothesis testing, regression, and spatial statistics.",
  "Igneous Petrology": "Studies the origin, composition, classification, textures, structures, and evolution of igneous rocks and magmas, including magma generation, crystallization, and differentiation.",
  "Practical Igneous Petrology": "Provides hands-on training in identifying and interpreting igneous rocks using hand specimens and thin sections.",
  "Mapping Sedimentary Terrain": "Provides field-based training in geological mapping of areas dominated by sedimentary rocks, including stratigraphic section measurement and map preparation.",
  "Geochemistry": "Studies the distribution, abundance, movement, and behavior of chemical elements and isotopes within the Earth, with applications in petrology, mineral exploration, and environmental studies.",
  "Mapping Igneous Terrain": "Focuses on geological field mapping in regions dominated by igneous rocks, including identification of intrusive and volcanic units and structural interpretation.",
  "Geophysics": "Introduces the physical principles and methods used to investigate the Earth's subsurface, including gravity, magnetic, electrical, and seismic methods.",
  "Principles of Hydrogeology": "Introduces the fundamental principles governing the occurrence, movement, recharge, discharge, and quality of groundwater.",
  "Fundamentals of Soil and Rock Mechanics": "Introduces the engineering properties and mechanical behavior of soils and rocks under natural and applied loading conditions.",
  "Petroleum and Coal Geology": "Examines the geological origin, occurrence, accumulation, exploration, and development of petroleum and coal resources.",
  "Metamorphic Petrology": "Examines the mineralogical, textural, and chemical changes that occur in rocks under changing temperature, pressure, and fluid conditions.",
  "Practical Metamorphic Petrology": "Develops practical skills for identifying, classifying, and interpreting metamorphic rocks using hand specimens and thin sections.",
  "Exploration Geophysics": "Focuses on the application of geophysical techniques to locate and characterize subsurface geological resources and structures.",
  "Engineering Geology": "Applies geological principles to engineering design, construction, and infrastructure development, including dams, roads, tunnels, foundations, and slopes.",
  "Economic Geology": "Studies geological processes responsible for the formation, distribution, characteristics, and economic significance of mineral deposits.",
  "Practical Economic Geology": "Provides practical training in identification, description, and interpretation of ore minerals, alteration, and mineral associations.",
  "Geology and Geologic Resources of Ethiopia": "Provides an overview of Ethiopia's geological evolution, major rock units, tectonic history, mineral resources, groundwater resources, and geological hazards.",
  "Mapping Metamorphic Terrain": "Provides practical field training in mapping regions characterized by metamorphic rocks and complex geological structures.",
  "Research Methods in Geosciences": "Introduces the principles and procedures involved in conducting scientific research in the geosciences, including research design, data analysis, and scientific writing.",
  "Internship": "Provides students with supervised practical experience in professional geological environments such as geological surveys, mining companies, and consulting firms.",
  "Elective I": "Allows students to explore specialized topics in geology, mineral exploration, or related fields through focused study from available elective courses offered by the department.",
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
function App(){
  const [page,setPage]=useState("homepage");
  const [mobile,setMobile]=useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const passwordCheckDone = useRef(false);
  const [courses,setCourses]=useState(initialCourses);
  const [user, setUser] = useState(null);
  const [meta, setMeta] = useState(null);
  const [selectedCourse,setSelectedCourse]=useState(null);
  const [search,setSearch]=useState("");
  const [yearFilter,setYearFilter]=useState("all");
  const [semesterFilter,setSemesterFilter]=useState("all");
  const [activeFilter,setActiveFilter]=useState("all");
  const [loginOpen,setLoginOpen]=useState(false);
  const [materials, setMaterials] = useState({});
  const [newsItems, setNewsItems] = useState([]);
  const [publications, setPublications] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadMeta(session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadMeta(session.user.id);
      else { setMeta(null); setProfilePic(null); passwordCheckDone.current = false; }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadMeta = async (uid) => {
    const { data } = await supabase.from('user_metadata').select('*').eq('id', uid).maybeSingle();
    setMeta(data);
  };

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
    if (!meta) {
      setMustChangePassword(false);
      passwordCheckDone.current = false;
      return;
    }
    if (passwordCheckDone.current) return;

    const needsChange = meta.password_changed === false;
    setMustChangePassword(needsChange);
    passwordCheckDone.current = true;
  }, [meta]);

  useEffect(() => {
    if (!user) { setProfilePic(null); return; }
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_pic')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) { console.error('Load profile pic error:', error); return; }
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

  // ============================================
  // SAVE PROFILE PICTURE — fixed with single upsert
  // ============================================
  const saveProfilePic = async (file) => {
    if (!file || !user) { alert('Please log in first.'); return; }

    console.log('[saveProfilePic] Start. User:', user.id, 'File:', file.name, file.size, 'bytes');

    // 1) Upload to Storage
    const res = await uploadToStorage('profiles', file);
    if (!res) {
      alert('Upload failed. Make sure the "profiles" bucket exists and is Public.');
      return;
    }
    console.log('[saveProfilePic] Uploaded URL:', res.url);

    // 2) Upsert into DB — single call
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          user_email: meta?.email || null,
          user_name: meta?.name || null,
          profile_pic: res.url,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[saveProfilePic] DB error:', error);
      alert('Save failed: ' + error.message);
      return;
    }

    console.log('[saveProfilePic] DB upsert succeeded');
    setProfilePic(res.url);
    alert('✅ Profile picture saved!');
  };

  const removeProfilePic = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ profile_pic: null })
      .eq('user_id', user.id);
    if (error) { alert('Could not remove: ' + error.message); return; }
    setProfilePic(null);
  };

  const markPasswordChanged = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('user_metadata')
      .update({ password_changed: true })
      .eq('id', user.id);
    if (error) {
      alert('Could not mark password as changed: ' + error.message);
      return;
    }
    setMeta(m => m ? { ...m, password_changed: true } : m);
    setMustChangePassword(false);
  };

  const activeCourses = courses.filter(c => c.active);
  const filteredCourses = useMemo(() => courses.filter(c => {
    const q = search.toLowerCase();
    return (!q || `${c.code} ${c.title} ${c.instructor}`.toLowerCase().includes(q))
      && (yearFilter === "all" || c.year === Number(yearFilter))
      && (semesterFilter === "all" || c.semester === semesterFilter)
      && (activeFilter === "all" || (activeFilter === "active" ? c.active : !c.active));
  }), [courses, search, yearFilter, semesterFilter, activeFilter]);

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
    setMustChangePassword(false);
    passwordCheckDone.current = false;
    navigate("homepage");
  }

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

      {page==="homepage" && <Homepage navigate={navigate} activeCourses={activeCourses.length} students={42} user={user} meta={meta}/>}
      {page==="about" && <About user={user} meta={meta}/>}
      {page==="academics" && <Academics navigate={navigate} user={user} meta={meta}/>}
      {page==="courses" && <CoursesPage courses={filteredCourses} search={search} setSearch={setSearch} yearFilter={yearFilter} setYearFilter={setYearFilter} semesterFilter={semesterFilter} setSemesterFilter={setSemesterFilter} activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSelectedCourse={setSelectedCourse} meta={meta}/>}
      {page==="staff" && <Staff profilePic={profilePic} saveProfilePic={saveProfilePic} removeProfilePic={removeProfilePic} user={user} meta={meta}/>}
      {page==="research" && <Research publications={publications} setPublications={setPublications} user={user} meta={meta}/>}
      {page==="news" && <News newsItems={newsItems} setNewsItems={setNewsItems} user={user} meta={meta}/>}
      {page==="activities" && <Activities user={user} meta={meta}/>}
      {page==="resources" && <Resources user={user} meta={meta}/>}
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

function Homepage({ navigate, activeCourses, students, user, meta }) {
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
      <section className="section" style={{ marginBottom: '0', paddingBottom: '0' }}>
        <SectionTitle kicker="WELCOME TO DMU GEOLOGY" title="A Center for Geological Education & Research"/>
        <div className="cards four">
          <Feature icon={<GraduationCap/>} title="Academic Programs" text="Explore our BSc geology curriculum." onClick={()=>navigate("academics")}/>
          <Feature icon={<BookOpen/>} title="Courses & Materials" text="Access active courses and resources." onClick={()=>navigate("courses")}/>
          <Feature icon={<Microscope/>} title="Research" text="Discover geological research." onClick={()=>navigate("research")}/>
          <Feature icon={<Users/>} title="Our Students" text="Student services." onClick={()=>navigate("students")}/>
        </div>
      </section>

      <HomeVideo user={user} meta={meta} />
    </main>
  );
}

// ============================================
// HOMEPAGE VIDEO — autoplay, muted, loops
// ============================================
function HomeVideo({ user, meta }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState('');
  const isStaff = meta?.role === 'staff';

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('home_video').select('*').eq('id', 1).maybeSingle();
      if (data) {
        setVideoUrl(data.video_url || '');
        setCaption(data.caption || '');
      }
    })();
  }, []);

  const upload = async (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return alert('Video must be under 50MB.');
    setBusy(true);
    const up = await uploadToStorage('videos', file);
    if (!up) { setBusy(false); return alert('Upload failed. Check the "videos" bucket exists and is Public.'); }

    const { error } = await supabase
      .from('home_video')
      .upsert({ id: 1, video_url: up.url, caption, updated_by: meta?.name }, { onConflict: 'id' });

    setBusy(false);
    if (error) return alert(error.message);
    setVideoUrl(up.url);
    alert('✅ Video uploaded!');
  };

  const saveCaption = async () => {
    const { error } = await supabase
      .from('home_video')
      .upsert({ id: 1, video_url: videoUrl || null, caption, updated_by: meta?.name }, { onConflict: 'id' });
    if (error) return alert(error.message);
    alert('✅ Caption saved!');
  };

  const removeVideo = async () => {
    if (!confirm('Remove video from homepage?')) return;
    await supabase.from('home_video').upsert({ id: 1, video_url: null, caption }, { onConflict: 'id' });
    setVideoUrl('');
  };

  if (!videoUrl && !isStaff) return null;

  return (
    <section style={{ marginTop: '0', paddingTop: '20px', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <SectionTitle
          kicker="OUR DEPARTMENT IN MOTION"
          title="Department of Geology — Highlights"
          text="A glimpse into our classrooms, labs, and field activities."
        />

        <div style={{
          background: 'white',
          border: '1px solid #dbe4ec',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {videoUrl ? (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="auto"
                style={{
                  width: '100%',
                  maxHeight: '520px',
                  borderRadius: '10px',
                  background: '#000',
                  display: 'block',
                  objectFit: 'cover'
                }}
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
              {caption && (
                <p style={{
                  margin: '15px 0 0',
                  textAlign: 'center',
                  color: '#66788a',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  {caption}
                </p>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f8f9fa',
              borderRadius: '10px',
              color: '#66788a'
            }}>
              <PlayCircle size={52} color="#1769aa" />
              <h3 style={{ color: '#102a43', marginTop: '12px' }}>No video yet</h3>
              <p style={{ margin: 0 }}>
                {isStaff ? 'Upload a short video below to display it here.' : 'Check back later.'}
              </p>
            </div>
          )}

          {isStaff && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eef3f6' }}>
              <h4 style={{ color: '#102a43', marginTop: 0 }}>Manage Video</h4>

              <div style={{ display: 'grid', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px' }}>
                    Upload Video (MP4, max 50MB)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => upload(e.target.files[0])}
                    disabled={busy}
                  />
                  {busy && <span style={{ marginLeft: '10px', color: '#66788a' }}>Uploading...</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px' }}>
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Field trip to the Blue Nile Gorge, 2025"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="primary" onClick={saveCaption} style={{ background: '#28a745' }}>
                    💾 Save Caption
                  </button>
                  {videoUrl && (
                    <button className="secondary" onClick={removeVideo} style={{ color: '#dc3545' }}>
                      🗑️ Remove Video
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
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
  const month = now.getMonth() + 1;
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

function About({ user, meta }) {
  const isStaff = meta?.role === 'staff';
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', imageFile: null });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('about_posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
    })();
  }, []);

  const submit = async () => {
    if (!form.title.trim()) return alert('Enter a title.');
    setBusy(true);

    let imageUrl = '';
    if (form.imageFile) {
      const up = await uploadToStorage('news-files', form.imageFile);
      if (up) imageUrl = up.url;
    }

    if (editId) {
      const updates = { title: form.title.trim(), content: form.content.trim() };
      if (imageUrl) updates.image_url = imageUrl;
      const { data, error } = await supabase.from('about_posts').update(updates).eq('id', editId).select();
      setBusy(false);
      if (error) return alert(error.message);
      if (data?.[0]) setPosts(prev => prev.map(p => p.id === editId ? data[0] : p));
    } else {
      const row = {
        title: form.title.trim(),
        content: form.content.trim(),
        image_url: imageUrl,
        uploaded_by: meta?.name,
        user_id: user.id
      };
      const { data, error } = await supabase.from('about_posts').insert([row]).select();
      setBusy(false);
      if (error) return alert(error.message);
      if (data) setPosts(prev => [...data, ...prev]);
    }

    setForm({ title: '', content: '', imageFile: null });
    setEditId(null);
    setShowForm(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('about_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Page title="About the Department" kicker="WHO WE ARE">

      <SectionTitle kicker="DEPARTMENT OVERVIEW" title="Geology at Debre Markos University" />

      <AboutSections isStaff={isStaff} user={user} meta={meta} />

      <div style={{ marginTop: '40px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '10px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#102a43' }}>About Our Department ({posts.length})</h2>
          {isStaff && (
            <button className="primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', content: '', imageFile: null }); }} style={{ background: '#28a745' }}>
              {showForm ? '📕 Close Form' : '📝 Add Post'}
            </button>
          )}
        </div>

        {isStaff && showForm && (
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #dbe4ec' }}>
            <h3 style={{ color: '#102a43', marginBottom: '15px' }}>{editId ? '✏️ Edit Post' : '📝 New Post'}</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. History of the Geology Department"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Content</label>
                <textarea value={form.content} rows="5"
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write about the department..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Photo</label>
                <input type="file" accept="image/*"
                  onChange={e => setForm({ ...form, imageFile: e.target.files[0] })} />
              </div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button className="primary" onClick={submit} disabled={busy} style={{ background: '#28a745' }}>
                {busy ? 'Saving...' : editId ? '✅ Update' : '✅ Publish'}
              </button>
              <button className="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <p style={{ color: '#66788a', textAlign: 'center', padding: '30px', background: '#f8f9fa', borderRadius: '12px' }}>
            {isStaff ? 'Click "Add Post" to add the first post.' : 'No posts yet.'}
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {posts.map(p => (
              <article key={p.id} style={{
                background: 'white', border: '1px solid #dbe4ec',
                borderRadius: '12px', overflow: 'hidden', display: 'flex', flexWrap: 'wrap'
              }}>
                {p.image_url && (
                  <div style={{
                    flex: '0 0 320px',
                    maxWidth: '320px',
                    minHeight: '200px',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    background: '#f0f4f8',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={p.image_url}
                      alt={p.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </div>
                )}
                <div style={{ flex: 1, padding: '22px', minWidth: '260px' }}>
                  <h3 style={{ margin: '0 0 10px', color: '#102a43' }}>{p.title}</h3>
                  <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{p.content}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
                    Posted by {p.uploaded_by} • {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                  </p>
                  {isStaff && user.id === p.user_id && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button className="secondary"
                        onClick={() => { setEditId(p.id); setForm({ title: p.title, content: p.content || '', imageFile: null }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{ color: '#1769aa', borderColor: '#1769aa' }}>✏️ Edit</button>
                      <button className="secondary" onClick={() => del(p.id)} style={{ color: '#dc3545' }}>🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

    </Page>
  );
}

function AboutSections({ isStaff, user, meta }) {
  const [sections, setSections] = useState({
    mission: { title: 'Mission', content: '' },
    vision:  { title: 'Vision',  content: '' },
    goal:    { title: 'Goal',    content: '' }
  });
  const [editKey, setEditKey] = useState(null);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('about_sections').select('*');
      if (data) {
        setSections(prev => {
          const next = { ...prev };
          data.forEach(row => {
            next[row.section_key] = {
              title: row.title || '',
              content: row.content || ''
            };
          });
          return next;
        });
      }
    })();
  }, []);

  const startEdit = (key) => {
    setEditKey(key);
    setDraft({
      title: sections[key].title,
      content: sections[key].content
    });
  };

  const cancelEdit = () => { setEditKey(null); setDraft({ title: '', content: '' }); };

  const saveEdit = async () => {
    if (!draft.title.trim()) return alert('Please enter a title.');
    setBusy(true);

    const { error } = await supabase
      .from('about_sections')
      .upsert(
        {
          section_key: editKey,
          title: draft.title.trim(),
          content: draft.content.trim(),
          updated_by: meta?.name
        },
        { onConflict: 'section_key' }
      );

    setBusy(false);
    if (error) return alert(error.message);

    setSections(prev => ({
      ...prev,
      [editKey]: {
        title: draft.title.trim(),
        content: draft.content.trim()
      }
    }));
    cancelEdit();
    alert('✅ Saved!');
  };

  const renderCard = (key) => {
    const s = sections[key];
    const isEditing = editKey === key;

    return (
      <article className="infoBox" key={key} style={{ position: 'relative' }}>
        {isEditing ? (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px' }}>
                Section Title
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={e => setDraft({ ...draft, title: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px' }}>
                Content
              </label>
              <textarea
                rows="6"
                value={draft.content}
                onChange={e => setDraft({ ...draft, content: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="primary" onClick={saveEdit} disabled={busy} style={{ background: '#28a745' }}>
                {busy ? 'Saving...' : '✅ Save'}
              </button>
              <button className="secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ margin: '0 0 8px' }}>{s.title}</h3>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{s.content}</p>
            {isStaff && (
              <button
                onClick={() => startEdit(key)}
                style={{
                  marginTop: '12px',
                  background: 'white',
                  border: '1px solid #1769aa',
                  color: '#1769aa',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ✏️ Edit
              </button>
            )}
          </>
        )}
      </article>
    );
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '20px',
        marginBottom: '30px'
      }}
    >
      {renderCard('mission')}
      {renderCard('vision')}
      {renderCard('goal')}
    </div>
  );
}

function Activities({ user, meta }) {
  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Field Trip',
    date: '', location: '', imageFile: null,
  });

  const isStaff = meta?.role === 'staff';

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setActivities(data);
    })();
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'Field Trip', date: '', location: '', imageFile: null });
    setEditingId(null);
  };

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
    resetForm();
    setShowForm(false);
    alert('✅ Activity posted!');
  };

  const startEdit = (activity) => {
    setEditingId(activity.id);
    setForm({
      title: activity.title || '',
      description: activity.description || '',
      category: activity.category || 'Field Trip',
      date: activity.activity_date || '',
      location: activity.location || '',
      imageFile: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!form.title.trim()) return alert('Please enter a title.');

    setBusy(true);
    let newImageUrl = null;
    if (form.imageFile) {
      const up = await uploadToStorage('activity-images', form.imageFile);
      if (up) newImageUrl = up.url;
    }

    const updates = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      activity_date: form.date,
      location: form.location.trim(),
    };
    if (newImageUrl) updates.image_url = newImageUrl;

    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', editingId)
      .select();

    setBusy(false);
    if (error) return alert(error.message);

    if (data && data[0]) {
      setActivities(prev => prev.map(a => a.id === editingId ? data[0] : a));
    }
    resetForm();
    setShowForm(false);
    alert('✅ Activity updated!');
  };

  const del = async (id) => {
    if (!confirm('Delete this activity?')) return;
    await supabase.from('activities').delete().eq('id', id);
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const staticCategories = [
    { label: 'Field Trips',        icon: '🚌', color: '#1769aa' },
    { label: 'Seminars',           icon: '🎤', color: '#6f42c1' },
    { label: 'Lab Training',       icon: '🔬', color: '#28a745' },
    { label: 'Community Service',  icon: '🤝', color: '#fd7e14' },
    { label: 'Workshops',          icon: '🛠️', color: '#17a2b8' },
    { label: 'Industrial Visits',  icon: '🏭', color: '#e83e8c' },
  ];

  return (
    <Page title="Department Activities" kicker="ENGAGEMENT">

      <div style={{
        background: 'linear-gradient(135deg, #102a43 0%, #1769aa 100%)',
        color: 'white',
        padding: '30px 35px',
        borderRadius: '16px',
        marginBottom: '35px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          fontSize: '180px', opacity: 0.08, transform: 'rotate(15deg)',
          pointerEvents: 'none'
        }}>🌍</div>
        <div style={{ position: 'relative' }}>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '12px', letterSpacing: '2px', fontWeight: '700' }}>
            DEPARTMENT OF GEOLOGY
          </p>
          <h2 style={{ margin: '8px 0 6px', fontSize: '26px', fontWeight: '700' }}>
            Field Trips, Seminars &amp; Engagement
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '14px', maxWidth: '600px', lineHeight: '1.6' }}>
            A living record of our department's activities — field work, laboratory training,
            workshops, and community engagement.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '45px'
      }}>
        {staticCategories.map((c, i) => (
          <div key={c.label} style={{
            background: 'white',
            border: '1px solid #dbe4ec',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s'
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '4px', height: '100%',
              background: c.color
            }} />
            <div style={{
              fontSize: '38px',
              fontWeight: '800',
              color: '#f0f4f8',
              lineHeight: 1,
              marginBottom: '8px'
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{c.icon}</div>
            <h3 style={{ margin: '0 0 6px', color: '#102a43', fontSize: '16px' }}>
              {c.label}
            </h3>
            <p style={{ color: '#66788a', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
              Department activity, training and academic engagement.
            </p>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '25px',
        paddingBottom: '18px',
        borderBottom: '2px solid #dbe4ec'
      }}>
        <div>
          <div style={{
            color: '#c99a2e', fontSize: '11px', fontWeight: '800',
            letterSpacing: '2px', marginBottom: '6px'
          }}>
            RECENT ACTIVITIES
          </div>
          <h2 style={{ margin: 0, color: '#102a43', fontSize: '24px' }}>
            Department Activities
            <span style={{
              background: '#1769aa', color: 'white',
              fontSize: '14px', fontWeight: '600',
              padding: '2px 12px', borderRadius: '20px',
              marginLeft: '12px', verticalAlign: 'middle'
            }}>{activities.length}</span>
          </h2>
        </div>

        {isStaff && (
          <button
            className="primary"
            onClick={() => {
              if (showForm && editingId) resetForm();
              setShowForm(!showForm);
            }}
            style={{ background: '#28a745', padding: '12px 24px', fontSize: '14px' }}
          >
            {showForm ? '📕 Close Form' : '📝 Post New Activity'}
          </button>
        )}
      </div>

      {isStaff && showForm && (
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
          padding: '26px',
          borderRadius: '14px',
          marginBottom: '30px',
          border: editingId ? '2px solid #1769aa' : '1px solid #dbe4ec',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#102a43', marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {editingId ? '✏️ Edit Activity' : '📝 New Activity'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Title *</label>
              <input
                type="text" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Geological Field Trip to the Blue Nile Gorge"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={inputStyle}
              >
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
              <label style={labelStyle}>Date</label>
              <input
                type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Location</label>
              <input
                type="text" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Blue Nile Gorge, Dejen"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description} rows="4"
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What happened? Who attended? Any key outcomes?"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>
                Photo {editingId ? '(leave empty to keep current)' : '*'}
              </label>
              <input
                type="file" accept="image/*"
                onChange={e => setForm({ ...form, imageFile: e.target.files[0] })}
                style={{ ...inputStyle, padding: '9px' }}
              />
              {editingId && (
                <p style={{ fontSize: '12px', color: '#66788a', marginTop: '6px' }}>
                  Uploading a new image will replace the current one.
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button
              className="primary"
              onClick={editingId ? saveEdit : submit}
              disabled={busy}
              style={{ background: '#28a745', padding: '11px 26px' }}
            >
              {busy ? 'Saving...' : editingId ? '✅ Update Activity' : '✅ Publish Activity'}
            </button>
            <button
              className="secondary"
              onClick={() => { resetForm(); setShowForm(false); }}
              style={{ padding: '11px 26px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 30px',
          background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
          borderRadius: '16px',
          border: '1px dashed #dbe4ec'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '10px' }}>📸</div>
          <h3 style={{ color: '#102a43', margin: '0 0 8px' }}>No Activities Posted Yet</h3>
          <p style={{ color: '#66788a', margin: 0, fontSize: '14px' }}>
            {isStaff
              ? 'Click "Post New Activity" above to share a field trip, seminar, or workshop with photos.'
              : 'Check back later for upcoming and past department activities.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '22px' }}>
          {activities.map(a => (
            <article key={a.id} style={{
              background: 'white',
              border: '1px solid #dbe4ec',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              transition: 'box-shadow 0.2s'
            }}>
              {a.image_url ? (
                <img
                  src={a.image_url}
                  alt={a.title}
                  style={{
                    width: '340px',
                    minHeight: '240px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    background: '#f0f4f8'
                  }}
                />
              ) : (
                <div style={{
                  width: '340px',
                  minHeight: '240px',
                  background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  fontSize: '64px',
                  flexShrink: 0
                }}>📷</div>
              )}

              <div style={{
                flex: 1,
                minWidth: '300px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  display: 'flex', gap: '8px', alignItems: 'center',
                  flexWrap: 'wrap', marginBottom: '12px'
                }}>
                  <span style={{
                    background: '#1769aa', color: 'white',
                    padding: '4px 12px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '700',
                    letterSpacing: '0.5px', textTransform: 'uppercase'
                  }}>
                    {a.category}
                  </span>
                  {a.activity_date && (
                    <span style={{
                      background: '#eaf4fb', color: '#1769aa',
                      padding: '4px 12px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: '600'
                    }}>
                      📅 {a.activity_date}
                    </span>
                  )}
                </div>

                <h3 style={{
                  margin: '0 0 10px',
                  color: '#102a43',
                  fontSize: '20px',
                  lineHeight: '1.35',
                  fontWeight: '700'
                }}>
                  {a.title}
                </h3>

                {a.location && (
                  <p style={{
                    margin: '0 0 12px',
                    color: '#66788a',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📍 {a.location}
                  </p>
                )}

                {a.description && (
                  <p style={{
                    margin: '0 0 16px',
                    color: '#444',
                    fontSize: '14px',
                    lineHeight: '1.7'
                  }}>
                    {a.description}
                  </p>
                )}

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '14px',
                  borderTop: '1px solid #f0f4f8',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
                      color: 'white',
                      display: 'grid', placeItems: 'center',
                      fontWeight: 'bold', fontSize: '14px'
                    }}>
                      {(a.uploaded_by || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#102a43', fontWeight: '600' }}>
                        {a.uploaded_by}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>

                  {isStaff && user.id === a.user_id && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => startEdit(a)}
                        style={{
                          background: 'white',
                          border: '1px solid #1769aa',
                          color: '#1769aa',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => del(a.id)}
                        style={{
                          background: 'white',
                          border: '1px solid #dc3545',
                          color: '#dc3545',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    </Page>
  );
}

const labelStyle = {
  display: 'block',
  fontWeight: '600',
  marginBottom: '6px',
  fontSize: '13px',
  color: '#102a43'
};
function Resources({ user, meta }) {
  const [tab, setTab] = useState('labs');
  const [labs, setLabs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [offices, setOffices] = useState([]);
  const [books, setBooks] = useState([]);
  const [maps, setMaps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTable, setEditingTable] = useState(null);

  const isStaff = meta?.role === 'staff';

  const [labForm, setLabForm] = useState({
    name: '', description: '', capacity: '', location: '', imageFile: null
  });
  const [equipForm, setEquipForm] = useState({
    name: '', category: 'Microscope', custom_category: '', model: '', serial_number: '',
    quantity: 1, condition: 'Working', lab_name: '', specifications: '', description: '', imageFile: null
  });
  const [officeForm, setOfficeForm] = useState({
    staff_name: '', room_number: '', building: '', phone: '', email: '', office_hours: '', imageFile: null
  });
  const [bookForm, setBookForm] = useState({
    title: '', author: '', edition: '', year: '', publisher: '', isbn: '',
    course_code: '', category: 'Reference', description: '', link: '', coverFile: null
  });
  const [mapForm, setMapForm] = useState({
    title: '', map_type: 'Geological Map', scale: '', region: '', year: '',
    publisher: '', description: '', imageFile: null, file: null
  });

  useEffect(() => {
    (async () => {
      const { data: l } = await supabase.from('lab_rooms').select('*').order('created_at', { ascending: false });
      const { data: e } = await supabase.from('lab_equipment').select('*').order('created_at', { ascending: false });
      const { data: o } = await supabase.from('staff_offices').select('*').order('staff_name');
      const { data: b } = await supabase.from('reference_books').select('*').order('title');
      const { data: m } = await supabase.from('maps').select('*').order('created_at', { ascending: false });
      setLabs(l || []);
      setEquipment(e || []);
      setOffices(o || []);
      setBooks(b || []);
      setMaps(m || []);
    })();
  }, []);

  useEffect(() => { setShowForm(false); setEditingId(null); setEditingTable(null); }, [tab]);

  const resetForm = () => {
    setEditingId(null);
    setEditingTable(null);
    setShowForm(false);
    setLabForm({ name: '', description: '', capacity: '', location: '', imageFile: null });
    setEquipForm({ name: '', category: 'Microscope', custom_category: '', model: '', serial_number: '', quantity: 1, condition: 'Working', lab_name: '', specifications: '', description: '', imageFile: null });
    setOfficeForm({ staff_name: '', room_number: '', building: '', phone: '', email: '', office_hours: '', imageFile: null });
    setBookForm({ title: '', author: '', edition: '', year: '', publisher: '', isbn: '', course_code: '', category: 'Reference', description: '', link: '', coverFile: null });
    setMapForm({ title: '', map_type: 'Geological Map', scale: '', region: '', year: '', publisher: '', description: '', imageFile: null, file: null });
  };

  const submitLab = async () => {
    if (!labForm.name.trim()) return alert('Lab name required.');
    setBusy(true);
    let imageUrl = null;
    if (labForm.imageFile) {
      const up = await uploadToStorage('resources', labForm.imageFile);
      if (up) imageUrl = up.url;
    }
    const payload = {
      name: labForm.name.trim(),
      description: labForm.description.trim(),
      capacity: labForm.capacity.trim(),
      location: labForm.location.trim(),
    };
    if (imageUrl) payload.image_url = imageUrl;

    if (editingId && editingTable === 'lab_rooms') {
      payload.uploaded_by = meta?.name;
      const { data, error } = await supabase.from('lab_rooms').update(payload).eq('id', editingId).select();
      setBusy(false);
      if (error) return alert(error.message);
      setLabs(prev => prev.map(x => x.id === editingId ? data[0] : x));
      alert('✅ Lab updated!');
    } else {
      if (!imageUrl) { setBusy(false); return alert('Photo required.'); }
      payload.image_url = imageUrl;
      payload.uploaded_by = meta?.name;
      payload.user_id = user.id;
      const { data, error } = await supabase.from('lab_rooms').insert([payload]).select();
      setBusy(false);
      if (error) return alert(error.message);
      setLabs(prev => [...(data || []), ...prev]);
      alert('✅ Lab room added!');
    }
    resetForm();
  };

  const submitEquip = async () => {
    if (!equipForm.name.trim()) return alert('Equipment name required.');
    if (equipForm.category === 'Other' && !equipForm.custom_category.trim()) {
      return alert('Please type the new category name.');
    }
    const finalCategory = equipForm.category === 'Other' ? equipForm.custom_category.trim() : equipForm.category;

    setBusy(true);
    let imageUrl = null;
    if (equipForm.imageFile) {
      const up = await uploadToStorage('resources', equipForm.imageFile);
      if (up) imageUrl = up.url;
    }
    const payload = {
      name: equipForm.name.trim(),
      category: finalCategory,
      model: equipForm.model.trim(),
      serial_number: equipForm.serial_number.trim(),
      quantity: parseInt(equipForm.quantity) || 1,
      condition: equipForm.condition,
      lab_name: equipForm.lab_name.trim(),
      specifications: equipForm.specifications.trim(),
      description: equipForm.description.trim(),
    };
    if (imageUrl) payload.image_url = imageUrl;

    if (editingId && editingTable === 'lab_equipment') {
      payload.uploaded_by = meta?.name;
      const { data, error } = await supabase.from('lab_equipment').update(payload).eq('id', editingId).select();
      setBusy(false);
      if (error) return alert(error.message);
      setEquipment(prev => prev.map(x => x.id === editingId ? data[0] : x));
      alert('✅ Equipment updated!');
    } else {
      if (!imageUrl) { setBusy(false); return alert('Photo required.'); }
      payload.image_url = imageUrl;
      payload.uploaded_by = meta?.name;
      payload.user_id = user.id;
      const { data, error } = await supabase.from('lab_equipment').insert([payload]).select();
      setBusy(false);
      if (error) return alert(error.message);
      setEquipment(prev => [...(data || []), ...prev]);
      alert('✅ Equipment added!');
    }
    resetForm();
  };

  const submitOffice = async () => {
    if (!officeForm.staff_name.trim()) return alert('Staff name required.');
    setBusy(true);
    let imageUrl = null;
    if (officeForm.imageFile) {
      const up = await uploadToStorage('resources', officeForm.imageFile);
      if (up) imageUrl = up.url;
    }
    const payload = {
      staff_name: officeForm.staff_name.trim(),
      room_number: officeForm.room_number.trim(),
      building: officeForm.building.trim(),
      phone: officeForm.phone.trim(),
      email: officeForm.email.trim(),
      office_hours: officeForm.office_hours.trim(),
    };
    if (imageUrl) payload.image_url = imageUrl;

    if (editingId && editingTable === 'staff_offices') {
      payload.uploaded_by = meta?.name;
      const { data, error } = await supabase.from('staff_offices').update(payload).eq('id', editingId).select();
      setBusy(false);
      if (error) return alert(error.message);
      setOffices(prev => prev.map(x => x.id === editingId ? data[0] : x));
      alert('✅ Office updated!');
    } else {
      payload.image_url = imageUrl || '';
      payload.uploaded_by = meta?.name;
      payload.user_id = user.id;
      const { data, error } = await supabase.from('staff_offices').insert([payload]).select();
      setBusy(false);
      if (error) return alert(error.message);
      setOffices(prev => [...(data || []), ...prev]);
      alert('✅ Office added!');
    }
    resetForm();
  };

  const submitBook = async () => {
    if (!bookForm.title.trim()) return alert('Book title required.');
    setBusy(true);
    let coverUrl = null;
    if (bookForm.coverFile) {
      const up = await uploadToStorage('resources', bookForm.coverFile);
      if (up) coverUrl = up.url;
    }
    const payload = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      edition: bookForm.edition.trim(),
      year: bookForm.year.trim(),
      publisher: bookForm.publisher.trim(),
      isbn: bookForm.isbn.trim(),
      course_code: bookForm.course_code.trim(),
      category: bookForm.category,
      description: bookForm.description.trim(),
      link: bookForm.link.trim(),
    };
    if (coverUrl) payload.cover_url = coverUrl;

    if (editingId && editingTable === 'reference_books') {
      payload.uploaded_by = meta?.name;
      const { data, error } = await supabase.from('reference_books').update(payload).eq('id', editingId).select();
      setBusy(false);
      if (error) return alert(error.message);
      setBooks(prev => prev.map(x => x.id === editingId ? data[0] : x));
      alert('✅ Book updated!');
    } else {
      payload.cover_url = coverUrl || '';
      payload.uploaded_by = meta?.name;
      payload.user_id = user.id;
      const { data, error } = await supabase.from('reference_books').insert([payload]).select();
      setBusy(false);
      if (error) return alert(error.message);
      setBooks(prev => [...(data || []), ...prev]);
      alert('✅ Book added!');
    }
    resetForm();
  };

  const submitMap = async () => {
    if (!mapForm.title.trim()) return alert('Map title required.');
    setBusy(true);
    let imageUrl = null, fileUrl = null;
    if (mapForm.imageFile) {
      const up = await uploadToStorage('resources', mapForm.imageFile);
      if (up) imageUrl = up.url;
    }
    if (mapForm.file) {
      const up = await uploadToStorage('resources', mapForm.file);
      if (up) fileUrl = up.url;
    }
    const payload = {
      title: mapForm.title.trim(),
      map_type: mapForm.map_type,
      scale: mapForm.scale.trim(),
      region: mapForm.region.trim(),
      year: mapForm.year.trim(),
      publisher: mapForm.publisher.trim(),
      description: mapForm.description.trim(),
    };
    if (imageUrl) payload.image_url = imageUrl;
    if (fileUrl) payload.file_url = fileUrl;

    if (editingId && editingTable === 'maps') {
      payload.uploaded_by = meta?.name;
      const { data, error } = await supabase.from('maps').update(payload).eq('id', editingId).select();
      setBusy(false);
      if (error) return alert(error.message);
      setMaps(prev => prev.map(x => x.id === editingId ? data[0] : x));
      alert('✅ Map updated!');
    } else {
      if (!imageUrl && !fileUrl) { setBusy(false); return alert('Please upload an image or file.'); }
      payload.image_url = imageUrl || '';
      payload.file_url = fileUrl || '';
      payload.uploaded_by = meta?.name;
      payload.user_id = user.id;
      const { data, error } = await supabase.from('maps').insert([payload]).select();
      setBusy(false);
      if (error) return alert(error.message);
      setMaps(prev => [...(data || []), ...prev]);
      alert('✅ Map added!');
    }
    resetForm();
  };

  const delItem = async (table, id, setter) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from(table).delete().eq('id', id);
    setter(prev => prev.filter(x => x.id !== id));
  };

  const startEditLab = (lab) => {
    setEditingId(lab.id); setEditingTable('lab_rooms');
    setLabForm({
      name: lab.name || '', description: lab.description || '',
      capacity: lab.capacity || '', location: lab.location || '', imageFile: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditEquip = (eq) => {
    setEditingId(eq.id); setEditingTable('lab_equipment');
    setEquipForm({
      name: eq.name || '', category: eq.category || 'Microscope', custom_category: '',
      model: eq.model || '', serial_number: eq.serial_number || '',
      quantity: eq.quantity || 1, condition: eq.condition || 'Working',
      lab_name: eq.lab_name || '', specifications: eq.specifications || '',
      description: eq.description || '', imageFile: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditOffice = (o) => {
    setEditingId(o.id); setEditingTable('staff_offices');
    setOfficeForm({
      staff_name: o.staff_name || '', room_number: o.room_number || '',
      building: o.building || '', phone: o.phone || '',
      email: o.email || '', office_hours: o.office_hours || '', imageFile: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditBook = (b) => {
    setEditingId(b.id); setEditingTable('reference_books');
    setBookForm({
      title: b.title || '', author: b.author || '', edition: b.edition || '',
      year: b.year || '', publisher: b.publisher || '', isbn: b.isbn || '',
      course_code: b.course_code || '', category: b.category || 'Reference',
      description: b.description || '', link: b.link || '', coverFile: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditMap = (m) => {
    setEditingId(m.id); setEditingTable('maps');
    setMapForm({
      title: m.title || '', map_type: m.map_type || 'Geological Map',
      scale: m.scale || '', region: m.region || '', year: m.year || '',
      publisher: m.publisher || '', description: m.description || '',
      imageFile: null, file: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const condColor = (c) => ({
    'Working':       { bg: '#d4edda', fg: '#155724' },
    'Needs Repair':  { bg: '#fff3cd', fg: '#856404' },
    'Under Service': { bg: '#cce5ff', fg: '#004085' },
    'Retired':       { bg: '#f8d7da', fg: '#721c24' },
  })[c] || { bg: '#e2e3e5', fg: '#383d41' };

  const RowCard = ({ image, placeholderIcon, children, item, tableName, setter, onEdit }) => (
    <article style={{
      background: 'white',
      border: '1px solid #dbe4ec',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap'
    }}>
      {image ? (
        <img src={image} alt=""
          style={{
            width: '340px', minHeight: '240px',
            objectFit: 'cover', flexShrink: 0,
            background: '#f0f4f8'
          }}
        />
      ) : (
        <div style={{
          width: '340px', minHeight: '240px',
          background: 'linear-gradient(135deg, #1a3a5c, #1769aa)',
          display: 'grid', placeItems: 'center',
          color: 'white', fontSize: '72px', flexShrink: 0
        }}>{placeholderIcon}</div>
      )}

      <div style={{ flex: 1, minWidth: '300px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        {children}

        <div style={{
          marginTop: 'auto', paddingTop: '14px',
          borderTop: '1px solid #f0f4f8',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '10px'
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>
            Added by {item.uploaded_by || 'Staff'}
          </p>
          {isStaff && user.id === item.user_id && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onEdit(item)}
                style={{
                  background: 'white', border: '1px solid #1769aa',
                  color: '#1769aa', padding: '7px 14px',
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '600'
                }}
              >✏️ Edit</button>
              <button onClick={() => delItem(tableName, item.id, setter)}
                style={{
                  background: 'white', border: '1px solid #dc3545',
                  color: '#dc3545', padding: '7px 14px',
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '600'
                }}
              >🗑️ Delete</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );

  const FullWidthGrid = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '22px' }}>
      {children}
    </div>
  );

  const TabBtn = ({ id, label, count }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '14px 22px',
      border: 'none',
      background: tab === id ? '#1769aa' : 'white',
      color: tab === id ? 'white' : '#102a43',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '14px',
      borderBottom: tab === id ? '3px solid #1769aa' : '3px solid transparent',
      transition: 'all 0.2s'
    }}>{label} <span style={{ opacity: 0.75, fontWeight: '500' }}>({count})</span></button>
  );

  const AddBtn = ({ label }) => (
    <button className="primary"
      onClick={() => { if (editingId) resetForm(); setShowForm(!showForm); }}
      style={{ background: '#28a745', padding: '12px 24px', fontSize: '14px' }}>
      {showForm ? '📕 Close Form' : label}
    </button>
  );

  const FormHeader = ({ icon, title }) => (
    <h3 style={{
      color: '#102a43', marginTop: 0, marginBottom: '20px',
      display: 'flex', alignItems: 'center', gap: '10px'
    }}>{icon} {editingId ? 'Edit' : 'New'} {title}</h3>
  );

  return (
    <Page title="Academic Resources" kicker="LEARNING CENTER">

      <div style={{
        background: 'linear-gradient(135deg, #102a43 0%, #1769aa 100%)',
        color: 'white', padding: '28px 32px', borderRadius: '16px',
        marginBottom: '30px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-30px', right: '-20px',
          fontSize: '160px', opacity: 0.08, transform: 'rotate(12deg)',
          pointerEvents: 'none'
        }}>📚</div>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '12px', letterSpacing: '2px', fontWeight: '700' }}>
          DEPARTMENT OF GEOLOGY
        </p>
        <h2 style={{ margin: '8px 0 6px', fontSize: '24px', fontWeight: '700' }}>
          Academic Resources
        </h2>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '14px', maxWidth: '620px', lineHeight: '1.6' }}>
          Laboratory rooms, equipment, staff offices, reference books and geological maps.
        </p>
      </div>

      <div style={{
        display: 'flex', gap: '6px', flexWrap: 'wrap',
        borderBottom: '2px solid #dbe4ec', marginBottom: '25px'
      }}>
        <TabBtn id="labs"      label="🔬 Laboratory Rooms" count={labs.length} />
        <TabBtn id="equipment" label="🧪 Lab Equipment"    count={equipment.length} />
        <TabBtn id="offices"   label="🏢 Staff Offices"    count={offices.length} />
        <TabBtn id="books"     label="📚 Reference Books"  count={books.length} />
        <TabBtn id="maps"      label="🗺️ Maps"             count={maps.length} />
      </div>

      {tab === 'labs' && (
        <>
          {isStaff && <div style={{ marginBottom: '20px' }}><AddBtn label="📝 Add Lab Room" /></div>}
          {isStaff && showForm && (
            <div style={formBoxStyle}>
              <FormHeader icon="🔬" title="Lab Room" />
              <div style={gridStyle}>
                <Field label="Lab Name *"><input value={labForm.name} onChange={e=>setLabForm({...labForm,name:e.target.value})} placeholder="e.g. Petrology Laboratory" style={inputStyle}/></Field>
                <Field label="Location"><input value={labForm.location} onChange={e=>setLabForm({...labForm,location:e.target.value})} placeholder="e.g. Block 4, Room 201" style={inputStyle}/></Field>
                <Field label="Capacity"><input value={labForm.capacity} onChange={e=>setLabForm({...labForm,capacity:e.target.value})} placeholder="e.g. 30 students" style={inputStyle}/></Field>
                <Field label={editingId ? 'Photo (optional)' : 'Photo *'}><input type="file" accept="image/*" onChange={e=>setLabForm({...labForm,imageFile:e.target.files[0]})} style={inputStyle}/></Field>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Description"><textarea value={labForm.description} onChange={e=>setLabForm({...labForm,description:e.target.value})} rows="3" placeholder="Equipment, purpose, notes..." style={inputStyle}/></Field>
                </div>
              </div>
              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button className="primary" onClick={submitLab} disabled={busy} style={{ background: '#28a745' }}>{busy?'Saving...': editingId ? '✅ Update Lab' : '✅ Add Lab'}</button>
                <button className="secondary" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          )}
          {labs.length === 0 ? <Empty msg="No lab rooms added yet." isStaff={isStaff}/> : (
            <FullWidthGrid>
              {labs.map(lab => (
                <RowCard key={lab.id} image={lab.image_url} placeholderIcon="🔬" item={lab} tableName="lab_rooms" setter={setLabs} onEdit={startEditLab}>
                  <h3 style={{ margin: '0 0 8px', color: '#102a43', fontSize: '20px' }}>{lab.name}</h3>
                  {lab.location && <p style={cardMetaStyle}>📍 {lab.location}</p>}
                  {lab.capacity && <p style={cardMetaStyle}>👥 {lab.capacity}</p>}
                  {lab.description && <p style={{ margin: '10px 0', color: '#444', fontSize: '14px', lineHeight: '1.6' }}>{lab.description}</p>}
                </RowCard>
              ))}
            </FullWidthGrid>
          )}
        </>
      )}

      {tab === 'equipment' && (
        <>
          {isStaff && <div style={{ marginBottom: '20px' }}><AddBtn label="📝 Add Equipment" /></div>}
          {isStaff && showForm && (
            <div style={formBoxStyle}>
              <FormHeader icon="🧪" title="Lab Equipment" />
              <div style={gridStyle}>
                <Field label="Equipment Name *"><input value={equipForm.name} onChange={e=>setEquipForm({...equipForm,name:e.target.value})} placeholder="e.g. Polarizing Microscope" style={inputStyle}/></Field>

                <Field label="Category">
                  <select value={equipForm.category} onChange={e=>setEquipForm({...equipForm,category:e.target.value})} style={inputStyle}>
                    <option>Microscope</option><option>Rock Cutting Saw</option><option>Sieve Set</option>
                    <option>GPS Receiver</option><option>Compass-Clinometer</option><option>Hammer & Chisel</option>
                    <option>Hand Lens</option><option>Spectrometer</option><option>XRF Analyzer</option>
                    <option>Oven / Furnace</option><option>Balance / Scale</option><option>Sample Splitter</option>
                    <option>Thin Sectioning Kit</option><option>Other</option>
                  </select>
                </Field>

                {equipForm.category === 'Other' && (
                  <Field label="Enter New Category Name *">
                    <input value={equipForm.custom_category} onChange={e=>setEquipForm({...equipForm,custom_category:e.target.value})} placeholder="e.g. Seismic Sensor" style={inputStyle}/>
                    <p style={{ fontSize: '11px', color: '#66788a', marginTop: '4px' }}>Type the custom category name.</p>
                  </Field>
                )}

                <Field label="Model"><input value={equipForm.model} onChange={e=>setEquipForm({...equipForm,model:e.target.value})} placeholder="e.g. Nikon Eclipse LV100" style={inputStyle}/></Field>
                <Field label="Serial Number"><input value={equipForm.serial_number} onChange={e=>setEquipForm({...equipForm,serial_number:e.target.value})} placeholder="e.g. SN-2023-0451" style={inputStyle}/></Field>
                <Field label="Quantity"><input type="number" value={equipForm.quantity} min="1" onChange={e=>setEquipForm({...equipForm,quantity:e.target.value})} style={inputStyle}/></Field>
                <Field label="Condition">
                  <select value={equipForm.condition} onChange={e=>setEquipForm({...equipForm,condition:e.target.value})} style={inputStyle}>
                    <option>Working</option><option>Needs Repair</option><option>Under Service</option><option>Retired</option>
                  </select>
                </Field>
                <Field label="Located in Lab"><input value={equipForm.lab_name} onChange={e=>setEquipForm({...equipForm,lab_name:e.target.value})} placeholder="e.g. Petrology Laboratory" style={inputStyle}/></Field>
                <Field label={editingId ? 'Photo (optional)' : 'Photo *'}><input type="file" accept="image/*" onChange={e=>setEquipForm({...equipForm,imageFile:e.target.files[0]})} style={inputStyle}/></Field>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Specifications"><textarea value={equipForm.specifications} onChange={e=>setEquipForm({...equipForm,specifications:e.target.value})} rows="2" placeholder="Technical specs..." style={inputStyle}/></Field>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Description / Usage"><textarea value={equipForm.description} onChange={e=>setEquipForm({...equipForm,description:e.target.value})} rows="3" placeholder="What is this equipment used for?" style={inputStyle}/></Field>
                </div>
              </div>
              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button className="primary" onClick={submitEquip} disabled={busy} style={{ background: '#28a745' }}>{busy?'Saving...': editingId ? '✅ Update Equipment' : '✅ Add Equipment'}</button>
                <button className="secondary" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          )}
          {equipment.length === 0 ? <Empty msg="No lab equipment added yet." isStaff={isStaff}/> : (
            <FullWidthGrid>
              {equipment.map(eq => {
                const cc = condColor(eq.condition);
                return (
                  <RowCard key={eq.id} image={eq.image_url} placeholderIcon="🧪" item={eq} tableName="lab_equipment" setter={setEquipment} onEdit={startEditEquip}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={badgeStyle}>{eq.category}</span>
                      <span style={{ background: cc.bg, color: cc.fg, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{eq.condition}</span>
                    </div>
                    <h3 style={{ margin: '0 0 12px', color: '#102a43', fontSize: '20px', lineHeight: '1.3' }}>{eq.name}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px 20px', marginBottom: '12px' }}>
                      {eq.model && <p style={cardMetaStyle}>🔧 <strong>Model:</strong> {eq.model}</p>}
                      {eq.serial_number && <p style={cardMetaStyle}>🔢 <strong>SN:</strong> {eq.serial_number}</p>}
                      {eq.quantity > 1 && <p style={cardMetaStyle}>📦 <strong>Qty:</strong> {eq.quantity}</p>}
                      {eq.lab_name && <p style={cardMetaStyle}>📍 <strong>Lab:</strong> {eq.lab_name}</p>}
                    </div>
                    {eq.specifications && <p style={{ margin: '0 0 10px', color: '#555', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic' }}><strong>Specs:</strong> {eq.specifications}</p>}
                    {eq.description && <p style={{ margin: '0 0 12px', color: '#444', fontSize: '14px', lineHeight: '1.6' }}>{eq.description}</p>}
                  </RowCard>
                );
              })}
            </FullWidthGrid>
          )}
        </>
      )}

      {tab === 'offices' && (
        <>
          {isStaff && <div style={{ marginBottom: '20px' }}><AddBtn label="📝 Add Office" /></div>}
          {isStaff && showForm && (
            <div style={formBoxStyle}>
              <FormHeader icon="🏢" title="Staff Office" />
              <div style={gridStyle}>
                <Field label="Staff Name *"><input value={officeForm.staff_name} onChange={e=>setOfficeForm({...officeForm,staff_name:e.target.value})} placeholder="e.g. Dr. Dawit Asmare" style={inputStyle}/></Field>
                <Field label="Room Number"><input value={officeForm.room_number} onChange={e=>setOfficeForm({...officeForm,room_number:e.target.value})} placeholder="e.g. 312" style={inputStyle}/></Field>
                <Field label="Building"><input value={officeForm.building} onChange={e=>setOfficeForm({...officeForm,building:e.target.value})} placeholder="e.g. Geology Block" style={inputStyle}/></Field>
                <Field label="Phone"><input value={officeForm.phone} onChange={e=>setOfficeForm({...officeForm,phone:e.target.value})} placeholder="+251..." style={inputStyle}/></Field>
                <Field label="Email"><input value={officeForm.email} onChange={e=>setOfficeForm({...officeForm,email:e.target.value})} placeholder="name@dmu.edu.et" style={inputStyle}/></Field>
                <Field label="Office Hours"><input value={officeForm.office_hours} onChange={e=>setOfficeForm({...officeForm,office_hours:e.target.value})} placeholder="Mon–Fri, 9–12" style={inputStyle}/></Field>
                <Field label={editingId ? 'Photo (optional)' : 'Office Photo'}><input type="file" accept="image/*" onChange={e=>setOfficeForm({...officeForm,imageFile:e.target.files[0]})} style={inputStyle}/></Field>
              </div>
              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button className="primary" onClick={submitOffice} disabled={busy} style={{ background: '#28a745' }}>{busy?'Saving...': editingId ? '✅ Update Office' : '✅ Add Office'}</button>
                <button className="secondary" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          )}
          {offices.length === 0 ? <Empty msg="No staff offices added yet." isStaff={isStaff}/> : (
            <FullWidthGrid>
              {offices.map(o => (
                <RowCard key={o.id} image={o.image_url} placeholderIcon="🏢" item={o} tableName="staff_offices" setter={setOffices} onEdit={startEditOffice}>
                  <h3 style={{ margin: '0 0 12px', color: '#102a43', fontSize: '20px' }}>{o.staff_name}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 20px' }}>
                    {o.room_number && <p style={cardMetaStyle}>🚪 <strong>Room:</strong> {o.room_number}</p>}
                    {o.building && <p style={cardMetaStyle}>🏛️ <strong>Building:</strong> {o.building}</p>}
                    {o.phone && <p style={cardMetaStyle}>📞 {o.phone}</p>}
                    {o.email && <p style={cardMetaStyle}>📧 {o.email}</p>}
                    {o.office_hours && <p style={cardMetaStyle}>🕐 {o.office_hours}</p>}
                  </div>
                </RowCard>
              ))}
            </FullWidthGrid>
          )}
        </>
      )}

      {tab === 'books' && (
        <>
          {isStaff && <div style={{ marginBottom: '20px' }}><AddBtn label="📝 Add Reference Book" /></div>}
          {isStaff && showForm && (
            <div style={formBoxStyle}>
              <FormHeader icon="📚" title="Reference Book" />
              <div style={gridStyle}>
                <Field label="Title *"><input value={bookForm.title} onChange={e=>setBookForm({...bookForm,title:e.target.value})} placeholder="Book title" style={inputStyle}/></Field>
                <Field label="Author(s)"><input value={bookForm.author} onChange={e=>setBookForm({...bookForm,author:e.target.value})} placeholder="Author(s)" style={inputStyle}/></Field>
                <Field label="Edition"><input value={bookForm.edition} onChange={e=>setBookForm({...bookForm,edition:e.target.value})} placeholder="e.g. 3rd Edition" style={inputStyle}/></Field>
                <Field label="Year"><input value={bookForm.year} onChange={e=>setBookForm({...bookForm,year:e.target.value})} placeholder="e.g. 2020" style={inputStyle}/></Field>
                <Field label="Publisher"><input value={bookForm.publisher} onChange={e=>setBookForm({...bookForm,publisher:e.target.value})} placeholder="e.g. Wiley" style={inputStyle}/></Field>
                <Field label="ISBN"><input value={bookForm.isbn} onChange={e=>setBookForm({...bookForm,isbn:e.target.value})} placeholder="ISBN" style={inputStyle}/></Field>
                <Field label="Course Code"><input value={bookForm.course_code} onChange={e=>setBookForm({...bookForm,course_code:e.target.value})} placeholder="e.g. Geol 2011" style={inputStyle}/></Field>
                <Field label="Category">
                  <select value={bookForm.category} onChange={e=>setBookForm({...bookForm,category:e.target.value})} style={inputStyle}>
                    <option>Reference</option><option>Textbook</option><option>Research</option>
                    <option>Manual</option><option>Atlas</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Link / URL"><input value={bookForm.link} onChange={e=>setBookForm({...bookForm,link:e.target.value})} placeholder="https://..." style={inputStyle}/></Field>
                <Field label={editingId ? 'Cover (optional)' : 'Cover Image'}><input type="file" accept="image/*" onChange={e=>setBookForm({...bookForm,coverFile:e.target.files[0]})} style={inputStyle}/></Field>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Description"><textarea value={bookForm.description} onChange={e=>setBookForm({...bookForm,description:e.target.value})} rows="3" placeholder="Notes..." style={inputStyle}/></Field>
                </div>
              </div>
              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button className="primary" onClick={submitBook} disabled={busy} style={{ background: '#28a745' }}>{busy?'Saving...': editingId ? '✅ Update Book' : '✅ Add Book'}</button>
                <button className="secondary" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          )}
          {books.length === 0 ? <Empty msg="No reference books added yet." isStaff={isStaff}/> : (
            <FullWidthGrid>
              {books.map(b => (
                <RowCard key={b.id} image={b.cover_url} placeholderIcon="📚" item={b} tableName="reference_books" setter={setBooks} onEdit={startEditBook}>
                  <div style={{ marginBottom: '10px' }}><span style={badgeStyle}>{b.category}</span></div>
                  <h3 style={{ margin: '0 0 12px', color: '#102a43', fontSize: '20px', lineHeight: '1.3' }}>{b.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 20px' }}>
                    {b.author && <p style={cardMetaStyle}>✍️ <strong>Author:</strong> {b.author}</p>}
                    {b.edition && <p style={cardMetaStyle}>📖 {b.edition}</p>}
                    {b.year && <p style={cardMetaStyle}>🗓️ {b.year}</p>}
                    {b.publisher && <p style={cardMetaStyle}>🏢 {b.publisher}</p>}
                    {b.course_code && <p style={cardMetaStyle}>📘 {b.course_code}</p>}
                  </div>
                  {b.description && <p style={{ margin: '10px 0 12px', color: '#444', fontSize: '14px', lineHeight: '1.6' }}>{b.description}</p>}
                  {b.link && (<a href={b.link} target="_blank" rel="noreferrer" style={linkStyle}>🔗 Open Link</a>)}
                </RowCard>
              ))}
            </FullWidthGrid>
          )}
        </>
      )}

      {tab === 'maps' && (
        <>
          {isStaff && <div style={{ marginBottom: '20px' }}><AddBtn label="📝 Add Map" /></div>}
          {isStaff && showForm && (
            <div style={formBoxStyle}>
              <FormHeader icon="🗺️" title="Map" />
              <div style={gridStyle}>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Map Title *"><input value={mapForm.title} onChange={e=>setMapForm({...mapForm,title:e.target.value})} placeholder="e.g. Geological Map of Ethiopia" style={inputStyle}/></Field>
                </div>
                <Field label="Map Type">
                  <select value={mapForm.map_type} onChange={e=>setMapForm({...mapForm,map_type:e.target.value})} style={inputStyle}>
                    <option>Geological Map</option><option>Topographic Map</option><option>Structural Map</option>
                    <option>Mineral Resources Map</option><option>Hydrogeological Map</option><option>Soil Map</option>
                    <option>Tectonic Map</option><option>Land Use Map</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Scale"><input value={mapForm.scale} onChange={e=>setMapForm({...mapForm,scale:e.target.value})} placeholder="e.g. 1:50,000" style={inputStyle}/></Field>
                <Field label="Region / Area"><input value={mapForm.region} onChange={e=>setMapForm({...mapForm,region:e.target.value})} placeholder="e.g. Blue Nile Basin" style={inputStyle}/></Field>
                <Field label="Year"><input value={mapForm.year} onChange={e=>setMapForm({...mapForm,year:e.target.value})} placeholder="e.g. 2020" style={inputStyle}/></Field>
                <Field label="Publisher"><input value={mapForm.publisher} onChange={e=>setMapForm({...mapForm,publisher:e.target.value})} placeholder="e.g. GSE" style={inputStyle}/></Field>
                <Field label={editingId ? 'Preview Image (optional)' : 'Preview Image'}><input type="file" accept="image/*" onChange={e=>setMapForm({...mapForm,imageFile:e.target.files[0]})} style={inputStyle}/></Field>
                <Field label={editingId ? 'Map File (optional)' : 'Map File (PDF / Image)'}><input type="file" accept=".pdf,image/*" onChange={e=>setMapForm({...mapForm,file:e.target.files[0]})} style={inputStyle}/></Field>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Description"><textarea value={mapForm.description} onChange={e=>setMapForm({...mapForm,description:e.target.value})} rows="3" placeholder="Notes about this map..." style={inputStyle}/></Field>
                </div>
              </div>
              <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                <button className="primary" onClick={submitMap} disabled={busy} style={{ background: '#28a745' }}>{busy?'Saving...': editingId ? '✅ Update Map' : '✅ Add Map'}</button>
                <button className="secondary" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          )}
          {maps.length === 0 ? <Empty msg="No maps added yet." isStaff={isStaff}/> : (
            <FullWidthGrid>
              {maps.map(m => (
                <RowCard key={m.id} image={m.image_url} placeholderIcon="🗺️" item={m} tableName="maps" setter={setMaps} onEdit={startEditMap}>
                  <div style={{ marginBottom: '10px' }}><span style={badgeStyle}>{m.map_type}</span></div>
                  <h3 style={{ margin: '0 0 12px', color: '#102a43', fontSize: '20px', lineHeight: '1.3' }}>{m.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px 20px' }}>
                    {m.scale && <p style={cardMetaStyle}>📐 <strong>Scale:</strong> {m.scale}</p>}
                    {m.region && <p style={cardMetaStyle}>📍 {m.region}</p>}
                    {m.year && <p style={cardMetaStyle}>🗓️ {m.year}</p>}
                    {m.publisher && <p style={cardMetaStyle}>🏛️ {m.publisher}</p>}
                  </div>
                  {m.description && <p style={{ margin: '10px 0 12px', color: '#444', fontSize: '14px', lineHeight: '1.6' }}>{m.description}</p>}
                  {m.file_url && (
                    isStaff ? (
                      <a href={m.file_url} target="_blank" rel="noreferrer" style={linkStyle}>📥 Open / Download Map</a>
                    ) : (
                      <span style={{
                        display: 'inline-block', marginTop: '10px',
                        padding: '8px 16px',
                        background: '#eaf4fb', color: '#1769aa',
                        borderRadius: '6px', fontSize: '13px', fontWeight: '600'
                      }}>
                        🗺️ Map available — visit the department office to view
                      </span>
                    )
                  )}
                </RowCard>
              ))}
            </FullWidthGrid>
          )}
        </>
      )}

    </Page>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px', color: '#102a43' }}>{label}</label>
      {children}
    </div>
  );
}
function Empty({ msg, isStaff }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 30px', background: 'linear-gradient(135deg, #f8f9fa, #ffffff)', borderRadius: '16px', border: '1px dashed #dbe4ec' }}>
      <div style={{ fontSize: '56px', marginBottom: '10px' }}>📂</div>
      <h3 style={{ color: '#102a43', margin: '0 0 8px' }}>{msg}</h3>
      <p style={{ color: '#66788a', margin: 0 }}>{isStaff ? 'Click the green "Add" button above to upload.' : 'Check back later.'}</p>
    </div>
  );
}
const formBoxStyle = { background: 'linear-gradient(135deg, #f8f9fa, #ffffff)', padding: '26px', borderRadius: '14px', marginBottom: '30px', border: '1px solid #dbe4ec', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' };
const cardMetaStyle = { margin: '3px 0', color: '#66788a', fontSize: '13px' };
const badgeStyle = { background: '#1769aa', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', display: 'inline-block', letterSpacing: '0.5px', textTransform: 'uppercase' };
const linkStyle = { display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: '#1769aa', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' };
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

function CoursesPage({ courses, search, setSearch, yearFilter, setYearFilter, semesterFilter, setSemesterFilter, activeFilter, setActiveFilter, setSelectedCourse, meta }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <Page title="Course Catalog" kicker="EXPLORE OUR COURSES">
      <div className="toolbar">
        <div className="search">
          <Search/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."/>
        </div>

        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="all">All Years</option>
          {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>

        <select value={semesterFilter} onChange={e => setSemesterFilter(e.target.value)}>
          <option value="all">All Semesters</option>
          <option value="I">Semester I</option>
          <option value="II">Semester II</option>
        </select>

        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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

  const filteredResults = filterYear === 'all'
    ? results
    : results.filter(r => r.student_year === filterYear);

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
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'2000px'}}>
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
                        <th style={{padding:'8px',textAlign:'center'}}>Action</th>
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
                          <td style={{padding:'8px',textAlign:'center'}}>
                            {isStaff && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Delete result for ${r.student}?`)) return;
                                  const { error } = await supabase.from('exam_results').delete().eq('id', r.id);
                                  if (error) return alert(error.message);
                                  setResults(prev => prev.filter(x => x.id !== r.id));
                                }}
                                style={{
                                  background: '#dc3545', color: 'white',
                                  border: 'none', padding: '5px 12px',
                                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            )}
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

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('user_metadata')
        .select('*')
        .eq('role', 'staff')
        .order('name');
      if (data) setAllStaff(data);
    })();
  }, []);

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

            <div style={{ flex: 1, minWidth: '260px' }}>
              <h3 style={{ margin: '0 0 5px', color: '#102a43', fontSize: '22px' }}>{meta?.name}</h3>
              <p style={{ color: '#1769aa', margin: '0 0 3px', fontWeight: '600' }}>{meta?.rank}</p>
              <p style={{ color: '#66788a', margin: '0 0 3px', fontSize: '14px' }}>🔬 {meta?.spec}</p>
              <p style={{ color: '#66788a', margin: '0 0 15px', fontSize: '14px' }}>📧 {meta?.email}</p>

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

      {selectedStaff && (
        <StaffViewModal
          staffMember={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </Page>
  );
}

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

function News({ newsItems, setNewsItems, user, meta }) {
  const isStaff = meta?.role === 'staff';
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '', category: 'News', content: '',
    imageFile: null, file: null
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return alert('Please enter a title.');
    setBusy(true);

    let imageUrl = '';
    let fileUrl = '';
    if (form.imageFile) {
      const up = await uploadToStorage('news-files', form.imageFile);
      if (up) imageUrl = up.url;
    }
    if (form.file) {
      const up = await uploadToStorage('news-files', form.file);
      if (up) fileUrl = up.url;
    }

    if (editId) {
      const updates = {
        title: form.title.trim(),
        category: form.category,
        content: form.content.trim() || 'No description.'
      };
      if (imageUrl) updates.image_url = imageUrl;
      if (fileUrl) updates.file_url = fileUrl;

      const { data, error } = await supabase.from('news').update(updates).eq('id', editId).select();
      setBusy(false);
      if (error) return alert(error.message);
      if (data && data[0]) {
        setNewsItems(prev => prev.map(n => n.id === editId ? data[0] : n));
      }
      alert('✅ Updated!');
    } else {
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
      alert('✅ Posted!');
    }

    setForm({ title: '', category: 'News', content: '', imageFile: null, file: null });
    setEditId(null);
    setShowForm(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('news').delete().eq('id', id);
    setNewsItems(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Page title="News & Events" kicker="LATEST UPDATES">

      {isStaff && (
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <button
            className="primary"
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', category: 'News', content: '', imageFile: null, file: null }); }}
            style={{ background: '#28a745' }}
          >
            {showForm ? '📕 Close Form' : '📝 Create New Post'}
          </button>
        </div>
      )}

      {isStaff && showForm && (
        <div style={{
          background: '#f8f9fa', padding: '20px',
          borderRadius: '12px', marginBottom: '25px',
          border: '1px solid #dbe4ec'
        }}>
          <h3 style={{ color: '#102a43', marginBottom: '15px' }}>
            {editId ? '✏️ Edit Post' : '📝 New Post'}
          </h3>

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
              {busy ? 'Saving...' : editId ? '✅ Update' : '✅ Publish'}
            </button>
            <button className="secondary" onClick={() => { setShowForm(false); setEditId(null); setForm({ title: '', category: 'News', content: '', imageFile: null, file: null }); }}>Cancel</button>
          </div>
        </div>
      )}

      {newsItems.length === 0 ? (
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
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {newsItems.map(n => (
            <article key={n.id} style={{
              background: 'white',
              border: '1px solid #dbe4ec',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexWrap: 'wrap'
            }}>
              {n.image_url && (
                <div style={{ flex: '0 0 320px', maxWidth: '320px', minHeight: '220px', background: '#f0f4f8' }}>
                  <img src={n.image_url} alt={n.title}
                    style={{ width: '100%', height: '100%', minHeight: '220px', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ flex: 1, padding: '22px', minWidth: '260px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{
                    background: '#1769aa', color: 'white',
                    padding: '2px 10px', borderRadius: '12px',
                    fontSize: '11px', fontWeight: '600'
                  }}>{n.category}</span>
                  <small style={{ color: '#66788a' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleDateString('en-GB') : 'Today'}
                  </small>
                </div>

                <h3 style={{ margin: '4px 0 10px', color: '#102a43', fontSize: '20px' }}>{n.title}</h3>

                <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                  {n.content}
                </p>

                <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
                  Posted by {n.uploaded_by}
                </p>

                {isStaff && user.id === n.user_id && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      className="secondary"
                      onClick={() => {
                        setEditId(n.id);
                        setForm({
                          title: n.title || '',
                          category: n.category || 'News',
                          content: n.content || '',
                          imageFile: null,
                          file: null
                        });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ color: '#1769aa', borderColor: '#1769aa' }}
                    >
                      ✏️ Edit
                    </button>
                    <button className="secondary" onClick={() => del(n.id)}
                      style={{ color: '#dc3545' }}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

    </Page>
  );
}

const newsLabelStyle = {
  display: 'block',
  fontWeight: '600',
  marginBottom: '6px',
  fontSize: '13px',
  color: '#102a43'
};

const newsInputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};
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
          autoComplete="new-password"
          style={{ width: '100%', padding: '10px', margin: '5px 0 12px', border: '1px solid #ccc', borderRadius: '8px' }}
        />

        <label style={{ fontWeight: '600', fontSize: '14px' }}>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          autoComplete="new-password"
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
function AppRoot(){ return <App/>; }
createRoot(document.getElementById("root")).render(<AppRoot/>);