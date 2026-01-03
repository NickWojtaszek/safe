# Segment-by-Segment Review Checklist

## Overview
This checklist guides you through reviewing all 16 protocol segments (sekcje) one by one, ensuring each:
- ✅ Has all fields properly defined
- ✅ Links to correct statistics
- ✅ Contains no deprecated fields
- ✅ Has required fields marked
- ✅ Passes data quality checks

---

## Segment 1: Sekcja A - Dane Administracyjne
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Fields to Review
- [ ] `study_number` - Numer badania (TEXT, REQ) → study_tracking
- [ ] `center_code` - Kod ośrodka (TEXT, REQ) → study_tracking
- [ ] `inclusion_date` - Data włączenia (DATE, REQ) → administrative_metadata
- [ ] `collector_initials` - Inicjały osoby zbierającej dane (TEXT, REQ) → administrative_metadata
- [ ] `consent_obtained` - Zgoda świadoma uzyskana (RADIO, OPT) → informed_consent
- [ ] `consent_date` - Data zgody (DATE, OPT) → informed_consent

### Questions
- [ ] All required fields have sample data?
- [ ] Date fields are YYYY-MM-DD format?
- [ ] Initials are 2-3 characters?
- [ ] Center code matches format (PL-001)?

### Issues Found
```
None
```

### Notes
Purely administrative section. Ensure study tracking fields are complete.

---

## Segment 2: Sekcja B - Dane Demograficzne
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Fields to Review
- [ ] `dob` - Data urodzenia (DATE, OPT) → age_calculation
- [ ] `age` - Wiek w dniu zabiegu (NUMBER, OPT) → age_distribution, risk_stratification
- [ ] `sex` - Płeć (RADIO, OPT) → sex_distribution, sex_subgroups
- [ ] `height` - Wzrost (NUMBER, OPT) → bmi_calculation
- [ ] `weight` - Masa ciała (NUMBER, OPT) → bmi_calculation
- [ ] `bmi` - BMI (NUMBER, OPT) → risk_factors
- [ ] `ethnicity` - Pochodzenie etniczne (SELECT, OPT) → demographic_diversity
- [ ] `smoking_status` - Status palenia (SELECT, OPT) → risk_factors

### Questions
- [ ] Age is 30-90 range?
- [ ] Sex is 'm' or 'k'?
- [ ] BMI calculated from height/weight (reasonable)?
- [ ] Smoking options match: nigdy, byly, aktualny?

### Issues Found
```
None
```

### Notes
Most fields optional but important for subgroup analysis. Age calculation critical for stratification.

---

## Segment 3: Sekcja C - Choroby Współistniejące
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Key Risk Factor Fields to Verify
- [ ] `htn` - Nadciśnienie tętnicze (RADIO) → comorbidity_prevalence, risk_factors
- [ ] `cad` - Choroba wieńcowa (RADIO) → risk_factors
- [ ] `afib` - Migotanie przedsionków (RADIO) → risk_factors
- [ ] `stroke_isch` - Przebyty udar niedokrwienny (RADIO) → stroke_predictors
- [ ] `stroke_tia` - Przebyty TIA (RADIO) → stroke_predictors
- [ ] `cognitive_impairment` - Zaburzenia poznawcze (RADIO) → risk_factors
- [ ] `baseline_egfr` - Wyjściowy eGFR (NUMBER) → aki_prediction
- [ ] `baseline_creat` - Wyjściowa kreatynina (NUMBER) → aki_prediction
- [ ] `baseline_hb` - Wyjściowa hemoglobina (NUMBER) → bleeding_risk

### Questions
- [ ] All YES_NO fields use 'tak'/'nie'?
- [ ] Lab values in reasonable ranges (eGFR 0-120, Cr 50-200)?
- [ ] Stroke history consistent with exclusion criteria?
- [ ] Comorbidity prevalence documented?

### Issues Found
```
⚠️ HIGH FIELD COUNT: 36 fields in one segment - very comprehensive
```

### Notes
**CRITICAL SEGMENT** - Contains major risk factors. All stroke history fields must be complete for outcome prediction. Verify baseline labs are pre-procedure values.

---

