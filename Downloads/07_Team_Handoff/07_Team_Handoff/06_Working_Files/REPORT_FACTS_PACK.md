# REPORT FACTS PACK — single source of truth for all 5011CEM report writing
All numbers below were reproduced by rerunning the full pipeline on 2026-06-11. Do NOT invent numbers; only use what is here or in the referenced files.

## Identities and admin
- Module: 5011CEM Big Data Programming Project. INTI International College Penang, School of Computing, 3+0 BSc (Hons) Computer Science in collaboration with Coventry University, UK.
- Lecturer: Ms. Vimala Doraisamy. Semester: April 2026.
- Team: Bryan Tey Kai Yuan (CU ID P23015693, GitHub @gokuthong) and Thong Wai Kit (CU ID P23015668, GitHub @WaiK3412). Two-person group.
- Deadlines: Individual Progressive Report 21 June 2026 (40%); Group Final Report 28 June 2026 (27%); viva weeks 13-14 (33%).
- Report filename format: Yourname_5011CEM_CW1_Report (e.g. BryanTeyKaiYuan_5011CEM_CW1_Report.docx).
- Project title: Home Credit Loan-Default Prediction (credit risk / loan default analysis, banking and financial sector scenario).
- Hand out date: Week 1. Due dates on cover: Individual Progress Report - WK10, Final Report - WK12, VIVA - WK13 & 14.

## Cover sheet (Section A) layout — copy this structure (from the lecturer's sample)
"INTI International College Penang  /  School of Computing" header line, then:
"3+0 Bachelor of Science (Hons) in Computer Science, in collaboration with Coventry University, UK"
"Coursework cover sheet"
"Section A - To be completed by the student" then a table: Full Name; CU Student ID Number; Semester (April 2026); Lecturer (Ms. Vimala Doraisamy); Module Code and Title (5011CEM Big Data Programming Project); Assignment No. / Title (Home Credit Loan-Default Prediction - 100% of Module Mark); Hand out date (Week 1); Due date (Individual Progress Report - WK10 / Final Report - WK12 / VIVA - WK13 & 14).
Then the Penalties paragraph: "No late work will be accepted. If you are unable to submit coursework on time due to extenuating circumstances, you may be eligible for an extension. Please consult the lecturer."
Then Declaration: "I/we the undersigned confirm that I/we have read and agree to abide by the University regulations on plagiarism and cheating and Faculty coursework policies and procedures. I/we confirm that this piece of work is my/our own. I/we consent to appropriate storage of our work for plagiarism checking." plus Signature(s) line with the student name(s).
For the GROUP report cover, list BOTH names and IDs.

## Format rules (mandatory)
- Times New Roman 12 pt body, 1.5 line spacing, <= 5000 words main body (excludes cover, ToC, references, appendices).
- Table of Contents page (insert a Word TOC field so it can refresh: use docx field code 'TOC \\o "1-3" \\h \\z \\u'; tell the reader nothing - it is normal).
- Harvard referencing, in-text (Author, Year) integrated into the discussion. Minimum 10 references per report.
- Headings: numbered chapters (Chapter 1: ..., 1.1, 1.1.1). Figures/tables all need captions ("Figure 3.1: ...", "Table 4.2: ...") referenced in the text.
- Appendices: Gantt chart + 2-3 diagrams (individual); group needs the main plots and diagrams with full caption/label/legend quality.
- Final page of each individual report: "Turnitin Similarity Percentage Page" placeholder heading with a note to insert the Turnitin receipt screenshot before submission.

## Writing style (mandatory — Malaysian academic English)
- Use sentence connectors naturally: Firstly, Secondly, Furthermore, Moreover, In addition, Besides that, On the other hand, In a nutshell, Lastly.
- NO em-dashes anywhere. Use commas, parentheses or separate sentences.
- Plain, direct sentence structures (subject-verb-object). Moderate vocabulary, not flowery. Slightly formal but readable.
- First person is acceptable: individual reports use "I" plus "my team and I" where group work is described; group report uses "we" / "our team".
- Do not use bullet-only sections; write flowing paragraphs with occasional short lists.
- Avoid AI-typical phrasing ("delve", "landscape", "leverage" as a verb everywhere, "It is important to note that" repeatedly, perfectly parallel triads). Vary paragraph lengths.

