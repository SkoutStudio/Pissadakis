/*
 * Έργα — οι φωτογραφίες είναι στο assets/projects/.
 * featured: true  → εμφανίζεται στο 3D τούνελ (με αυτή τη σειρά)
 * cat             → μία από τις κατηγορίες του CATEGORIES
 */
window.CATEGORIES = [
  { id: "vafes", label: "Ελαιοχρωματισμοί", text: "Εξωτερικοί & εσωτερικοί χρωματισμοί, δίχρωμες προσόψεις, εποξειδικά δάπεδα.", cover: "mezoneta-dyo-chromata-1.webp", coverTitle: "Δίχρωμη μεζονέτα · Λέσβος" },
  { id: "gypso", label: "Γυψοσανίδες", text: "Συνθέσεις, ράφια, κουτελα, σκάλες και καμπύλες κατασκευές από γυψοσανίδα.", cover: "goniaio-syntheto-2.webp", coverTitle: "Γωνιακή σύνθεση με LED · Μυτιλήνη" },
  { id: "led", label: "Κρυφός φωτισμός", text: "Ψευδοροφές με κρυφό φωτισμό LED, ταινίες και spot.", cover: "led-ypnodomatio.webp", coverTitle: "Κρυφός φωτισμός υπνοδωματίου" },
  { id: "prosopsi", label: "Προσόψεις & Επενδύσεις", text: "Τσιμεντοσανίδες, θερμοπροσόψεις και επενδύσεις καταστημάτων.", cover: "electronet-1.webp", coverTitle: "Electronet Προδρόμου · Μυτιλήνη" },
  { id: "deco", label: "Διακοσμητικά", text: "Stucco veneziano και ειδικά διακοσμητικά τελειώματα.", cover: "stucco-veneziano-tzaki.webp", coverTitle: "Stucco veneziano σε τζάκι" }
];

window.PROJECTS = [
  { src: "refill-aerolimenas.webp", title: "Refill — Αεροδρόμιο Μυτιλήνης", place: "Μυτιλήνη", cat: "gypso", featured: true },
  { src: "mezoneta-dyo-chromata-1.webp", title: "Δίχρωμη μεζονέτα", place: "Λέσβος", cat: "vafes", featured: true },
  { src: "electronet-1.webp", title: "Electronet Προδρόμου", place: "Μυτιλήνη", cat: "prosopsi", featured: true },
  { src: "led-ypnodomatio.webp", title: "Κρυφός φωτισμός υπνοδωματίου", place: "Μυτιλήνη", cat: "led", featured: true },
  { src: "goniaio-syntheto-2.webp", title: "Γωνιακή σύνθεση με LED", place: "Μυτιλήνη", cat: "gypso", featured: true },
  { src: "neoklassiko-mytilini.webp", title: "Νεοκλασικό", place: "Μυτιλήνη", cat: "vafes", featured: true },
  { src: "kryfos-fotismos-neoklassiko.webp", title: "Πέτρα & κρυφός φωτισμός", place: "Μυτιλήνη", cat: "led", featured: true },
  { src: "ophthalmologiki-larsos.webp", title: "Οφθαλμολογική κλινική", place: "Μυτιλήνη", cat: "vafes", featured: true },

  { src: "mezoneta-dyo-chromata-2.webp", title: "Δίχρωμη μεζονέτα", place: "Λέσβος", cat: "vafes" },
  { src: "mezoneta-dyo-chromata-3.webp", title: "Δίχρωμη μεζονέτα", place: "Λέσβος", cat: "vafes" },
  { src: "exoterikos-choros-mytilini.webp", title: "Εξωτερικός χρωματισμός", place: "Μυτιλήνη", cat: "vafes" },
  { src: "polykatoikia-exoteriko.webp", title: "Πολυκατοικία", place: "Μυτιλήνη", cat: "vafes" },
  { src: "epoxeidiko-dapedo.webp", title: "Εποξειδικό δάπεδο", place: "Μυτιλήνη", cat: "vafes" },
  { src: "electronet-2.webp", title: "Electronet Προδρόμου", place: "Μυτιλήνη", cat: "prosopsi" },
  { src: "electronet-3.webp", title: "Electronet — σε εξέλιξη", place: "Μυτιλήνη", cat: "prosopsi" },
  { src: "thermoprosopsi-mezoneta.webp", title: "Θερμοπρόσοψη", place: "Λέσβος", cat: "prosopsi" },
  { src: "thermoprosopsi-gypsosanides.webp", title: "Θερμοπρόσοψη & γυψοσανίδες", place: "Λέσβος", cat: "prosopsi" },
  { src: "prosopsi-after.webp", title: "Πρόσοψη με τσιμεντοσανίδα", place: "Μυτιλήνη", cat: "prosopsi" },
  { src: "goniaio-syntheto-1.webp", title: "Γωνιακή σύνθεση — σκελετός", place: "Μυτιλήνη", cat: "gypso" },
  { src: "syntheto-saloni.webp", title: "Σύνθεση σαλονιού", place: "Μυτιλήνη", cat: "gypso" },
  { src: "skala-gypsosanida.webp", title: "Σκάλα με γυψοσανίδα", place: "Μυτιλήνη", cat: "gypso" },
  { src: "stucco-veneziano-tzaki.webp", title: "Stucco veneziano σε τζάκι", place: "Μυτιλήνη", cat: "deco" }
];

window.BEFORE_AFTER = {
  before: "prosopsi-before.webp",
  after: "prosopsi-after.webp",
  title: "Πρόσοψη κτιρίου με τσιμεντοσανίδα"
};