## Segment 4: Sekcja D - Wskazanie i Patologia Aorty
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Critical Anatomy Fields
- [ ] `primary_indication` - Wskazanie (SELECT) → indication_stratification
- [ ] `aneurysm_max_diam` - Maks. średnica tętniaka (NUMBER) → aneurysm_size_risk
- [ ] `aneurysm_gt_70` - Tętniak >= 70mm (RADIO) → risk_stratification
- [ ] `shaggy_aorta` - Aorta shaggy (RADIO, **CRITICAL**) → shaggy_predictor
- [ ] `asc_aorta_diam` - Śr. aorty wstępującej (NUMBER) → anatomy_risk_factors
- [ ] `asc_aorta_ge_40` - Śr. aorty wstęp. >= 40mm (RADIO) → risk_stratification
- [ ] `arch_type_ishimaru` - Typ łuku (RADIO) → anatomy_risk_factors
- [ ] `thrombus_in_arch` - Skrzeplina w łuku (RADIO) → plaque_burden
- [ ] `porcelain_aorta` - Aorta porcelanowa (RADIO) → anatomy_risk_factors
- [ ] `fl_thrombosis_grade` - Stopień zakrzepicy kanału fałszywego (SELECT) → dissection_severity
- [ ] `supraaortic_vessels_inv` - Zajęcie tt. nadaortalnych (SELECT) → branch_vessel_analysis

### Dissection-Specific Fields (If Applicable)
- [ ] `stanford_class` - Klasyfikacja Stanford (RADIO) → indication_stratification
- [ ] `dissection_phase` - Faza (RADIO) → indication_stratification
- [ ] `malperfusion_syndrome` - Zespół malperfuzji (RADIO) → risk_factors

### Questions
- [ ] Indication matches patient: tetniak, rozwarstwienie, etc?
- [ ] Aneurysm size >= 30mm for indication?
- [ ] Shaggy aorta documented (yes/no/unknown)?
- [ ] All aortic diameters in mm (20-100 range)?
- [ ] Arch type consistent with anatomy (I, II, or III)?

### Issues Found
```
🔴 CRITICAL: shaggy_aorta is major stroke predictor - must be collected
🔴 CRITICAL: asc_aorta_ge_40 linked to multiple risk analyses
⚠️ High field count (33 fields) - good for phenotyping
```

### Notes
**ABSOLUTELY CRITICAL SEGMENT** - Anatomical features directly predict stroke risk. shaggy_aorta is TOP predictor. asc_aorta_ge_40 linked to ascending aorta complications. All diameter measurements must be in mm and plausible.

---

## Segment 5: Sekcja E - Ocena Naczyń Mózgowych (Circle of Willis)
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Circle of Willis Assessment
- [ ] `angio_tk_done` - Wykonano angio-TK (RADIO) → imaging_documentation
- [ ] `acom_patent` - ACom drożna (RADIO) → willis_risk_assessment
- [ ] `segment_a1_aca` - Segment A1 (ACA) (SELECT) → willis_risk_assessment
- [ ] `r_pcom_patent` - PCom prawe drożne (RADIO) → cerebral_perfusion_reserve
- [ ] `l_pcom_patent` - PCom lewe drożne (RADIO) → cerebral_perfusion_reserve
- [ ] `r_va_status` - Tętn. kręgowa prawa (SELECT) → vertebrobasilar_status
- [ ] `l_va_status` - Tętn. kręgowa lewa (SELECT) → vertebrobasilar_status
- [ ] `va_dominance` - Dominacja VA (SELECT) → vertebrobasilar_status
- [ ] `r_ica_status` - ICA prawe (SELECT) → carotid_status
- [ ] `l_ica_status` - ICA lewe (SELECT) → carotid_status
- [ ] `willis_classification` - Klasyfikacja Koła Willisa (SELECT) → willis_risk
- [ ] `posterior_risk` - Ryzyko krążenia tylnego (SELECT) → risk_stratification
- [ ] `willis_risk_total` - Ryzyko Koła Willisa - łącznie (RADIO) → stroke_predictors

### Questions
- [ ] Circle of Willis imaging completed?
- [ ] At least one anterior communicating artery (AcomPatent)?
- [ ] Vertebral artery dominance documented?
- [ ] Posterior communicating arteries status clear?
- [ ] Overall Willis risk classified (low/med/high)?

### Issues Found
```
None
```

### Notes
**CRITICAL FOR STROKE RISK** - Incomplete Circle of Willis (especially absent PCom) increases stroke risk. VA dominance important for LIFS strategy. Risk classification (low/med/high) drives clinical decision-making.

---