## Dataset facts
- Home Credit Default Risk dataset, Kaggle competition (Home Credit Group, 2018): https://www.kaggle.com/competitions/home-credit-default-risk
- Core table application_train.csv: 307,511 rows x 122 columns (166,133,370 bytes). One row per loan application. TARGET = 1 means payment difficulty (default), 0 means repaid. Default rate 8.07% (24,825 defaults).
- Licence/ethics: real, anonymised consumer-loan data released by Home Credit Group for the public Kaggle competition; no direct identifiers; complies with the assignment's >=100,000-record requirement.
- Relational children join application on SK_ID_CURR: bureau (and bureau_balance on SK_ID_BUREAU), previous_application, POS_CASH_balance, installments_payments, credit_card_balance. Only application_train is used in the deployed single-table model; the children are the documented future-work extension.
- Data dictionary: HomeCredit_columns_description.csv.
- Known quirk: DAYS_EMPLOYED sentinel value 365243 (about 1000 years) marks pensioners/unemployed; replaced with NaN on load. 55,374 rows (18.0%) affected.
- Missingness: roughly 24% of all cells missing; the sparse building-survey block (COMMONAREA_*, NONLIVINGAPARTMENTS_*, YEARS_BUILD_*, etc.) is mostly empty.

## Preprocessing (as implemented in src/preprocessing.py)
1. clean_data: drop exact duplicate rows (0 found in the real data), keep rows with missing values (imputed later), log missing footprint.
2. engineer_features: 6 domain ratios: AGE_YEARS (= -DAYS_BIRTH/365.25), YEARS_EMPLOYED, CREDIT_INCOME_RATIO, ANNUITY_INCOME_RATIO, CREDIT_TERM (= annuity/credit), EMPLOYED_AGE_RATIO; divisions by zero become NaN.
3. select_feature_columns: drop SK_ID_CURR and TARGET, drop columns >=60% missing, drop FLAG_DOCUMENT_* indicators.
4. ColumnTransformer (fit on train only, so no leakage): numeric -> median impute -> StandardScaler; categorical -> mode impute -> OneHotEncoder(handle_unknown='ignore'). Columns selected by dtype at fit time.
5. stratified_split: 80/20 hold-out preserving the 8.07% rate (246,008 train / 61,503 test), random_state=42.

## Statistical tests (computed on the real data; in outputs/tables/)
Chi-square (categorical vs TARGET), all p < 0.001:
- NAME_INCOME_TYPE chi2=1253.5 (dof 7); NAME_EDUCATION_TYPE chi2=1019.2 (dof 4); CODE_GENDER chi2=920.8 (dof 2); NAME_FAMILY_STATUS chi2=504.7 (dof 5); NAME_CONTRACT_TYPE chi2=293.2 (dof 1).
Point-biserial correlation (numeric vs TARGET), all p < 0.05:
- EXT_SOURCE_3 r=-0.179, EXT_SOURCE_2 r=-0.161, EXT_SOURCE_1 r=-0.155, AGE_YEARS r=-0.078, YEARS_EMPLOYED r=-0.075, AMT_CREDIT r=-0.030, ANNUITY_INCOME_RATIO r=+0.014, CREDIT_TERM r=+0.013, CREDIT_INCOME_RATIO r=-0.008, AMT_INCOME_TOTAL r=-0.004.
Interpretation: external credit scores are the strongest single predictors; younger and shorter-employed applicants default more; raw income barely matters once ratios are considered.
EDA highlights: default rate falls with education level (Lower secondary highest ~11%, Academic degree lowest); male applicants default more (~10.1%) than female (~7.0%); incomes/credits are right-skewed (log transform shown in EDA); class imbalance plot shows 91.9% vs 8.1%.

