
import { CollectionSchema, FieldType } from './types';

const YES_NO_UNKNOWN = [
  { label: 'Tak', value: 'tak' },
  { label: 'Nie', value: 'nie' },
  { label: 'Nieznane', value: 'nieznane' }
];

const YES_NO = [
  { label: 'Tak', value: 'tak' },
  { label: 'Nie', value: 'nie' }
];

const GRADE_NONE_SEVERE = [
  { label: 'Brak', value: 'none' },
  { label: 'Mała', value: 'mild' },
  { label: 'Umiarkowana', value: 'moderate' },
  { label: 'Duża', value: 'severe' }
];

export const DATA_SCHEMA: CollectionSchema = [
  {
    id: 'sec_a_admin',
    title: 'Sekcja A: Dane Administracyjne',
    description: 'Dokumentacja identyfikacyjna v1.1',
    fields: [
      { id: 'study_number', label: 'Numer badania', type: FieldType.TEXT, required: true },
      { id: 'center_code', label: 'Kod ośrodka', type: FieldType.TEXT, required: true },
      { id: 'inclusion_date', label: 'Data włączenia', type: FieldType.DATE, required: true },
      { id: 'collector_initials', label: 'Inicjały osoby zbierającej dane', type: FieldType.TEXT, required: true },
      { id: 'consent_obtained', label: 'Zgoda świadoma uzyskana', type: FieldType.RADIO, options: [{label: 'Tak', value: 'tak'}, {label: 'Nie', value: 'nie'}, {label: 'Zwolniona (retrospektywnie)', value: 'zwolniona'}] },
      { id: 'consent_date', label: 'Data zgody (jeśli dotyczy)', type: FieldType.DATE }
    ]
  },
  {
    id: 'sec_b_demo',
    title: 'Sekcja B: Dane Demograficzne',
    description: 'Charakterystyka pacjenta v1.1',
    fields: [
      { id: 'dob', label: 'Data urodzenia', type: FieldType.DATE },
      { id: 'age', label: 'Wiek w dniu zabiegu', type: FieldType.NUMBER, unit: 'lat' },
      { id: 'sex', label: 'Płeć', type: FieldType.RADIO, options: [{label: 'Mężczyzna', value: 'm'}, {label: 'Kobieta', value: 'k'}] },
      { id: 'height', label: 'Wzrost', type: FieldType.NUMBER, unit: 'cm' },
      { id: 'weight', label: 'Masa ciała', type: FieldType.NUMBER, unit: 'kg' },
      { id: 'bmi', label: 'BMI (obliczone)', type: FieldType.NUMBER, unit: 'kg/m2' },
      { id: 'ethnicity', label: 'Pochodzenie etniczne', type: FieldType.SELECT, options: [{label: 'Kaukaskie', value: 'kaukaskie'}, {label: 'Afrykańskie', value: 'afrykanskie'}, {label: 'Azjatyckie', value: 'azjatyckie'}, {label: 'Latynoskie', value: 'latynoskie'}, {label: 'Inne', value: 'inne'}] },
      { id: 'smoking_status', label: 'Status palenia', type: FieldType.SELECT, options: [{label: 'Nigdy', value: 'nigdy'}, {label: 'Były palacz (>1 rok)', value: 'byly'}, {label: 'Aktualny palacz', value: 'aktualny'}] }
    ]
  },
  {
    id: 'sec_c_comorb',
    title: 'Sekcja C: Choroby Współistniejące',
    description: 'Obciążenia i wywiad (v1.1 - ROZSZERZONA)',
    fields: [
      { id: 'hdr_c_cv', label: 'UKŁAD SERCOWO-NACZYNIOWY', type: FieldType.SECTION_HEADER },
      { id: 'htn', label: 'Nadciśnienie tętnicze', type: FieldType.RADIO, options: YES_NO },
      { id: 'cad', label: 'Choroba wieńcowa', type: FieldType.RADIO, options: YES_NO },
      { id: 'mi_history', label: 'Przebyty zawał serca', type: FieldType.RADIO, options: YES_NO },
      { id: 'heart_failure_nyha', label: 'Niewydolność serca (NYHA)', type: FieldType.SELECT, options: [{label: 'NYHA I', value: '1'}, {label: 'NYHA II', value: '2'}, {label: 'NYHA III', value: '3'}, {label: 'NYHA IV', value: '4'}, {label: 'Brak', value: '0'}] },
      { id: 'afib', label: 'Migotanie przedsionków', type: FieldType.RADIO, options: YES_NO },
      { id: 'prev_cardio_sx', label: 'Przebyta operacja kardiochirurgiczna', type: FieldType.RADIO, options: YES_NO },
      { id: 'pfo_history', label: 'Przetrwały otwór owalny (PFO)', type: FieldType.RADIO, options: YES_NO },
      { id: 'other_shunt', label: 'Inny przeciek wewnątrzsercowy', type: FieldType.RADIO, options: YES_NO },
      { id: 'pad', label: 'Miażdżyca tt. obwodowych', type: FieldType.RADIO, options: YES_NO },
      { id: 'hdr_c_neuro_ext', label: '[NOWE] UKŁAD MÓZGOWO-NACZYNIOWY - ROZSZERZONA OCENA', type: FieldType.SECTION_HEADER },
      { id: 'stroke_isch', label: '[NOWE] Przebyty udar niedokrwienny', type: FieldType.RADIO, options: YES_NO },
      { id: 'stroke_hem', label: '[NOWE] Przebyty udar krwotoczny', type: FieldType.RADIO, options: YES_NO },
      { id: 'stroke_tia', label: '[NOWE] Przebyty TIA', type: FieldType.RADIO, options: YES_NO },
      { id: 'carotid_stenosis_gt50', label: 'Zwężenie t. szyjnej (>50%)', type: FieldType.RADIO, options: YES_NO },
      { id: 'cea_stent_history', label: 'Endarterektomia / Stent t. szyjnej', type: FieldType.RADIO, options: YES_NO },
      { id: 'cognitive_impairment', label: 'Zaburzenia poznawcze', type: FieldType.RADIO, options: YES_NO },
      { id: 'hdr_c_incidents', label: '[NOWE] SZCZEGÓŁY PRZEBYTYCH INCYDENTÓW', type: FieldType.SECTION_HEADER },
      { id: 'stroke_count', label: '[NOWE] Liczba przebytych udarów', type: FieldType.NUMBER },
      { id: 'last_stroke_date', label: '[NOWE] Data ostatniego udaru/TIA', type: FieldType.DATE },
      { id: 'time_from_stroke_months', label: '[NOWE] Czas od ostatniego udaru do zabiegu', type: FieldType.NUMBER, unit: 'miesięcy' },
      { id: 'stroke_area', label: '[NOWE] Obszar przebytego udaru', type: FieldType.SELECT, options: [{label: 'MCA', value: 'mca'}, {label: 'ACA', value: 'aca'}, {label: 'PCA', value: 'pca'}, {label: 'Kręgowo-podstawny', value: 'vb'}, {label: 'Mnogie', value: 'multi'}, {label: 'Nieznany', value: 'unk'}] },
      { id: 'permanent_neuro_deficit', label: '[NOWE] Trwały deficyt neurologiczny', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'pre_proc_mrs', label: '[NOWE] mRS przed obecnym zabiegiem', type: FieldType.NUMBER, unit: '/6' },
      { id: 'hdr_c_other', label: 'INNE CHOROBY WSPÓŁISTNIEJĄCE', type: FieldType.SECTION_HEADER },
      { id: 'dm', label: 'Cukrzyca', type: FieldType.RADIO, options: YES_NO },
      { id: 'copd', label: 'POChP', type: FieldType.RADIO, options: YES_NO },
      { id: 'chronic_kidney', label: 'Przewlekła choroba nerek', type: FieldType.RADIO, options: YES_NO },
      { id: 'dialysis', label: 'Dializoterapia', type: FieldType.RADIO, options: YES_NO },
      { id: 'connective_tissue_disease', label: '[NOWE] Choroba tkanki łącznej', type: FieldType.RADIO, options: YES_NO },
      { id: 'active_cancer', label: 'Nowotwór złośliwy (aktywny)', type: FieldType.RADIO, options: YES_NO },
      { id: 'hdr_c_labs', label: 'WYNIKI WYJŚCIOWE', type: FieldType.SECTION_HEADER },
      { id: 'baseline_egfr', label: 'Wyjściowy eGFR', type: FieldType.NUMBER, unit: 'mL/min/1.73m2' },
      { id: 'baseline_creat', label: 'Wyjściowa kreatynina', type: FieldType.NUMBER, unit: 'umol/L' },
      { id: 'baseline_hb', label: 'Wyjściowa hemoglobina', type: FieldType.NUMBER, unit: 'g/dL' },
      { id: 'hdr_c_ct_details', label: '[NOWE] TYP CHOROBY TKANKI ŁĄCZNEJ', type: FieldType.SECTION_HEADER },
      { id: 'ct_type', label: 'Typ choroby', type: FieldType.SELECT, options: [{label: 'Marfan', value: 'marfan'}, {label: 'Loeys-Dietz', value: 'loeys'}, {label: 'Ehlers-Danlos', value: 'ehlers'}, {label: 'Inna', value: 'inna'}] },
      { id: 'ct_dx_age', label: 'Wiek w momencie rozpoznania', type: FieldType.NUMBER, unit: 'lat' }
    ]
  },
  {
    id: 'sec_d_patho',
    title: 'Sekcja D: Wskazanie i Patologia Aorty',
    description: 'Anatomia i morfologia (v1.1 - ROZSZERZONA)',
    fields: [
      { id: 'hdr_d_indication', label: 'GŁÓWNE WSKAZANIE', type: FieldType.SECTION_HEADER },
      { id: 'primary_indication', label: 'Wskazanie', type: FieldType.SELECT, options: [{label: 'Tętniak', value: 'tetniak'}, {label: 'Rozwarstwienie', value: 'rozwarstwienie'}, {label: 'Krwiak śródścienny', value: 'imh'}, {label: 'Wrzód drążący', value: 'ulcer'}, {label: 'Urazowe', value: 'trauma'}, {label: 'Inne', value: 'inne'}] },
      { id: 'hdr_d_aneurysm', label: 'W PRZYPADKU TĘTNIAKA', type: FieldType.SECTION_HEADER },
      { id: 'aneurysm_max_diam', label: 'Maksymalna średnica tętniaka', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'aneurysm_loc', label: 'Lokalizacja tętniaka', type: FieldType.SELECT, options: [{label: 'Aorta wstępująca', value: 'asc'}, {label: 'Łuk aorty', value: 'arch'}, {label: 'Zstępująca proksym.', value: 'desc_p'}, {label: 'Wiele segmentów', value: 'multi'}] },
      { id: 'aneurysm_size_cat', label: '[NOWE] Kategoria wielkości tętniaka', type: FieldType.SELECT, options: [{label: '<50 mm', value: 'lt50'}, {label: '50-59 mm', value: '50_59'}, {label: '60-69 mm', value: '60_69'}, {label: '70-79 mm', value: '70_79'}, {label: '>=80 mm', value: 'ge80'}] },
      { id: 'aneurysm_gt_70', label: '[NOWE] Tętniak >= 70 mm', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'aneurysm_symptomatic', label: 'Objawowy', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'aneurysm_rupture_cont', label: 'Pęknięcie ograniczone', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_d_dissection', label: 'W PRZYPADKU ROZWARSTWIENIA', type: FieldType.SECTION_HEADER },
      { id: 'stanford_class', label: 'Klasyfikacja Stanford', type: FieldType.RADIO, options: [{label: 'Typ A', value: 'a'}, {label: 'Typ B', value: 'b'}] },
      { id: 'debakey_class', label: 'Klasyfikacja DeBakey', type: FieldType.SELECT, options: [{label: 'I', value: '1'}, {label: 'II', value: '2'}, {label: 'IIIa', value: '3a'}, {label: 'IIIb', value: '3b'}] },
      { id: 'dissection_phase', label: 'Faza', type: FieldType.RADIO, options: [{label: 'Ostre (<14 dni)', value: 'acute'}, {label: 'Podostre (14-90 dni)', value: 'subacute'}, {label: 'Przewlekłe (>90 dni)', value: 'chronic'}] },
      { id: 'malperfusion_syndrome', label: 'Zespół niedokrwienia narządowego (malperfuzja)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_d_fl', label: '[NOWE] WYMIARY KANAŁU FAŁSZYWEGO', type: FieldType.SECTION_HEADER },
      { id: 'fl_max_width', label: 'Maks. szerokość kanału fałszywego', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'fl_arch_width', label: 'Szerokość na poziomie łuku', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'fl_thrombus_present', label: 'Skrzeplina w kanale fałszywym', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'fl_thrombosis_grade', label: 'Stopień zakrzepicy k. fałszywego', type: FieldType.SELECT, options: [{label: 'Brak', value: 'none'}, {label: 'Częściowa (<50%)', value: 'part_lt50'}, {label: 'Częściowa (>=50%)', value: 'part_ge50'}, {label: 'Pełna', value: 'full'}] },
      { id: 'hdr_d_key_analysis', label: '[NOWE] WYMIARY AORTY - KLUCZOWE DLA ANALIZY', type: FieldType.SECTION_HEADER },
      { id: 'asc_aorta_diam', label: 'Średnica aorty wstępującej', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'stj_diam', label: 'Złącze zatokowo-tubularne (STJ)', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'asc_aorta_cat', label: 'Kategoria śr. aorty wstępującej', type: FieldType.SELECT, options: [{label: '<35 mm', value: 'lt35'}, {label: '35-39 mm', value: '35_39'}, {label: '40-45 mm', value: '40_45'}, {label: '>45 mm', value: 'gt45'}] },
      { id: 'asc_aorta_ge_40', label: 'Średnica aorty wstępującej >= 40 mm', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'arch_diam', label: 'Średnica łuku aorty', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'desc_aorta_lsa_diam', label: 'Aorta zstępująca (przy LSA)', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'zone0_length', label: 'Długość strefy 0', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'zone2_length', label: 'Długość strefy 2', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'diam_diff_asc_landing', label: 'Różnica średnic (aorta wstęp. - strefa ladowania)', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'hdr_d_morphology', label: 'MORFOLOGIA AORTY', type: FieldType.SECTION_HEADER },
      { id: 'arch_type_ishimaru', label: 'Typ łuku (Ishimaru)', type: FieldType.RADIO, options: [{label: 'Typ I', value: '1'}, {label: 'Typ II', value: '2'}, {label: 'Typ III', value: '3'}] },
      { id: 'shaggy_aorta', label: 'Aorta shaggy (ruchome blaszki miażdż.)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'shaggy_thickness_max', label: '[NOWE] Jeśli shaggy - maks. grubość blaszki', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'shaggy_location', label: '[NOWE] Lokalizacja shaggy', type: FieldType.SELECT, options: [{label: 'Aorta wstępująca', value: 'asc'}, {label: 'Łuk', value: 'arch'}, {label: 'Aorta zstępująca', value: 'desc'}, {label: 'Mnogie', value: 'multi'}] },
      { id: 'thrombus_in_arch', label: 'Skrzeplina w łuku aorty', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'thrombus_in_asc', label: 'Skrzeplina w aorcie wstępującej', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'porcelain_aorta', label: 'Aorta porcelanowa (zwapnienia obwodowe)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'supraaortic_vessels_inv', label: 'Zajęcie tt. nadaortalnych', type: FieldType.SELECT, options: [{label: 'Brak', value: 'none'}, {label: 'BCT', value: 'bct'}, {label: 'LCCA', value: 'lcca'}, {label: 'LSA', value: 'lsa'}, {label: 'Wiele', value: 'multi'}] }
    ]
  },
  {
    id: 'sec_e_neuro_pre',
    title: 'Sekcja E: Przedoperacyjna Ocena Naczyń Mózgowych',
    description: 'Angio-TK i Koło Willisa (v1.1 - ROZSZERZONA)',
    fields: [
      { id: 'hdr_e_tk', label: 'ANGIO-TK GŁOWY (KOŁO WILLISA)', type: FieldType.SECTION_HEADER },
      { id: 'angio_tk_done', label: 'Wykonano angio-TK głowy', type: FieldType.RADIO, options: YES_NO },
      { id: 'angio_tk_date', label: 'Data angio-TK głowy', type: FieldType.DATE },
      { id: 'hdr_e_ant', label: 'KRĄŻENIE PRZEDNIE', type: FieldType.SECTION_HEADER },
      { id: 'acom_patent', label: 'Tętnica łącząca przednia (ACom) drożna', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'acom_diam', label: 'Średnica ACom (jeśli zmierzono)', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'segment_a1_aca', label: 'Segment A1 (ACA)', type: FieldType.SELECT, options: [{label: 'Obustronnie drożny', value: 'both'}, {label: 'Dominacja prawa', value: 'r_dom'}, {label: 'Dominacja lewa', value: 'l_dom'}, {label: 'Hipoplazja/brak', value: 'hypo'}] },
      { id: 'hdr_e_post', label: 'KRĄŻENIE TYLNE', type: FieldType.SECTION_HEADER },
      { id: 'r_pcom_patent', label: 'Prawa t. łącząca tylna (PCom) drożna', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'r_pcom_diam', label: 'Średnica prawej PCom', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'l_pcom_patent', label: 'Lewa t. łącząca tylna (PCom) drożna', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'l_pcom_diam', label: 'Średnica lewej PCom', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'willis_classification', label: 'Klasyfikacja Koła Willisa', type: FieldType.SELECT, options: [{label: 'Pełne', value: 'full'}, {label: 'Niepełne przednie', value: 'inc_ant'}, {label: 'Niepełne tylne', value: 'inc_post'}, {label: 'Niepełne oba', value: 'inc_both'}] },
      { id: 'hdr_e_vb', label: 'UKŁAD KRĘGOWO-PODSTAWNY', type: FieldType.SECTION_HEADER },
      { id: 'r_va_status', label: 'Prawa t. kręgowa', type: FieldType.SELECT, options: [{label: 'Drożna (V1-V4)', value: 'patent'}, {label: 'Hipoplastyczna (<2 mm)', value: 'hypo'}, {label: 'Kończy się w PICA', value: 'pica'}, {label: 'Niedrożna', value: 'occl'}, {label: 'Nie oceniano', value: 'na'}] },
      { id: 'l_va_status', label: 'Lewa t. kręgowa', type: FieldType.SELECT, options: [{label: 'Drożna (V1-V4)', value: 'patent'}, {label: 'Hipoplastyczna (<2 mm)', value: 'hypo'}, {label: 'Kończy się w PICA', value: 'pica'}, {label: 'Niedrożna', value: 'occl'}, {label: 'Nie oceniano', value: 'na'}] },
      { id: 'va_dominance', label: 'Dominacja t. kręgowej', type: FieldType.SELECT, options: [{label: 'Kodominacja', value: 'codom'}, {label: 'Dominacja prawa', value: 'r_dom'}, {label: 'Dominacja lewa', value: 'l_dom'}] },
      { id: 'r_va_diam', label: 'Średnica prawej VA', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'l_va_diam', label: 'Średnica lewej VA', type: FieldType.NUMBER, unit: 'mm' },
      { id: 'basilar_patent', label: 'Tętnica podstawna drożna', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_e_carotid', label: 'OCENA TĘTNIC SZYJNYCH', type: FieldType.SECTION_HEADER },
      { id: 'r_ica_status', label: 'Prawa ICA', type: FieldType.SELECT, options: [{label: 'Drożna', value: 'patent'}, {label: 'Zwężenie <50%', value: 'sten_lt50'}, {label: 'Zwężenie 50-69%', value: 'sten_50_69'}, {label: 'Zwężenie 70-99%', value: 'sten_70_99'}, {label: 'Niedrożna', value: 'occl'}] },
      { id: 'l_ica_status', label: 'Lewa ICA', type: FieldType.SELECT, options: [{label: 'Drożna', value: 'patent'}, {label: 'Zwężenie <50%', value: 'sten_lt50'}, {label: 'Zwężenie 50-69%', value: 'sten_50_69'}, {label: 'Zwężenie 70-99%', value: 'sten_70_99'}, {label: 'Niedrożna', value: 'occl'}] },
      { id: 'hdr_e_risk', label: 'KLASYFIKACJA RYZYKA - PODSUMOWANIE', type: FieldType.SECTION_HEADER },
      { id: 'posterior_risk', label: 'Ryzyko krążenia tylnego', type: FieldType.SELECT, options: [{label: 'Niskie (pełne PCom, kodom. VA)', value: 'low'}, {label: 'Umiarkowane (jednostr. PCom)', value: 'med'}, {label: 'Wysokie (brak PCom, pojedyncza VA)', value: 'high'}] },
      { id: 'willis_risk_total', label: '[NOWE] Ryzyko Koła Willisa - ŁĄCZNIE', type: FieldType.RADIO, options: [{label: 'Niskie', value: 'low'}, {label: 'Umiarkowane', value: 'med'}, {label: 'Wysokie', value: 'high'}] }
    ]
  },
  {
    id: 'sec_f_cardiac',
    title: 'Sekcja F: Przedoperacyjna Ocena Kardiologiczna',
    description: 'ECHO i Coronary Angio (v1.1 - PEŁNA)',
    fields: [
      { id: 'hdr_f_consult', label: 'KONSULTACJA', type: FieldType.SECTION_HEADER },
      { id: 'cardio_consult_done', label: 'Wykonano konsultację kardiologiczną', type: FieldType.RADIO, options: YES_NO },
      { id: 'cardio_consult_date', label: 'Data konsultacji', type: FieldType.DATE },
      { id: 'hdr_f_echo', label: 'ECHOKARDIOGRAFIA', type: FieldType.SECTION_HEADER },
      { id: 'echo_type', label: 'Wykonano echokardiografię', type: FieldType.SELECT, options: [{label: 'TTE', value: 'tte'}, {label: 'TEE', value: 'tee'}, {label: 'Oba', value: 'both'}, {label: 'Nie wykonano', value: 'none'}] },
      { id: 'lvef_perc', label: 'LVEF (%)', type: FieldType.NUMBER, unit: '%' },
      { id: 'lv_function', label: 'Funkcja LK', type: FieldType.SELECT, options: [{label: 'Prawidłowa (>=55%)', value: 'norm'}, {label: 'Łagodna (45-54%)', value: 'mild'}, {label: 'Umiarkowana (30-44%)', value: 'mod'}, {label: 'Ciężka (<30%)', value: 'severe'}] },
      { id: 'aortic_insuf_grade', label: 'Niedomykalność aortalna', type: FieldType.SELECT, options: GRADE_NONE_SEVERE },
      { id: 'aortic_sten_grade', label: 'Stenoza aortalna', type: FieldType.SELECT, options: GRADE_NONE_SEVERE },
      { id: 'pfo_detected', label: 'Wykryto przetrwały otwór owalny (PFO)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'asd_detected', label: 'Wykryto ubytek przegrody międzyprzedsionkowej', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'laa_thrombus', label: 'Skrzeplina w uszku lewego przedsionka', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_f_coronary', label: 'OCENA TĘTNIC WIEŃCOWYCH', type: FieldType.SECTION_HEADER },
      { id: 'coronary_eval_method', label: 'Metoda oceny tt. wieńcowych', type: FieldType.SELECT, options: [{label: 'Angio-TK tt. wieńcowych', value: 'ct'}, {label: 'Koronarografia inwazyjna', value: 'angio'}, {label: 'Testy obciążeniowe', value: 'stress'}, {label: 'Nie wykonano', value: 'none'}] },
      { id: 'cad_status', label: 'Choroba wieńcowa', type: FieldType.SELECT, options: [{label: 'Brak', value: 'none'}, {label: 'Nieobturacyjna', value: 'non_obt'}, {label: '1-naczyniowa', value: '1v'}, {label: '2-naczyniowa', value: '2v'}, {label: '3-naczyniowa', value: '3v'}, {label: 'Pień lewej', value: 'main_l'}] },
      { id: 'revasc_required_pre_aorta', label: 'Rewaskularyzacja wymagana przed naprawą aorty', type: FieldType.RADIO, options: YES_NO_UNKNOWN }
    ]
  },
  {
    id: 'sec_g_proc',
    title: 'Sekcja G: Dane Proceduralne',
    description: 'Szczegóły zabiegu i konfiguracja v1.1',
    fields: [
      { id: 'hdr_g_basic', label: 'CZAS I WARUNKI', type: FieldType.SECTION_HEADER },
      { id: 'proc_date', label: 'Data zabiegu', type: FieldType.DATE },
      { id: 'urgency_proc', label: 'Tryb zabiegu', type: FieldType.RADIO, options: [{label: 'Planowy', value: 'elective'}, {label: 'Pilny (<24h)', value: 'urgent'}, {label: 'Nagły (<2h)', value: 'emergency'}, {label: 'Ratunkowy', value: 'salvage'}] },
      { id: 'proc_location', label: 'Miejsce zabiegu', type: FieldType.RADIO, options: [{label: 'Hybrydowa sala operacyjna', value: 'hybrid'}, {label: 'Konwencjonalna sala oper.', value: 'conv'}] },
      { id: 'operator_1_init', label: 'Operator 1 (inicjały)', type: FieldType.TEXT },
      { id: 'operator_2_init', label: 'Operator 2 (inicjały)', type: FieldType.TEXT },
      { id: 'hdr_g_access', label: 'DOSTĘP NACZYNIOWY', type: FieldType.SECTION_HEADER },
      { id: 'main_access_site', label: 'Główny dostęp tętniczy', type: FieldType.SELECT, options: [{label: 'Udowy (chirurgiczny)', value: 'fem_s'}, {label: 'Udowy (przezskórny)', value: 'fem_p'}, {label: 'Konduit biodrowy', value: 'conduit'}, {label: 'Aortalny (bezpośredni)', value: 'direct'}] },
      { id: 'main_access_side', label: 'Strona głównego dostępu', type: FieldType.RADIO, options: [{label: 'Prawa', value: 'r'}, {label: 'Lewa', value: 'l'}] },
      { id: 'main_sheath_fr', label: 'Rozmiar koszulki głównej (Fr)', type: FieldType.NUMBER },
      { id: 'add_access_site', label: 'Dostęp dodatkowy (jeśli dotyczy)', type: FieldType.SELECT, options: [{label: 'Promieniowy prawy', value: 'rad_r'}, {label: 'Promieniowy lewy', value: 'rad_l'}, {label: 'Ramienny prawy', value: 'brach_r'}, {label: 'Ramienny lewy', value: 'brach_l'}, {label: 'Pachowy prawy', value: 'ax_r'}, {label: 'Pachowy lewy', value: 'ax_l'}] },
      { id: 'hdr_g_config', label: 'KONFIGURACJA URZĄDZENIA', type: FieldType.SECTION_HEADER },
      { id: 'stentgraft_system', label: 'System stentgraftu', type: FieldType.SELECT, options: [{label: 'NEXUS', value: 'nexus'}, {label: 'COOK arch branch', value: 'cook'}, {label: 'RelayBranch', value: 'relay'}, {label: 'Gore TAG', value: 'gore'}, {label: 'Inny', value: 'other'}] },
      { id: 'proc_config', label: 'Konfiguracja', type: FieldType.RADIO, options: [{label: 'Rozgałęziony (branched)', value: 'branched'}, {label: 'Modułowy', value: 'modular'}, {label: 'Fenestrowany', value: 'fen'}, {label: 'LIFS', value: 'lifs'}] },
      { id: 'treated_arch_branches_count', label: 'Liczba leczonych odgałęzień łuku', type: FieldType.RADIO, options: [{label: '1', value: '1'}, {label: '2', value: '2'}, {label: '3', value: '3'}] },
      { id: 'treated_vessels', label: 'Leczone naczynia', type: FieldType.SELECT, options: [{label: 'BCT/Pień r-g', value: 'bct'}, {label: 'LCCA', value: 'lcca'}, {label: 'LSA', value: 'lsa'}, {label: 'Wiele', value: 'multi'}] },
      { id: 'lsa_coverage_no_revasc', label: 'Pokrycie LSA bez rewaskularyzacji', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'bypass_cs_p', label: 'Bypass/transpozycja szyjno-podobojczykowa', type: FieldType.RADIO, options: YES_NO_UNKNOWN }
    ]
  },
  {
    id: 'sec_g2_matasa',
    title: '[NOWE] Sekcja G2: PRÓBA MATASA (dla LIFS/NEXUS)',
    description: 'Ocena tolerancji ucisku t. szyjnej v1.1',
    fields: [
      { id: 'matasa_done', label: 'Wykonano próbę Matasa', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'matasa_compression_time', label: 'Czas ucisku t. szyjnej (minuty)', type: FieldType.NUMBER },
      { id: 'matasa_side', label: 'Strona ucisku', type: FieldType.RADIO, options: [{label: 'Prawa', value: 'r'}, {label: 'Lewa', value: 'l'}, {label: 'Obustronna (sekwencyjnie)', value: 'both'}] },
      { id: 'matasa_neuro_symptoms', label: 'Objawy neurologiczne podczas próby', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'matasa_symptoms_desc', label: 'Jeśli objawy - opis', type: FieldType.TEXTAREA },
      { id: 'matasa_rso2_drop_detected', label: 'Spadek rSO2 podczas próby Matasa', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'matasa_rso2_drop_max', label: 'Maks. spadek rSO2 podczas próby (%)', type: FieldType.NUMBER, unit: '%' },
      { id: 'matasa_result', label: 'Wynik próby Matasa', type: FieldType.SELECT, options: [{label: 'Negatywna (toleruje)', value: 'neg'}, {label: 'Pozytywna (nietolerancja)', value: 'pos'}, {label: 'Nieokreślona', value: 'unclear'}] },
      { id: 'lifs_reason', label: 'Uzasadnienie zastosowania LIFS', type: FieldType.SELECT, options: [{label: 'Anatomia naczyń', value: 'anat'}, {label: 'Ograniczenia urządzenia', value: 'device'}, {label: 'Kąt odejścia naczynia', value: 'angle'}, {label: 'Odległość między tt.', value: 'dist'}, {label: 'Inne', value: 'inne'}] }
    ]
  },
  {
    id: 'sec_h_hemo',
    title: 'Sekcja H: Śródoperacyjne Monitorowanie i Hemodynamika',
    description: 'NIRS i parametry hemodynamiczne v1.1',
    fields: [
      { id: 'hdr_h_nirs', label: 'MONITOROWANIE NIRS (SPEKTROSKOPIA)', type: FieldType.SECTION_HEADER },
      { id: 'nirs_used', label: 'Stosowano monitorowanie NIRS', type: FieldType.RADIO, options: YES_NO },
      { id: 'nirs_device', label: 'Urządzenie NIRS', type: FieldType.TEXT },
      { id: 'rso2_baseline_r', label: 'Wyjściowe rSO2 (prawa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_baseline_l', label: 'Wyjściowe rSO2 (lewa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_lowest_r', label: 'Najniższe rSO2 (prawa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_lowest_l', label: 'Najniższe rSO2 (lewa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_delta_max_r', label: 'Maks. Delta rSO2 (prawa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_delta_max_l', label: 'Maks. Delta rSO2 (lewa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_alert_triggered', label: 'Wyzwolono alert rSO2 (spadek >20% lub <50% bezwzgl.)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'rso2_intervention', label: 'Wywolano interwencje rSO2 (spadek >25% lub <40%)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_h_nirs_phases', label: '[NOWE] NIRS PODCZAS KLUCZOWYCH FAZ ZABIEGU', type: FieldType.SECTION_HEADER },
      { id: 'rso2_pre_stim_r', label: 'rSO2 przed stymulacją (prawa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_pre_stim_l', label: 'rSO2 przed stymulacją (lewa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_during_stim_r', label: 'rSO2 podczas stymulacji (prawa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_during_stim_l', label: 'rSO2 podczas stymulacji (lewa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_at_deployment_r', label: 'rSO2 przy rozprężeniu (prawa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'rso2_at_deployment_l', label: 'rSO2 przy rozprężeniu (lewa)', type: FieldType.NUMBER, unit: '%' },
      { id: 'hdr_h_map', label: 'STREFA KONTROLI MAP (CEL: 80-100 mmHg)', type: FieldType.SECTION_HEADER },
      { id: 'map_baseline', label: 'Wyjściowe MAP', type: FieldType.NUMBER, unit: 'mmHg' },
      { id: 'map_highest', label: 'Najwyższe MAP', type: FieldType.NUMBER, unit: 'mmHg' },
      { id: 'map_lowest', label: 'Najniższe MAP', type: FieldType.NUMBER, unit: 'mmHg' },
      { id: 'map_at_deployment', label: 'MAP przy rozprężeniu', type: FieldType.NUMBER, unit: 'mmHg' },
      { id: 'map_lt_80_time', label: 'Czas MAP <80 mmHg (minuty)', type: FieldType.NUMBER },
      { id: 'map_gt_100_time', label: 'Czas MAP >100 mmHg (minuty)', type: FieldType.NUMBER },
      { id: 'map_ge_85_pre_stim', label: 'MAP >=85 mmHg przez >=30s przed stymulacją', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_h_vent', label: 'WENTYLACJA I PERFUZJA', type: FieldType.SECTION_HEADER },
      { id: 'etco2_target_maintained', label: 'Cel EtCO2 (35-40 mmHg) utrzymany', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'paco2_measured', label: 'PaCO2 (jeśli mierzono)', type: FieldType.NUMBER, unit: 'mmHg' },
      { id: 'lowest_body_temp', label: 'Temperatura (najniższa)', type: FieldType.NUMBER, unit: '°C' },
      { id: 'hdr_h_anticoag', label: 'ANTYKOAGULACJA', type: FieldType.SECTION_HEADER },
      { id: 'heparin_dose_total', label: 'Dawka heparyny (j.m.)', type: FieldType.NUMBER },
      { id: 'baseline_act', label: 'Wyjściowy ACT (sekundy)', type: FieldType.NUMBER },
      { id: 'peak_act', label: 'Szczytowy ACT (sekundy)', type: FieldType.NUMBER },
      { id: 'act_target_maintained', label: 'ACT utrzymany 250-300s przez cały zabieg', type: FieldType.RADIO, options: YES_NO },
      { id: 'protamine_given', label: 'Podano protaminę', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_h_pacing', label: 'SZYBKA STYMULACJA KOMOROWA (RAPID PACING)', type: FieldType.SECTION_HEADER },
      { id: 'rapid_pacing_used', label: 'Stosowano szybką stymulację komorową', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'pacing_episodes_count', label: 'Liczba epizodów stymulacji', type: FieldType.NUMBER },
      { id: 'pacing_time_total', label: 'Całkowity czas stymulacji (sekundy)', type: FieldType.NUMBER },
      { id: 'pacing_freq', label: 'Częstość stymulacji (/min)', type: FieldType.NUMBER },
      { id: 'volume_filling_pre_stim', label: 'Wypełnienie objętościowe przed stymulacją (mL)', type: FieldType.NUMBER }
    ]
  },
  {
    id: 'sec_i_protection',
    title: 'Sekcja I: Ochrona przed Zatorami i Płukanie Urządzenia',
    description: 'Strategie protekcji v1.1',
    fields: [
      { id: 'hdr_i_flush', label: 'CIĄGŁE PŁUKANIE KOSZULKI', type: FieldType.SECTION_HEADER },
      { id: 'continuous_flush_used', label: 'Stosowano ciągłe płukanie solą heparynizowaną', type: FieldType.RADIO, options: YES_NO },
      { id: 'flush_fluid_type', label: 'Roztwór do płukania', type: FieldType.SELECT, options: [{label: '0,9% NaCl + 1000 j.m. heparyny/L', value: 'std'}, {label: 'Inny', value: 'other'}] },
      { id: 'flush_pressure_target', label: 'Ciśnienie w worku 150-200 mmHg', type: FieldType.RADIO, options: YES_NO },
      { id: 'flush_rate_drops_per_sec', label: 'Prędkość płukania (kropli/sekundę)', type: FieldType.NUMBER, unit: 'cel: 1-2' },
      { id: 'hdr_i_prep', label: 'WSTĘPNE PŁUKANIE STENTGRAFTU', type: FieldType.SECTION_HEADER },
      { id: 'sg_flush_technique', label: 'Technika płukania stentgraftu', type: FieldType.SELECT, options: [{label: 'CO2 + sol fizjol. (w koszulce)', value: 'co2_sal'}, {label: 'Wypływ wsteczny (w rękawie)', value: 'retro'}, {label: 'Inna', value: 'other'}] },
      { id: 'sg_air_removed_confirmed', label: 'Potwierdzono całkowite usunięcie powietrza', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_i_epd', label: 'DYSTALNA OCHRONA ZATOROWA (EPD)', type: FieldType.SECTION_HEADER },
      { id: 'epd_used_proc', label: 'Stosowano dystalną ochronę zatorową (EPD)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'epd_indication', label: 'Wskazanie do EPD', type: FieldType.SELECT, options: [{label: 'Aorta shaggy', value: 'shaggy'}, {label: 'Skrzeplina łuku', value: 'thromb_arch'}, {label: 'Skrzeplina aorty wstęp.', value: 'thromb_asc'}, {label: 'Rutynowo', value: 'routine'}, {label: 'Inne', value: 'other'}] },
      { id: 'epd_device', label: 'Urządzenie ochronne', type: FieldType.SELECT, options: [{label: 'Filtr Spider', value: 'spider'}, {label: 'Sentinel', value: 'sentinel'}, {label: 'TriGuard', value: 'triguard'}, {label: 'Inne', value: 'other'}] },
      { id: 'epd_protected_vessels', label: 'Chronione naczynia', type: FieldType.SELECT, options: [{label: 'Prawa CCA (przez BCT)', value: 'r_cca'}, {label: 'LCCA', value: 'lcca'}, {label: 'Obie CCA', value: 'both'}] },
      { id: 'epd_access_site', label: 'Dostęp dla EPD', type: FieldType.SELECT, options: [{label: 'Promieniowy prawy', value: 'rad_r'}, {label: 'Promieniowy lewy', value: 'rad_l'}, {label: 'Ramienny', value: 'brach'}, {label: 'Udowy', value: 'fem'}] },
      { id: 'epd_sheath_fr', label: 'Rozmiar koszulki ochronnej (Fr)', type: FieldType.NUMBER },
      { id: 'epd_removed_success', label: 'Filtr pomyślnie usunięty', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'epd_material_visible', label: 'Widoczny materiał zatorowy w filtrze', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'epd_material_desc', label: 'Opis materiału (jeśli widoczny)', type: FieldType.TEXTAREA },
      { id: 'epd_to_pathology', label: 'Filtr wysłany do badania histopatologicznego', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_i_analysis', label: '[NOWE] ANALIZA MATERIAŁU ZATOROWEGO', type: FieldType.SECTION_HEADER },
      { id: 'epd_material_type', label: 'Typ materiału', type: FieldType.SELECT, options: [{label: 'Skrzeplina', value: 'thrombus'}, {label: 'Blaszka miażdż.', value: 'plaque'}, {label: 'Materiał mieszany', value: 'mixed'}, {label: 'Inne', value: 'other'}] },
      { id: 'epd_material_vol_mm3', label: 'Szacowana objętość materiału (mm3)', type: FieldType.NUMBER },
      { id: 'epd_ct_correlation', label: 'Korelacja z obrazem TK (shaggy/skrzeplina)', type: FieldType.RADIO, options: YES_NO_UNKNOWN }
    ]
  },
  {
    id: 'sec_j_completion',
    title: 'Sekcja J: Zakończenie Zabiegu',
    description: 'Wyniki techniczne v1.1',
    fields: [
      { id: 'proc_time_total_min', label: 'Całkowity czas zabiegu (min)', type: FieldType.NUMBER },
      { id: 'fluoro_time_min', label: 'Czas fluoroskopii (min)', type: FieldType.NUMBER },
      { id: 'contrast_vol_ml', label: 'Objętość kontrastu (mL)', type: FieldType.NUMBER },
      { id: 'est_blood_loss_ml', label: 'Szacowana utrata krwi (mL)', type: FieldType.NUMBER },
      { id: 'intraop_angio_neuro_done', label: 'Wykonano angiografię wewnątrzczaszkową', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'intraop_angio_neuro_result', label: 'Stan naczyń w angio (jeśli tak)', type: FieldType.SELECT, options: [{label: 'Wszystkie drożne', value: 'patent'}, {label: 'Wykryto niedrożność', value: 'occl'}] },
      { id: 'hdr_j_success', label: 'WYNIK TECHNICZNY', type: FieldType.SECTION_HEADER },
      { id: 'tech_success', label: 'Sukces techniczny (ekskluzja, drożność, brak I/III)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'endoleak_type_1', label: 'Przeciek typu I', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'endoleak_type_2', label: 'Przeciek typu II', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'endoleak_type_3', label: 'Przeciek typu III', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'branch_vessel_occlusion', label: 'Niedrożność naczynia odgałęzionego', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'open_conversion', label: 'Konwersja do operacji otwartej', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'unplanned_addon_proc', label: 'Nieplanowany dodatkowy zabieg', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_j_limits', label: '[NOWE] OGRANICZENIA TECHNICZNE URZĄDZENIA', type: FieldType.SECTION_HEADER },
      { id: 'tech_limit_encountered', label: 'Napotkano ograniczenia techniczne urządzenia', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'tech_limit_type', label: 'Typ ograniczenia', type: FieldType.SELECT, options: [{label: 'Rozmiar (maks. 46mm)', value: 'size'}, {label: 'Kąt odejścia', value: 'angle'}, {label: 'Długość', value: 'length'}, {label: 'Inne', value: 'other'}] },
      { id: 'tech_limit_desc', label: 'Opis ograniczenia', type: FieldType.TEXTAREA }
    ]
  },
  {
    id: 'sec_k_neuro_outcome',
    title: 'Sekcja K: Wyniki Neurologiczne',
    description: 'Ocena powikłań v1.1 - ROZSZERZONA',
    fields: [
      { id: 'hdr_k_immediate', label: 'BEZPOŚREDNIA OCENA POOPERACYJNA (W CIĄGU 24H)', type: FieldType.SECTION_HEADER },
      { id: 'new_neuro_deficit_at_wake', label: 'Nowy ogniskowy deficyt neurologiczny przy wybudzeniu', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'time_to_first_neuro_eval_h', label: 'Czas pierwszej oceny neurologicznej (h po zabiegu)', type: FieldType.NUMBER },
      { id: 'gcs_at_wake', label: 'GCS przy wybudzeniu', type: FieldType.NUMBER, unit: '/15' },
      { id: 'motor_deficit', label: 'Deficyt ruchowy (jakikolwiek)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'speech_deficit', label: 'Deficyt mowy/języka', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'vision_deficit', label: 'Deficyt wzrokowy', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_k_stroke_30d', label: 'UDAR (W CIĄGU 30 DNI)', type: FieldType.SECTION_HEADER },
      { id: 'any_stroke_30d', label: 'Jakikolwiek udar', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'stroke_date', label: 'Jeśli tak - data wystąpienia', type: FieldType.DATE },
      { id: 'stroke_time_from_proc_h', label: 'Czas od zabiegu do udaru (godziny)', type: FieldType.NUMBER },
      { id: 'stroke_type_cat', label: 'Typ udaru', type: FieldType.SELECT, options: [{label: 'Niedokrwienny', value: 'isch'}, {label: 'Krwotoczny', value: 'hem'}, {label: 'Oba/mieszany', value: 'mix'}, {label: 'Nieznany', value: 'unk'}] },
      { id: 'stroke_area_cat', label: 'Obszar udaru', type: FieldType.SELECT, options: [{label: 'MCA', value: 'mca'}, {label: 'ACA', value: 'aca'}, {label: 'PCA', value: 'pca'}, {label: 'Kręgowo-podstawny', value: 'vb'}, {label: 'Strefowy (watershed)', value: 'ws'}, {label: 'Liczne', value: 'multi'}, {label: 'Nieznany', value: 'unk'}] },
      { id: 'stroke_side', label: 'Strona udaru', type: FieldType.RADIO, options: [{label: 'Prawa', value: 'r'}, {label: 'Lewa', value: 'l'}, {label: 'Obustronna', value: 'bilat'}] },
      { id: 'stroke_imaging_confirmed', label: 'Potwierdzenie obrazowe (TK/MR)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'nihss_at_diagnosis', label: 'NIHSS przy rozpoznaniu', type: FieldType.NUMBER, unit: '/42' },
      { id: 'mrs_at_30d', label: 'mRS w 30. dobie', type: FieldType.NUMBER, unit: '/6' },
      { id: 'stroke_classification_30d', label: 'Klasyfikacja udaru', type: FieldType.SELECT, options: [{label: 'Mały (mRS 0-2)', value: 'small'}, {label: 'Duży (mRS 3-5)', value: 'large'}, {label: 'Śmiertelny (mRS 6)', value: 'fatal'}] },
      { id: 'hdr_k_correlation', label: '[NOWE] KORELACJA Z CZYNNIKAMI RYZYKA', type: FieldType.SECTION_HEADER },
      { id: 'corr_asc_aorta_ge_40', label: 'Udar u pacjenta z śr. aorty wstęp. >=40 mm', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'corr_prev_stroke_tia', label: 'Udar u pacjenta z przebytym udarem/TIA', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'corr_shaggy_aorta', label: 'Udar u pacjenta z aortą shaggy', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'corr_willis_inc', label: 'Udar u pacjenta z niepełnym Kołem Willisa', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'corr_aneurysm_ge_70', label: 'Udar u pacjenta z tętniakiem >= 70 mm', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_k_tia', label: 'PRZEMIJAJĄCY ATAK NIEDOKRWIENNY (TIA)', type: FieldType.SECTION_HEADER },
      { id: 'tia_any', label: 'TIA (deficyt <24h, brak zmian w TK/MR)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'tia_date', label: 'Data TIA', type: FieldType.DATE },
      { id: 'tia_duration_h', label: 'Czas trwania objawów (h)', type: FieldType.NUMBER },
      { id: 'tia_symptoms', label: '[NOWE] Objawy TIA', type: FieldType.SELECT, options: [{label: 'Niedowlad', value: 'weak'}, {label: 'Zaburzenia mowy', value: 'speech'}, {label: 'Zaburzenia widzenia', value: 'vision'}, {label: 'Zawroty głowy', value: 'dizz'}, {label: 'Inne', value: 'other'}] },
      { id: 'hdr_k_sci', label: 'NIEDOKRWIENIE RDZENIA KRĘGOWEGO (SCI)', type: FieldType.SECTION_HEADER },
      { id: 'sci_any', label: 'Niedokrwienie rdzenia kręgowego', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'sci_severity', label: 'Nasilenie SCI', type: FieldType.SELECT, options: [{label: 'Niedowład kończyn dolnych', value: 'weak'}, {label: 'Porażenie kończyn dolnych', value: 'paral'}, {label: 'Przemijające (ustąpiło)', value: 'trans'}] },
      { id: 'sci_onset_h_post_proc', label: 'Czas do wystąpienia objawów (h po zabiegu)', type: FieldType.NUMBER },
      { id: 'hdr_k_intervention', label: 'INTERWENCJA NEURONACZYNIOWA', type: FieldType.SECTION_HEADER },
      { id: 'thrombectomy_done', label: 'Wykonano trombektomię mechaniczną', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'thrombectomy_time_to_puncture', label: 'Czas od objawów do nakłucia (min)', type: FieldType.NUMBER },
      { id: 'thrombectomy_recanalization', label: 'Skuteczna rekanalizacja (TICI 2b/3)', type: FieldType.RADIO, options: YES_NO_UNKNOWN }
    ]
  },
  {
    id: 'sec_l_complications',
    title: 'Sekcja L: Inne Powikłania (30-dniowe)',
    description: 'Powikłania ogólnoustrojowe v1.1',
    fields: [
      { id: 'hdr_l_cv', label: 'SERCOWO-NACZYNIOWE', type: FieldType.SECTION_HEADER },
      { id: 'mi_30d', label: 'Zawał mięśnia sercowego', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'afib_new_onset', label: 'Nowo powstałe migotanie przedsionków', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'cardiac_arrest', label: 'Zatrzymanie krążenia', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'aortic_rupture_post', label: 'Pęknięcie aorty', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'retrograde_type_a', label: 'Wsteczne rozwarstwienie typu A', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_l_access', label: 'DOSTĘP NACZYNIOWY', type: FieldType.SECTION_HEADER },
      { id: 'access_hematoma_intervention', label: 'Krwiak w miejscu dostępu wymagający interwencji', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'retroperitoneal_hematoma', label: 'Krwiak zaotrzewnowy', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'limb_ischemia_major', label: 'Niedokrwienie kończyny', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'pseudoaneurysm', label: 'Tętniak rzekomy', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'av_fistula', label: 'Przetoka tętniczo-żylna', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_l_renal', label: 'NERKOWE', type: FieldType.SECTION_HEADER },
      { id: 'aki_akin_ge_2', label: 'Ostre uszkodzenie nerek (AKIN >=2)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'new_dialysis_required', label: 'Nowa konieczność dializy', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_l_resp', label: 'ODDECHOWE', type: FieldType.SECTION_HEADER },
      { id: 'pneumonia_30d', label: 'Zapalenie płuc', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'vent_gt_48h', label: 'Przedłużona wentylacja (>48h)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'tracheostomy_required', label: 'Tracheostomia', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_l_inf', label: 'INFEKCYJNE', type: FieldType.SECTION_HEADER },
      { id: 'ssi_site', label: 'Zakażenie miejsca operowanego', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'sepsis_30d', label: 'Posocznica', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'stentgraft_infection', label: 'Zakażenie stentgraftu', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_l_bleed', label: 'KRWAWIENIE', type: FieldType.SECTION_HEADER },
      { id: 'bleeding_barc_ge_3', label: 'Duże krwawienie (BARC >=3)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'prbc_units_transfused', label: 'Przetoczone jednostki KKCz', type: FieldType.NUMBER },
      { id: 'reop_for_bleeding', label: 'Reoperacja z powodu krwawienia', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'hdr_l_other', label: 'INNE', type: FieldType.SECTION_HEADER },
      { id: 'bowel_ischemia', label: 'Niedokrwienie jelit', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'arm_ischemia_lsa', label: 'Niedokrwienie lewej ręki (jeśli pokryto LSA)', type: FieldType.RADIO, options: YES_NO_UNKNOWN }
    ]
  },
  {
    id: 'sec_m_death',
    title: 'Sekcja M: Śmiertelność',
    description: 'Przyczyny zgonów v1.1',
    fields: [
      { id: 'death_any_30d', label: 'Zgon w ciągu 30 dni', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'death_date', label: 'Jeśli tak - data zgonu', type: FieldType.DATE },
      { id: 'death_days_from_proc_final', label: 'Dni od zabiegu do zgonu', type: FieldType.NUMBER },
      { id: 'death_cause_main', label: 'Główna przyczyna zgonu', type: FieldType.SELECT, options: [{label: 'Udar niedokrwienny', value: 'str_i'}, {label: 'Udar krwotoczny', value: 'str_h'}, {label: 'Pęknięcie aorty', value: 'rupt'}, {label: 'Sercowa', value: 'card'}, {label: 'Posocznica', value: 'sepsis'}, {label: 'Niewydolność oddechowa', value: 'resp'}, {label: 'Wielonarządowa', value: 'mods'}, {label: 'Inna', value: 'other'}] },
      { id: 'death_classification_final', label: 'Klasyfikacja zgonu', type: FieldType.SELECT, options: [{label: 'Związany z aortą', value: 'aorta'}, {label: 'Sercowo-naczyniowy (nie-aortalny)', value: 'cv'}, {label: 'Neurologiczny', value: 'neuro'}, {label: 'Inny', value: 'other'}] },
      { id: 'autopsy_performed', label: 'Wykonano sekcję zwłok', type: FieldType.RADIO, options: YES_NO_UNKNOWN }
    ]
  },
  {
    id: 'sec_n_followup',
    title: 'Sekcja N: Obserwacja (FOLLOW-UP)',
    description: 'Wyniki długofalowe v1.1',
    fields: [
      { id: 'followup_last_visit_date', label: 'Data ostatniej wizyty kontrolnej', type: FieldType.DATE },
      { id: 'followup_time_days', label: 'Czas obserwacji (dni)', type: FieldType.NUMBER },
      { id: 'followup_status', label: 'Status w obserwacji', type: FieldType.SELECT, options: [{label: 'Żyje', value: 'alive'}, {label: 'Zmarł', value: 'dead'}, {label: 'Utracony z obserwacji', value: 'lost'}] },
      { id: 'followup_mrs', label: 'mRS przy ostatniej wizycie', type: FieldType.NUMBER, unit: '/6' },
      { id: 'late_stroke_gt_30d', label: 'Późny udar (>30 dni)', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'reintervention_required', label: 'Wymagana reinterwencja', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'control_endoleak_found', label: 'Przeciek w kontrolnym badaniu obrazowym', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'branch_patency_confirmed', label: 'Potwierdzona drożność naczyń odgałęzionych', type: FieldType.RADIO, options: YES_NO_UNKNOWN }
    ]
  },
  {
    id: 'sec_o_quality',
    title: 'Sekcja O: Jakość i Kompletność Danych',
    description: 'Weryfikacja v1.1',
    fields: [
      { id: 'mandatory_fields_filled', label: 'Wszystkie obowiązkowe pola wypełnione', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'source_docs_available', label: 'Dokumentacja źródłowa dostępna', type: FieldType.RADIO, options: YES_NO_UNKNOWN },
      { id: 'data_entry_initials', label: 'Wprowadził (inicjały)', type: FieldType.TEXT },
      { id: 'data_entry_date', label: 'Data wprowadzenia danych', type: FieldType.DATE },
      { id: 'verification_initials', label: 'Zweryfikował (inicjały)', type: FieldType.TEXT },
      { id: 'verification_date', label: 'Data weryfikacji', type: FieldType.DATE }
    ]
  }
];

const generateMockData = () => {
  const records = [];
  const startYear = 2024;
  
  // Indication and disease arrays
  const indications = ['tetniak', 'rozwarstwienie'];
  const ethnicities = ['kaukaskie', 'afrykanskie', 'azjatyckie'];
  const smokingStatus = ['nigdy', 'byly', 'aktualny'];
  const strokeAreas = ['mca', 'aca', 'pca', 'vb'];
  const stentgrafts = ['nexus', 'relay', 'cook'];
  const configs = ['branched', 'modular'];
  
  for (let i = 1; i <= 50; i++) {
    const isFemale = Math.random() > 0.5;
    const age = 62 + Math.floor(Math.random() * 20);
    const urgency = Math.random() > 0.8 ? 'emergency' : 'elective';
    const hasShaggy = Math.random() > 0.7 ? 'tak' : 'nie';
    const hasIncompleteCow = Math.random() > 0.5;
    const hasEpd = urgency === 'elective' ? (Math.random() > 0.2 ? 'tak' : 'nie') : (Math.random() > 0.7 ? 'tak' : 'nie');
    
    let strokeProb = 0.04;
    if (hasShaggy === 'tak') strokeProb += 0.15;
    if (hasIncompleteCow) strokeProb += 0.08;
    if (hasEpd === 'nie') strokeProb += 0.10;
    if (urgency !== 'elective') strokeProb += 0.12;

    const hasStroke = Math.random() < strokeProb ? 'tak' : 'nie';
    // Always assign a stroke type to stroke patients
    const strokeTypeRand = Math.random();
    const strokeType = strokeTypeRand < 0.70 ? 'isch' : strokeTypeRand < 0.85 ? 'hem' : strokeTypeRand < 0.95 ? 'mix' : 'unk';
    const contrastVol = 90 + Math.floor(Math.random() * 140);
    const baselineCreat = 70 + Math.floor(Math.random() * 60);
    const hasAki = (contrastVol > 180 || baselineCreat > 110) && Math.random() > 0.7 ? 'tak' : 'nie';
    const isDead = (hasStroke === 'tak' && Math.random() > 0.8) || (Math.random() < 0.03) ? 'tak' : 'nie';

    const data: Record<string, any> = {
      // Section A - Administrative
      study_number: `SA-${1000 + i}`,
      center_code: 'PL-01',
      inclusion_date: `2024-02-${String(1 + Math.floor(Math.random() * 25)).padStart(2, '0')}`,
      collector_initials: 'JK',
      consent_obtained: 'tak',
      consent_date: `2024-02-${String(1 + Math.floor(Math.random() * 25)).padStart(2, '0')}`,
      
      // Section B - Demographics
      dob: `${1960 + age}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
      age,
      sex: isFemale ? 'k' : 'm',
      height: isFemale ? 160 + Math.floor(Math.random() * 10) : 175 + Math.floor(Math.random() * 10),
      weight: isFemale ? 60 + Math.floor(Math.random() * 20) : 80 + Math.floor(Math.random() * 25),
      bmi: isFemale ? 24 + Math.random() * 4 : 26 + Math.random() * 3,
      ethnicity: ethnicities[Math.floor(Math.random() * ethnicities.length)],
      smoking_status: smokingStatus[Math.floor(Math.random() * smokingStatus.length)],
      
      // Section C - Comorbidities
      htn: 'tak',
      cad: Math.random() > 0.6 ? 'tak' : 'nie',
      mi_history: Math.random() > 0.8 ? 'tak' : 'nie',
      heart_failure_nyha: Math.random() > 0.7 ? '0' : Math.random() > 0.5 ? '1' : '2',
      afib: Math.random() > 0.75 ? 'tak' : 'nie',
      prev_cardio_sx: Math.random() > 0.85 ? 'tak' : 'nie',
      pfo_history: Math.random() > 0.85 ? 'tak' : 'nie',
      other_shunt: Math.random() > 0.9 ? 'tak' : 'nie',
      pad: Math.random() > 0.8 ? 'tak' : 'nie',
      stroke_isch: Math.random() > 0.7 ? 'tak' : 'nie',
      stroke_hem: Math.random() > 0.9 ? 'tak' : 'nie',
      stroke_tia: Math.random() > 0.8 ? 'tak' : 'nie',
      carotid_stenosis_gt50: Math.random() > 0.85 ? 'tak' : 'nie',
      cea_stent_history: Math.random() > 0.9 ? 'tak' : 'nie',
      cognitive_impairment: Math.random() > 0.88 ? 'tak' : 'nie',
      stroke_count: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
      last_stroke_date: Math.random() > 0.7 ? `2023-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}` : '',
      time_from_stroke_months: Math.random() > 0.7 ? Math.floor(Math.random() * 24) : 0,
      stroke_area: Math.random() > 0.7 ? strokeAreas[Math.floor(Math.random() * strokeAreas.length)] : '',
      permanent_neuro_deficit: Math.random() > 0.7 ? 'tak' : Math.random() > 0.5 ? 'nie' : 'nieznane',
      pre_proc_mrs: Math.floor(Math.random() * 5),
      dm: Math.random() > 0.7 ? 'tak' : 'nie',
      copd: Math.random() > 0.85 ? 'tak' : 'nie',
      chronic_kidney: Math.random() > 0.8 ? 'tak' : 'nie',
      dialysis: Math.random() > 0.95 ? 'tak' : 'nie',
      connective_tissue_disease: Math.random() > 0.9 ? 'tak' : 'nie',
      active_cancer: Math.random() > 0.9 ? 'tak' : 'nie',
      baseline_egfr: Math.floor(90 - (baselineCreat / 10)),
      baseline_creat: baselineCreat,
      baseline_hb: 11 + Math.random() * 4,
      ct_type: Math.random() > 0.95 ? 'marfan' : 'inna',
      ct_dx_age: Math.random() > 0.95 ? 45 : 0,
      
      // Section D - Pathology & Indication
      primary_indication: indications[Math.floor(Math.random() * indications.length)],
      indication_specify: Math.random() > 0.7 ? 'pseudotetniak' : '',
      aortic_diameter_mm: 50 + Math.floor(Math.random() * 40),
      aortic_diameter_proximal: 45 + Math.floor(Math.random() * 30),
      aortic_diameter_distal: 40 + Math.floor(Math.random() * 20),
      aortic_location: Math.random() > 0.5 ? 'thoracic' : 'aaaa',
      shaggy_aorta: hasShaggy,
      thrombus_aorta: Math.random() > 0.85 ? 'tak' : 'nie',
      willis_classification: hasIncompleteCow ? 'inc_both' : 'full',
      CoW_specify: hasIncompleteCow ? 'inc_anterior' : '',
      intracranial_stenosis: Math.random() > 0.8 ? 'tak' : 'nie',
      
      // Section E - Procedure Details
      urgency_proc: urgency,
      access_artery: Math.random() > 0.5 ? 'femoral' : 'axillary',
      anesthesia_type: Math.random() > 0.7 ? 'local' : 'general',
      stentgraft_system: stentgrafts[Math.floor(Math.random() * stentgrafts.length)],
      stent_diameter: 28 + Math.floor(Math.random() * 8),
      proc_config: configs[Math.floor(Math.random() * configs.length)],
      nirs_used: 'tak',
      epd_used_proc: hasEpd,
      proc_time_total_min: 140 + Math.floor(Math.random() * 80),
      setup_time_min: 20 + Math.floor(Math.random() * 15),
      fluoro_time_min: 30 + Math.floor(Math.random() * 45),
      contrast_vol_ml: contrastVol,
      blood_loss_ml: 50 + Math.floor(Math.random() * 300),
      fluid_administered_ml: 1000 + Math.floor(Math.random() * 2000),
      transfusion_needed: Math.random() > 0.95 ? 'tak' : 'nie',
      transfusion_type: 'prbc',
      units_transfused: Math.floor(Math.random() * 4),
      procedural_complications: Math.random() > 0.9 ? 'tak' : 'nie',
      complication_type: Math.random() > 0.95 ? 'dissection' : '',
      complication_managed: 'interventional',
      endoleak_type_1: Math.random() > 0.85 ? 'tak' : 'nie',
      endoleak_type_2: Math.random() > 0.95 ? 'tak' : 'nie',
      endoleak_type_3: Math.random() > 0.98 ? 'tak' : 'nie',
      sci_any: Math.random() > 0.92 ? 'tak' : 'nie',
      sci_severity: Math.random() > 0.92 ? (Math.random() > 0.5 ? 'weak' : 'paral') : '',
      sci_onset_h_post_proc: Math.random() > 0.92 ? 2 + Math.floor(Math.random() * 12) : 0,
      
      // Section F - 30-Day Outcomes
      any_stroke_30d: hasStroke,
      stroke_type_cat: hasStroke === 'tak' ? strokeType : '',
      stroke_subtype: hasStroke === 'tak' ? (strokeType === 'isch' ? 'territorial' : 'lobar') : '',
      stroke_hemispheric_location: Math.random() > 0.5 ? 'left' : 'right',
      nihss_at_diagnosis: hasStroke === 'tak' ? 6 + Math.floor(Math.random() * 12) : 0,
      nihss_at_24h: hasStroke === 'tak' ? 4 + Math.floor(Math.random() * 10) : 0,
      nihss_at_30d: hasStroke === 'tak' ? 2 + Math.floor(Math.random() * 8) : 0,
      mrs_at_24h: hasStroke === 'tak' ? 2 + Math.floor(Math.random() * 3) : 0,
      mrs_at_30d: hasStroke === 'tak' ? 2 + Math.floor(Math.random() * 2) : 0,
      aki_akin_ge_2: hasAki,
      max_creatinine_postproc: baselineCreat + (hasAki === 'tak' ? 20 + Math.random() * 40 : Math.random() * 10),
      bleeding_barc_ge_3: Math.random() > 0.9 ? 'tak' : 'nie',
      access_complication: Math.random() > 0.92 ? 'tak' : 'nie',
      access_complication_type: Math.random() > 0.98 ? 'pseudoaneurysm' : '',
      death_any_30d: isDead,
      death_days_from_proc_final: isDead === 'tak' ? 3 + Math.floor(Math.random() * 15) : 30,
      death_attributed_to: isDead === 'tak' ? Math.random() > 0.5 ? 'stroke' : 'other' : ''
    };

    records.push({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), data });
  }
  return records;
};

export const MOCK_DATA = generateMockData();