## Segment 6: Sekcja F - Ocena Kardiologiczna
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Cardiac Function
- [ ] `cardio_consult_done` - Konsultacja kardiologiczna (RADIO) → baseline_evaluation
- [ ] `echo_type` - Echokardiografia (SELECT) → cardiac_function_baseline
- [ ] `lvef_perc` - LVEF (%) (NUMBER) → cardiac_function_baseline
- [ ] `lv_function` - Funkcja LK (SELECT) → risk_factors
- [ ] `aortic_insuf_grade` - Niedomykalność aortalna (SELECT) → cardiac_comorbidity
- [ ] `aortic_sten_grade` - Stenoza aortalna (SELECT) → cardiac_comorbidity
- [ ] `pfo_detected` - PFO (RADIO) → risk_factors
- [ ] `asd_detected` - ASD (RADIO) → risk_factors

### Coronary Assessment
- [ ] `coronary_eval_method` - Metoda oceny tt. wieńcowych (SELECT) → cad_status
- [ ] `cad_status` - Choroba wieńcowa (SELECT) → risk_factors
- [ ] `revasc_required_pre_aorta` - Rewaskularyzacja wymagana (RADIO) → procedural_planning

### Questions
- [ ] Echo (TTE/TEE/both) documented?
- [ ] LVEF percentage recorded (0-100)?
- [ ] LV function matches LVEF (normal >55%, mild 45-54%, mod 30-44%, severe <30%)?
- [ ] Coronary status assessed (none, non-obstructive, 1/2/3-vessel, left main)?
- [ ] Valvular disease graded (none, mild, moderate, severe)?

### Issues Found
```
None
```

### Notes
Baseline cardiac function predicts postoperative complications. LVEF <30% is risk factor. PFO/ASD increase stroke risk in some patient populations. CAD status drives perioperative management.

---

## Segment 7: Sekcja G - Dane Proceduralne
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Procedure Basics
- [ ] `proc_date` - Data zabiegu (DATE) → procedural_characteristics
- [ ] `urgency_proc` - Tryb zabiegu (RADIO) → risk_stratification
- [ ] `proc_location` - Miejsce zabiegu (RADIO) → procedural_characteristics
- [ ] `operator_1_init` - Operator 1 (TEXT) → procedural_characteristics

### Device Configuration (**CRITICAL**)
- [ ] `stentgraft_system` - System stentgraftu (SELECT) → device_comparison
- [ ] `proc_config` - Konfiguracja (RADIO) → config_comparison, subgroup_analysis
- [ ] `treated_arch_branches_count` - Liczba leczonych odgałęzień (RADIO) → technical_outcomes
- [ ] `treated_vessels` - Leczone naczynia (SELECT) → branch_vessel_analysis
- [ ] `lsa_coverage_no_revasc` - Pokrycie LSA bez rewasc (RADIO) → lsa_coverage_strategy
- [ ] `bypass_cs_p` - Bypass szyjno-podobojczykowy (RADIO) → lsa_coverage_strategy

### Access Details
- [ ] `main_access_site` - Główny dostęp (SELECT) → access_route
- [ ] `main_access_side` - Strona dostępu (RADIO) → access_route
- [ ] `main_sheath_fr` - Rozmiar koszulki (NUMBER) → device_specifications
- [ ] `add_access_site` - Dostęp dodatkowy (SELECT) → access_route

### Questions
- [ ] Procedure date is before data entry?
- [ ] Urgency matches indication (emergency/urgent vs elective)?
- [ ] Device system documented (NEXUS/COOK/RelayBranch/Gore)?
- [ ] Configuration matches anatomy (branched/modular/fenestrated/LIFS)?
- [ ] Access sites match device system?
- [ ] Sheath sizes reasonable (18-24 Fr)?

### Issues Found
```
None
```

### Notes
**CRITICAL FOR SUBGROUP ANALYSIS** - proc_config (branched/modular/fen/LIFS) is major subgroup variable. Device comparison important for outcome analysis. LSA coverage strategy directly impacts stroke and arm ischemia risk.

---

## Segment 8: Sekcja G2 - Próba Matasa (NEW - For LIFS/NEXUS)
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Matasa Test (If Applicable)
- [ ] `matasa_done` - Wykonano próbę Matasa (RADIO) → lifs_tolerance_assessment
- [ ] `matasa_compression_time` - Czas ucisku (NUMBER) → lifs_tolerance_assessment
- [ ] `matasa_side` - Strona ucisku (RADIO) → lifs_tolerance_assessment
- [ ] `matasa_neuro_symptoms` - Objawy neurologiczne (RADIO) → lifs_tolerance
- [ ] `matasa_rso2_drop_detected` - Spadek rSO2 (RADIO) → nirs_correlation
- [ ] `matasa_rso2_drop_max` - Maks. spadek rSO2 (%) (NUMBER) → nirs_correlation
- [ ] `matasa_result` - Wynik próby (SELECT) → lifs_tolerance_assessment
- [ ] `lifs_reason` - Uzasadnienie LIFS (SELECT) → device_limitations