## Models (all inside one sklearn Pipeline with the shared preprocessor)
- Logistic Regression: liblinear, class_weight='balanced', max_iter=500. Baseline, interpretable coefficients.
- Random Forest: 200 trees, max_depth=20, min_samples_leaf=10, class_weight='balanced_subsample'.
- XGBoost: 400 trees, max_depth=6, learning_rate=0.1, subsample=0.9, colsample_bytree=0.9, eval_metric='aucpr', tree_method='hist', scale_pos_weight = neg/pos of the training fold (about 11.4). Single imbalance correction only.
- Imbalance evidence (xgb_experiment.py, same hold-out): baseline spw=1 vs spw-only vs SMOTE 0.3 vs SMOTE 0.5; spw-only gave the best F1 at the 0.5 threshold; combining SMOTE with spw double-corrects (recall up, precision crushed). SMOTE citation: Chawla et al. (2002).

## Hold-out results (61,503 applications, reproduced 2026-06-11)
| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
| XGBoost | 0.759 | 0.190 | 0.612 | 0.290 | 0.763 |
| Random Forest | 0.861 | 0.240 | 0.332 | 0.278 | 0.742 |
| Logistic Regression | 0.691 | 0.162 | 0.676 | 0.261 | 0.749 |
Confusion matrices (rows=actual repaid/default, cols=predicted repaid/default):
- LR: [[39121, 17417], [1607, 3358]]
- RF: [[51317, 5221], [3319, 1646]]
- XGB: [[43614, 12924], [1928, 3037]]
Narrative: at 8% defaults accuracy is misleading (a reject-nobody model scores 92%). XGBoost balances recall (0.612) and precision best (best F1 and AUC) and is the deployed model. RF is most accurate but misses two thirds of defaulters. LR catches most defaulters but wrongly flags many good customers.

## Optimisation results (optimise_models.py, same hold-out)
Decision-threshold tuning (default 0.5 vs F1-maximising threshold):
- Logistic Regression: F1 0.261 -> 0.300 at t=0.66 (precision 0.162 -> 0.234, recall 0.676 -> 0.416)
- Random Forest: F1 0.278 -> 0.285 at t=0.47 (precision 0.240 -> 0.224, recall 0.332 -> 0.393)
- XGBoost: F1 0.290 -> 0.315 at t=0.65 (precision 0.190 -> 0.260, recall 0.612 -> 0.400)
Calibration (Brier scores; lower is better): RF 0.124, XGB 0.163, LR 0.202. All three curves sit above the diagonal: the imbalance corrections inflate raw scores, so they are treated as ranking scores; the dashboard maps them to Low/Moderate/High percentile bands instead of quoting raw probabilities.
Measured runtimes (246,008 train rows, 61,503 test rows, local machine):
- LR fit 95.0 s, predict 0.5 s. Train complexity O(n*d) per epoch (liblinear coordinate descent, single-threaded).
- RF fit 58.8 s, predict 1.2 s. Train complexity O(T*n*log n*sqrt(d)), T=200.
- XGBoost fit 22.8 s, predict 0.9 s. Train complexity O(T*L*n) with histogram binning, T=400.
Talking point: XGBoost trains fastest despite having the most trees because the hist method bins features once and parallelises; LR is slowest because liblinear is single-threaded on the wide one-hot matrix (~240 columns after encoding).
Feature importance (top drivers): EXT_SOURCE_3, EXT_SOURCE_2, EXT_SOURCE_1 dominate for RF and XGBoost; CREDIT_TERM, DAYS_BIRTH/AGE_YEARS, DAYS_EMPLOYED follow; for XGBoost gain also NAME_EDUCATION_TYPE_Higher education, CODE_GENDER, NAME_CONTRACT_TYPE_Revolving loans. LR's largest absolute coefficients are rare categories (Academic degree, Student, Pensioner income types). Consistent with Yang et al. (2025) who found EXT_SOURCE features dominate SHAP values on this dataset.