### Questions
- [ ] Only filled if LIFS used?
- [ ] Compression time >3 minutes documented?
- [ ] rSO2 drops documented if occurred?
- [ ] Matasa result (negative/positive/unclear)?
- [ ] LIFS reason documented?

### Issues Found
```
⚠️ NEW SECTION: Verify LIFS usage accuracy
```

### Notes
**NEW in v1.1** - Only relevant for LIFS and NEXUS devices. Matasa test assesses tolerance to left carotid compression. Result (negative = can tolerate, positive = cannot tolerate) informs treatment decisions.

---

## Segment 9: Sekcja H - Monitorowanie i Hemodynamika
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### NIRS Monitoring (**IMPORTANT**)
- [ ] `nirs_used` - Stosowano NIRS (RADIO) → intraoperative_monitoring
- [ ] `rso2_baseline_r` - rSO2 wyjściowe prawe (NUMBER) → nirs_oxygenation
- [ ] `rso2_baseline_l` - rSO2 wyjściowe lewe (NUMBER) → nirs_oxygenation
- [ ] `rso2_lowest_r` - Najniższe rSO2 prawe (NUMBER) → nirs_oxygenation
- [ ] `rso2_lowest_l` - Najniższe rSO2 lewe (NUMBER) → nirs_oxygenation
- [ ] `rso2_delta_max_r` - Maks. delta rSO2 prawe (%) (NUMBER) → stroke_risk
- [ ] `rso2_delta_max_l` - Maks. delta rSO2 lewe (%) (NUMBER) → stroke_risk
- [ ] `rso2_alert_triggered` - Alert rSO2 (RADIO) → intraoperative_monitoring
- [ ] `rso2_intervention` - Interwencja z powodu rSO2 (RADIO) → intraoperative_monitoring

### Hemodynamics (MAP Control)
- [ ] `map_baseline` - Wyjściowe MAP (NUMBER) → hemodynamic_stability
- [ ] `map_highest` - Najwyższe MAP (NUMBER) → hemodynamic_stability
- [ ] `map_lowest` - Najniższe MAP (NUMBER) → hemodynamic_stability
- [ ] `map_at_deployment` - MAP przy rozprężeniu (NUMBER) → hemodynamic_stability
- [ ] `map_lt_80_time` - Czas MAP <80 mmHg (NUMBER) → hemodynamic_stability
- [ ] `map_ge_85_pre_stim` - MAP >=85 przed stymulacją (RADIO) → procedural_success

### Ventilation & Perfusion
- [ ] `etco2_target_maintained` - EtCO2 35-40 (RADIO) → respiratory_management
- [ ] `lowest_body_temp` - Temperatura najniższa (NUMBER) → perioperative_management

### Anticoagulation
- [ ] `heparin_dose_total` - Dawka heparyny (NUMBER) → anticoagulation_protocol
- [ ] `baseline_act` - ACT wyjściowy (NUMBER) → anticoagulation_protocol
- [ ] `peak_act` - ACT szczytowy (NUMBER) → anticoagulation_protocol
- [ ] `act_target_maintained` - ACT 250-300s (RADIO) → anticoagulation_protocol

### Rapid Pacing
- [ ] `rapid_pacing_used` - Stymulacja komorowa (RADIO) → hemodynamic_management
- [ ] `pacing_episodes_count` - Liczba epizodów (NUMBER) → pacing_frequency
- [ ] `pacing_time_total` - Całkowity czas stymulacji (NUMBER) → pacing_frequency

### Questions
- [ ] rSO2 values 40-100 range (physiologic)?
- [ ] Delta rSO2 represents % change from baseline?
- [ ] MAP recorded every 5-10 minutes?
- [ ] ACT target 250-300s maintained throughout?
- [ ] Rapid pacing frequency 150-200 bpm?
- [ ] Body temperature ≥32°C?

### Issues Found
```
None
```

### Notes
**VERY LARGE SEGMENT (37 fields)** - Most critical for intraoperative stroke prevention. rSO2 monitoring (NIRS) shows brain oxygenation status. MAP goals: prevent hypotension (<80) and hypertension (>100). ACT>250s ensures anticoagulation during procedure. Low rSO2 or hypotension during critical maneuvers → increased stroke risk.

---

## Segment 10: Sekcja I - Ochrona przed Zatorami
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### EPD (Distal Embolic Protection) (**CRITICAL**)
- [ ] `epd_used_proc` - Stosowano EPD (RADIO) → embolic_protection_strategy
- [ ] `epd_indication` - Wskazanie do EPD (SELECT) → embolic_protection_strategy
- [ ] `epd_device` - Urządzenie ochronne (SELECT) → embolic_protection_strategy
- [ ] `epd_protected_vessels` - Chronione naczynia (SELECT) → embolic_protection_strategy
- [ ] `epd_access_site` - Dostęp dla EPD (SELECT) → access_planning
- [ ] `epd_sheath_fr` - Rozmiar koszulki (NUMBER) → device_specifications
- [ ] `epd_removed_success` - Filtr usunięty pomyślnie (RADIO) → embolic_protection_strategy
- [ ] `epd_material_visible` - Materiał zatorowy widoczny (RADIO) → embolic_material_analysis
- [ ] `epd_material_desc` - Opis materiału (TEXTAREA) → embolic_material_analysis

### Material Analysis
- [ ] `epd_material_type` - Typ materiału (SELECT) → embolic_material_analysis
- [ ] `epd_material_vol_mm3` - Objętość materiału (NUMBER) → embolic_burden
- [ ] `epd_ct_correlation` - Korelacja z TK (RADIO) → embolic_material_analysis

### Flushing Protocol
- [ ] `continuous_flush_used` - Płukanie solą heparynizowaną (RADIO) → device_management
- [ ] `flush_fluid_type` - Roztwór do płukania (SELECT) → device_management
- [ ] `flush_pressure_target` - Ciśnienie 150-200 mmHg (RADIO) → device_management
- [ ] `sg_flush_technique` - Technika płukania (SELECT) → device_management
- [ ] `sg_air_removed_confirmed` - Powietrze całkowicie usunięte (RADIO) → device_management

### Questions
- [ ] EPD used if aorta shaggy or thrombus?
- [ ] EPD device matches access (Spider/Sentinel/TriGuard)?
- [ ] Material recovered and analyzed?
- [ ] Continuous flush maintained at 150-200 mmHg?
- [ ] Air completely removed from device before deployment?
- [ ] EPD successfully removed post-procedure?

### Issues Found
```
🔴 CRITICAL: EPD usage should correlate with shaggy_aorta
```

### Notes
**CRITICAL FOR STROKE PREVENTION** - EPD captures embolic material released during procedure. Higher material burden = higher stroke risk. Continuous flushing with anticoagulated saline prevents thrombus formation inside sheath.

---

## Segment 11: Sekcja J - Zakończenie Zabiegu
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Procedure Metrics
- [ ] `proc_time_total_min` - Całkowity czas zabiegu (NUMBER) → procedural_metrics
- [ ] `fluoro_time_min` - Czas fluoroskopii (NUMBER) → radiation_exposure
- [ ] `contrast_vol_ml` - Objętość kontrastu (NUMBER) → contrast_exposure, aki_risk
- [ ] `est_blood_loss_ml` - Utrata krwi (NUMBER) → bleeding_assessment

### Angiography & Technical Success
- [ ] `intraop_angio_neuro_done` - Angio wewnątrzczaszkowa (RADIO) → technical_assessment
- [ ] `intraop_angio_neuro_result` - Wynik angio (SELECT) → technical_assessment
- [ ] `tech_success` - Sukces techniczny (RADIO) → technical_success_metric

### Complications
- [ ] `endoleak_type_1` - Przeciek typu I (RADIO) → endoleak_rate, safety_composite
- [ ] `endoleak_type_2` - Przeciek typu II (RADIO) → endoleak_rate
- [ ] `endoleak_type_3` - Przeciek typu III (RADIO) → endoleak_rate
- [ ] `branch_vessel_occlusion` - Niedrożność naczynia (RADIO) → technical_outcome
- [ ] `open_conversion` - Konwersja do operacji otwartej (RADIO) → conversion_rate

### Device Limitations
- [ ] `tech_limit_encountered` - Ograniczenia techniczne (RADIO) → device_limitations
- [ ] `tech_limit_type` - Typ ograniczenia (SELECT) → device_limitations
- [ ] `tech_limit_desc` - Opis ograniczenia (TEXTAREA) → device_limitations

### Questions
- [ ] Procedure time 120-300 minutes?
- [ ] Fluoroscopy time 20-60 minutes?
- [ ] Contrast volume 100-300 mL (related to AKI risk)?
- [ ] Blood loss <500 mL typically?
- [ ] Intracranial angiography performed post-deployment?
- [ ] Tech success = no type I/III, good exclusion?
- [ ] Type II endoleaks common but often benign?
- [ ] Device limitations documented?