## Pipeline / engineering facts
- Tech stack: Python 3.12, pandas 2.2.2, scikit-learn 1.5.0, XGBoost 2.0.3, imbalanced-learn, pyarrow (parquet cache), matplotlib/seaborn, Plotly, Streamlit 1.36, joblib, pytest (20 unit tests, all passing). IDEs: Jupyter Notebook + VS Code.
- run_pipeline.py: EDA figures -> trains 3 models -> writes consolidated reports/metrics.csv (single source of truth; dashboard reads the same file).
- optimise_models.py: threshold sweep, calibration curves, runtime measurement, feature importances.
- data_loader caches the 166 MB CSV as parquet (several times faster reloads) and fixes the DAYS_EMPLOYED sentinel.
- Dashboard (Streamlit, 3 pages): Overview (KPIs + EDA charts on a 50,000-row sample), Model Comparison (metrics table, threshold-tuning table, confusion matrices, ROC curves, calibration + importance figures), Live Prediction (form -> XGBoost score -> percentile risk band Low/Moderate/High using sample score quantiles q50/q80).
- Storage discussion points: 166 MB CSV loads slowly in pandas; parquet cache cuts reload time several-fold; the full relational set (~2.7 GB over 7 tables) motivates a discussion of scalable storage; MongoDB (Lab 4/5) is discussed as a non-relational option for semi-structured application data, while the current implementation uses flat CSV + parquet which is adequate for single-table batch analysis.
- Version control: GitHub private repo gokuthong/5011cem-paysim-fraud-detection (36 commits planned, 18 per member, May 15 - June 25 2026, branch-less trunk workflow, descriptive conventional-commit messages). Tests via pytest; Streamlit AppTest smoke test for the dashboard.
- Ethics/legal: anonymised open data; GDPR Article 22 (right not to be subject to solely automated decisions) and 'right to explanation' (Goodman & Flaxman 2017) discussed because an ML credit decision affects individuals; fairness in credit scoring (Kozodoi et al. 2022); gender appears predictive but using it raises discrimination concerns under equal-credit rules (discuss as limitation/ethical consideration).

## Diagrams available (embed as figures; all PNG, regenerated 2026-06-11)
- 04_Diagrams/System_Diagrams/dfd_level0.png, dfd_level1.png, erd.png, uml_class.png, flowchart_preprocessing.png
- 04_Diagrams/EDA_Plots/: eda_target.png (class balance), eda_default_by_cat.png, eda_amounts.png, eda_ext_source.png, eda_ext_vs_target.png, eda_amt_vs_target.png, eda_missing.png, eda_corr.png, eda_age_employment.png
- 05_GitHub_and_Code/code/reports/figures/: cm_*.png, roc_*.png (per model), threshold_sweep.png, calibration_curves.png, feature_importance.png, 01_class_balance.png ... 09_correlation_heatmap.png
- 03_Gantt_Chart/HomeCredit_Project_Gantt_Chart.xlsx (project runs 13/04/2026 - 28/06/2026; phases: planning, data sources, collection plan, EDA, preprocessing, model development, evaluation, dashboard, testing/deployment, final preparation). For embedding, reference it textually or screenshot is taken separately; in appendices write "Gantt chart (see appendix figure)" and embed 06_Working_Files/gantt_screenshot.png IF it exists, otherwise describe placement instruction.

## References
Use ONLY the verified references in 06_Working_Files/verified_references.md (21 entries, Harvard format strings provided). Allocation:
- Bryan primary: Hand & Henley 1997; Baesens et al. 2003; Hasan et al. 2020; Srivastava & Gopalkrishnan 2015; Goodman & Flaxman 2017; Emmanuel et al. 2021; Sarikaya et al. 2019. Plus shared.
- Thong primary: Chen & Guestrin 2016; Xia et al. 2017; Li & Wu 2024; Al-qerem et al. 2019; He & Garcia 2009; XGBoost docs 2022; Garcia et al. 2016. Plus shared.
- Shared core (both may cite): Chawla et al. 2002; Breiman 2001; Lundberg & Lee 2017; Lessmann et al. 2015; Yang et al. 2025; Kozodoi et al. 2022; GDPR Art. 22 (2016).
Each individual report must end with >= 12 references actually cited in text.