### Issues Found
```
None
```

### Notes
Technical success definition: exclusion of aneurysm/dissection, no type I/III endoleaks, patent branch vessels, no conversion. Type II endoleaks usually benign. Contrast volume >150mL increases AKI risk in renal disease. Device limitations (size, angle, length) drive LIFS decisions.

---

## Segment 12: Sekcja K - Wyniki Neurologiczne (🔴 PRIMARY OUTCOME)
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### **PRIMARY OUTCOME - CRITICAL SEGMENT**

### Immediate Postoperative Assessment (24h)
- [ ] `new_neuro_deficit_at_wake` - Nowy deficyt przy wybudzeniu (RADIO) → immediate_neuro_outcome
- [ ] `gcs_at_wake` - GCS przy wybudzeniu (NUMBER) → neurologic_status
- [ ] `motor_deficit` - Deficyt ruchowy (RADIO) → focal_deficit
- [ ] `speech_deficit` - Deficyt mowy (RADIO) → focal_deficit
- [ ] `vision_deficit` - Deficyt wzrokowy (RADIO) → focal_deficit

### 30-Day Stroke (🔴 PRIMARY OUTCOME)
- [ ] `any_stroke_30d` - **Jakikolwiek udar** (RADIO) → **PRIMARY_OUTCOME_STROKE**
- [ ] `stroke_date` - Data udaru (DATE) → stroke_timing
- [ ] `stroke_time_from_proc_h` - Czas od zabiegu (NUMBER) → stroke_timing
- [ ] `stroke_type_cat` - **Typ udaru** (SELECT) → stroke_type_distribution
- [ ] `stroke_area_cat` - Obszar udaru (SELECT) → stroke_localization
- [ ] `stroke_side` - Strona udaru (RADIO) → stroke_laterality
- [ ] `stroke_imaging_confirmed` - Potwierdzone obrazowo (RADIO) → stroke_confirmation
- [ ] `nihss_at_diagnosis` - NIHSS (NUMBER) → stroke_severity
- [ ] `mrs_at_30d` - **mRS 30d** (NUMBER) → **FUNCTIONAL_OUTCOME**
- [ ] `stroke_classification_30d` - Klasyfikacja (SELECT) → stroke_severity_category

### Risk Factor Correlation
- [ ] `corr_asc_aorta_ge_40` - Udar u pacjenta z aort. >=40mm (RADIO) → risk_analysis
- [ ] `corr_prev_stroke_tia` - Udar u pacjenta z poprzednim udarem (RADIO) → risk_analysis
- [ ] `corr_shaggy_aorta` - **Udar u pacjenta z shaggy** (RADIO) → **SHAGGY_PREDICTOR**
- [ ] `corr_willis_inc` - Udar u pacjenta z niepełnym Willis (RADIO) → risk_analysis
- [ ] `corr_aneurysm_ge_70` - Udar u pacjenta z tętniakiem >=70mm (RADIO) → risk_analysis

### TIA (Transient Ischemic Attack)
- [ ] `tia_any` - TIA (RADIO) → tia_documentation
- [ ] `tia_date` - Data TIA (DATE) → tia_timing
- [ ] `tia_duration_h` - Czas trwania (NUMBER) → tia_severity

### Spinal Cord Ischemia (SCI)
- [ ] `sci_any` - Niedokrwienie rdzenia (RADIO) → sci_documentation
- [ ] `sci_severity` - Nasilenie SCI (SELECT) → sci_severity_grading
- [ ] `sci_onset_h_post_proc` - Czas do objawów (NUMBER) → sci_timing

### Neurointerventional Procedures
- [ ] `thrombectomy_done` - Trombektomia (RADIO) → thrombectomy_rate
- [ ] `thrombectomy_time_to_puncture` - Czas do nakłucia (NUMBER) → door_to_puncture
- [ ] `thrombectomy_recanalization` - Skuteczna rekanalizacja (RADIO) → thrombectomy_success

### Questions
- [ ] **any_stroke_30d documented for EVERY patient?** (YES/NO - CRITICAL)
- [ ] If stroke: type specified (ischemic/hemorrhagic/mixed)?
- [ ] Stroke timing recorded (hours from procedure)?
- [ ] NIHSS recorded at diagnosis?
- [ ] **mRS recorded at 30 days?** (YES - CRITICAL)
- [ ] Imaging confirmation documented?
- [ ] Risk factor correlations filled for stroke patients?
- [ ] TIA distinguished from stroke (symptoms <24h)?

### Issues Found
```
🔴 CRITICAL: This is PRIMARY OUTCOME segment
🔴 any_stroke_30d: Must be complete for ALL patients (0% missing)
🔴 mrs_at_30d: Must be complete for ALL patients (0% missing)
🔴 stroke_type_cat: Must be specified if any_stroke_30d='tak'
🔴 corr_shaggy_aorta: MUST correlate stroke with shaggy
```

### Notes
**ABSOLUTELY CRITICAL** - This segment defines primary outcome. any_stroke_30d (30-day stroke) and mrs_at_30d (functional outcome at 30 days) are the KEY outcome measures. ALL patients must have these recorded. If stroke occurs, type must be documented. Risk factor correlations allow analysis of what caused strokes. NIHSS measures stroke severity at diagnosis.

---

## Segment 13: Sekcja L - Inne Powikłania
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Cardiac Complications
- [ ] `mi_30d` - Zawał serca (RADIO) → cardiac_complications
- [ ] `afib_new_onset` - Nowe migotanie (RADIO) → arrhythmia_rate
- [ ] `cardiac_arrest` - Zatrzymanie krążenia (RADIO) → cardiac_emergency
- [ ] `aortic_rupture_post` - Pęknięcie aorty (RADIO) → safety_composite
- [ ] `retrograde_type_a` - Wsteczne rozwarstwienie A (RADIO) → dissection_complications

### Access Site Complications
- [ ] `access_hematoma_intervention` - Krwiak wymagający interwencji (RADIO) → access_complication_rate
- [ ] `retroperitoneal_hematoma` - Krwiak zaotrzewnowy (RADIO) → major_bleeding
- [ ] `limb_ischemia_major` - Niedokrwienie kończyny (RADIO) → limb_ischemia_rate
- [ ] `pseudoaneurysm` - Tętniak rzekomy (RADIO) → access_complication_rate
- [ ] `av_fistula` - Przetoka tętniczo-żylna (RADIO) → access_complication_rate

### Renal Complications
- [ ] `aki_akin_ge_2` - AKI >=AKIN2 (RADIO) → acute_kidney_injury_rate, safety_composite
- [ ] `new_dialysis_required` - Nowa dializoterapia (RADIO) → aki_severity

### Respiratory Complications
- [ ] `pneumonia_30d` - Zapalenie płuc (RADIO) → infection_rate
- [ ] `vent_gt_48h` - Wentylacja >48h (RADIO) → prolonged_ventilation
- [ ] `tracheostomy_required` - Tracheostomia (RADIO) → respiratory_failure

### Infectious Complications
- [ ] `ssi_site` - Zakażenie operacyjne (RADIO) → surgical_site_infection_rate
- [ ] `sepsis_30d` - Posocznica (RADIO) → sepsis_rate
- [ ] `stentgraft_infection` - Zakażenie stentgraftu (RADIO) → device_infection_rate

### Bleeding Complications
- [ ] `bleeding_barc_ge_3` - Krwawienie BARC >=3 (RADIO) → bleeding_rate, safety_composite
- [ ] `prbc_units_transfused` - Jednostki KKCz (NUMBER) → transfusion_volume
- [ ] `reop_for_bleeding` - Reoperacja (RADIO) → relaparotomy_rate

### Other Complications
- [ ] `bowel_ischemia` - Niedokrwienie jelit (RADIO) → visceral_ischemia_rate
- [ ] `arm_ischemia_lsa` - Niedokrwienie ręki (RADIO) → lsa_coverage_consequences

### Questions
- [ ] All NO entries if no complications occurred?
- [ ] Serious complications (rupture, arrest, sepsis) documented?
- [ ] AKI assessed (creatinine rise ≥1.5x baseline)?
- [ ] Bleeding complications tracked (transfusion volume)?
- [ ] Access site complications documented?
- [ ] Infections documented (SSI, sepsis, pneumonia)?

### Issues Found
```
None
```

### Notes
**SAFETY OUTCOME SEGMENT** - Complication rates determine safety profile. Stroke (from Seg K) and these complications form safety composite. AKI common after TEVAR (contrast exposure). Access complications related to access site choice. LSA coverage without revascularization → arm ischemia risk. All YES/NO fields - should be NO if complication absent.

---

## Segment 14: Sekcja M - Śmiertelność
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### 30-Day Mortality
- [ ] `death_any_30d` - Zgon w ciągu 30 dni (RADIO) → all_cause_mortality_30d
- [ ] `death_date` - Data zgonu (DATE) → mortality_timing
- [ ] `death_days_from_proc_final` - Dni od zabiegu (NUMBER) → mortality_timing
- [ ] `death_cause_main` - Główna przyczyna (SELECT) → cause_of_death
- [ ] `death_classification_final` - Klasyfikacja (SELECT) → death_attribution