## Differentiation requirements (critical, similarity <= 20%)
The two individual reports must NOT look like copies. They share the project facts but must differ in:
- Framing: Bryan frames the problem from the lender/business decision view (portfolio quality, customer retention, dashboards for analysts). Thong frames it from the data-engineering/modelling view (imbalance, preprocessing quality, algorithmic efficiency).
- Research questions/hypotheses: Bryan e.g. RQ on which applicant attributes drive default and whether interpretable models suffice; Thong e.g. RQ on whether boosting beats baselines under imbalance and which imbalance strategy works best.
- Literature selection per allocation above; different ordering of chapters' internal subsections; different examples; entirely different wording.
- Work-split narrative (consistent with README/Gantt/commit plan): Bryan led EDA, Logistic Regression, Random Forest, dashboard Overview/Live Prediction pages, group report assembly. Thong led data loading/preprocessing, XGBoost + imbalance experiment, evaluation module, dashboard Model Comparison page, architecture documentation.
- The individual report is a PROGRESSIVE report: written as design + planning with early evidence (it may reference preliminary EDA and the planned models, hypothesis tests, and evaluation design). Use future/planning voice for modelling chapters ("the project will train and compare...") while EDA/statistics can be reported as already explored. The GROUP report is the FINAL report: past tense, full results.

## Group report structure (rubric-mapped, 27%)
1. Descriptive Statistics / EDA (6 marks): attribute data types (categorical vs numerical with examples from the 122 columns), distributions, variable selection justification, interpretation of every chart used.
2. Model Development (6): describe functionality of each code file (data_loader, preprocessing, eda, evaluation, models/*, run_pipeline, xgb_experiment, optimise_models, dashboard/app, tests) - what it is for and how it achieves it, including testing; NO syntax-level detail.
3. Measure and optimise algorithm complexity (2): Big-O table + measured timings + threshold tuning as optimisation + parquet caching + hist tree method.
4. Professional practices (2): version control workflow, commit conventions, code review via PRs/dual roles, pytest + AppTest, ethical/legal handling of financial data.
5. Conclusions and recommendations (3): findings vs goals/hypotheses, limitations (single table, calibration, modest precision, demographic features ethics), recommendations (threshold choice per business cost, calibration step, multi-table features, monitoring).
6. Diagrams appendix (5): high-quality captioned figures (EDA plots, CMs, ROC, threshold sweep, calibration, importance, DFDs, ERD, UML, flowchart, Gantt).
7. Overall organisation (3): logical flow, clear member responsibility table, consistent formatting.
Group cover: both members. Filename: Group_5011CEM_Final_Report.docx -> actually name it "BryanTey_ThongWaiKit_5011CEM_Group_Final_Report.docx".

## Individual report structure (rubric-mapped, 40%) — both reports
Chapter 1 Introduction (5): problem, scope, goals, success criteria, report structure outline.
Chapter 2 Literature Review (10): similar applications compared; techniques/algorithms compared; big-data challenges in banking; research questions + hypotheses derived from the review.
Chapter 3 Design and Planning of Project / Data Analysis (7): data source/schema/format/structure; preprocessing plan + data quality issues; contextual diagram (DFD L0) + system functions/architecture; data storage discussion.
Chapter 4 Model Design and Planning (10): analysis tools/techniques; hypothesis testing + correlation tests with variable justification (use the chi-square + point-biserial numbers); the chosen ML algorithms introduced and justified (min 2); implementation and evaluation plan (metrics, stratified split, K-fold, threshold tuning plan).
References (3): >= 10, Harvard, integrated.
Appendices (5): Gantt (2) + 2-3 diagrams (3): DFD L1 / ERD / UML / flowchart as appropriate (Bryan: DFD L0+L1 + ERD; Thong: flowchart + UML + ERD to differentiate).
Filenames: BryanTeyKaiYuan_5011CEM_CW1_Report.docx / ThongWaiKit_5011CEM_CW1_Report.docx.
Final page: Turnitin placeholder.

## Output locations
Write the .docx generator script AND the .docx into C:\Users\ASUS\Downloads\07_Team_Handoff\07_Team_Handoff\08_Final_Submission\
(create the folder if needed). Keep the generator script (build_<name>_report.py) next to the docx so it can be regenerated.