### Autopsy
- [ ] `autopsy_performed` - Sekcja zwłok (RADIO) → autopsy_rate

### Questions
- [ ] Mortality status clearly documented (yes/no)?
- [ ] If death: date recorded?
- [ ] If death: cause classified (stroke/cardiac/aortic/sepsis/other)?
- [ ] If death: attributed to procedure/aorta/other?
- [ ] Time from procedure to death recorded (critical for outcome classification)?

### Issues Found
```
None
```

### Notes
30-day mortality is KEY safety metric and secondary outcome. Causes: procedure-related (aortic rupture), comorbidity (cardiac), complication (sepsis/stroke), or unrelated. Classification distinguishes procedure-related deaths from other deaths, important for published outcome comparisons.

---

## Segment 15: Sekcja N - Obserwacja (Follow-up)
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Follow-up Status
- [ ] `followup_last_visit_date` - Data ostatniej wizyty (DATE) → long_term_outcomes
- [ ] `followup_time_days` - Czas obserwacji (NUMBER) → followup_duration
- [ ] `followup_status` - Status (SELECT: alive/dead/lost) → vital_status

### Functional Outcome
- [ ] `followup_mrs` - mRS przy ostatniej wizycie (NUMBER) → functional_outcome_long_term

### Long-term Complications
- [ ] `late_stroke_gt_30d` - Późny udar (RADIO) → late_stroke_rate
- [ ] `reintervention_required` - Reinterwencja (RADIO) → reintervention_rate
- [ ] `control_endoleak_found` - Przeciek w kontroli (RADIO) → endoleak_persistence
- [ ] `branch_patency_confirmed` - Drożność naczyń (RADIO) → branch_patency_long_term

### Questions
- [ ] Minimum 30-day follow-up documented?
- [ ] Vital status (alive/dead/lost to follow-up) clear?
- [ ] If alive: functional status (mRS) recorded?
- [ ] Control imaging findings documented?
- [ ] Reinterventions clearly noted?

### Issues Found
```
None
```

### Notes
Follow-up confirms durability of repair. Late stroke (>30d) indicates late embolic phenomena. Endoleaks may appear or persist. Reinterventions track secondary procedures (for new aneurysms, dilation, etc.). Minimum 30-day follow-up required; longer follow-up (1, 2, 5 years) valuable for durability assessment.

---

## Segment 16: Sekcja O - Jakość i Kompletność Danych
**Status:** ⬜ Not Started | 🟨 In Progress | ✅ Complete

### Data Entry Quality
- [ ] `mandatory_fields_filled` - Obowiązkowe pola (RADIO) → data_completeness
- [ ] `source_docs_available` - Dokumentacja dostępna (RADIO) → source_documentation
- [ ] `data_entry_initials` - Wprowadził (TEXT) → data_entry_audit
- [ ] `data_entry_date` - Data wprowadzenia (DATE) → data_entry_timing
- [ ] `verification_initials` - Zweryfikował (TEXT) → data_verification_audit
- [ ] `verification_date` - Data weryfikacji (DATE) → data_verification_timing

### Questions
- [ ] All mandatory fields from Segments A-M completed?
- [ ] Source documents (charts, imaging) available for verification?
- [ ] Data entry person identified?
- [ ] Verification person identified?
- [ ] Verification performed (initials ≠ entry initials)?
- [ ] Verification date within reasonable time (days, not months)?

### Issues Found
```
None
```

### Notes
**DATA QUALITY CONTROL** - This segment ensures data completeness and accuracy. Mandatory fields requirement enforces protocol compliance. Source documentation verification ensures data accuracy. Verification by different person (different initials) ensures quality control.

---

## FINAL CHECKLIST - COMPLETION

### Required Completions
- [ ] All 16 segments reviewed
- [ ] All critical segments (K, D, G, H, L) verified
- [ ] No critical issues in primary outcome fields
- [ ] No missing required fields >5% of records
- [ ] Data validity score ≥95%
- [ ] All orphaned fields mapped or explained

### Sign-Off
- **Reviewer Name:** ___________________________
- **Date:** ___________________________
- **Status:** ⬜ Not Started | 🟨 In Progress | ✅ COMPLETE

### Notes for Next Phase
```
[Space for reviewer notes]
```

---

**You're ready to systematically review all segments!**
Go section by section, use the Data-Statistics Debugger tool to validate, and check off as complete.

